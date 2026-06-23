import type { AiProviderId, AiRecommendation } from '@shared/types/ai'
import type { DiagnosticSnapshot } from '@shared/types/report'
import type { Language } from '@shared/i18n'

export interface AiAnalysisContext {
  readonly snapshot: DiagnosticSnapshot
  /** Output language for the recommendation. Defaults to English when omitted. */
  readonly language?: Language
}

/**
 * Strategy interface for AI providers. Adding Claude / Gemini / a local LLM is a
 * matter of implementing this one method — no caller changes. Providers return
 * recommendation text in the context's `language` (default English).
 */
export interface IAiProvider {
  readonly id: AiProviderId
  analyze(context: AiAnalysisContext): Promise<AiRecommendation>
}
