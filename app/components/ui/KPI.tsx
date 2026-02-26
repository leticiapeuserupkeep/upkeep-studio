import type { ReactNode } from 'react'

interface KPIProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  accent?: boolean
  className?: string
}

export function KPI({ label, value, subtitle, icon, accent = false, className = '' }: KPIProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] p-[var(--space-md)] ${
        accent ? 'bg-[var(--color-accent-1)] border-[var(--color-accent-3)]' : 'bg-[var(--surface-primary)]'
      } ${className}`}
    >
      {icon && (
        <div className={`flex items-center justify-center w-9 h-9 rounded-[var(--radius-lg)] shrink-0 ${
          accent ? 'bg-[var(--color-accent-2)]' : 'bg-[var(--color-neutral-3)]'
        }`}>
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] font-medium truncate">
          {label}
        </span>
        <span className="text-[length:var(--font-size-xl)] font-bold text-[var(--color-neutral-12)] leading-[var(--line-height-tight)]">
          {value}
        </span>
        {subtitle && (
          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
