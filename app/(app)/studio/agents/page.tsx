'use client'

import {
  ShieldCheck, BarChart2, Zap, CalendarClock, ClipboardCheck,
  Pencil, ArrowRight, MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

/* ── Hardcoded agents ── */

const myAgents = [
  {
    name: 'HVAC Inspector',
    color: '#f59e0b',
    description: 'Specialized in HVAC inspection checklists, photo capture, and follow-up work order creation.',
    dataAccess: ['Inspections', 'Work Orders', 'Assets'],
    created: 'Mon, 25 Sep — You',
  },
  {
    name: 'PM Analyst',
    color: '#f59e0b',
    description: 'Builds KPI dashboards and trend charts for preventive maintenance performance.',
    dataAccess: ['Assets', 'Meters'],
    created: 'Mon, 25 Sep — You',
  },
]

/* ── Agent templates ── */

const agentTemplates = [
  {
    icon: ShieldCheck,
    name: 'Inspector Agent',
    description: 'Inspection checklists, photo capture, compliance follow-ups, and WO creation on failure.',
  },
  {
    icon: BarChart2,
    name: 'Analyst Agent',
    description: 'KPI dashboards, trend charts, asset health scoring, and scheduled reports.',
  },
  {
    icon: Zap,
    name: 'Automator Agent',
    description: 'Triggered actions, scheduling rules, notification logic, and recurring workflows.',
  },
  {
    icon: CalendarClock,
    name: 'Maintenance Planner',
    description: 'PM scheduling, technician assignments, and parts availability checks.',
  },
  {
    icon: ClipboardCheck,
    name: 'Data Quality Agent',
    description: 'Duplicate detection, missing field audits, and record cleanup workflows.',
  },
]

export default function MyAgentsPage() {
  return (
    <main className="flex-1 overflow-auto bg-[var(--surface-primary)]">
      <div className="max-w-[1280px] mx-auto w-full px-[var(--space-2xl)] py-[var(--space-2xl)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[length:var(--font-size-title-1)] font-bold text-[var(--color-neutral-12)]">
            My Agents
          </h1>
          <p className="mt-1 text-[length:var(--font-size-body-2)] text-[var(--color-neutral-8)]">
            Agents that power your app builds
          </p>
        </div>

        {/* Agents grid */}
        <div className="grid grid-cols-3 gap-[var(--space-xl)] mb-[var(--space-3xl)]">
          {myAgents.map((agent, i) => (
            <div
              key={agent.name}
              className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden card-animate"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Card body */}
              <div className="flex flex-col flex-1 px-7 pt-7 pb-5">
                {/* Top row: color dot + overflow */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: agent.color }}
                  />
                  <button className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                    <MoreHorizontal size={16} className="text-[var(--color-neutral-7)]" />
                  </button>
                </div>

                {/* Name */}
                <h3 className="text-[length:var(--font-size-body-1)] font-semibold text-[var(--color-neutral-12)] mb-1">
                  {agent.name}
                </h3>

                {/* Description */}
                <p className="text-[length:var(--font-size-body-2)] text-[var(--color-neutral-8)] leading-relaxed line-clamp-2 mb-4">
                  {agent.description}
                </p>

                {/* Data access chips */}
                <div className="mb-4">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-neutral-7)] mb-1.5">
                    Data Access
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.dataAccess.map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)] font-medium"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Created date */}
                <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] mt-auto">
                  Created By: {agent.created}
                </p>
              </div>

              {/* Card footer actions */}
              <div className="flex items-center gap-2 px-7 py-4 border-t border-[var(--border-default)]">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  <Pencil size={13} />
                  Edit
                </Button>
                <Button variant="primary" size="sm" className="flex-1 gap-1.5">
                  <ArrowRight size={13} />
                  Use in builder
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Start from a template */}
        <div>
          <h3 className="text-base font-semibold text-[var(--color-neutral-12)] mb-[var(--space-md)]">
            Start from a template
          </h3>
          <div className="grid grid-cols-3 gap-[var(--space-md)]">
            {agentTemplates.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.name}
                  className="flex flex-col items-start bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5 gap-3 text-left transition-all duration-[var(--duration-fast)] cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--color-accent-1)]">
                    <Icon size={20} strokeWidth={1.5} className="text-[var(--color-accent-9)]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">{t.name}</h4>
                    <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] leading-relaxed">{t.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
