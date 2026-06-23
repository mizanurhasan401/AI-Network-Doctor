import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-surface-2 text-muted',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      danger: 'bg-danger/15 text-danger',
      info: 'bg-primary/15 text-primary'
    }
  },
  defaultVariants: { tone: 'neutral' }
})

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
