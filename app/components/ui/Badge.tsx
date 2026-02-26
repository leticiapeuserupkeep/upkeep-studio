import type { ReactNode } from 'react'

type BadgeSeverity = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps {
  severity?: BadgeSeverity
  children: ReactNode
  className?: string
  dot?: boolean
}

const severityStyles: Record<BadgeSeverity, string> = {
  info: 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info-border)]',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-border)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
  danger: 'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error-border)]',
  neutral: 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-9)] border-[var(--color-neutral-5)]',
}

const dotColors: Record<BadgeSeverity, string> = {
  info: 'bg-[var(--color-info)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-error)]',
  neutral: 'bg-[var(--color-neutral-7)]',
}

export function Badge({ severity = 'neutral', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-full)] border text-[length:var(--font-size-xs)] font-medium leading-none whitespace-nowrap ${severityStyles[severity]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[severity]}`} />}
      {children}
    </span>
  )
}
