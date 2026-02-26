import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type TrendDirection = 'up' | 'down' | 'flat'

interface StatProps {
  label: string
  value: string | number
  trend?: { value: string; direction: TrendDirection }
  icon?: ReactNode
  className?: string
}

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; color: string }> = {
  up: { icon: TrendingUp, color: 'text-[var(--color-success)]' },
  down: { icon: TrendingDown, color: 'text-[var(--color-error)]' },
  flat: { icon: Minus, color: 'text-[var(--color-neutral-7)]' },
}

export function Stat({ label, value, trend, icon, className = '' }: StatProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        {icon && <span className="text-[var(--color-neutral-7)]">{icon}</span>}
        <span className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] leading-[var(--line-height-tight)]">
          {value}
        </span>
        {trend && <TrendIndicator {...trend} />}
      </div>
    </div>
  )
}

function TrendIndicator({ value, direction }: { value: string; direction: TrendDirection }) {
  const config = trendConfig[direction]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-0.5 text-[length:var(--font-size-sm)] font-medium ${config.color}`}>
      <Icon size={14} />
      {value}
    </span>
  )
}
