'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'danger'
  | 'success'

type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  label: string
}

const variantStyles: Record<IconButtonVariant, string> = {
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

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-6 h-6 rounded-[var(--radius-sm)]',
  md: 'w-8 h-8 rounded-[var(--radius-lg)]',
  lg: 'w-10 h-10 rounded-[var(--radius-xl)]',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', label, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={`inline-flex items-center justify-center shrink-0 transition-colors duration-[var(--duration-fast)] cursor-pointer select-none disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)
IconButton.displayName = 'IconButton'
