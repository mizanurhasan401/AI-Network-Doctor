import type {
  ConnectivityResult,
  DetectedIssue,
  DnsResult,
  PacketLossResult,
  SpeedTestResult,
  SystemInfo,
  TracerouteResult
} from './diagnostics'
import type { HealthScore } from './health'
import type { AiRecommendation } from './ai'

/**
 * The full diagnostic snapshot. Held only in memory (per product spec: no
 * persistence) until the user exports it. This is the single object passed to
 * the AI engine and the report generators.
 */
export interface DiagnosticSnapshot {
  readonly id: string
  /** ISO-8601 creation timestamp. */
  readonly createdAt: string
  readonly system: SystemInfo
  readonly connectivity: ConnectivityResult
  readonly dns: DnsResult
  readonly packetLoss: PacketLossResult
  readonly traceroute: TracerouteResult
  readonly speedTest: SpeedTestResult
  readonly health: HealthScore
  readonly issues: readonly DetectedIssue[]
}

export type ReportFormat = 'pdf' | 'docx' | 'txt'

export interface ReportRequest {
  readonly snapshot: DiagnosticSnapshot
  readonly recommendation?: AiRecommendation
  readonly format: ReportFormat
}

export interface ReportResult {
  readonly format: ReportFormat
  readonly filePath: string
  readonly bytes: number
}
