import type { ReactNode } from 'react'

type BadgeSeverity = 'info' | 'success' | 'warning' | 'danger' | 'neutral'
type BadgeStyle = 'solid' | 'subtle' | 'outline' | 'surface'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  severity?: BadgeSeverity
  variant?: BadgeStyle
  size?: BadgeSize
  children: ReactNode
  className?: string
  dot?: boolean
}

const solidStyles: Record<BadgeSeverity, string> = {
  info: 'bg-[var(--color-accent-9)] text-white',
  success: 'bg-[var(--color-success)] text-white',
  warning: 'bg-[var(--color-warning)] text-[var(--color-neutral-12)]',
  danger: 'bg-[var(--color-error)] text-white',
  neutral: 'bg-[var(--color-neutral-6)] text-[var(--color-neutral-12)]',
}

const subtleStyles: Record<BadgeSeverity, string> = {
  info: 'bg-[var(--color-accent-1)] text-[var(--color-accent-10)]',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-error-light)] text-[var(--color-error)]',
  neutral: 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-12)]',
}

const outlineStyles: Record<BadgeSeverity, string> = {
  info: 'border border-[var(--color-accent-4)] text-[var(--color-accent-10)]',
  success: 'border border-[var(--color-success-border)] text-[var(--color-success)]',
  warning: 'border border-[var(--color-warning-border)] text-[var(--color-warning)]',
  danger: 'border border-[var(--color-error-border)] text-[var(--color-error)]',
  neutral: 'border border-[var(--color-neutral-5)] text-[var(--color-neutral-12)]',
}

const surfaceStyles: Record<BadgeSeverity, string> = {
  info: 'bg-[var(--color-accent-1)] border border-[var(--color-accent-4)] text-[var(--color-accent-10)]',
  success: 'bg-[var(--color-success-light)] border border-[var(--color-success-border)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-light)] border border-[var(--color-warning-border)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-error-light)] border border-[var(--color-error-border)] text-[var(--color-error)]',
  neutral: 'bg-[var(--color-neutral-3)] border border-[var(--color-neutral-5)] text-[var(--color-neutral-12)]',
}

const variantMap: Record<BadgeStyle, Record<BadgeSeverity, string>> = {
  solid: solidStyles,
  subtle: subtleStyles,
  outline: outlineStyles,
  surface: surfaceStyles,
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 gap-1 text-[length:var(--font-size-sm)] rounded-[var(--radius-lg)]',
  md: 'h-6 px-2 py-1 gap-1 text-[length:var(--font-size-sm)] rounded-[var(--radius-lg)]',
  lg: 'h-8 px-3 py-1 gap-2 text-[length:var(--font-size-base)] rounded-[var(--radius-xl)]',
}

const dotColors: Record<BadgeSeverity, string> = {
  info: 'bg-[var(--color-info)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-error)]',
  neutral: 'bg-[var(--color-neutral-7)]',
}

const dotSolid: Record<BadgeSeverity, string> = {
  info: 'bg-white',
  success: 'bg-white',
  warning: 'bg-[var(--color-neutral-12)]',
  danger: 'bg-white',
  neutral: 'bg-[var(--color-neutral-12)]',
}

export function Badge({
  severity = 'neutral',
  variant = 'surface',
  size = 'sm',
  children,
  className = '',
  dot = false,
}: BadgeProps) {
  const dotColor = variant === 'solid' ? dotSolid[severity] : dotColors[severity]

  return (
    <span
      className={`inline-flex items-center justify-center font-medium leading-none whitespace-nowrap ${variantMap[variant][severity]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {children}
    </span>
  )
}
