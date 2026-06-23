import type { AiProviderConfig } from '@shared/types/ai'
import { childLogger } from '../../core/logger'
import { OpenAiProvider } from './providers/OpenAiProvider'
import { FallbackProvider } from './providers/FallbackProvider'
import type { IAiProvider } from './IAiProvider'

const log = childLogger('AiProviderFactory')

/**
 * Selects a provider implementation from config. Claude / Gemini / remote-local
 * are architecturally prepared but not yet implemented, so they currently resolve
 * to the offline fallback — wiring a new provider only touches this switch.
 */
export class AiProviderFactory {
  create(config: AiProviderConfig): IAiProvider {
    switch (config.provider) {
      case 'openai':
        if (config.apiKey) return new OpenAiProvider(config)
        log.warn('OpenAI selected without API key — using offline fallback')
        return new FallbackProvider()
      case 'claude':
      case 'gemini':
        log.info({ provider: config.provider }, 'provider not yet implemented — using fallback')
        return new FallbackProvider()
      case 'local':
      default:
        return new FallbackProvider()
    }
  }
}
