import type { PingStats } from '@shared/types/diagnostics'
import type { PingProbeResult } from '../../adapters/ping/IPingAdapter'
import { avg, jitter, max, min, round } from '../../core/stats'

/** Convert a low-level probe result into the public PingStats DTO. */
export function toPingStats(probe: PingProbeResult): PingStats {
  return {
    host: probe.host,
    alive: probe.alive,
    sent: probe.sent,
    received: probe.received,
    packetLossPercent: round(probe.lossPercent),
    minMs: min(probe.rttsMs),
    avgMs: avg(probe.rttsMs),
    maxMs: max(probe.rttsMs),
    jitterMs: jitter(probe.rttsMs)
  }
}
