/** AI analysis model. All human-facing text fields are Bangla. */

export type AiProviderId = 'openai' | 'claude' | 'gemini' | 'local'

export type AiPriority = 'low' | 'medium' | 'high' | 'critical'

export interface AiProviderConfig {
  readonly provider: AiProviderId
  readonly model: string
  /** Never persisted to disk; supplied per-session from the UI/env. */
  readonly apiKey?: string
  readonly baseUrl?: string
  readonly temperature?: number
}

/** Structured, Bangla AI recommendation — mirrors the required report sections. */
export interface AiRecommendation {
  /** সমস্যা সারাংশ */
  readonly problemSummaryBn: string
  /** সম্ভাব্য মূল কারণ */
  readonly rootCauseBn: string
  /** প্রভাব */
  readonly impactBn: string
  /** করণীয় সমাধান */
  readonly solutionsBn: readonly string[]
  /** অগ্রাধিকার স্তর */
  readonly priority: AiPriority
  /** Confidence Score, 0-1. */
  readonly confidence: number
  /** True when produced by the offline heuristic fallback, not a live model. */
  readonly generatedByFallback: boolean
}
