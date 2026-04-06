'use client'

import { ClipboardList, AlertTriangle, Package, TrendingDown, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface MetricCard {
  label: string
  value: string | number
  icon: React.ReactNode
  trend: {
    text: string
    type: 'success' | 'warning' | 'neutral'
    icon?: React.ReactNode
  }
}

const metrics: MetricCard[] = [
  {
    label: 'Open work orders',
    value: 47,
    icon: <ClipboardList size={18} className="text-[var(--color-accent-9)]" />,
    trend: { text: '↓ 8 from yesterday', type: 'success', icon: <TrendingDown size={12} /> },
  },
  {
    label: 'Overdue PMs',
    value: 6,
    icon: <AlertTriangle size={18} className="text-[var(--color-warning)]" />,
    trend: { text: '2 critical assets', type: 'warning' },
  },
  {
    label: 'Low stock alerts',
    value: 3,
    icon: <Package size={18} className="text-[var(--color-neutral-8)]" />,
    trend: { text: 'Auto-reorder: 2', type: 'neutral', icon: <TrendingUp size={12} /> },
  },
]

const trendColors = {
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  neutral: 'text-[var(--color-neutral-8)]',
}

export function SystemPulse() {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 1.5fr' }}>
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex flex-col gap-1 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--color-neutral-8)]">{m.label}</span>
            {m.icon}
          </div>
          <span className="text-[24px] font-semibold text-[var(--color-neutral-12)] leading-tight">
            {m.value}
          </span>
          <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${trendColors[m.trend.type]}`}>
            {m.trend.icon}
            {m.trend.text}
          </span>
        </div>
      ))}

      <SupernovaSavingsCard />
    </div>
  )
}

function SupernovaSavingsCard() {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-white/15 bg-gradient-to-br from-[var(--color-accent-9)] via-[var(--color-accent-10)] to-[var(--color-accent-12)] p-4 shadow-sm">
      <div className="flex items-stretch gap-4">
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/75">
            <Clock size={16} className="text-white shrink-0" strokeWidth={2} />
            Time Saved
          </span>
          <span className="text-[24px] font-semibold text-white leading-tight">-128h</span>
        </div>

        <div className="w-px shrink-0 self-stretch bg-white/20" />

        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/75">
            <DollarSign size={16} className="text-white shrink-0" strokeWidth={2} />
            Cost Reduction
          </span>
          <span className="text-[24px] font-semibold text-white leading-tight">-$12.4k</span>
        </div>
      </div>

      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-white/90">
        <TrendingDown size={12} className="shrink-0" />
        23% vs last month
      </span>
    </div>
  )
}
