import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IpcChannel } from '@shared/ipc/contract'
import type {
  AnalyzeRequest,
  NetDoctorApi,
  ProgressEvent,
  RunDiagnosticOptions
} from '@shared/ipc/contract'
import type { ReportRequest } from '@shared/types/report'
import type { RouterRequest } from '@shared/types/router'

/**
 * The preload bridge. Runs in an isolated context with Node access and exposes a
 * single, explicitly-enumerated API to the renderer via contextBridge. No raw
 * `ipcRenderer` is leaked — the renderer can only call the methods listed here.
 */
const api: NetDoctorApi = {
  scanSystem: () => ipcRenderer.invoke(IpcChannel.ScanSystem),
  runConnectivity: (opts?: RunDiagnosticOptions) =>
    ipcRenderer.invoke(IpcChannel.RunConnectivity, opts ?? {}),
  runDns: (opts?: RunDiagnosticOptions) => ipcRenderer.invoke(IpcChannel.RunDns, opts ?? {}),
  runPacketLoss: (opts?: RunDiagnosticOptions) =>
    ipcRenderer.invoke(IpcChannel.RunPacketLoss, opts ?? {}),
  runTraceroute: (opts?: RunDiagnosticOptions) =>
    ipcRenderer.invoke(IpcChannel.RunTraceroute, opts ?? {}),
  runSpeedTest: () => ipcRenderer.invoke(IpcChannel.RunSpeedTest),
  runFullDiagnostic: (opts?: RunDiagnosticOptions) =>
    ipcRenderer.invoke(IpcChannel.RunFullDiagnostic, opts ?? {}),
  analyzeWithAi: (req: AnalyzeRequest) => ipcRenderer.invoke(IpcChannel.AnalyzeWithAi, req),
  exportReport: (req: ReportRequest) => ipcRenderer.invoke(IpcChannel.ExportReport, req),
  routerFetchInfo: (req: RouterRequest) => ipcRenderer.invoke(IpcChannel.RouterFetchInfo, req),
  routerReboot: (req: RouterRequest) => ipcRenderer.invoke(IpcChannel.RouterReboot, req),
  onProgress: (listener: (event: ProgressEvent) => void) => {
    const handler = (_e: IpcRendererEvent, payload: ProgressEvent): void => listener(payload)
    ipcRenderer.on(IpcChannel.Progress, handler)
    return () => ipcRenderer.removeListener(IpcChannel.Progress, handler)
  }
}

contextBridge.exposeInMainWorld('netdoctor', api)
