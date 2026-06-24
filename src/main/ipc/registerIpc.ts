import { BrowserWindow, dialog, type FileFilter } from 'electron'
import { writeFile } from 'node:fs/promises'
import { IpcChannel } from '@shared/ipc/contract'
import type { AnalyzeRequest, ProgressEvent } from '@shared/ipc/contract'
import type { ReportFormat, ReportRequest } from '@shared/types/report'
import { ValidationError } from '@shared/errors/errors'
import { DEFAULT_LANGUAGE, translate } from '@shared/i18n'
import {
  analyzeRequestSchema,
  reportRequestSchema,
  runDiagnosticOptionsSchema
} from '@shared/schemas/ipc.schema'
import type { AppContainer } from '../container'
import { registerInvoke } from './handler'

const REPORT_FILTERS: Record<ReportFormat, FileFilter> = {
  pdf: { name: 'PDF', extensions: ['pdf'] },
  docx: { name: 'Word', extensions: ['docx'] },
  txt: { name: 'Text', extensions: ['txt'] }
}

/**
 * Registers every IPC channel against the container. Each channel is typed by the
 * shared contract and validated by its Zod schema, so the renderer cannot reach a
 * service with a malformed payload.
 */
export function registerIpcHandlers(container: AppContainer): void {
  registerInvoke(IpcChannel.ScanSystem, null, () => container.scanner.scan())

  registerInvoke(IpcChannel.RunConnectivity, runDiagnosticOptionsSchema, async (opts) => {
    const system = await container.scanner.scan()
    return container.connectivity.run({
      gatewayIp: system.gatewayIp,
      ...(opts.probeHost !== undefined ? { probeHost: opts.probeHost } : {}),
      ...(opts.pingCount !== undefined ? { pingCount: opts.pingCount } : {}),
      ...(opts.packetSizeBytes !== undefined ? { packetSizeBytes: opts.packetSizeBytes } : {})
    })
  })

  registerInvoke(IpcChannel.RunDns, runDiagnosticOptionsSchema, async () => {
    const system = await container.scanner.scan()
    return container.dns.run({ servers: system.dnsServers })
  })

  registerInvoke(IpcChannel.RunPacketLoss, runDiagnosticOptionsSchema, (opts) =>
    container.packetLoss.run({
      ...(opts.probeHost !== undefined ? { probeHost: opts.probeHost } : {}),
      ...(opts.pingCount !== undefined ? { pingCount: opts.pingCount } : {}),
      ...(opts.packetSizeBytes !== undefined ? { packetSizeBytes: opts.packetSizeBytes } : {})
    })
  )

  registerInvoke(IpcChannel.RunTraceroute, runDiagnosticOptionsSchema, (opts) =>
    container.traceroute.run(opts.probeHost !== undefined ? { probeHost: opts.probeHost } : {})
  )

  registerInvoke(IpcChannel.RunSpeedTest, null, () => container.speedTest.run())

  registerInvoke(IpcChannel.RunFullDiagnostic, runDiagnosticOptionsSchema, (opts, event) => {
    const emit = (progress: ProgressEvent): void => {
      if (!event.sender.isDestroyed()) event.sender.send(IpcChannel.Progress, progress)
    }
    return container.orchestrator.run(
      {
        ...(opts.probeHost !== undefined ? { probeHost: opts.probeHost } : {}),
        ...(opts.pingCount !== undefined ? { pingCount: opts.pingCount } : {}),
        ...(opts.packetSizeBytes !== undefined ? { packetSizeBytes: opts.packetSizeBytes } : {})
      },
      emit
    )
  })

  registerInvoke(IpcChannel.AnalyzeWithAi, analyzeRequestSchema, (raw) => {
    // Shape is runtime-validated above; the snapshot is our own round-tripped data.
    const req = raw as unknown as AnalyzeRequest
    return container.ai.analyze(req.snapshot, req.config, req.language)
  })

  registerInvoke(IpcChannel.ExportReport, reportRequestSchema, async (raw, event) => {
    const req = raw as unknown as ReportRequest
    const bytes = await container.reports.render(req)
    const win = BrowserWindow.fromWebContents(event.sender) ?? undefined
    const { canceled, filePath } = await dialog.showSaveDialog(win!, {
      defaultPath: container.reports.suggestedFileName(req),
      filters: [REPORT_FILTERS[req.format]]
    })
    if (canceled || !filePath) {
      throw new ValidationError(translate(req.language ?? DEFAULT_LANGUAGE, 'report.saveCancelled'))
    }
    await writeFile(filePath, bytes)
    return { format: req.format, filePath, bytes: bytes.byteLength }
  })
}
