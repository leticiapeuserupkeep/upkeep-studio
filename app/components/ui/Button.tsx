'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'danger'
  | 'success'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)] active:bg-[var(--color-accent-12)] disabled:bg-[var(--color-neutral-3)] disabled:text-[var(--color-neutral-8)]',
  secondary:
    'bg-[var(--surface-primary)] border border-[var(--border-default)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-4)] hover:border-[var(--color-neutral-5)] active:bg-[var(--color-neutral-6)] active:border-[var(--color-neutral-6)] disabled:bg-[var(--color-neutral-3)] disabled:border-transparent disabled:text-[var(--color-neutral-8)]',
  tertiary:
    'text-[var(--color-accent-10)] hover:text-[var(--color-accent-12)] active:text-[var(--color-accent-12)] disabled:text-[var(--color-neutral-7)]',
  outline:
    'border border-[var(--border-default)] text-[var(--color-neutral-11)] hover:border-[var(--color-neutral-5)] active:border-[var(--color-neutral-6)] disabled:text-[var(--color-neutral-7)]',
  subtle:
    'bg-[var(--color-accent-1)] text-[var(--color-neutral-11)] hover:bg-[var(--color-accent-2)] active:bg-[var(--color-accent-3)] disabled:bg-[var(--color-neutral-3)] disabled:text-[var(--color-neutral-7)]',
  ghost:
    'text-[var(--color-accent-10)] hover:text-[var(--color-accent-12)] active:text-[var(--color-accent-12)] disabled:text-[var(--color-neutral-7)]',
  danger:
    'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-hover)] active:bg-[var(--color-error-active)] disabled:bg-[var(--color-neutral-3)] disabled:text-[var(--color-neutral-8)]',
  success:
    'bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] active:bg-[var(--color-success-active)] disabled:bg-[var(--color-neutral-3)] disabled:text-[var(--color-neutral-8)]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-6 px-1.5 text-[length:var(--font-size-sm)] leading-4 gap-1 rounded-[var(--radius-sm)]',
  md: 'h-8 px-2 text-[length:var(--font-size-base)] leading-5 gap-1 rounded-[var(--radius-lg)]',
  lg: 'h-10 px-3 text-[length:var(--font-size-md)] leading-6 gap-2 rounded-[var(--radius-xl)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', asChild = false, className = '', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={`inline-flex items-center justify-center font-medium tracking-[0.01em] transition-colors duration-[var(--duration-fast)] cursor-pointer whitespace-nowrap select-none disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
