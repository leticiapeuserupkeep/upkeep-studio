'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DeltaLabelProps {
  delta: number
  light?: boolean
  invert?: boolean
  className?: string
}

export function DeltaLabel({ delta, light = false, invert = false, className = '' }: DeltaLabelProps) {
  const isPositive = invert ? delta < 0 : delta > 0
  const isNegative = invert ? delta > 0 : delta < 0

  return (
    <div className={`flex items-center gap-1 mt-0.5 ${className}`}>
      {delta > 0 ? (
        <TrendingUp size={11} className={light ? 'opacity-80' : isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'} />
      ) : delta < 0 ? (
        <TrendingDown size={11} className={light ? 'opacity-80' : isNegative ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'} />
      ) : (
        <Minus size={11} className={light ? 'opacity-60' : 'text-[var(--color-neutral-7)]'} />
      )}
      <span
        className={`text-[length:var(--font-size-xs)] font-medium ${
          light
            ? 'opacity-80'
            : isPositive
              ? 'text-[var(--color-success)]'
              : isNegative
                ? 'text-[var(--color-error)]'
                : 'text-[var(--color-neutral-7)]'
        }`}
      >
        {delta > 0 ? '+' : ''}{delta}%
      </span>
    </div>
  )
}
