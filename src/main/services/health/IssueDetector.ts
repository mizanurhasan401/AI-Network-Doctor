import type { DetectedIssue } from '@shared/types/diagnostics'
import type { HealthInput } from './HealthEngine'

/**
 * Rule-based issue detection. Produces Bangla, customer-readable findings from
 * raw measurements. These feed both the report and the AI engine (as grounding
 * context), keeping the AI honest about what was actually observed.
 */
export class IssueDetector {
  detect(input: HealthInput): DetectedIssue[] {
    const issues: DetectedIssue[] = []
    const { connectivity, dns, packetLoss, speedTest } = input

    if (!connectivity.internet.alive) {
      issues.push({
        id: 'no-internet',
        area: 'connectivity',
        severity: 'critical',
        titleBn: 'ইন্টারনেট সংযোগ নেই',
        descriptionBn: 'পাবলিক হোস্টে পিং ব্যর্থ হয়েছে — ইন্টারনেট সংযোগ বিচ্ছিন্ন বলে মনে হচ্ছে।'
      })
    }

    if (!connectivity.gateway.alive) {
      issues.push({
        id: 'gateway-unreachable',
        area: 'connectivity',
        severity: 'critical',
        titleBn: 'রাউটার/গেটওয়েতে পৌঁছানো যাচ্ছে না',
        descriptionBn: 'লোকাল গেটওয়েতে পিং ব্যর্থ — রাউটার বা স্থানীয় সংযোগে সমস্যা থাকতে পারে।'
      })
    }

    if (packetLoss.lossPercent >= 5) {
      issues.push({
        id: 'packet-loss',
        area: 'packetLoss',
        severity: packetLoss.lossPercent >= 15 ? 'critical' : 'warning',
        titleBn: `প্যাকেট লস ${packetLoss.lossPercent}%`,
        descriptionBn: 'উল্লেখযোগ্য প্যাকেট লস শনাক্ত হয়েছে — ভিডিও কল ও গেমিংয়ে বিঘ্ন ঘটতে পারে।'
      })
    }

    if (connectivity.internet.avgMs !== null && connectivity.internet.avgMs > 150) {
      issues.push({
        id: 'high-latency',
        area: 'latency',
        severity: connectivity.internet.avgMs > 300 ? 'critical' : 'warning',
        titleBn: `উচ্চ লেটেন্সি (${connectivity.internet.avgMs}ms)`,
        descriptionBn: 'গড় লেটেন্সি বেশি — ব্রাউজিং ও রিয়েল-টাইম অ্যাপ ধীর মনে হতে পারে।'
      })
    }

    const unreachableDns = dns.servers.filter((s) => !s.reachable).length
    if (unreachableDns > 0) {
      issues.push({
        id: 'dns-unreachable',
        area: 'dns',
        severity: unreachableDns === dns.servers.length ? 'critical' : 'warning',
        titleBn: 'ডিএনএস রেজোলিউশন সমস্যা',
        descriptionBn: `${unreachableDns}টি ডিএনএস সার্ভার সাড়া দেয়নি — নাম রেজোলিউশন ব্যর্থ হতে পারে।`
      })
    } else if (dns.avgResolveMs !== null && dns.avgResolveMs > 120) {
      issues.push({
        id: 'slow-dns',
        area: 'dns',
        severity: 'warning',
        titleBn: 'ডিএনএস রেজোলিউশন ধীর',
        descriptionBn: `গড় ডিএনএস রেজোলিউশন সময় ${dns.avgResolveMs}ms — দ্রুততর ডিএনএস ব্যবহার বিবেচনা করুন।`
      })
    }

    if (speedTest.available && speedTest.downloadMbps !== null && speedTest.downloadMbps < 10) {
      issues.push({
        id: 'low-bandwidth',
        area: 'speed',
        severity: 'warning',
        titleBn: `ডাউনলোড গতি কম (${speedTest.downloadMbps} Mbps)`,
        descriptionBn: 'ডাউনলোড গতি প্রত্যাশার চেয়ে কম — প্ল্যান বা লাইন কোয়ালিটি যাচাই করুন।'
      })
    }

    return issues
  }
}
