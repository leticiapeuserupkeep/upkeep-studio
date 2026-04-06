'use client'

import { ArrowRight, MessageCircle } from 'lucide-react'
import { EXISTING_AGENTS } from '@/app/lib/agents-data'
import { WorkflowsColumn } from './WorkflowsColumn'

interface IntegrationRef {
  name: string
  logo: string
}

interface AIMatePreview {
  id: string
  name: string
  photo: string
  skill: string
  skillColor: string
  skillBg: string
  activity: string
  mode: string
  integrations: IntegrationRef[]
}

const aiMates: AIMatePreview[] = [
  {
    id: 'sofia',
    name: 'Sofia',
    photo: EXISTING_AGENTS.find(a => a.id === 'sofia')?.photo ?? '',
    skill: 'Scheduling',
    skillColor: 'text-blue-700',
    skillBg: 'bg-blue-50 border-blue-200',
    activity: "Assigned 14 WO's",
    mode: 'Auto-assign',
    integrations: [
      { name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' },
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
  },
  {
    id: 'elena',
    name: 'Elena',
    photo: `https://i.pravatar.cc/150?u=elena-rodriguez-upkeep`,
    skill: 'Inventory',
    skillColor: 'text-emerald-700',
    skillBg: 'bg-emerald-50 border-emerald-200',
    activity: 'Reordered 3 parts',
    mode: 'Auto-reorder · approval >$500',
    integrations: [
      { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
      { name: 'Google Sheets', logo: '/images/integrations/google-sheets.svg' },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus',
    photo: EXISTING_AGENTS.find(a => a.id === 'marcus')?.photo ?? '',
    skill: 'Triage',
    skillColor: 'text-amber-700',
    skillBg: 'bg-amber-50 border-amber-200',
    activity: '8 requests sorted',
    mode: 'Auto-escalate · 4h threshold',
    integrations: [
      { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
  },
]

interface HandledAction {
  id: string
  photo: string
  mateName: string
  count: number
  noun: string
  verb: string
  timeAgo: string
  via?: IntegrationRef
}

const handledActions: HandledAction[] = [
  { id: 'h1', photo: aiMates[0].photo, mateName: 'Sofia', count: 14, noun: 'work orders', verb: 'assigned', timeAgo: '6h ago', via: { name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' } },
  { id: 'h2', photo: aiMates[1].photo, mateName: 'Elena', count: 3, noun: 'parts', verb: 'reordered', timeAgo: '8h ago', via: { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' } },
  { id: 'h3', photo: aiMates[2].photo, mateName: 'Marcus', count: 1, noun: 'request', verb: 'escalated', timeAgo: '12h ago', via: { name: 'Slack', logo: '/images/integrations/slack.svg' } },
]

interface AIMatesColumnProps {
  onOpenChat?: (mateId?: string) => void
  onManage?: () => void
  onOpenWorkflows?: () => void
}

export function AIMatesColumn({ onOpenChat, onManage, onOpenWorkflows }: AIMatesColumnProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* AI-Mates */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">AI-Mates</h3>
          <button
            onClick={onManage}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] cursor-pointer transition-colors"
          >
            Manage <ArrowRight size={12} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {aiMates.map((mate) => (
            <div
              key={mate.id}
              className="flex items-center gap-3 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 hover:shadow-sm transition-shadow duration-150"
            >
              <div className="relative shrink-0">
                <img
                  src={mate.photo}
                  alt={mate.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--color-success)] border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[var(--color-neutral-12)]">{mate.name}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${mate.skillBg} ${mate.skillColor}`}>
                    {mate.skill}
                  </span>
                  {mate.integrations.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 ml-0.5">
                      {mate.integrations.map((integ) => (
                        <img key={integ.name} src={integ.logo} alt={integ.name} title={integ.name} className="w-3.5 h-3.5 rounded-[2px] object-cover" />
                      ))}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--color-neutral-8)] truncate">{mate.activity}</span>
                <span className="text-[11px] text-[var(--color-neutral-7)] w-full truncate">Mode: {mate.mode}</span>
              </div>
              <button
                onClick={() => onOpenChat?.(mate.id)}
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--color-neutral-7)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-accent-9)] cursor-pointer transition-colors"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Handled Today */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">Handled today</h3>
          <span className="text-[12px] font-medium text-[var(--color-neutral-8)]">25 actions</span>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden">
          {handledActions.map((action, i) => (
            <div
              key={action.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < handledActions.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''}`}
            >
              <img src={action.photo} alt={action.mateName} className="w-6 h-6 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-[var(--color-neutral-11)]">
                  <strong className="font-semibold">{action.count} {action.noun}</strong> {action.verb}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {action.via && (
                  <img src={action.via.logo} alt={action.via.name} title={`via ${action.via.name}`} className="w-3.5 h-3.5 rounded-[2px] object-cover" />
                )}
                <span className="text-[11px] text-[var(--color-neutral-7)] whitespace-nowrap">
                  {action.mateName} · {action.timeAgo}
                </span>
              </div>
            </div>
          ))}
          <div className="px-4 py-2.5 border-t border-[var(--border-subtle)]">
            <button className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] cursor-pointer transition-colors">
              View activity log <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Workflows */}
      <WorkflowsColumn onOpenWorkflows={onOpenWorkflows} />
    </div>
  )
}
