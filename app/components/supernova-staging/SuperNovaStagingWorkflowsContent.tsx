'use client'

import * as Collapsible from '@radix-ui/react-collapsible'
import Link from 'next/link'
import { ChevronDown, Trash2, UserPlus } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Card, CardHeader } from '@/app/components/ui/Card'
import { IconButton } from '@/app/components/ui/IconButton'

type StagingWorkflow = {
  id: string
  title: string
  description: string
  steps: string[]
  meta: string
  extraBadges?: { label: string; variant: 'demo' | 'unassigned' }[]
  runHistory?: { label: string; duration: string }[]
}

const stagingWorkflows: StagingWorkflow[] = [
  {
    id: '1',
    title: 'Daily WO Report',
    description: 'Summarizes open work orders and posts to the maintenance channel each morning.',
    steps: ['Fetch data', 'Check threshold'],
    meta: '2 steps • cron',
    extraBadges: [{ label: 'Demo', variant: 'demo' }],
    runHistory: [{ label: 'completed', duration: '242s' }],
  },
  {
    id: '2',
    title: 'Company Research & Presentation',
    description: 'Pulls public filings and drafts a short executive brief for review.',
    steps: ['Gather sources', 'Summarize', 'Format deck'],
    meta: '3 steps • manual',
    extraBadges: [{ label: 'Unassigned', variant: 'unassigned' }],
  },
  {
    id: '3',
    title: 'HVAC Diagnostics',
    description: 'Reads sensor streams and flags anomalies against the facility playbook.',
    steps: ['Ingest telemetry', 'Score rules', 'Notify owner'],
    meta: '3 steps • event',
    extraBadges: [{ label: 'Demo', variant: 'demo' }],
  },
  {
    id: '4',
    title: 'Inventory reorder check',
    description: 'Compares stock levels to min/max and opens a draft PO when needed.',
    steps: ['Sync inventory', 'Compare thresholds'],
    meta: '2 steps • cron',
  },
  {
    id: '5',
    title: 'Safety briefing digest',
    description: 'Aggregates incidents and near-misses into a weekly digest for EHS.',
    steps: ['Collect cases', 'Classify', 'Publish summary'],
    meta: '3 steps • cron',
    runHistory: [{ label: 'completed', duration: '118s' }],
  },
]

function ExtraBadge({ variant, label }: { variant: 'demo' | 'unassigned'; label: string }) {
  if (variant === 'demo') {
    return (
      <span className="inline-flex h-5 items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-2 text-[11px] font-medium text-[var(--color-neutral-9)]">
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex h-5 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-neutral-3)] px-2 text-[11px] font-medium text-[var(--color-neutral-9)]">
      {label}
    </span>
  )
}

export function SuperNovaStagingWorkflowsContent({ className = '' }: { className?: string }) {
  return (
    <div className={`flex w-full flex-col gap-6 ${className}`}>
      <p className="max-w-[var(--supernova-staging-prose-max)] text-[length:var(--font-size-body-1)] leading-6 text-[var(--color-neutral-12)]">
        Manage all workflows created by your agents in one place. Agents can create them directly from chat.
        To create a new workflow for the demo, ask something in the chat.
      </p>

      <div className="sn-staging-workflow-cards flex w-full max-w-[var(--supernova-staging-content-max)] flex-col gap-[var(--space-md)]">
        {stagingWorkflows.map((wf) => (
          <Card
            key={wf.id}
            className="sn-staging-workflow-card-enter border-[var(--border-default)] bg-[var(--surface-primary)] shadow-none"
          >
            <CardHeader
              action={
                <>
                  <IconButton label="Delete workflow" variant="secondary" size="md" className="shrink-0">
                    <Trash2 size={16} aria-hidden />
                  </IconButton>
                  <Button variant="secondary" size="md" type="button" className="gap-1.5">
                    <UserPlus size={16} className="shrink-0" aria-hidden />
                    Assign
                  </Button>
                </>
              }
            >
              <div className="flex min-w-0 flex-wrap items-center gap-[var(--space-xs)]">
                <h2 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">
                  {wf.title}
                </h2>
                <Badge severity="success" variant="subtle" size="sm">
                  ACTIVE
                </Badge>
                {wf.extraBadges?.map((b) => (
                  <ExtraBadge key={b.label} variant={b.variant} label={b.label} />
                ))}
              </div>
            </CardHeader>

            <div className="flex flex-col gap-[var(--space-md)] px-[var(--widget-padding)] pb-[var(--widget-padding)]">
              <p className="text-[length:var(--font-size-sm)] leading-relaxed text-[var(--color-neutral-8)]">
                {wf.description}
              </p>

              <div className="flex flex-wrap gap-[var(--space-xs)]">
                {wf.steps.map((step, i) => (
                  <span
                    key={step}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-4)] bg-[var(--color-accent-1)] px-2.5 py-1 text-[length:var(--font-size-xs)] font-medium text-[var(--color-accent-11)]"
                  >
                    <span className="tabular-nums opacity-80">{i + 1}.</span>
                    {step}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[length:var(--font-size-sm)]">
                <span className="text-[var(--color-neutral-8)]">{wf.meta}</span>
                <Link
                  href="#"
                  className="font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  View graph
                </Link>
              </div>

              {wf.runHistory && wf.runHistory.length > 0 && (
                <Collapsible.Root defaultOpen className="-mx-1 border-t border-[var(--border-subtle)] pt-3">
                  <Collapsible.Trigger className="flex w-full cursor-pointer items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] data-[state=open]:[&_svg]:rotate-180">
                    <ChevronDown
                      size={14}
                      className="shrink-0 transition-transform duration-[var(--duration-fast)]"
                      aria-hidden
                    />
                    Run history ({wf.runHistory.length})
                  </Collapsible.Trigger>
                  <Collapsible.Content className="mt-2 data-[state=closed]:animate-out">
                    <ul className="flex flex-col gap-2">
                      {wf.runHistory.map((run, idx) => (
                        <li
                          key={idx}
                          className="flex flex-wrap items-center gap-2 text-[length:var(--font-size-sm)]"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-success)]" aria-hidden />
                          <span className="text-[var(--color-neutral-8)]">Just now</span>
                          <span className="font-medium text-[var(--color-success)]">{run.label}</span>
                          <span className="tabular-nums text-[var(--color-neutral-8)]">{run.duration}</span>
                        </li>
                      ))}
                    </ul>
                  </Collapsible.Content>
                </Collapsible.Root>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
