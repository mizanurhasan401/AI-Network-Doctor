import type { HealthGrade } from '@shared/types/health'
import type { Severity } from '@shared/types/diagnostics'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export const GRADE_LABEL_BN: Record<HealthGrade, string> = {
  excellent: 'চমৎকার',
  good: 'ভালো',
  fair: 'মোটামুটি',
  poor: 'দুর্বল',
  critical: 'সংকটাপন্ন'
}

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

export const SEVERITY_LABEL_BN: Record<Severity, string> = {
  info: 'তথ্য',
  warning: 'সতর্কতা',
  critical: 'গুরুতর'
}

export const PRIORITY_LABEL_BN = {
  low: 'নিম্ন',
  medium: 'মাঝারি',
  high: 'উচ্চ',
  critical: 'সর্বোচ্চ'
} as const
