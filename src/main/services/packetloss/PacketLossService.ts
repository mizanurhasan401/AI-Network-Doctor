import type { PacketLossResult } from '@shared/types/diagnostics'
import { DEFAULT_PROBE_HOST, PACKET_LOSS_SAMPLE_COUNT } from '@shared/constants'
import type { IPingAdapter } from '../../adapters/ping/IPingAdapter'
import { avg, jitter, round } from '../../core/stats'

/**
 * Sends a larger ping burst to quantify packet loss, average latency and jitter
 * — the three numbers customers most often feel as "the internet is laggy".
 */
export class PacketLossService {
  constructor(private readonly ping: IPingAdapter) {}

  async run(options: { probeHost?: string } = {}): Promise<PacketLossResult> {
    const host = options.probeHost ?? DEFAULT_PROBE_HOST
    const probe = await this.ping.ping(host, { count: PACKET_LOSS_SAMPLE_COUNT })

    return {
      host,
      sent: probe.sent,
      received: probe.received,
      lossPercent: round(probe.lossPercent),
      latencyAvgMs: avg(probe.rttsMs),
      jitterMs: jitter(probe.rttsMs)
    }
  }
}
