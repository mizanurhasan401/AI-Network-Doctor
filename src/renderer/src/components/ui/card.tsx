import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('rounded-xl border border-border bg-surface p-5 shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('mb-3 flex items-center justify-between', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h3 className={cn('text-sm font-semibold text-muted', className)} {...props} />
}

export function CardValue({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('text-2xl font-bold text-foreground', className)} {...props} />
}
