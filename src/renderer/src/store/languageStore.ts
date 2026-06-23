import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LANGUAGE, type Language } from '@shared/i18n'

/**
 * UI language preference. Unlike diagnostic data (which is session-only by
 * product spec), the chosen language is a user setting, so it's persisted to
 * localStorage and survives restarts. Default is English.
 */
interface LanguageState {
  language: Language
  setLanguage(language: Language): void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language })
    }),
    { name: 'netdoctor-language' }
  )
)
