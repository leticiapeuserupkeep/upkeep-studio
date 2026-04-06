'use client'

import { ArrowRight, Check, Plus } from 'lucide-react'

interface Integration {
  id: string
  name: string
  logo: string
  connected: boolean
}

const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    logo: '/images/integrations/slack.svg',
    connected: true,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    logo: '/images/integrations/google-calendar.svg',
    connected: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    logo: '/images/integrations/gmail.svg',
    connected: true,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    logo: '/images/integrations/quickbooks.svg',
    connected: true,
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    logo: '/images/integrations/teams.svg',
    connected: false,
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    logo: '/images/integrations/google-sheets.svg',
    connected: false,
  },
]

export function IntegrationsStrip() {
  const connected = integrations.filter(i => i.connected)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">Your integrations</h3>
        <button className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] cursor-pointer transition-colors">
          Manage <ArrowRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2.5">
        {connected.map((integ) => (
          <div
            key={integ.id}
            className="flex flex-col items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3 hover:shadow-sm transition-shadow duration-150"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-1 ring-[var(--border-subtle)]">
              <img src={integ.logo} alt={integ.name} className="h-full w-full object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-success)] border-2 border-white">
                <Check size={9} strokeWidth={3} className="text-white" />
              </span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium text-[var(--color-neutral-12)] leading-tight">{integ.name}</p>
            </div>
          </div>
        ))}

        {/* Add new integration card */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-neutral-5)] bg-[var(--color-neutral-1)] p-3 hover:border-[var(--color-accent-7)] hover:bg-[var(--color-accent-1)] cursor-pointer transition-all duration-150 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] group-hover:bg-[var(--color-accent-2)] transition-colors">
            <Plus size={18} className="text-[var(--color-neutral-8)] group-hover:text-[var(--color-accent-9)] transition-colors" />
          </div>
          <p className="text-[10px] font-medium text-[var(--color-neutral-8)] group-hover:text-[var(--color-accent-9)] transition-colors">
            New integration
          </p>
        </div>
      </div>
    </div>
  )
}
