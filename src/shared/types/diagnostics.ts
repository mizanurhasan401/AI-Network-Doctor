/**
 * Diagnostic domain model. Every type here is a plain, JSON-serializable DTO so
 * it can cross the Electron IPC boundary unchanged (no Date, no class instances).
 * Timestamps are ISO-8601 strings; durations are milliseconds.
 */

export type Severity = 'info' | 'warning' | 'critical'

export interface SystemInfo {
  readonly hostname: string
  readonly localIp: string
  readonly gatewayIp: string | null
  readonly dnsServers: readonly string[]
  readonly publicIp: string | null
  readonly macAddress: string | null
  /** Negotiated link speed of the active LAN/Wi-Fi port in Mbps (null if unknown). */
  readonly linkSpeedMbps: number | null
  /**
   * Medium of the active interface. On `wireless` the speed is an instantaneous
   * PHY rate that fluctuates and must not be read as a fixed cap; on `wired` it's
   * the stable negotiated Ethernet rate (100/1000/…).
   */
  readonly linkType: 'wired' | 'wireless' | 'other' | null
  readonly os: {
    readonly platform: string
    readonly distro: string
    readonly release: string
    readonly arch: string
  }
  readonly cpu: {
    readonly manufacturer: string
    readonly brand: string
    readonly cores: number
    readonly speedGHz: number
  }
  readonly ram: {
    readonly totalBytes: number
    readonly freeBytes: number
  }
}

export interface PingStats {
  readonly host: string
  readonly alive: boolean
  readonly sent: number
  readonly received: number
  readonly packetLossPercent: number
  readonly minMs: number | null
  readonly avgMs: number | null
  readonly maxMs: number | null
  readonly jitterMs: number | null
}

export interface HttpCheck {
  readonly url: string
  readonly ok: boolean
  readonly statusCode: number | null
  readonly latencyMs: number | null
  readonly error: string | null
}

export interface ConnectivityResult {
  readonly gateway: PingStats
  readonly internet: PingStats
  readonly http: HttpCheck
  readonly https: HttpCheck
}

export interface DnsServerResult {
  readonly server: string
  readonly reachable: boolean
  readonly resolveMs: number | null
  readonly testedDomain: string
  readonly error: string | null
}

export interface DnsResult {
  readonly testedDomain: string
  readonly servers: readonly DnsServerResult[]
  readonly avgResolveMs: number | null
}

export interface PacketLossResult {
  readonly host: string
  readonly sent: number
  readonly received: number
  readonly lossPercent: number
  readonly latencyAvgMs: number | null
  readonly jitterMs: number | null
}

export interface TracerouteHop {
  readonly hop: number
  readonly host: string | null
  readonly ip: string | null
  readonly avgMs: number | null
  readonly timedOut: boolean
}

export interface TracerouteResult {
  readonly target: string
  readonly hops: readonly TracerouteHop[]
  readonly completed: boolean
}

export interface SpeedTestResult {
  readonly available: boolean
  readonly downloadMbps: number | null
  readonly uploadMbps: number | null
  readonly pingMs: number | null
  readonly jitterMs: number | null
  readonly isp: string | null
  readonly serverName: string | null
  readonly error: string | null
}

/**
 * A problem the engine detected from raw measurements. Language-neutral: `id` is
 * a stable key into the i18n catalog (`issue.<id>.title` / `.desc`) and `params`
 * carries the measured values to interpolate — so the same issue renders in any
 * language without re-running diagnostics.
 */
export interface DetectedIssue {
  readonly id: string
  readonly area: 'connectivity' | 'dns' | 'packetLoss' | 'speed' | 'latency' | 'system'
  readonly severity: Severity
  /** Values interpolated into the issue's i18n templates (e.g. `{lossPercent}`). */
  readonly params?: Record<string, string | number>
}
