import type {
  ConnectivityResult,
  DnsResult,
  PacketLossResult,
  SpeedTestResult,
  SystemInfo,
  TracerouteResult
} from '../types/diagnostics'
import type { DiagnosticSnapshot, ReportRequest, ReportResult } from '../types/report'
import type { AiProviderConfig, AiRecommendation } from '../types/ai'
import type { SerializedError } from '../errors/errors'

/**
 * The single source of truth for the renderer↔main API surface. Both the preload
 * bridge and the main-process router are typed against this map, so adding or
 * changing a channel is a compile error on the side that forgets to update.
 */
export const IpcChannel = {
  ScanSystem: 'diagnostic:scan-system',
  RunConnectivity: 'diagnostic:connectivity',
  RunDns: 'diagnostic:dns',
  RunPacketLoss: 'diagnostic:packet-loss',
  RunTraceroute: 'diagnostic:traceroute',
  RunSpeedTest: 'diagnostic:speed-test',
  RunFullDiagnostic: 'diagnostic:run-full',
  AnalyzeWithAi: 'ai:analyze',
  ExportReport: 'report:export',
  Progress: 'diagnostic:progress'
} as const

export type IpcChannelName = (typeof IpcChannel)[keyof typeof IpcChannel]

export interface RunDiagnosticOptions {
  /** Public host used for internet ping / packet-loss / traceroute targets. */
  readonly probeHost?: string
}

export interface AnalyzeRequest {
  readonly snapshot: DiagnosticSnapshot
  readonly config: AiProviderConfig
}

/** request/response shape for every invoke-style channel. */
export interface IpcContract {
  [IpcChannel.ScanSystem]: { request: void; response: SystemInfo }
  [IpcChannel.RunConnectivity]: { request: RunDiagnosticOptions; response: ConnectivityResult }
  [IpcChannel.RunDns]: { request: RunDiagnosticOptions; response: DnsResult }
  [IpcChannel.RunPacketLoss]: { request: RunDiagnosticOptions; response: PacketLossResult }
  [IpcChannel.RunTraceroute]: { request: RunDiagnosticOptions; response: TracerouteResult }
  [IpcChannel.RunSpeedTest]: { request: void; response: SpeedTestResult }
  [IpcChannel.RunFullDiagnostic]: { request: RunDiagnosticOptions; response: DiagnosticSnapshot }
  [IpcChannel.AnalyzeWithAi]: { request: AnalyzeRequest; response: AiRecommendation }
  [IpcChannel.ExportReport]: { request: ReportRequest; response: ReportResult }
}

export type InvokeChannel = keyof IpcContract

/** A failed invoke returns this instead of throwing across the boundary. */
export type IpcResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: SerializedError }

/** Progress events pushed main → renderer during a full diagnostic run. */
export type DiagnosticStage =
  | 'system'
  | 'connectivity'
  | 'dns'
  | 'packetLoss'
  | 'traceroute'
  | 'speedTest'
  | 'health'
  | 'done'

export interface ProgressEvent {
  readonly stage: DiagnosticStage
  readonly labelBn: string
  readonly percent: number
  /** Speed-test sub-phase (only set while `stage === 'speedTest'`). */
  readonly phase?: 'latency' | 'download' | 'upload'
  /** Live throughput for the active speed-test phase, in Mbps. */
  readonly currentMbps?: number | null
}

/** The typed API exposed on `window.netdoctor` by the preload bridge. */
export interface NetDoctorApi {
  scanSystem(): Promise<IpcResult<SystemInfo>>
  runConnectivity(opts?: RunDiagnosticOptions): Promise<IpcResult<ConnectivityResult>>
  runDns(opts?: RunDiagnosticOptions): Promise<IpcResult<DnsResult>>
  runPacketLoss(opts?: RunDiagnosticOptions): Promise<IpcResult<PacketLossResult>>
  runTraceroute(opts?: RunDiagnosticOptions): Promise<IpcResult<TracerouteResult>>
  runSpeedTest(): Promise<IpcResult<SpeedTestResult>>
  runFullDiagnostic(opts?: RunDiagnosticOptions): Promise<IpcResult<DiagnosticSnapshot>>
  analyzeWithAi(req: AnalyzeRequest): Promise<IpcResult<AiRecommendation>>
  exportReport(req: ReportRequest): Promise<IpcResult<ReportResult>>
  onProgress(listener: (event: ProgressEvent) => void): () => void
}
