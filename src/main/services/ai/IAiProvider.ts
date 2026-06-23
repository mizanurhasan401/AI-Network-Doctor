import type { AiProviderId, AiRecommendation } from '@shared/types/ai'
import type { DiagnosticSnapshot } from '@shared/types/report'

export interface AiAnalysisContext {
  readonly snapshot: DiagnosticSnapshot
}

/**
 * Strategy interface for AI providers. Adding Claude / Gemini / a local LLM is a
 * matter of implementing this one method — no caller changes. All providers MUST
 * return Bangla text in the AiRecommendation fields.
 */
export interface IAiProvider {
  readonly id: AiProviderId
  analyze(context: AiAnalysisContext): Promise<AiRecommendation>
}
