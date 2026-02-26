'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'

type ProgressColor = 'accent' | 'success' | 'warning' | 'danger'

interface ProgressProps {
  value: number
  max?: number
  color?: ProgressColor
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

const colorStyles: Record<ProgressColor, string> = {
  accent: 'bg-[var(--color-accent-9)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-error)]',
}

const sizeHeight: Record<'sm' | 'md', string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export function Progress({ value, max = 100, color = 'accent', size = 'sm', label, className = '' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-[length:var(--font-size-sm)]">
          <span className="text-[var(--color-neutral-9)] font-medium">{label}</span>
          <span className="text-[var(--color-neutral-8)]">{Math.round(pct)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        value={value}
        max={max}
        className={`relative overflow-hidden rounded-full bg-[var(--color-neutral-3)] ${sizeHeight[size]}`}
      >
        <ProgressPrimitive.Indicator
          className={`h-full rounded-full transition-[width] duration-[var(--duration-slow)] ${colorStyles[color]}`}
          style={{ width: `${pct}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}
