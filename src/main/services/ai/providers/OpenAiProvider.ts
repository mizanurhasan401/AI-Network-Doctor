import OpenAI from 'openai'
import type { AiProviderConfig, AiRecommendation } from '@shared/types/ai'
import { AIError } from '@shared/errors/errors'
import { DEFAULT_LANGUAGE } from '@shared/i18n'
import { childLogger } from '../../../core/logger'
import { buildSystemPrompt, buildUserPrompt } from '../prompts'
import { aiRecommendationSchema } from '../recommendation.schema'
import type { AiAnalysisContext, IAiProvider } from '../IAiProvider'

const log = childLogger('OpenAiProvider')

/**
 * OpenAI implementation. The API key is taken from per-session config and never
 * persisted or logged. JSON mode + Zod validation make the output trustworthy.
 */
export class OpenAiProvider implements IAiProvider {
  readonly id = 'openai' as const
  private readonly client: OpenAI

  constructor(private readonly config: AiProviderConfig) {
    if (!config.apiKey) {
      throw new AIError('OpenAI ব্যবহারের জন্য API কী প্রয়োজন।', { detail: 'missing apiKey' })
    }
    this.client = new OpenAI({
      apiKey: config.apiKey,
      ...(config.baseUrl ? { baseURL: config.baseUrl } : {})
    })
  }

  async analyze({ snapshot, language = DEFAULT_LANGUAGE }: AiAnalysisContext): Promise<AiRecommendation> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature ?? 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(language) },
          { role: 'user', content: buildUserPrompt(language, snapshot) }
        ]
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new AIError('AI থেকে খালি উত্তর পাওয়া গেছে।')

      const parsed = aiRecommendationSchema.safeParse(JSON.parse(content))
      if (!parsed.success) {
        throw new AIError('AI উত্তরের কাঠামো অবৈধ।', { detail: parsed.error.message })
      }

      return { ...parsed.data, generatedByFallback: false }
    } catch (err) {
      if (err instanceof AIError) throw err
      log.error({ err }, 'OpenAI analysis failed')
      throw new AIError('AI বিশ্লেষণ ব্যর্থ হয়েছে।', {
        cause: err,
        ...(err instanceof Error ? { detail: err.message } : {})
      })
    }
  }
}
