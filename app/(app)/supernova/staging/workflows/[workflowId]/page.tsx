'use client'

import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Bot, Clock, Zap, GitBranch,
  CheckCircle2, AlertCircle, RefreshCw, ChevronDown,
  Send, Plus, MoreVertical, Settings, UserPlus,
  PauseCircle, FileEdit, Cpu, Split, ArrowRight,
} from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { IconButton } from '@/app/components/ui/IconButton'
import { SuperNovaStagingOrb } from '@/app/components/supernova-staging/SuperNovaStagingOrb'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  getWorkflowById,
  type WorkflowStatus,
  type TriggerType,
  type StepType,
} from '../../lib/staging-workflows'

// ─── Type ────────────────────────────────────────────────────────────────────
type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkflowStatus }) {
  if (status === 'active')
    return <Badge severity="success" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide">Active</Badge>
  if (status === 'paused')
    return <Badge severity="warning" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide">Paused</Badge>
  if (status === 'failed')
    return <Badge severity="danger" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide">Failed</Badge>
  return <Badge severity="neutral" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide">Draft</Badge>
}

function TriggerChip({ type }: { type: TriggerType }) {
  if (type === 'scheduled')
    return (
      <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">
        <Clock size={13} className="text-[var(--color-accent-9)]" aria-hidden /> Scheduled
      </span>
    )
  if (type === 'event')
    return (
      <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">
        <Zap size={13} className="text-[#7c3aed]" aria-hidden /> Event-based
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">
      <Play size={13} className="text-[var(--color-neutral-7)]" aria-hidden /> Manual
    </span>
  )
}

function RunStatusDot({ status }: { status: 'completed' | 'failed' | 'running' }) {
  if (status === 'running')
    return <RefreshCw size={13} className="text-[var(--color-accent-9)] animate-spin shrink-0" aria-hidden />
  if (status === 'failed')
    return <AlertCircle size={13} className="text-[var(--color-error)] shrink-0" aria-hidden />
  return <CheckCircle2 size={13} className="text-[var(--color-success)] shrink-0" aria-hidden />
}

// ─── Workflow graph ───────────────────────────────────────────────────────────

const STEP_TYPE_META: Record<StepType, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  action: { label: 'Action', color: 'var(--color-accent-9)', bg: 'var(--color-accent-1)', Icon: Cpu },
  condition: { label: 'Condition', color: '#7c3aed', bg: '#fdf4ff', Icon: GitBranch },
  branch: { label: 'Branch', color: '#d97706', bg: '#fffbeb', Icon: Split },
  agent: { label: 'Agent', color: 'var(--color-success)', bg: 'color-mix(in srgb, var(--color-success) 10%, transparent)', Icon: Bot },
}

