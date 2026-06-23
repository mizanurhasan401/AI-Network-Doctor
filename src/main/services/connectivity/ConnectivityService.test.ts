import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IPingAdapter, PingProbeResult } from '../../adapters/ping/IPingAdapter'
import { ConnectivityService } from './ConnectivityService'

class StubPingAdapter implements IPingAdapter {
  constructor(private readonly map: Record<string, PingProbeResult>) {}
  async ping(host: string): Promise<PingProbeResult> {
    return this.map[host] ?? { host, alive: false, sent: 5, received: 0, lossPercent: 100, rttsMs: [] }
  }
}

describe('ConnectivityService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('aggregates gateway + internet pings and http checks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 204 }) as Response))

    const ping = new StubPingAdapter({
      '192.168.1.1': { host: '192.168.1.1', alive: true, sent: 5, received: 5, lossPercent: 0, rttsMs: [1, 2, 3] },
      '8.8.8.8': { host: '8.8.8.8', alive: true, sent: 5, received: 4, lossPercent: 20, rttsMs: [10, 12, 11, 13] }
    })
    const service = new ConnectivityService(ping)

    const result = await service.run({ gatewayIp: '192.168.1.1', probeHost: '8.8.8.8' })

    expect(result.gateway.alive).toBe(true)
    expect(result.gateway.avgMs).toBe(2)
    expect(result.internet.packetLossPercent).toBe(20)
    expect(result.http.ok).toBe(true)
    expect(result.https.ok).toBe(true)
  })

  it('reports a dead gateway when no gateway IP is known', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 204 }) as Response))
    const service = new ConnectivityService(new StubPingAdapter({}))

    const result = await service.run({ gatewayIp: null })

    expect(result.gateway.alive).toBe(false)
    expect(result.gateway.packetLossPercent).toBe(100)
  })
})
