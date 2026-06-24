import type { DiagnosticSnapshot } from '@shared/types/report'

/** Builds a baseline healthy snapshot; override any slice for a given test. */
export function makeSnapshot(overrides: Partial<DiagnosticSnapshot> = {}): DiagnosticSnapshot {
  return {
    id: 'test-id',
    createdAt: '2026-06-23T10:00:00.000Z',
    system: {
      hostname: 'test-host',
      localIp: '192.168.1.10',
      gatewayIp: '192.168.1.1',
      dnsServers: ['1.1.1.1'],
      publicIp: '203.0.113.5',
      macAddress: 'aa:bb:cc:dd:ee:ff',
      linkSpeedMbps: 1000,
      linkType: 'wired',
      os: { platform: 'darwin', distro: 'macOS', release: '15.0', arch: 'arm64' },
      cpu: { manufacturer: 'Apple', brand: 'M1', cores: 8, speedGHz: 3.2 },
      ram: { totalBytes: 17_179_869_184, freeBytes: 8_000_000_000 }
    },
    connectivity: {
      gateway: { host: '192.168.1.1', alive: true, sent: 5, received: 5, packetLossPercent: 0, minMs: 1, avgMs: 2, maxMs: 3, jitterMs: 1 },
      internet: { host: '8.8.8.8', alive: true, sent: 5, received: 5, packetLossPercent: 0, minMs: 12, avgMs: 15, maxMs: 18, jitterMs: 1 },
      http: { url: 'h', ok: true, statusCode: 204, latencyMs: 30, error: null },
      https: { url: 'h', ok: true, statusCode: 204, latencyMs: 35, error: null }
    },
    dns: {
      testedDomain: 'cloudflare.com',
      servers: [{ server: '1.1.1.1', reachable: true, resolveMs: 20, testedDomain: 'cloudflare.com', error: null }],
      avgResolveMs: 20
    },
    packetLoss: { host: '8.8.8.8', sent: 20, received: 20, lossPercent: 0, latencyAvgMs: 15, jitterMs: 1 },
    traceroute: { target: '8.8.8.8', hops: [{ hop: 1, host: '192.168.1.1', ip: '192.168.1.1', avgMs: 2, timedOut: false }], completed: true },
    speedTest: { available: true, downloadMbps: 100, uploadMbps: 50, pingMs: 12, jitterMs: 1, isp: 'ISP', serverName: 'srv', error: null },
    health: {
      overall: 95,
      grade: 'excellent',
      components: [{ key: 'connectivity', labelBn: 'সংযোগ', score: 100, weight: 0.3, measured: true }]
    },
    issues: [],
    ...overrides
  }
}
