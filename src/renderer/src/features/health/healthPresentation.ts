import type { HealthGrade } from '@shared/types/health'
import type { Severity } from '@shared/types/diagnostics'

/**
 * Visual tone mapping only. Human-readable labels (grades, severities,
 * priorities) live in the shared i18n catalog and are resolved via `useT`.
 */
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export function gradeTone(grade: HealthGrade): Tone {
  switch (grade) {
    case 'excellent':
    case 'good':
      return 'success'
    case 'fair':
      return 'warning'
    default:
      return 'danger'
  }
}

export function scoreTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  return 'danger'
}

export function severityTone(severity: Severity): Tone {
  return severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : 'info'
}
