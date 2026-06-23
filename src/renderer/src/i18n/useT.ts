import { useCallback } from 'react'
import { translate, type Language, type MessageKey, type TranslateParams } from '@shared/i18n'
import { useLanguageStore } from '../store/languageStore'

export type TFunction = (key: MessageKey, params?: TranslateParams) => string

/** Reactive translator bound to the current UI language. */
export function useT(): TFunction {
  const language = useLanguageStore((s) => s.language)
  return useCallback(
    (key: MessageKey, params?: TranslateParams) => translate(language, key, params),
    [language]
  )
}

/** The currently selected UI language. */
export function useLanguage(): Language {
  return useLanguageStore((s) => s.language)
}
