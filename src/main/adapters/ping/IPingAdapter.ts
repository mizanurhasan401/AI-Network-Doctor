/**
 * Low-level ICMP probe abstraction. Services depend on this interface, never on
 * a concrete implementation — so `node-net-ping` (raw sockets) or a mocked probe
 * can replace the system-binary default without changing any service.
 */
export interface PingProbeOptions {
  readonly count: number
  readonly perPingTimeoutMs?: number
}

export interface PingProbeResult {
  readonly host: string
  readonly alive: boolean
  readonly sent: number
  readonly received: number
  readonly lossPercent: number
  /** Individual round-trip times in ms (one per successful reply). */
  readonly rttsMs: readonly number[]
}

export interface IPingAdapter {
  ping(host: string, options: PingProbeOptions): Promise<PingProbeResult>
}
