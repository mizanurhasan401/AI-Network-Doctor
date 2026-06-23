import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:opacity-90',
        secondary: 'bg-surface-2 text-foreground hover:bg-border',
        ghost: 'text-muted hover:bg-surface-2 hover:text-foreground'
      },
      size: {
        md: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'
