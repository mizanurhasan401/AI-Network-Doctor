import { create } from 'zustand'
import type { DiagnosticSnapshot } from '@shared/types/report'
import type { AiRecommendation, AiProviderConfig } from '@shared/types/ai'
import type { ProgressEvent } from '@shared/ipc/contract'

/**
 * Ephemeral UI state. Per the product spec there is NO persistence: the latest
 * snapshot and recommendation live only in memory until exported, and are gone on
 * app restart. The AI config (incl. any API key) is likewise session-only.
 */
/**
 * Per-run probe knobs chosen in the UI. `null` means "use the service default"
 * (so the request omits the field and existing behavior is preserved).
 */
export interface ProbeConfig {
  /** ICMP echoes per probe; null = service default. */
  pingCount: number | null
  /** Custom ICMP payload size in bytes; null = OS default. */
  packetSizeBytes: number | null
}

interface DiagnosticState {
  snapshot: DiagnosticSnapshot | null
  recommendation: AiRecommendation | null
  progress: ProgressEvent | null
  aiConfig: AiProviderConfig
  probeConfig: ProbeConfig

  setSnapshot(snapshot: DiagnosticSnapshot): void
  setRecommendation(recommendation: AiRecommendation): void
  clearRecommendation(): void
  setProgress(progress: ProgressEvent | null): void
  setAiConfig(config: Partial<AiProviderConfig>): void
  setProbeConfig(config: Partial<ProbeConfig>): void
  reset(): void
}

const DEFAULT_AI_CONFIG: AiProviderConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.3
}

const DEFAULT_PROBE_CONFIG: ProbeConfig = {
  pingCount: null,
  packetSizeBytes: null
}

export const useDiagnosticStore = create<DiagnosticState>((set) => ({
  snapshot: null,
  recommendation: null,
  progress: null,
  aiConfig: DEFAULT_AI_CONFIG,
  probeConfig: DEFAULT_PROBE_CONFIG,

  setSnapshot: (snapshot) => set({ snapshot, recommendation: null }),
  setRecommendation: (recommendation) => set({ recommendation }),
  clearRecommendation: () => set({ recommendation: null }),
  setProgress: (progress) => set({ progress }),
  setAiConfig: (config) => set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),
  setProbeConfig: (config) => set((state) => ({ probeConfig: { ...state.probeConfig, ...config } })),
  reset: () => set({ snapshot: null, recommendation: null, progress: null })
}))
