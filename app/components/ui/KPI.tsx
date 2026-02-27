import type { ReactNode } from 'react'

interface KPIProps {
  label: string
  value: string | number
  subtitle?: string
  subtitleIcon?: ReactNode
  icon?: ReactNode
  chart?: ReactNode
  accent?: boolean
  className?: string
}

export function KPI({ label, value, subtitle, subtitleIcon, icon, chart, accent = false, className = '' }: KPIProps) {
  return (
    <div
      className={`flex flex-col rounded-[var(--widget-radius)] border border-[var(--widget-border)] p-[var(--widget-padding)] ${
        accent ? 'bg-[var(--color-accent-1)] border-[var(--color-accent-3)]' : 'bg-[var(--widget-bg)]'
      } shadow-[var(--widget-shadow)] ${className}`}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] font-medium">
          {label}
        </span>
        {icon && (
          <div className={`flex items-center justify-center w-9 h-9 rounded-[var(--radius-lg)] shrink-0 ${
            accent ? 'bg-[var(--color-accent-2)]' : 'bg-[var(--color-neutral-3)]'
          }`}>
            {icon}
          </div>
        )}
      </div>

      <span className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] leading-[var(--line-height-tight)] tabular-nums">
        {value}
      </span>

      {subtitle && (
        <span className="flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] mt-1">
          {subtitleIcon}
          {subtitle}
        </span>
      )}

      {chart && (
        <div className="mt-3">
          {chart}
        </div>
      )}
    </div>
  )
}
