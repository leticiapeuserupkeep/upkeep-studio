'use client'

import { Activity, AlertTriangle, ShieldAlert, FileCheck, TrendingDown, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface MetricCard {
  label: string
  value: string | number
  icon: React.ReactNode
  trend: {
    text: string
    type: 'success' | 'warning' | 'neutral'
    icon?: React.ReactNode
  }
  sources: string[]
}

const metrics: MetricCard[] = [
  {
    label: 'Operational health',
    value: '97.4%',
    icon: <Activity size={18} className="text-[var(--color-accent-9)]" />,
    trend: { text: '↑ 1.2% vs last week', type: 'success', icon: <TrendingUp size={12} /> },
    sources: ['/images/integrations/ignition.svg', '/images/integrations/upkeep.svg'],
  },
  {
    label: 'Active issues',
    value: 12,
    icon: <AlertTriangle size={18} className="text-[var(--color-warning)]" />,
    trend: { text: '↓ 4 from yesterday', type: 'success', icon: <TrendingDown size={12} /> },
    sources: ['/images/integrations/slack.svg', '/images/integrations/sap.svg'],
  },
  {
    label: 'Critical signals',
    value: 5,
    icon: <ShieldAlert size={18} className="text-[var(--color-warning)]" />,
    trend: { text: '3 exceeded threshold', type: 'warning' },
    sources: ['/images/integrations/ignition.svg'],
  },
  {
    label: 'Pending approvals',
    value: 6,
    icon: <FileCheck size={18} className="text-[var(--color-accent-9)]" />,
    trend: { text: '2 high-impact items waiting', type: 'warning' },
    sources: ['/images/integrations/quickbooks.svg', '/images/integrations/gmail.svg'],
  },
]

const trendColors = {
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  neutral: 'text-[var(--color-neutral-8)]',
}

export function SystemPulseKPIs() {
  return (
    <div className="grid grid-cols-4 gap-4">
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
          <span className="inline-flex items-center gap-1 mt-0.5">
            {m.sources.map(src => (
              <img key={src} src={src} alt="" className="w-3 h-3 rounded-[2px] object-cover" />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}

export { SupernovaSavingsCard }

function SupernovaSavingsCard() {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-white/15 bg-gradient-to-br from-[var(--color-accent-9)] via-[var(--color-accent-10)] to-[var(--color-accent-12)] p-4 shadow-sm">
      <div className="flex items-stretch gap-4">
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/75">
            <Clock size={16} className="text-white shrink-0" strokeWidth={2} />
            Time saved
          </span>
          <span className="text-[24px] font-semibold text-white leading-tight">128h</span>
        </div>

        <div className="w-px shrink-0 self-stretch bg-white/20" />

        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/75">
            <DollarSign size={16} className="text-white shrink-0" strokeWidth={2} />
            Cost impact
          </span>
          <span className="text-[24px] font-semibold text-white leading-tight">$12.4k</span>
        </div>
      </div>

      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-white/90">
        <TrendingUp size={12} className="shrink-0" />
        23% improvement vs last month
      </span>
    </div>
  )
}
