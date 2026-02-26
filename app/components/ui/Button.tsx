'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'gradient'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)] active:bg-[var(--color-accent-11)]',
  secondary:
    'border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]',
  ghost:
    'text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-11)]',
  danger:
    'border border-[var(--color-error-border)] text-[var(--color-error)] hover:bg-[var(--color-error-light)]',
  destructive:
    'border border-[var(--color-error-border)] text-[var(--color-error)] hover:bg-[var(--color-error-light)]',
  gradient:
    'bg-gradient-to-r from-[#7C3AED] to-[#4F7EF5] text-white font-semibold hover:opacity-90 shadow-[var(--shadow-md)]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[length:var(--font-size-sm)] gap-1 rounded-[var(--radius-md)]',
  md: 'h-8 px-3 text-[length:var(--font-size-base)] gap-1.5 rounded-[var(--radius-lg)]',
  lg: 'h-10 px-4 text-[length:var(--font-size-base)] gap-2 rounded-[var(--radius-lg)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', asChild = false, className = '', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-colors duration-[var(--duration-fast)] cursor-pointer whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
