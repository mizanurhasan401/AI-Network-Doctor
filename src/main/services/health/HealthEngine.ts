import type {
  ConnectivityResult,
  DnsResult,
  PacketLossResult,
  SpeedTestResult
} from '@shared/types/diagnostics'
import type { HealthComponent, HealthComponentKey, HealthGrade, HealthScore } from '@shared/types/health'
import { clamp, round } from '../../core/stats'

export interface HealthInput {
  readonly connectivity: ConnectivityResult
  readonly dns: DnsResult
  readonly packetLoss: PacketLossResult
  readonly speedTest: SpeedTestResult
}

interface RawComponent {
  readonly key: HealthComponentKey
  readonly labelBn: string
  readonly weight: number
  readonly score: number
  readonly measured: boolean
}

/**
 * Deterministic, explainable scoring. Each dimension yields a 0-100 sub-score;
 * the overall score is a weight-renormalized average over the dimensions that
 * could actually be measured (so a missing speed test doesn't unfairly tank the
 * grade). Thresholds are intentionally centralized for easy tuning.
 */
export class HealthEngine {
  compute(input: HealthInput): HealthScore {
    const raw: RawComponent[] = [
      {
        key: 'connectivity',
        labelBn: 'সংযোগ',
        weight: 0.3,
        measured: true,
        score: this.connectivityScore(input.connectivity)
      },
      {
        key: 'dns',
        labelBn: 'ডিএনএস',
        weight: 0.15,
        measured: true,
        score: this.dnsScore(input.dns)
      },
      {
        key: 'packetLoss',
        labelBn: 'প্যাকেট লস',
        weight: 0.2,
        measured: true,
        score: this.packetLossScore(input.packetLoss)
      },
      {
        key: 'latency',
        labelBn: 'লেটেন্সি',
        weight: 0.15,
        measured: input.connectivity.internet.avgMs !== null,
        score: this.latencyScore(input.connectivity.internet.avgMs)
      },
      {
        key: 'speed',
        labelBn: 'গতি',
        weight: 0.2,
        measured: input.speedTest.available,
        score: this.speedScore(input.speedTest)
      }
    ]

    const measured = raw.filter((c) => c.measured)
    const totalWeight = measured.reduce((sum, c) => sum + c.weight, 0) || 1
    const overall = round(
      measured.reduce((sum, c) => sum + c.score * (c.weight / totalWeight), 0)
    )

    const components: HealthComponent[] = raw.map((c) => ({
      key: c.key,
      labelBn: c.labelBn,
      score: round(c.score),
      weight: c.measured ? round(c.weight / totalWeight, 3) : 0,
      measured: c.measured
    }))

    return { overall, grade: this.grade(overall), components }
  }

  private connectivityScore(c: ConnectivityResult): number {
    let score = 0
    if (c.internet.alive) score += 50
    if (c.gateway.alive) score += 20
    if (c.https.ok) score += 20
    if (c.http.ok) score += 10
    score -= c.internet.packetLossPercent * 0.5
    return clamp(score, 0, 100)
  }

  private dnsScore(dns: DnsResult): number {
    if (dns.servers.length === 0) return 0
    const reachable = dns.servers.filter((s) => s.reachable).length
    const availability = (reachable / dns.servers.length) * 70
    const speed = dns.avgResolveMs === null ? 0 : clamp(30 - (dns.avgResolveMs / 200) * 30, 0, 30)
    return clamp(availability + speed, 0, 100)
  }

  private packetLossScore(p: PacketLossResult): number {
    // 0% loss → 100; each 1% loss removes ~8 points; 12.5%+ loss → 0.
    return clamp(100 - p.lossPercent * 8, 0, 100)
  }

  private latencyScore(avgMs: number | null): number {
    if (avgMs === null) return 0
    if (avgMs <= 20) return 100
    if (avgMs >= 300) return 0
    return clamp(100 - ((avgMs - 20) / 280) * 100, 0, 100)
  }

  private speedScore(speed: SpeedTestResult): number {
    if (!speed.available || speed.downloadMbps === null) return 0
    // 100 Mbps+ → 100; scaled linearly below that.
    return clamp((speed.downloadMbps / 100) * 100, 0, 100)
  }

  private grade(overall: number): HealthGrade {
    if (overall >= 90) return 'excellent'
    if (overall >= 75) return 'good'
    if (overall >= 55) return 'fair'
    if (overall >= 35) return 'poor'
    return 'critical'
  }
}
