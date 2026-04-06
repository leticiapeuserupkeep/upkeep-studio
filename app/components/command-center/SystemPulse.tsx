'use client'

import { ClipboardList, Shield, AlertTriangle, Package, TrendingDown, TrendingUp, Sparkles, Clock, DollarSign } from 'lucide-react'

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
    label: 'SLA compliance',
    value: '94%',
    icon: <Shield size={18} className="text-[var(--color-success)]" />,
    trend: { text: 'Target: 95%', type: 'neutral' },
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
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr' }}>
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4"
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
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-indigo-600">Supernova savings</span>
        <Sparkles size={18} className="text-indigo-500" />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock size={13} className="text-indigo-400 shrink-0" />
            <span className="text-[20px] font-semibold text-[var(--color-neutral-12)] leading-tight">128h</span>
          </div>
          <span className="text-[11px] text-[var(--color-neutral-7)]">time saved this month</span>
        </div>

        <div className="w-px h-9 bg-[var(--border-default)]" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <DollarSign size={13} className="text-emerald-500 shrink-0" />
            <span className="text-[20px] font-semibold text-[var(--color-neutral-12)] leading-tight">$12.4k</span>
          </div>
          <span className="text-[11px] text-[var(--color-neutral-7)]">cost reduction</span>
        </div>
      </div>

      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-success)]">
        <TrendingUp size={11} />
        ↑ 23% vs last month
      </span>
    </div>
  )
}
