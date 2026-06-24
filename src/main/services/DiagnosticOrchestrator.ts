import { randomUUID } from 'node:crypto'
import type { DiagnosticSnapshot } from '@shared/types/report'
import type { ProgressEvent, RunDiagnosticOptions } from '@shared/ipc/contract'
import type { NetworkScannerService } from './network/NetworkScannerService'
import type { ConnectivityService } from './connectivity/ConnectivityService'
import type { DnsService } from './dns/DnsService'
import type { PacketLossService } from './packetloss/PacketLossService'
import type { TracerouteService } from './traceroute/TracerouteService'
import type { SpeedTestService } from './speedtest/SpeedTestService'
import type { HealthEngine, HealthInput } from './health/HealthEngine'
import type { IssueDetector } from './health/IssueDetector'

export type ProgressEmitter = (event: ProgressEvent) => void

export interface DiagnosticServices {
  readonly scanner: NetworkScannerService
  readonly connectivity: ConnectivityService
  readonly dns: DnsService
  readonly packetLoss: PacketLossService
  readonly traceroute: TracerouteService
  readonly speedTest: SpeedTestService
  readonly health: HealthEngine
  readonly issues: IssueDetector
}

/**
 * Runs the end-to-end diagnostic as a deterministic, observable pipeline.
 * Stages run sequentially because later targets (probe host) and weighting
 * depend on earlier results, and to keep the network from being saturated by
 * concurrent probes (which would distort latency/speed readings).
 */
export class DiagnosticOrchestrator {
  constructor(private readonly s: DiagnosticServices) {}

  async run(
    options: RunDiagnosticOptions,
    onProgress: ProgressEmitter = () => {}
  ): Promise<DiagnosticSnapshot> {
    // Forward only the explicitly-set probe knobs; services fall back to defaults.
    const probeOpts = {
      ...(options.probeHost !== undefined ? { probeHost: options.probeHost } : {}),
      ...(options.pingCount !== undefined ? { pingCount: options.pingCount } : {}),
      ...(options.packetSizeBytes !== undefined ? { packetSizeBytes: options.packetSizeBytes } : {})
    }

    onProgress({ stage: 'system', labelBn: 'সিস্টেম স্ক্যান হচ্ছে', percent: 5 })
    const system = await this.s.scanner.scan()

    onProgress({ stage: 'connectivity', labelBn: 'সংযোগ পরীক্ষা হচ্ছে', percent: 25 })
    const connectivity = await this.s.connectivity.run({
      gatewayIp: system.gatewayIp,
      ...probeOpts
    })

    onProgress({ stage: 'dns', labelBn: 'ডিএনএস বিশ্লেষণ হচ্ছে', percent: 40 })
    const dns = await this.s.dns.run({ servers: system.dnsServers })

    onProgress({ stage: 'packetLoss', labelBn: 'প্যাকেট লস পরিমাপ হচ্ছে', percent: 55 })
    const packetLoss = await this.s.packetLoss.run(probeOpts)

    onProgress({ stage: 'traceroute', labelBn: 'নেটওয়ার্ক পথ অনুসন্ধান হচ্ছে', percent: 70 })
    const traceroute = await this.s.traceroute.run(
      options.probeHost !== undefined ? { probeHost: options.probeHost } : {}
    )

    onProgress({ stage: 'speedTest', labelBn: 'গতি পরীক্ষা চলছে', percent: 80 })
    const speedLabel = {
      latency: 'লেটেন্সি মাপা হচ্ছে',
      download: 'ডাউনলোড গতি মাপা হচ্ছে',
      upload: 'আপলোড গতি মাপা হচ্ছে'
    } as const
    const speedTest = await this.s.speedTest.run((sp) =>
      onProgress({
        stage: 'speedTest',
        labelBn: speedLabel[sp.phase],
        // Map the speed test's own 0–100 into the overall 80→95 band.
        percent: Math.round(80 + (sp.percent / 100) * 15),
        phase: sp.phase,
        currentMbps: sp.currentMbps
      })
    )

    onProgress({ stage: 'health', labelBn: 'স্বাস্থ্য স্কোর গণনা হচ্ছে', percent: 95 })
    const healthInput: HealthInput = { connectivity, dns, packetLoss, speedTest }
    const health = this.s.health.compute(healthInput)
    const issues = this.s.issues.detect(healthInput)

    onProgress({ stage: 'done', labelBn: 'সম্পন্ন', percent: 100 })

    return {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      system,
      connectivity,
      dns,
      packetLoss,
      traceroute,
      speedTest,
      health,
      issues
    }
  }
}
