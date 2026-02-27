'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

type IconButtonVariant = 'ghost' | 'secondary' | 'danger'
type IconButtonSize = 'sm' | 'md'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  label: string
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:
    'text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]',
  secondary:
    'border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]',
  danger:
    'text-[var(--color-neutral-8)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)]',
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-7 h-7 rounded-[var(--radius-md)]',
  md: 'w-8 h-8 rounded-[var(--radius-lg)]',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'sm', label, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={`inline-flex items-center justify-center shrink-0 transition-colors duration-[var(--duration-fast)] cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)
IconButton.displayName = 'IconButton'
