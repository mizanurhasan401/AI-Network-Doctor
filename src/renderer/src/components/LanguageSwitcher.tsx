import { Languages } from 'lucide-react'
import { LANGUAGES } from '@shared/i18n'
import { useLanguageStore } from '../store/languageStore'
import { useDiagnosticStore } from '../store/diagnosticStore'
import { cn } from '../lib/utils'

const SHORT: Record<string, string> = { en: 'EN', bn: 'বাং' }

/**
 * English/Bangla toggle. Switching language re-renders every translated surface
 * instantly and clears any existing AI recommendation (it was generated in the
 * previous language) so the user can re-run it in the new one.
 */
export function LanguageSwitcher(): JSX.Element {
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)
  const clearRecommendation = useDiagnosticStore((s) => s.clearRecommendation)

  return (
    <div className="flex items-center gap-2 px-2">
      <Languages className="text-muted" size={16} />
      <div className="flex flex-1 gap-1 rounded-lg border border-border bg-surface-2 p-1">
        {LANGUAGES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              if (l !== language) {
                setLanguage(l)
                clearRecommendation()
              }
            }}
            className={cn(
              'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              language === l ? 'bg-primary text-white' : 'text-muted hover:bg-surface'
            )}
          >
            {SHORT[l] ?? l}
          </button>
        ))}
      </div>
    </div>
  )
}
