import type { ReactNode } from 'react'
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'

type AlertSeverity = 'info' | 'success' | 'warning' | 'danger'

interface InlineAlertProps {
  severity?: AlertSeverity
  children: ReactNode
  className?: string
}

const config: Record<AlertSeverity, { icon: typeof Info; bg: string; border: string; text: string }> = {
  info: {
    icon: Info,
    bg: 'bg-[var(--color-info-light)]',
    border: 'border-[var(--color-info-border)]',
    text: 'text-[var(--color-info)]',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-[var(--color-success-light)]',
    border: 'border-[var(--color-success-border)]',
    text: 'text-[var(--color-success)]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[var(--color-warning-light)]',
    border: 'border-[var(--color-warning-border)]',
    text: 'text-[var(--color-warning)]',
  },
  danger: {
    icon: XCircle,
    bg: 'bg-[var(--color-error-light)]',
    border: 'border-[var(--color-error-border)]',
    text: 'text-[var(--color-error)]',
  },
}

export function InlineAlert({ severity = 'info', children, className = '' }: InlineAlertProps) {
  const c = config[severity]
  const Icon = c.icon
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-lg)] border ${c.bg} ${c.border} ${className}`}
    >
      <Icon size={16} className={`${c.text} shrink-0 mt-0.5`} />
      <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] leading-[var(--line-height-normal)]">
        {children}
      </p>
    </div>
  )
}
