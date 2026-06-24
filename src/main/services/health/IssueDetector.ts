import type { DetectedIssue } from '@shared/types/diagnostics'
import type { HealthInput } from './HealthEngine'

/**
 * Rule-based issue detection. Produces language-neutral findings (stable `id` +
 * measured `params`) from raw measurements. The renderer and the report localize
 * them via the i18n catalog; the AI engine receives them as grounding context.
 */
export class IssueDetector {
  detect(input: HealthInput): DetectedIssue[] {
    const issues: DetectedIssue[] = []
    const { connectivity, dns, packetLoss, speedTest } = input

    if (!connectivity.internet.alive) {
      issues.push({ id: 'no-internet', area: 'connectivity', severity: 'critical' })
    }

    if (!connectivity.gateway.alive) {
      issues.push({ id: 'gateway-unreachable', area: 'connectivity', severity: 'critical' })
    }

    // Packet-loss detection is sample-aware so a single stray drop doesn't read
    // as "unreachable". 1 of 5 packets is 20% loss but tells us almost nothing;
    // we only flag a true total outage, or ≥2 drops at a meaningful percentage
    // (so larger sample counts, e.g. 100 pings, make the verdict trustworthy).
    if (packetLoss.sent > 0) {
      const lost = packetLoss.sent - packetLoss.received
      if (packetLoss.received === 0) {
        issues.push({
          id: 'packet-loss',
          area: 'packetLoss',
          severity: 'critical',
          params: { lossPercent: packetLoss.lossPercent }
        })
      } else if (lost >= 2 && packetLoss.lossPercent >= 5) {
        issues.push({
          id: 'packet-loss',
          area: 'packetLoss',
          severity: packetLoss.lossPercent >= 15 ? 'critical' : 'warning',
          params: { lossPercent: packetLoss.lossPercent }
        })
      }
    }

    if (connectivity.internet.avgMs !== null && connectivity.internet.avgMs > 150) {
      issues.push({
        id: 'high-latency',
        area: 'latency',
        severity: connectivity.internet.avgMs > 300 ? 'critical' : 'warning',
        params: { avgMs: connectivity.internet.avgMs }
      })
    }

    const unreachableDns = dns.servers.filter((s) => !s.reachable).length
    if (unreachableDns > 0) {
      issues.push({
        id: 'dns-unreachable',
        area: 'dns',
        severity: unreachableDns === dns.servers.length ? 'critical' : 'warning',
        params: { count: unreachableDns }
      })
    } else if (dns.avgResolveMs !== null && dns.avgResolveMs > 120) {
      issues.push({
        id: 'slow-dns',
        area: 'dns',
        severity: 'warning',
        params: { avgResolveMs: dns.avgResolveMs }
      })
    }

    if (speedTest.available && speedTest.downloadMbps !== null && speedTest.downloadMbps < 10) {
      issues.push({
        id: 'low-bandwidth',
        area: 'speed',
        severity: 'warning',
        params: { downloadMbps: speedTest.downloadMbps }
      })
    }

    return issues
  }
}
