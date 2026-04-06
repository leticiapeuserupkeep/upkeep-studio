'use client'

import { ArrowRight, Check, ExternalLink } from 'lucide-react'

interface Integration {
  id: string
  name: string
  logo: string
  description: string
  connected: boolean
  usedBy: string[]
}

const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    logo: '/images/integrations/slack.svg',
    description: 'Notifications & alerts',
    connected: true,
    usedBy: ['Sam', 'Marcus'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    logo: '/images/integrations/google-calendar.png',
    description: 'Schedules & availability',
    connected: true,
    usedBy: ['Sam'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    logo: '/images/integrations/gmail.png',
    description: 'Requests & reports',
    connected: true,
    usedBy: ['Marcus', 'Elena'],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    logo: '/images/integrations/quickbooks.svg',
    description: 'Invoices & POs',
    connected: true,
    usedBy: ['Elena'],
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    logo: '/images/integrations/teams.svg',
    description: 'Team collaboration',
    connected: false,
    usedBy: ['Sam', 'Marcus'],
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    logo: '/images/integrations/google-sheets.svg',
    description: 'Data export & import',
    connected: false,
    usedBy: ['Elena'],
  },
]

export function IntegrationsStrip() {
  const connected = integrations.filter(i => i.connected)
  const available = integrations.filter(i => !i.connected)

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
            className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3 hover:shadow-sm transition-shadow duration-150"
          >
            <div className="relative">
              <img src={integ.logo} alt={integ.name} className="w-9 h-9 rounded-[var(--radius-md)] object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-success)] border-2 border-white">
                <Check size={9} strokeWidth={3} className="text-white" />
              </span>
            </div>
            <div className="text-center">
              <p className="text-[12px] font-medium text-[var(--color-neutral-12)] leading-tight">{integ.name}</p>
              <p className="text-[10px] text-[var(--color-neutral-7)] mt-0.5">{integ.description}</p>
            </div>
            <div className="flex items-center gap-0.5">
              {integ.usedBy.map((name) => (
                <span key={name} className="text-[9px] text-[var(--color-neutral-7)] bg-[var(--color-neutral-2)] px-1.5 py-0.5 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}

        {available.map((integ) => (
          <div
            key={integ.id}
            className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-neutral-5)] bg-[var(--color-neutral-1)] p-3 hover:border-[var(--color-neutral-7)] hover:bg-[var(--color-neutral-2)] cursor-pointer transition-all duration-150 group"
          >
            <img src={integ.logo} alt={integ.name} className="w-9 h-9 rounded-[var(--radius-md)] object-cover opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="text-center">
              <p className="text-[12px] font-medium text-[var(--color-neutral-9)] leading-tight">{integ.name}</p>
              <p className="text-[10px] text-[var(--color-neutral-7)] mt-0.5">{integ.description}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-accent-9)] opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={9} />
              Connect
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
