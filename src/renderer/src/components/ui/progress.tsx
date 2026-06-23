import { cn } from '../../lib/utils'

interface ProgressProps {
  readonly value: number
  readonly className?: string
  readonly tone?: 'primary' | 'success' | 'warning' | 'danger'
}

const toneClass = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
} as const

export function Progress({ value, className, tone = 'primary' }: ProgressProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', toneClass[tone])}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
