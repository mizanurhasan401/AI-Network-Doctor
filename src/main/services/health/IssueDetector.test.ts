import { describe, expect, it } from 'vitest'
import type {
  ConnectivityResult,
  DnsResult,
  PacketLossResult,
  PingStats,
  SpeedTestResult
} from '@shared/types/diagnostics'
import { IssueDetector } from './IssueDetector'
import type { HealthInput } from './HealthEngine'

const alivePing: PingStats = {
  host: '8.8.8.8',
  alive: true,
  sent: 5,
  received: 5,
  packetLossPercent: 0,
  minMs: 10,
  avgMs: 12,
  maxMs: 14,
  jitterMs: 1
}

const okConnectivity: ConnectivityResult = {
  gateway: { ...alivePing, host: '192.168.0.1' },
  internet: alivePing,
  http: { url: 'http://x', ok: true, statusCode: 204, latencyMs: 20, error: null },
  https: { url: 'https://x', ok: true, statusCode: 204, latencyMs: 22, error: null }
}

const okDns: DnsResult = {
  testedDomain: 'cloudflare.com',
  servers: [{ server: '1.1.1.1', reachable: true, resolveMs: 20, testedDomain: 'cloudflare.com', error: null }],
  avgResolveMs: 20
}

const noSpeed: SpeedTestResult = {
  available: false,
  downloadMbps: null,
  uploadMbps: null,
  pingMs: null,
  jitterMs: null,
  isp: null,
  serverName: null,
  error: null
}

function input(packetLoss: PacketLossResult): HealthInput {
  return { connectivity: okConnectivity, dns: okDns, packetLoss, speedTest: noSpeed }
}

function loss(sent: number, received: number): PacketLossResult {
  return {
    host: '8.8.8.8',
    sent,
    received,
    lossPercent: sent > 0 ? Math.round(((sent - received) / sent) * 10000) / 100 : 100,
    latencyAvgMs: 12,
    jitterMs: 1
  }
}

describe('IssueDetector packet-loss thresholds', () => {
  const detector = new IssueDetector()
  const find = (i: HealthInput): boolean => detector.detect(i).some((x) => x.id === 'packet-loss')

  it('ignores a single stray drop in a small sample (1 of 5 = 20%)', () => {
    expect(find(input(loss(5, 4)))).toBe(false)
  })

  it('ignores a single drop in a large sample (1 of 100 = 1%)', () => {
    expect(find(input(loss(100, 99)))).toBe(false)
  })

  it('flags a critical packet-loss when nothing comes back', () => {
    const issues = detector.detect(input(loss(20, 0)))
    const pl = issues.find((x) => x.id === 'packet-loss')
    expect(pl?.severity).toBe('critical')
  })

  it('flags a warning for meaningful loss (2 of 20 = 10%)', () => {
    const issues = detector.detect(input(loss(20, 18)))
    const pl = issues.find((x) => x.id === 'packet-loss')
    expect(pl?.severity).toBe('warning')
  })

  it('flags critical for heavy loss (4 of 20 = 20%)', () => {
    const issues = detector.detect(input(loss(20, 16)))
    const pl = issues.find((x) => x.id === 'packet-loss')
    expect(pl?.severity).toBe('critical')
  })
})