function StepNode({ step, index, isLast }: {
  step: { id: string; label: string; type: StepType; description?: string; branches?: { label: string }[] }
  index: number
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = STEP_TYPE_META[step.type]
  const Icon = meta.Icon

  return (
    <div className="flex gap-3">
      {/* Left: node + connector */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: meta.bg,
            boxShadow: `0 0 0 1.5px ${meta.color}60`,
          }}
        >
          <Icon size={13} style={{ color: meta.color }} aria-hidden />
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ minHeight: 20, background: 'var(--border-default)' }} />
        )}
      </div>

      {/* Right: content */}
      <div className={`flex-1 min-w-0 pb-4 ${isLast ? 'pb-0' : ''}`}>
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full text-left group/step"
        >
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-[var(--radius-sm)] shrink-0 mt-0.5"
              style={{ color: meta.color, background: meta.bg }}
            >
              {index + 1} · {meta.label}
            </span>
            <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)] leading-snug flex-1 min-w-0">
              {step.label}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 mt-0.5 text-[var(--color-neutral-6)] transition-transform duration-[var(--duration-fast)] ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </div>
        </button>

        {expanded && (
          <div className="mt-2 pl-0 space-y-2">
            {step.description && (
              <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] leading-relaxed">
                {step.description}
              </p>
            )}
            {step.branches && step.branches.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {step.branches.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ArrowRight size={11} className="text-[var(--color-neutral-6)] shrink-0" aria-hidden />
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-sm)]"
                      style={{ color: meta.color, background: meta.bg }}
                    >
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Detail page ─────────────────────────────────────────────────────────────

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = typeof params.workflowId === 'string' ? params.workflowId : ''
  const wf = getWorkflowById(workflowId)

  const [draft, setDraft] = useState('')
  const [historyOpen, setHistoryOpen] = useState(true)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Pre-seeded assistant context message
  const initialMessages: ChatMessage[] = wf ? [
    {
      id: 'asst-context',
      role: 'assistant',
      text: `This workflow **${wf.title}** ${wf.description.toLowerCase().replace(/\.$/, '')}. It has ${wf.steps.length} steps and ${wf.triggerType === 'scheduled' ? 'runs automatically on a schedule' : wf.triggerType === 'event' ? 'triggers on incoming events' : 'runs manually on demand'}. ${wf.totalRuns > 0 ? `It has run ${wf.totalRuns} time${wf.totalRuns !== 1 ? 's' : ''}${wf.lastRun ? `, most recently ${wf.lastRun}` : ''}.` : 'It has not run yet.'} ${wf.assignedAgent ? `Assigned to agent: ${wf.assignedAgent}.` : 'Currently unassigned.'}`,
    },
  ] : []

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)

  useEffect(() => {
    if (!wf) router.replace('/supernova/staging')
  }, [wf, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }])
    setDraft('')
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'Got it — full agent replies will be available in production. This is staging-only behaviour.',
        },
      ])
    }, 420)
  }, [draft])

  if (!wf) return (
    <div className="flex h-full items-center justify-center text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">
      Loading…
    </div>
  )

  const quickActions = [
    { label: 'Run now', icon: Play, prompt: 'Run this workflow now.' },
    { label: 'Assign agent', icon: UserPlus, prompt: 'Assign an agent to this workflow.' },
    { label: 'Modify steps', icon: FileEdit, prompt: 'I want to modify the steps in this workflow.' },
    { label: 'Pause', icon: PauseCircle, prompt: 'Pause this workflow.' },
  ]

  return (
    <div className="sn-staging-agent-detail-enter flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-[var(--surface-canvas)]">

      {/* ── LEFT: main content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 min-h-[var(--supernova-staging-header-height)] px-[var(--space-2xl)] border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
          <button
            type="button"
            onClick={() => router.push('/supernova/staging')}
            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)] shrink-0"
            aria-label="Back to Workflows"
          >
            <ArrowLeft size={18} className="text-[var(--color-neutral-7)]" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] shrink-0">Workflows</span>
            <span className="text-[var(--color-neutral-5)] shrink-0">/</span>
            <h1 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] truncate">
              {wf.title}
            </h1>
            <StatusBadge status={wf.status} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {wf.status !== 'failed' && wf.status !== 'draft' && (
              <Button variant="primary" size="md" type="button" className="gap-1.5">
                <Play size={14} strokeWidth={2.5} aria-hidden /> Run now
              </Button>
            )}
            <IconButton label="More options" variant="secondary" size="md" type="button">
              <MoreVertical size={16} aria-hidden />
            </IconButton>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-[var(--space-2xl)] py-[var(--space-xl)]">
          <div className="flex flex-col gap-6" style={{ maxWidth: 580 }}>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: 'Assigned agent',
                  value: wf.assignedAgent ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent-3)] flex items-center justify-center shrink-0">
                        <Bot size={11} className="text-[var(--color-accent-10)]" aria-hidden />
                      </span>
                      {wf.assignedAgent}
                    </span>
                  ) : (
                    <span className="text-[var(--color-neutral-6)]">Unassigned</span>
                  ),
                },
                {
                  label: 'Trigger',
                  value: <TriggerChip type={wf.triggerType} />,
                },
                {
                  label: 'Total runs',
                  value: <span className="tabular-nums">{wf.totalRuns}</span>,
                },
                {
                  label: 'Last run',
                  value: wf.lastRun ? (
                    <span className="inline-flex items-center gap-1.5">
                      <RunStatusDot status={wf.lastRunStatus!} />
                      {wf.lastRun}
                    </span>
                  ) : (
                    <span className="text-[var(--color-neutral-6)]">Never</span>
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)] mb-1">{label}</p>
                  <div className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)] mb-1.5">Description</p>
              <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-10)] leading-relaxed">
                {wf.description}
              </p>
            </div>

            {/* Workflow graph */}
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--border-subtle)]">
                <GitBranch size={15} className="text-[var(--color-neutral-7)] shrink-0" aria-hidden />
                <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                  Workflow steps
                </span>
                <span className="ml-auto text-[11px] font-medium text-[var(--color-neutral-7)]">
                  {wf.steps.length} step{wf.steps.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="px-5 py-4">
                {wf.steps.map((step, i) => (
                  <StepNode
                    key={step.id}
                    step={step}
                    index={i}
                    isLast={i === wf.steps.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Run history */}
            {wf.runHistory.length > 0 && (
              <Collapsible.Root open={historyOpen} onOpenChange={setHistoryOpen}>
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden">
                  <Collapsible.Trigger className="w-full flex items-center gap-2 px-5 py-3.5 border-b border-[var(--border-subtle)] hover:bg-[var(--color-neutral-2)] transition-colors cursor-pointer group">
                    <CheckCircle2 size={15} className="text-[var(--color-neutral-7)] shrink-0" aria-hidden />
                    <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] flex-1 text-left">
                      Run history
                    </span>
                    <span className="text-[11px] font-medium text-[var(--color-neutral-7)] mr-1">
                      {wf.runHistory.length} run{wf.runHistory.length !== 1 ? 's' : ''}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[var(--color-neutral-6)] transition-transform duration-[var(--duration-fast)] ${historyOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {/* Col headers */}
                      <div className="grid px-5 py-2 bg-[var(--surface-secondary)]"
                        style={{ gridTemplateColumns: '1fr 80px 100px 100px' }}>
                        {['Started', 'Duration', 'Status', 'Triggered by'].map((h) => (
                          <span key={h} className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)]">{h}</span>
                        ))}
                      </div>
                      {wf.runHistory.map((run) => (
                        <div
                          key={run.id}
                          className="grid items-center px-5 py-3"
                          style={{ gridTemplateColumns: '1fr 80px 100px 100px' }}
                        >
                          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">{run.startedAt}</span>
                          <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] tabular-nums">
                            {run.duration ?? '—'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-sm)]">
                            <RunStatusDot status={run.status} />
                            <span className="capitalize text-[var(--color-neutral-9)]">{run.status}</span>
                          </span>
                          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] capitalize">
                            {run.triggeredBy}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Collapsible.Content>
                </div>
              </Collapsible.Root>
            )}

          </div>
        </div>
      </div>

      {/* ── RIGHT: Supernova chat panel ────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col overflow-hidden border-l border-[var(--border-default)] bg-[var(--surface-primary)]"
        style={{ width: 340 }}
      >
        {/* Panel header */}
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border-default)]">
          <SuperNovaStagingOrb size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)] leading-tight">
              SuperNova
            </p>
            <p className="text-[11px] text-[var(--color-neutral-7)] leading-tight">Workflow assistant</p>
          </div>
          <IconButton label="More options" variant="ghost" size="md" type="button">
            <MoreVertical size={15} aria-hidden />
          </IconButton>
        </div>

        {/* Chat messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {messages.map((m) => (
            <Fragment key={m.id}>
              {m.role === 'assistant' && (
                <div className="flex gap-2.5">
                  <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center">
                    <SuperNovaStagingOrb size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-[var(--radius-xl)] rounded-tl-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3.5 py-3 text-[length:var(--font-size-sm)] leading-relaxed text-[var(--color-neutral-11)] shadow-[var(--shadow-xs)]">
                      {m.text}
                    </div>
                  </div>
                </div>
              )}
              {m.role === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-[var(--radius-xl)] rounded-tr-[var(--radius-sm)] bg-[var(--color-neutral-4)] px-3.5 py-2.5 text-[length:var(--font-size-sm)] leading-relaxed text-[var(--color-neutral-12)]">
                    {m.text}
                  </div>
                </div>
              )}
            </Fragment>
          ))}

          {/* Quick actions (shown after initial message, before any user input) */}
          {messages.length === 1 && (
            <div className="flex flex-col gap-1.5 pl-9">
              <p className="text-[11px] font-semibold text-[var(--color-neutral-7)] uppercase tracking-wide mb-1">Quick actions</p>
              {quickActions.map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: a.prompt }])
                      window.setTimeout(() => {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `a-${Date.now()}`,
                            role: 'assistant',
                            text: `Sure — I'll handle "${a.label}" for this workflow. Full agent execution will be connected in production.`,
                          },
                        ])
                      }, 420)
                    }}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon size={14} className="text-[var(--color-neutral-7)] shrink-0" aria-hidden />
                      <span className="truncate">{a.label}</span>
                    </span>
                    <ArrowRight size={13} className="text-[var(--color-neutral-6)] shrink-0" aria-hidden />
                  </button>
                )
              })}
            </div>
          )}

          <div ref={messagesEndRef} className="h-px w-full shrink-0" aria-hidden />
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-[var(--border-default)] px-3 py-3">
          <div className="flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus-within:border-[var(--color-accent-7)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent-9)_14%,transparent)]">
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              rows={1}
              placeholder="Ask about this workflow…"
              className="flex-1 resize-none bg-transparent text-[length:var(--font-size-sm)] leading-5 text-[var(--color-neutral-12)] outline-none placeholder:text-[var(--color-neutral-6)] min-h-[32px] max-h-24 py-1.5"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-9)] text-white shadow-sm transition-opacity hover:bg-[var(--color-accent-10)] disabled:pointer-events-none disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={14} className="shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
