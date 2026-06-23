import type { AiPriority, AiRecommendation } from '@shared/types/ai'
import type { DiagnosticSnapshot } from '@shared/types/report'
import { DEFAULT_LANGUAGE, translate, type Language, type MessageKey } from '@shared/i18n'
import { clamp } from '../../../core/stats'
import type { AiAnalysisContext, IAiProvider } from '../IAiProvider'

/**
 * Deterministic, offline recommendation engine. Used when no API key is
 * configured or the chosen provider is 'local' without an endpoint, and as the
 * resilient fallback when a live provider fails. Guarantees the product promise
 * ("AI-powered recommendation") in the selected language even with zero
 * connectivity.
 */
export class FallbackProvider implements IAiProvider {
  readonly id = 'local' as const

  async analyze({ snapshot, language = DEFAULT_LANGUAGE }: AiAnalysisContext): Promise<AiRecommendation> {
    const critical = snapshot.issues.filter((i) => i.severity === 'critical')
    const warnings = snapshot.issues.filter((i) => i.severity === 'warning')

    const priority: AiPriority =
      critical.length > 0 ? 'critical' : warnings.length > 1 ? 'high' : warnings.length === 1 ? 'medium' : 'low'

    return {
      problemSummaryBn: this.summary(language, snapshot, critical.length, warnings.length),
      rootCauseBn: this.rootCause(language, snapshot),
      impactBn: this.impact(language, priority),
      solutionsBn: this.solutions(language, snapshot),
      priority,
      confidence: clamp(0.55 + snapshot.issues.length * 0.05, 0.5, 0.8),
      generatedByFallback: true
    }
  }

  private summary(lang: Language, s: DiagnosticSnapshot, critical: number, warnings: number): string {
    if (s.issues.length === 0) {
      return translate(lang, 'aifb.summary.none', { score: s.health.overall })
    }
    return translate(lang, 'aifb.summary.issues', { critical, warnings, score: s.health.overall })
  }

  private rootCause(lang: Language, s: DiagnosticSnapshot): string {
    let key: MessageKey = 'aifb.rootCause.none'
    if (!s.connectivity.internet.alive) key = 'aifb.rootCause.internet'
    else if (!s.connectivity.gateway.alive) key = 'aifb.rootCause.gateway'
    else if (s.packetLoss.lossPercent >= 5) key = 'aifb.rootCause.packetLoss'
    else if (s.dns.servers.some((d) => !d.reachable)) key = 'aifb.rootCause.dns'
    return translate(lang, key)
  }

  private impact(lang: Language, priority: AiPriority): string {
    const key: Record<AiPriority, MessageKey> = {
      critical: 'aifb.impact.critical',
      high: 'aifb.impact.high',
      medium: 'aifb.impact.medium',
      low: 'aifb.impact.low'
    }
    return translate(lang, key[priority])
  }

  private solutions(lang: Language, s: DiagnosticSnapshot): string[] {
    const out: string[] = []
    if (!s.connectivity.internet.alive) out.push(translate(lang, 'aifb.solution.internet'))
    if (!s.connectivity.gateway.alive) out.push(translate(lang, 'aifb.solution.gateway'))
    if (s.packetLoss.lossPercent >= 5) out.push(translate(lang, 'aifb.solution.packetLoss'))
    if (s.dns.servers.some((d) => !d.reachable) || (s.dns.avgResolveMs ?? 0) > 120)
      out.push(translate(lang, 'aifb.solution.dns'))
    if (s.speedTest.available && (s.speedTest.downloadMbps ?? 0) < 10)
      out.push(translate(lang, 'aifb.solution.speed'))
    if (out.length === 0) out.push(translate(lang, 'aifb.solution.none'))
    return out
  }
}
