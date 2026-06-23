import type { AiPriority, AiRecommendation } from '@shared/types/ai'
import type { DiagnosticSnapshot } from '@shared/types/report'
import { clamp } from '../../../core/stats'
import type { AiAnalysisContext, IAiProvider } from '../IAiProvider'

/**
 * Deterministic, offline Bangla recommendation engine. Used when no API key is
 * configured or the chosen provider is 'local' without an endpoint, and as the
 * resilient fallback when a live provider fails. Guarantees the product promise
 * ("AI-powered recommendation in Bangla") even with zero connectivity.
 */
export class FallbackProvider implements IAiProvider {
  readonly id = 'local' as const

  async analyze({ snapshot }: AiAnalysisContext): Promise<AiRecommendation> {
    const critical = snapshot.issues.filter((i) => i.severity === 'critical')
    const warnings = snapshot.issues.filter((i) => i.severity === 'warning')

    const priority: AiPriority =
      critical.length > 0 ? 'critical' : warnings.length > 1 ? 'high' : warnings.length === 1 ? 'medium' : 'low'

    return {
      problemSummaryBn: this.summary(snapshot, critical.length, warnings.length),
      rootCauseBn: this.rootCause(snapshot),
      impactBn: this.impact(priority),
      solutionsBn: this.solutions(snapshot),
      priority,
      confidence: clamp(0.55 + snapshot.issues.length * 0.05, 0.5, 0.8),
      generatedByFallback: true
    }
  }

  private summary(s: DiagnosticSnapshot, critical: number, warnings: number): string {
    if (s.issues.length === 0) {
      return `নেটওয়ার্ক স্বাস্থ্য স্কোর ${s.health.overall}/100 — কোনো উল্লেখযোগ্য সমস্যা শনাক্ত হয়নি।`
    }
    return `${critical}টি গুরুতর এবং ${warnings}টি সতর্কতামূলক সমস্যা শনাক্ত হয়েছে। স্বাস্থ্য স্কোর ${s.health.overall}/100।`
  }

  private rootCause(s: DiagnosticSnapshot): string {
    if (!s.connectivity.internet.alive) return 'ইন্টারনেট আপলিঙ্ক বা আইএসপি সংযোগ বিচ্ছিন্ন।'
    if (!s.connectivity.gateway.alive) return 'স্থানীয় রাউটার বা গেটওয়ে সংযোগে সমস্যা।'
    if (s.packetLoss.lossPercent >= 5) return 'লাইন কোয়ালিটি বা ভিড়জনিত কারণে প্যাকেট লস।'
    if (s.dns.servers.some((d) => !d.reachable)) return 'ডিএনএস সার্ভার কনফিগারেশন বা প্রাপ্যতার সমস্যা।'
    return 'নির্দিষ্ট কোনো মূল কারণ স্বয়ংক্রিয়ভাবে শনাক্ত হয়নি; পরিমাপ স্বাভাবিক সীমার মধ্যে।'
  }

  private impact(priority: AiPriority): string {
    const map: Record<AiPriority, string> = {
      critical: 'ইন্টারনেট ব্যবহার মারাত্মকভাবে ব্যাহত হচ্ছে।',
      high: 'ব্রাউজিং, কল ও স্ট্রিমিংয়ে লক্ষণীয় বিঘ্ন ঘটছে।',
      medium: 'কিছু পরিষেবায় মাঝে মাঝে ধীরগতি অনুভূত হতে পারে।',
      low: 'ব্যবহারকারীর উপর সামান্য বা কোনো প্রভাব নেই।'
    }
    return map[priority]
  }

  private solutions(s: DiagnosticSnapshot): string[] {
    const out: string[] = []
    if (!s.connectivity.internet.alive) out.push('মডেম/রাউটার পুনরায় চালু করুন এবং আইএসপি লাইন স্ট্যাটাস যাচাই করুন।')
    if (!s.connectivity.gateway.alive) out.push('রাউটারের পাওয়ার ও কেবল সংযোগ পরীক্ষা করুন।')
    if (s.packetLoss.lossPercent >= 5) out.push('তার/কানেক্টর পরীক্ষা করুন এবং সম্ভব হলে ওয়াইফাইয়ের বদলে ইথারনেট ব্যবহার করুন।')
    if (s.dns.servers.some((d) => !d.reachable) || (s.dns.avgResolveMs ?? 0) > 120)
      out.push('ডিএনএস হিসেবে 1.1.1.1 বা 8.8.8.8 ব্যবহার করে দেখুন।')
    if (s.speedTest.available && (s.speedTest.downloadMbps ?? 0) < 10)
      out.push('আইএসপির সাথে আপনার প্ল্যানের গতি ও লাইন কোয়ালিটি নিশ্চিত করুন।')
    if (out.length === 0) out.push('বর্তমানে কোনো পদক্ষেপ প্রয়োজন নেই; পর্যায়ক্রমে পুনরায় পরীক্ষা করুন।')
    return out
  }
}
