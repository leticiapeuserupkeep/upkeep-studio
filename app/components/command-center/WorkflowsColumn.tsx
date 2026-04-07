'use client'

import { ArrowRight } from 'lucide-react'

interface IntegrationRef {
  name: string
  logo: string
}

interface WorkflowItem {
  id: string
  title: string
  schedule: string
  isToday: boolean
  description: string
  integrations: IntegrationRef[]
}

const workflows: WorkflowItem[] = [
  {
    id: 'wf1',
    title: 'Weekly operations digest',
    schedule: 'Today 5pm',
    isToday: true,
    description: 'Summarizes key metrics and sends to team leads',
    integrations: [
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
      { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
    ],
  },
  {
    id: 'wf2',
    title: 'Resource level check',
    schedule: 'Mon 8am',
    isToday: false,
    description: 'Scans all levels, flags items below threshold',
    integrations: [
      { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
    ],
  },
  {
    id: 'wf3',
    title: 'SLA compliance report',
    schedule: 'Daily 6am',
    isToday: false,
    description: 'Tracks SLA performance and alerts on misses',
    integrations: [
      { name: 'Google Sheets', logo: '/images/integrations/google-sheets.svg' },
      { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
    ],
  },
  {
    id: 'wf4',
    title: 'External data sync',
    schedule: 'Daily 9am',
    isToday: false,
    description: 'Imports and reconciles data from connected sources',
    integrations: [
      { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
      { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
    ],
  },
]

interface WorkflowsColumnProps {
  onOpenWorkflows?: () => void
}

export function WorkflowsColumn({ onOpenWorkflows }: WorkflowsColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pt-3">
        <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">Scheduled workflows</h3>
        <button
          onClick={onOpenWorkflows}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] cursor-pointer transition-colors"
        >
          All <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="flex items-start gap-3 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 hover:shadow-sm transition-shadow duration-150"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-medium text-[var(--color-neutral-12)] leading-tight w-full">{wf.title}</p>
                {wf.integrations.length > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    {wf.integrations.map((integ) => (
                      <img key={integ.name} src={integ.logo} alt={integ.name} title={integ.name} className="w-3.5 h-3.5 rounded-[2px] object-cover" />
                    ))}
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-medium mt-0.5 ${wf.isToday ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-8)]'}`}>
                {wf.schedule}
              </p>
              <p className="text-[11px] text-[var(--color-neutral-7)] mt-0.5">{wf.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full text-center text-[13px] font-medium text-[#3b82f6] hover:text-[#2563eb] cursor-pointer transition-colors mt-1 py-1">
        New workflow
      </button>
    </div>
  )
}
