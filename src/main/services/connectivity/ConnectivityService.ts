import type { ConnectivityResult, HttpCheck, PingStats } from '@shared/types/diagnostics'
import { DEFAULT_PROBE_HOST, HTTP_CHECK_URL, HTTPS_CHECK_URL, PING_SAMPLE_COUNT } from '@shared/constants'
import type { IPingAdapter } from '../../adapters/ping/IPingAdapter'
import { toPingStats } from './pingStats'

export interface ConnectivityRunOptions {
  readonly gatewayIp: string | null
  readonly probeHost?: string
  /** ICMP echoes per probe. Defaults to `PING_SAMPLE_COUNT`. */
  readonly pingCount?: number
  /** Custom ICMP payload size in bytes. Omit for the OS default. */
  readonly packetSizeBytes?: number
}

/**
 * Tests reachability of the local gateway and the public internet via ICMP, plus
 * plain HTTP and HTTPS reachability. The ping adapter is injected (composition),
 * so this service is fully unit-testable without touching the network.
 */
export class ConnectivityService {
  constructor(private readonly ping: IPingAdapter) {}

  async run(options: ConnectivityRunOptions): Promise<ConnectivityResult> {
    const probeHost = options.probeHost ?? DEFAULT_PROBE_HOST
    const count = options.pingCount ?? PING_SAMPLE_COUNT

    const [gateway, internet, http, https] = await Promise.all([
      this.pingOrDead(options.gatewayIp, count, options.packetSizeBytes),
      this.pingHost(probeHost, count, options.packetSizeBytes),
      this.httpCheck(HTTP_CHECK_URL),
      this.httpCheck(HTTPS_CHECK_URL)
    ])

    return { gateway, internet, http, https }
  }

  private async pingHost(host: string, count: number, sizeBytes?: number): Promise<PingStats> {
    const probe = await this.ping.ping(host, {
      count,
      ...(sizeBytes !== undefined ? { sizeBytes } : {})
    })
    return toPingStats(probe)
  }

  private async pingOrDead(
    host: string | null,
    count: number,
    sizeBytes?: number
  ): Promise<PingStats> {
    if (!host) {
      return {
        host: 'unknown',
        alive: false,
        sent: 0,
        received: 0,
        packetLossPercent: 100,
        minMs: null,
        avgMs: null,
        maxMs: null,
        jitterMs: null
      }
    }
    return this.pingHost(host, count, sizeBytes)
  }

  private async httpCheck(url: string): Promise<HttpCheck> {
    const startedAt = performance.now()
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal })
      clearTimeout(timer)
      const latencyMs = Math.round(performance.now() - startedAt)
      return {
        url,
        ok: res.status > 0 && res.status < 500,
        statusCode: res.status,
        latencyMs,
        error: null
      }
    } catch (err) {
      return {
        url,
        ok: false,
        statusCode: null,
        latencyMs: null,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
}
