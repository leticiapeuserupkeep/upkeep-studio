import type { ReactNode } from 'react'

/** Split label into two lines (first / second half of words), or honor explicit `\n`. */
function labelTwoLines(label: string): ReactNode {
  const trimmed = label.trim()
  if (trimmed.includes('\n')) {
    const parts = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean)
    if (parts.length >= 2) {
      return (
        <>
          {parts[0]}
          <br />
          {parts.slice(1).join(' ')}
        </>
      )
    }
  }
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length <= 1) {
    return label
  }
  const mid = Math.ceil(words.length / 2)
  const first = words.slice(0, mid).join(' ')
  const second = words.slice(mid).join(' ')
  return (
    <>
      {first}
      <br />
      {second}
    </>
  )
}

interface KPIProps {
  label: string
  value: string | number
  subtitle?: string
  subtitleIcon?: ReactNode
  /** Compact metric tile: value only on the right (no subtitle row). */
  compact?: boolean
  icon?: ReactNode
  chart?: ReactNode
  accent?: boolean
  className?: string
}

export function KPI({
  label,
  value,
  subtitle,
  subtitleIcon,
  compact = false,
  icon,
  chart,
  accent = false,
  className = '',
}: KPIProps) {
  return (
    <div
      className={`flex flex-col rounded-[var(--widget-radius)] border border-[var(--widget-border)] p-[var(--widget-padding)] ${
        accent ? 'bg-[var(--color-accent-1)] border-[var(--color-accent-3)]' : 'bg-[var(--widget-bg)]'
      } shadow-[var(--widget-shadow)] ${className}`}
    >
      {/* Testing layout: 2 columns — left: icon + label, right: value + subtitle. Revert to stacked if product prefers. */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-[var(--space-xs)]">
          {icon && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-kpi-icon)] text-[var(--color-accent-9)] [&_svg]:size-5 [&_svg]:shrink-0 ${
                accent ? 'bg-[var(--color-accent-2)]' : 'bg-[var(--color-accent-1)]'
              }`}
            >
              {icon}
            </div>
          )}
          <span className="min-w-0 text-[length:var(--font-size-sm)] font-medium leading-tight text-[var(--color-neutral-8)]">
            {labelTwoLines(label)}
          </span>
        </div>

        <div
          className={`flex shrink-0 flex-col items-end text-right ${compact || !subtitle ? 'gap-0' : 'gap-0.5'}`}
        >
          <span className="text-[length:var(--font-size-xl)] font-bold leading-[var(--line-height-tight)] text-[var(--color-neutral-12)] tabular-nums">
            {value}
          </span>
          {!compact && subtitle ? (
            <span className="flex max-w-[14rem] items-center justify-end gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
              {subtitleIcon}
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>

      {chart && (
        <div className="mt-3">
          {chart}
        </div>
      )}
    </div>
  )
}
