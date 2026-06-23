import { describe, expect, it } from 'vitest'
import type { ConnectivityResult, DnsResult, PacketLossResult, SpeedTestResult } from '@shared/types/diagnostics'
import { HealthEngine, type HealthInput } from './HealthEngine'

const alivePing = (avgMs: number) => ({
  host: '8.8.8.8',
  alive: true,
  sent: 5,
  received: 5,
  packetLossPercent: 0,
  minMs: avgMs,
  avgMs,
  maxMs: avgMs,
  jitterMs: 1
})

function input(overrides: Partial<HealthInput> = {}): HealthInput {
  const connectivity: ConnectivityResult = {
    gateway: alivePing(2),
    internet: alivePing(15),
    http: { url: 'h', ok: true, statusCode: 204, latencyMs: 30, error: null },
    https: { url: 'h', ok: true, statusCode: 204, latencyMs: 35, error: null }
  }
  const dns: DnsResult = {
    testedDomain: 'x',
    servers: [{ server: '1.1.1.1', reachable: true, resolveMs: 20, testedDomain: 'x', error: null }],
    avgResolveMs: 20
  }
  const packetLoss: PacketLossResult = { host: '8.8.8.8', sent: 20, received: 20, lossPercent: 0, latencyAvgMs: 15, jitterMs: 1 }
  const speedTest: SpeedTestResult = {
    available: true,
    downloadMbps: 100,
    uploadMbps: 50,
    pingMs: 12,
    jitterMs: 1,
    isp: 'X',
    serverName: 'Y',
    error: null
  }
  return { connectivity, dns, packetLoss, speedTest, ...overrides }
}

describe('HealthEngine', () => {
  const engine = new HealthEngine()

  it('scores a healthy network as excellent', () => {
    const result = engine.compute(input())
    expect(result.overall).toBeGreaterThanOrEqual(90)
    expect(result.grade).toBe('excellent')
  })

  it('penalizes a dead-internet network heavily', () => {
    // A coherent outage: no internet ping AND full packet loss on the probe host.
    const dead = input({
      connectivity: {
        ...input().connectivity,
        internet: { ...alivePing(0), alive: false, received: 0, packetLossPercent: 100, avgMs: null }
      },
      packetLoss: { host: '8.8.8.8', sent: 20, received: 0, lossPercent: 100, latencyAvgMs: null, jitterMs: null }
    })
    const result = engine.compute(dead)
    expect(result.overall).toBeLessThan(50)
    expect(result.grade).not.toBe('excellent')
  })

  it('renormalizes weights when speed test is unavailable', () => {
    const noSpeed = input({
      speedTest: { available: false, downloadMbps: null, uploadMbps: null, pingMs: null, jitterMs: null, isp: null, serverName: null, error: 'x' }
    })
    const result = engine.compute(noSpeed)
    const speedComponent = result.components.find((c) => c.key === 'speed')
    expect(speedComponent?.measured).toBe(false)
    expect(speedComponent?.weight).toBe(0)
    // Remaining measured weights must sum to ~1.
    const totalWeight = result.components.filter((c) => c.measured).reduce((s, c) => s + c.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 2)
  })
})
