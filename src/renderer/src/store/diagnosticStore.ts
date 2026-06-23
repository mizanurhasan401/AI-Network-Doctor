import { create } from 'zustand'
import type { DiagnosticSnapshot } from '@shared/types/report'
import type { AiRecommendation, AiProviderConfig } from '@shared/types/ai'
import type { ProgressEvent } from '@shared/ipc/contract'

/**
 * Ephemeral UI state. Per the product spec there is NO persistence: the latest
 * snapshot and recommendation live only in memory until exported, and are gone on
 * app restart. The AI config (incl. any API key) is likewise session-only.
 */
interface DiagnosticState {
  snapshot: DiagnosticSnapshot | null
  recommendation: AiRecommendation | null
  progress: ProgressEvent | null
  aiConfig: AiProviderConfig

  setSnapshot(snapshot: DiagnosticSnapshot): void
  setRecommendation(recommendation: AiRecommendation): void
  clearRecommendation(): void
  setProgress(progress: ProgressEvent | null): void
  setAiConfig(config: Partial<AiProviderConfig>): void
  reset(): void
}

const DEFAULT_AI_CONFIG: AiProviderConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.3
}

export const useDiagnosticStore = create<DiagnosticState>((set) => ({
  snapshot: null,
  recommendation: null,
  progress: null,
  aiConfig: DEFAULT_AI_CONFIG,

  setSnapshot: (snapshot) => set({ snapshot, recommendation: null }),
  setRecommendation: (recommendation) => set({ recommendation }),
  clearRecommendation: () => set({ recommendation: null }),
  setProgress: (progress) => set({ progress }),
  setAiConfig: (config) => set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),
  reset: () => set({ snapshot: null, recommendation: null, progress: null })
}))
