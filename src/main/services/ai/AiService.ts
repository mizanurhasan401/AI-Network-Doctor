import type { AiProviderConfig, AiRecommendation } from '@shared/types/ai'
import type { DiagnosticSnapshot } from '@shared/types/report'
import { DEFAULT_LANGUAGE, type Language } from '@shared/i18n'
import { childLogger } from '../../core/logger'
import { AiProviderFactory } from './AiProviderFactory'
import { FallbackProvider } from './providers/FallbackProvider'

const log = childLogger('AiService')

/**
 * Application-facing AI facade. Resolves a provider, runs analysis, and — if the
 * live provider fails for any reason — degrades to the offline Bangla engine so
 * the caller always receives a valid recommendation. Never throws on AI failure.
 */
export class AiService {
  constructor(
    private readonly factory = new AiProviderFactory(),
    private readonly fallback = new FallbackProvider()
  ) {}

  async analyze(
    snapshot: DiagnosticSnapshot,
    config: AiProviderConfig,
    language: Language = DEFAULT_LANGUAGE
  ): Promise<AiRecommendation> {
    const provider = this.factory.create(config)
    try {
      return await provider.analyze({ snapshot, language })
    } catch (err) {
      log.warn({ err, provider: provider.id }, 'provider failed; using offline fallback')
      return this.fallback.analyze({ snapshot, language })
    }
  }
}
