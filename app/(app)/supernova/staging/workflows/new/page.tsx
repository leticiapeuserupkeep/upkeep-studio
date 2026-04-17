'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import {
  BarChart3, Package, ShieldCheck, Wrench, Bell, Users,
  Zap, ClipboardList, ArrowRight, Send,
} from 'lucide-react'
import { SuperNovaStagingOrb } from '@/app/components/supernova-staging/SuperNovaStagingOrb'

// ─── Types ────────────────────────────────────────────────────────────────────
type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string }

// ─── Typing bubble ────────────────────────────────────────────────────────────
function TypingBubble() {
  return (
    <div className="flex gap-2.5 sn-fade-in">
      <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center">
        <SuperNovaStagingOrb size="sm" />
      </div>
      <div className="rounded-[var(--radius-xl)] rounded-tl-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3.5 py-3 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-1 h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neutral-6)] animate-bounce" style={{ animationDelay: '0ms', animationDuration: '900ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neutral-6)] animate-bounce" style={{ animationDelay: '180ms', animationDuration: '900ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neutral-6)] animate-bounce" style={{ animationDelay: '360ms', animationDuration: '900ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Workflow idea chips ───────────────────────────────────────────────────────
const WORKFLOW_IDEAS = [
  { icon: BarChart3,     label: 'Vendor invoice approval',         prompt: 'I want to build a workflow that routes vendor invoices through approval, flags exceptions, and notifies the finance team.' },
  { icon: Bell,         label: 'PM work order escalation',         prompt: 'I need a workflow that monitors preventive maintenance work orders and escalates overdue ones to the right manager.' },
  { icon: Zap,          label: 'Asset downtime alert',             prompt: 'Build a workflow that detects when an asset goes offline and immediately alerts the on-call technician.' },
  { icon: ClipboardList,label: 'Compliance audit report',          prompt: 'I want a workflow that gathers compliance data from multiple sources and generates a weekly audit report.' },
  { icon: Users,        label: 'New employee onboarding checklist',prompt: 'Create a workflow that automatically kicks off onboarding tasks when a new employee is added to the system.' },
  { icon: Package,      label: 'Parts restock notification',       prompt: 'I need a workflow that watches parts inventory and sends a restock request when any item drops below its minimum threshold.' },
  { icon: ShieldCheck,  label: 'Safety incident digest',           prompt: 'Build a workflow that collects safety incidents and near-misses each week and sends a digest to the EHS team.' },
  { icon: Wrench,       label: 'Inspection scheduling',            prompt: 'I want a workflow that automatically schedules recurring inspections for assets based on their maintenance plan.' },
]

const INTRO_MESSAGE_ID = 'intro-0'
const INTRO_TEXT = `Hey Leti 👋 I'm here to help you build a new workflow from scratch.\n\nDescribe what you need in plain words — what should happen, when it should trigger, and what the end result is. Or pick one of the ideas below to get started quickly.`

// ─── Page ────────────────────────────────────────────────────────────────────
export default function NewWorkflowPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [ideaMessageId, setIdeaMessageId] = useState<string | null>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mount: show typing then greeting
  useEffect(() => {
    const t1 = window.setTimeout(() => setIsTyping(true), 400)
    const t2 = window.setTimeout(() => {
      setIsTyping(false)
      setMessages([{ id: INTRO_MESSAGE_ID, role: 'assistant', text: INTRO_TEXT }])
      setIdeaMessageId(INTRO_MESSAGE_ID)
      window.setTimeout(() => composerRef.current?.focus(), 60)
    }, 1600)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages, isTyping])

  const handleIdeaSelect = useCallback((idea: (typeof WORKFLOW_IDEAS)[number]) => {
    setIdeaMessageId(null)
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: idea.label }])
    setIsTyping(true)
    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `Great choice! Here's what I'm thinking for **${idea.label}**:\n\n${idea.prompt}\n\nLet me sketch out the steps. What's the main trigger — should this run on a schedule, fire on a specific event, or be kicked off manually?`,
        },
      ])
    }, 1200)
  }, [])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }])
    setDraft('')
    setIsTyping(true)
    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `Got it — that sounds like a great workflow! Let me think through the steps with you. Full agent replies will be available in production. What's the first thing that should happen when this workflow kicks off?`,
        },
      ])
    }, 1100)
  }, [draft])

  return (
    <div className="sn-staging-agent-detail-enter flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-canvas)]">

      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 min-h-[var(--supernova-staging-header-height)] px-[var(--space-2xl)] border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
        <SuperNovaStagingOrb size="sm" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] leading-tight">New Workflow</h1>
          <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] leading-tight">SuperNova will help you build it step by step</p>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-[var(--space-2xl)] py-6 flex flex-col gap-4" style={{ maxWidth: 680, width: '100%', margin: '0 auto', alignSelf: 'center' }}>

        {messages.map((m) => (
          <Fragment key={m.id}>
            {m.role === 'assistant' && (
              <div className="flex gap-2.5 sn-fade-in">
                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center">
                  <SuperNovaStagingOrb size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="rounded-[var(--radius-xl)] rounded-tl-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 text-[length:var(--font-size-sm)] leading-relaxed text-[var(--color-neutral-11)] shadow-[var(--shadow-xs)] whitespace-pre-line">
                    {m.text}
                  </div>
                </div>
              </div>
            )}

            {m.role === 'user' && (
              <div className="flex justify-end sn-fade-in">
                <div className="max-w-[75%] rounded-[var(--radius-xl)] rounded-tr-[var(--radius-sm)] bg-[var(--color-neutral-4)] px-4 py-2.5 text-[length:var(--font-size-sm)] leading-relaxed text-[var(--color-neutral-12)]">
                  {m.text}
                </div>
              </div>
            )}

            {/* Idea chips after intro message */}
            {m.id === ideaMessageId && (
              <div className="ml-9 sn-fade-in">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)] mb-2.5 px-0.5">
                  Quick ideas
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {WORKFLOW_IDEAS.map((idea) => {
                    const Icon = idea.icon
                    return (
                      <button
                        key={idea.label}
                        type="button"
                        onClick={() => handleIdeaSelect(idea)}
                        className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-accent-1)] hover:border-[var(--color-accent-4)] transition-colors cursor-pointer group/idea"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] group-hover/idea:bg-[var(--color-accent-2)] transition-colors">
                          <Icon size={13} className="text-[var(--color-neutral-7)] group-hover/idea:text-[var(--color-accent-9)] transition-colors" aria-hidden />
                        </span>
                        <span className="flex-1 truncate">{idea.label}</span>
                        <ArrowRight size={12} className="text-[var(--color-neutral-5)] group-hover/idea:text-[var(--color-accent-9)] shrink-0 transition-colors" aria-hidden />
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-[var(--color-neutral-6)] mt-3 px-0.5">
                  or describe your own idea below ↓
                </p>
              </div>
            )}
          </Fragment>
        ))}

        {isTyping && <TypingBubble />}
        <div ref={messagesEndRef} className="h-px shrink-0" aria-hidden />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-[var(--border-default)] px-[var(--space-2xl)] py-4" style={{ maxWidth: 680, width: '100%', margin: '0 auto', alignSelf: 'center' }}>
        <div className="flex items-end gap-2 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus-within:border-[var(--color-accent-7)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent-9)_14%,transparent)]">
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            rows={1}
            placeholder="Describe your workflow idea…"
            className="flex-1 resize-none bg-transparent text-[length:var(--font-size-sm)] leading-5 text-[var(--color-neutral-12)] outline-none focus:outline-none focus-visible:outline-none placeholder:text-[var(--color-neutral-6)] min-h-[28px] max-h-32 py-0.5"
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
  )
}
