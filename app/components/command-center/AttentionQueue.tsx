'use client'

import { ArrowUpRight, ChevronDown, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/app/components/ui/DropdownMenu'

interface IntegrationRef {
  name: string
  logo: string
}

interface SuggestedBy {
  name: string
  photo: string
}

interface Assignee {
  id: string
  name: string
  photo: string
  role: string
  recommended?: boolean
}

interface PrimaryAction {
  label: string
  variant: 'danger' | 'warning' | 'info'
  type?: 'assign' | 'default'
  assignees?: Assignee[]
}

interface AttentionItem {
  id: string
  type: 'sla' | 'anomaly' | 'approval'
  reference: string
  title: string
  description: string
  timeLeft?: string
  primaryAction: PrimaryAction
  secondaryAction?: string
  suggestedBy?: SuggestedBy
  source?: IntegrationRef
}

const teamMembers: Assignee[] = [
  { id: 'maria', name: 'Maria Santos', photo: 'https://i.pravatar.cc/150?u=maria-santos-upkeep', role: 'HVAC Technician', recommended: true },
  { id: 'james', name: 'James Park', photo: 'https://i.pravatar.cc/150?u=james-park-upkeep', role: 'Senior Technician' },
  { id: 'alex', name: 'Alex Rivera', photo: 'https://i.pravatar.cc/150?u=alex-rivera-upkeep', role: 'Maintenance Tech' },
  { id: 'sarah', name: 'Sarah Chen', photo: 'https://i.pravatar.cc/150?u=sarah-chen-upkeep', role: 'Facilities Lead' },
]

const items: AttentionItem[] = [
  {
    id: '1',
    type: 'sla',
    reference: 'WO-4521',
    title: 'HVAC unit failure — Building A',
    description: 'Cooling system down. Immediate assignment needed.',
    timeLeft: '2h left',
    primaryAction: { label: 'Assign to', variant: 'danger', type: 'assign', assignees: teamMembers },
    suggestedBy: { name: 'Sofia', photo: 'https://i.pravatar.cc/150?u=sofia-chen-upkeep' },
    source: { name: 'Slack', logo: '/images/integrations/slack.svg' },
  },
  {
    id: '2',
    type: 'anomaly',
    reference: 'Asset #1847',
    title: 'Compressor #4 vibration pattern',
    description: 'Bearing wear detected. Failure predicted in 2–3 weeks.',
    primaryAction: { label: 'Schedule PM', variant: 'warning' },
    secondaryAction: 'History',
    suggestedBy: { name: 'Marcus', photo: 'https://i.pravatar.cc/150?u=marcus-johnson-upkeep' },
    source: { name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' },
  },
  {
    id: '3',
    type: 'approval',
    reference: 'PO-892',
    title: 'Part reorder — $1,240',
    description: '15× filters above auto-approval threshold.',
    primaryAction: { label: 'Approve', variant: 'info' },
    secondaryAction: 'Modify',
    suggestedBy: { name: 'Elena', photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep' },
    source: { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
  },
]

const badgeConfig = {
  sla: { label: 'SLA risk', bg: 'bg-red-50 text-red-700 border-red-200', border: 'border-l-red-500' },
  anomaly: { label: 'Anomaly', bg: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-500' },
  approval: { label: 'Approval', bg: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
}

const actionBg = {
  danger: 'bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)] text-white',
  warning: 'bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)] text-white',
  info: 'bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)] text-white',
}

export function AttentionQueue() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">Needs your attention</h3>
          <span className="text-[12px] font-medium text-[var(--color-neutral-8)]">{items.length} items</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const badge = badgeConfig[item.type]
          return (
            <div
              key={item.id}
              className={`rounded-l-none rounded-r-[var(--radius-2xl)] border border-[var(--border-default)] border-l-[3px] ${badge.border} bg-[var(--surface-primary)] p-4 transition-shadow duration-150 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[12px] font-medium text-[var(--color-neutral-8)]">{item.reference}</span>
                </div>
                {item.timeLeft && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                    <Clock size={11} />
                    {item.timeLeft}
                  </span>
                )}
              </div>

              <h4 className="text-[14px] font-medium text-[var(--color-neutral-12)] mb-1">{item.title}</h4>
              <p className="text-[13px] text-[var(--color-neutral-8)] mb-3">{item.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.primaryAction.type === 'assign' && item.primaryAction.assignees ? (
                    <AssignDropdown action={item.primaryAction} />
                  ) : (
                    <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-semibold cursor-pointer transition-colors ${actionBg[item.primaryAction.variant]}`}>
                      {item.primaryAction.label}
                      <ArrowUpRight size={12} />
                    </button>
                  )}
                  {item.secondaryAction && (
                    <button className="px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-medium text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
                      {item.secondaryAction}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.source && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-neutral-7)]">
                      <img src={item.source.logo} alt={item.source.name} className="w-3.5 h-3.5 rounded-[2px] object-cover" />
                      via {item.source.name}
                    </span>
                  )}
                  {item.suggestedBy && (
                    <img
                      src={item.suggestedBy.photo}
                      alt={item.suggestedBy.name}
                      title={`Suggested by ${item.suggestedBy.name}`}
                      className="w-5 h-5 rounded-full object-cover border border-[var(--border-subtle)]"
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AssignDropdown({ action }: { action: PrimaryAction }) {
  const recommended = action.assignees?.filter(a => a.recommended) ?? []
  const others = action.assignees?.filter(a => !a.recommended) ?? []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-semibold cursor-pointer transition-colors ${actionBg[action.variant]}`}>
          {action.label}
          <ChevronDown size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent minWidth="220px" align="start">
        {recommended.length > 0 && (
          <>
            <DropdownMenuLabel>Recommended</DropdownMenuLabel>
            {recommended.map((person) => (
              <DropdownMenuItem key={person.id}>
                <img src={person.photo} alt={person.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-[var(--color-neutral-12)] leading-tight">{person.name}</span>
                  <span className="text-[10px] text-[var(--color-neutral-7)] leading-tight">{person.role}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel>Team</DropdownMenuLabel>
        {others.map((person) => (
          <DropdownMenuItem key={person.id}>
            <img src={person.photo} alt={person.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[var(--color-neutral-12)] leading-tight">{person.name}</span>
              <span className="text-[10px] text-[var(--color-neutral-7)] leading-tight">{person.role}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
