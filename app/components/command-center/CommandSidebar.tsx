'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X, Search, Plus, Send, Mic, Settings, ChevronRight,
  Star, Zap, BarChart3, ClipboardList, Sparkles, Users,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import {
  EXISTING_AGENTS, AVAILABLE_AGENTS, DEFAULT_CHIPS, MULTI_AGENT_EXTRA_CHIPS,
  suggestTeammate, getTeammateGreeting, getTeammateWelcomeActions,
  SMART_INBOX_WORKFLOW_CHIP_PROMPT,
} from '@/app/lib/agents-data'
import type { Teammate, ChatMessage, SuggestedChip, ActionOption } from '@/app/lib/agents-data'

export type SidebarView = 'chat' | 'aimates' | 'workflows'

interface CommandSidebarProps {
  view: SidebarView
  isOpen: boolean
  onClose: () => void
  onChangeView: (view: SidebarView) => void
  initialChatMateId?: string | null
  initialChatMessage?: string | null
}

const ALL_AGENTS = [...EXISTING_AGENTS, ...AVAILABLE_AGENTS]

const tElena = ALL_AGENTS.find((a) => a.id === 'elena')!
const tMarcus = ALL_AGENTS.find((a) => a.id === 'marcus')!
const tSofia = ALL_AGENTS.find((a) => a.id === 'sofia')!

const availabilityDot: Record<string, string> = {
  available: 'bg-[var(--color-success)]',
  busy: 'bg-amber-400',
  offline: 'bg-[var(--color-neutral-5)]',
}

/* ── Workflows data ── */

export interface SidebarWorkflowRow {
  id: string
  title: string
  schedule: string
  active: boolean
  description: string
}

const INITIAL_SIDEBAR_WORKFLOWS: SidebarWorkflowRow[] = [
  { id: 'sw1', title: 'Weekly PM digest', schedule: 'Today 5pm', active: true, description: 'Sends PM summary to maintenance leads' },
  { id: 'sw2', title: 'Inventory check', schedule: 'Mon 8am', active: true, description: 'Scans stock levels, flags low items' },
  { id: 'sw3', title: 'SLA compliance report', schedule: 'Daily 6am', active: true, description: 'Calculates SLA % and alerts on misses' },
  { id: 'sw4', title: 'Vendor invoice sync', schedule: 'Daily 9am', active: false, description: 'Imports invoices from connected vendors' },
  { id: 'sw5', title: 'Shift handoff summary', schedule: 'Daily 3pm', active: true, description: 'Summarizes open items for next shift' },
]

const SMART_INBOX_SAVED: Omit<SidebarWorkflowRow, 'id'> = {
  title: 'Smart inbox reply drafts',
  schedule: 'Every 60 min',
  active: true,
  description: 'Monitors inbox, researches context, and drafts replies for important emails',
}

/* ── Main sidebar (inline drawer) ── */

export function CommandSidebar({ view, isOpen, onClose, onChangeView, initialChatMateId, initialChatMessage }: CommandSidebarProps) {
  const [sidebarWorkflows, setSidebarWorkflows] = useState<SidebarWorkflowRow[]>(INITIAL_SIDEBAR_WORKFLOWS)

  if (!isOpen) return null

  return (
    <div className="w-[380px] shrink-0 border-l border-[var(--border-default)] bg-[var(--surface-primary)] flex flex-col overflow-hidden h-full min-h-0 max-h-[calc(100vh-3.5rem)] sticky top-0 z-20">
      {view === 'chat' && (
        <ChatView
          onClose={onClose}
          initialMateId={initialChatMateId}
          initialMessage={initialChatMessage}
          onWorkflowSaved={(row) => setSidebarWorkflows((prev) => [row, ...prev])}
        />
      )}
      {view === 'aimates' && <AIMatesView onClose={onClose} onSelectMate={(id) => { onChangeView('chat') }} />}
      {view === 'workflows' && <WorkflowsView onClose={onClose} workflows={sidebarWorkflows} />}
    </div>
  )
}

/* ── Chat View ── */

function ChatView({
  onClose,
  initialMateId,
  initialMessage,
  onWorkflowSaved,
}: {
  onClose: () => void
  initialMateId?: string | null
  initialMessage?: string | null
  onWorkflowSaved: (row: SidebarWorkflowRow) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialMateId ?? null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  /** 0 = idle; 1 = Elena turn; 2 = Marcus; 3 = Sofia; 4 = Marcus final (save/dismiss) */
  const [smartInboxStep, setSmartInboxStep] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedMate = selectedId ? ALL_AGENTS.find(a => a.id === selectedId) : null
  const isMulti = !selectedId

  const pendingWorkflowOptions = [...messages].reverse().find(
    (m) =>
      m.role === 'teammate' &&
      m.options?.some(
        (o) => o.action === 'wf_continue' || o.action === 'wf_save' || o.action === 'wf_dismiss',
      ),
  )
  const inputLockedForWorkflow = isMulti && smartInboxStep > 0 && !!pendingWorkflowOptions

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  useEffect(() => {
    if (selectedMate) {
      const content = initialMessage ?? getTeammateGreeting(selectedMate)
      const actions = initialMessage ? [] : getTeammateWelcomeActions(selectedMate)
      setMessages([{
        id: 'welcome',
        role: 'teammate',
        content,
        teammate: selectedMate,
        timestamp: new Date(),
        options: actions,
      }])
      setSmartInboxStep(0)
    } else {
      setMessages([])
      setSmartInboxStep(0)
    }
  }, [selectedMate, initialMessage])

  const startSmartInboxWorkflow = useCallback(() => {
    setSmartInboxStep(1)
    setMessages([
      {
        id: `wf-user-${Date.now()}`,
        role: 'user',
        content: SMART_INBOX_WORKFLOW_CHIP_PROMPT,
        timestamp: new Date(),
      },
    ])
    setIsThinking(true)
    setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `wf-elena-${Date.now()}`,
          role: 'teammate',
          teammate: tElena,
          content:
            'I\'d start by **scoring each email** for importance (sender, thread, recency), then only invest drafting time on messages above your threshold — that keeps volume manageable.\n\n**What should we prioritize first?**',
          timestamp: new Date(),
          options: [
            { id: 'wf-e1', label: 'VIP senders + urgent threads', action: 'wf_continue' },
            { id: 'wf-e2', label: 'Score everything, draft top 20%', action: 'wf_continue' },
          ],
        },
      ])
    }, 900)
  }, [])

  const handleWorkflowOption = useCallback(
    (opt: ActionOption) => {
      if (opt.action === 'wf_save') {
        const id = `sw-${Date.now()}`
        onWorkflowSaved({ id, ...SMART_INBOX_SAVED })
        setMessages((prev) => [
          ...prev,
          { id: `wf-user-${Date.now()}`, role: 'user', content: opt.label, timestamp: new Date() },
          {
            id: `wf-saved-${Date.now()}`,
            role: 'teammate',
            teammate: tMarcus,
            content:
              '**Smart inbox reply drafts** is saved and **active**. It\'s on a **60 min** schedule — **last run:** 8 min ago · **Runs:** 127.\n\nYou can manage it anytime under **Workflows**.',
            timestamp: new Date(),
          },
        ])
        setSmartInboxStep(0)
        return
      }
      if (opt.action === 'wf_dismiss') {
        setMessages((prev) => [
          ...prev,
          { id: `wf-user-${Date.now()}`, role: 'user', content: opt.label, timestamp: new Date() },
          {
            id: `wf-dismiss-${Date.now()}`,
            role: 'teammate',
            teammate: tMarcus,
            content: 'No problem — we can pick this up later. If you change your mind, start another **AI-Team** thread anytime.',
            timestamp: new Date(),
          },
        ])
        setSmartInboxStep(0)
        return
      }

      setMessages((prev) => [
        ...prev,
        { id: `wf-user-${Date.now()}`, role: 'user', content: opt.label, timestamp: new Date() },
      ])
      setIsThinking(true)
      setSmartInboxStep((prevStep) => {
        const nextStep = prevStep + 1
        setTimeout(() => {
          setIsThinking(false)
          if (nextStep === 2) {
            setMessages((prev) => [
              ...prev,
              {
                id: `wf-marcus-1-${Date.now()}`,
                role: 'teammate',
                teammate: tMarcus,
                content:
                  'I\'ll set the trigger to **Schedule every 60 minutes** so you get consistent coverage without hammering APIs. We can tune cadence later.\n\n**Confirm the schedule:**',
                timestamp: new Date(),
                options: [
                  { id: 'wf-m1', label: 'Every 60 minutes', action: 'wf_continue' },
                  { id: 'wf-m2', label: 'Every 15 minutes (higher load)', action: 'wf_continue' },
                ],
              },
            ])
          } else if (nextStep === 3) {
            setMessages((prev) => [
              ...prev,
              {
                id: `wf-sofia-${Date.now()}`,
                role: 'teammate',
                teammate: tSofia,
                content:
                  'Here\'s a clean **5-step** path: (1) fetch new mail → (2) score importance → (3) pull **Gmail + Google Calendar** context for important threads → (4) draft the reply → (5) save to **Gmail Drafts** only (never auto-send).\n\n**Which integrations should we assume?**',
                timestamp: new Date(),
                options: [
                  { id: 'wf-s1', label: 'Gmail + Google Calendar', action: 'wf_continue' },
                  { id: 'wf-s2', label: 'Gmail only', action: 'wf_continue' },
                ],
              },
            ])
          } else if (nextStep === 4) {
            setMessages((prev) => [
              ...prev,
              {
                id: `wf-marcus-final-${Date.now()}`,
                role: 'teammate',
                teammate: tMarcus,
                content:
                  `Here\'s what we\'ve aligned on:\n\n**Smart inbox reply drafts**\n\n**Trigger:** Schedule every 60 minutes\n\n**What it does:** Checks Gmail inbox for new emails → scores importance → for important ones, searches recent conversation history and context → drafts a reply using that context → saves to **Gmail Drafts** (not sent — just drafted).\n\n**Steps:** 5\n**Agent:** Marcus\n**Integrations:** Gmail, Google Calendar (for context on meetings mentioned)\n**Status:** active (once saved)\n**Trigger type:** Schedule · Every 60 min\n**Description:** "Monitors inbox, researches context, and drafts replies for important emails"\n**Last run:** — · **Runs:** 0\n\n---\n\nDo you want to save this as a workflow?`,
                timestamp: new Date(),
                options: [
                  { id: 'wf-save', label: 'Save workflow', action: 'wf_save' },
                  { id: 'wf-no', label: 'Not now', action: 'wf_dismiss' },
                ],
              },
            ])
          }
        }, 900)
        return nextStep
      })
    },
    [onWorkflowSaved],
  )

  const handleMessageOption = useCallback(
    (opt: ActionOption) => {
      if (opt.action === 'wf_continue' || opt.action === 'wf_save' || opt.action === 'wf_dismiss') {
        handleWorkflowOption(opt)
        return
      }
      if (!selectedMate) return
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', content: opt.label, timestamp: new Date() },
      ])
      setIsThinking(true)
      setTimeout(() => {
        setIsThinking(false)
        setMessages((prev) => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            role: 'teammate',
            teammate: selectedMate,
            content: getSimulatedResponse(selectedMate, opt.label),
            timestamp: new Date(),
          },
        ])
      }, 800)
    },
    [selectedMate, handleWorkflowOption],
  )

  const handleSend = useCallback(() => {
    const text = chatInput.trim()
    if (!text) return
    if (inputLockedForWorkflow) return
    setChatInput('')

    const smartInboxIntent =
      isMulti &&
      smartInboxStep === 0 &&
      /smart inbox|inbox reply|reply draft|gmail draft|design a workflow/i.test(text)

    if (smartInboxIntent) {
      setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: new Date() }])
      setIsThinking(true)
      setSmartInboxStep(1)
      setTimeout(() => {
        setIsThinking(false)
        setMessages((prev) => [
          ...prev,
          {
            id: `wf-elena-${Date.now()}`,
            role: 'teammate',
            teammate: tElena,
            content:
              'I\'d start by **scoring each email** for importance (sender, thread, recency), then only invest drafting time on messages above your threshold — that keeps volume manageable.\n\n**What should we prioritize first?**',
            timestamp: new Date(),
            options: [
              { id: 'wf-e1', label: 'VIP senders + urgent threads', action: 'wf_continue' },
              { id: 'wf-e2', label: 'Score everything, draft top 20%', action: 'wf_continue' },
            ],
          },
        ])
      }, 900)
      return
    }

    setMessages((prev) => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }])

    setIsThinking(true)
    const responder = selectedMate ?? suggestTeammate(text)
    setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [...prev, {
        id: `resp-${Date.now()}`,
        role: 'teammate',
        content: getSimulatedResponse(responder, text),
        teammate: responder,
        timestamp: new Date(),
      }])
    }, 1200)
  }, [chatInput, selectedMate, isMulti, smartInboxStep, inputLockedForWorkflow])

  const handleChipClick = (chip: SuggestedChip) => {
    if (isMulti && chip.prompt === SMART_INBOX_WORKFLOW_CHIP_PROMPT) {
      startSmartInboxWorkflow()
      return
    }
    setChatInput(chip.prompt)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const showWelcome = isMulti && messages.length === 0

  return (
    <div className="flex h-full">
      {/* Left: Agent selector (vertical) */}
      <div className="flex flex-col items-center gap-1.5 py-2 px-1.5 border-r border-[var(--border-subtle)] bg-[var(--surface-primary)] shrink-0 w-[68px]">
        {/* Multi-agent */}
        <button
          onClick={() => setSelectedId(null)}
          className={`flex flex-col items-center gap-1 w-12 py-2 rounded-[var(--radius-lg)] cursor-pointer transition-all ${
            isMulti
              ? 'bg-[var(--color-accent-1)] border border-[var(--color-accent-7)]'
              : 'hover:bg-[var(--color-neutral-2)] border border-transparent'
          }`}
          title="All Agents"
        >
          <div className="flex -space-x-2">
            {EXISTING_AGENTS.slice(0, 2).map(a => (
              <img key={a.id} src={a.photo} alt={a.firstName} className="w-7 h-7 rounded-full object-cover border-2 border-white" />
            ))}
          </div>
          <span className={`text-[9px] font-semibold ${isMulti ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-7)]'}`}>All</span>
        </button>

        {/* Individual agents */}
        {ALL_AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedId(agent.id)}
            className={`flex flex-col items-center gap-1 w-12 py-2 rounded-[var(--radius-lg)] cursor-pointer transition-all ${
              selectedId === agent.id
                ? 'bg-[var(--color-accent-1)] border border-[var(--color-accent-7)]'
                : 'hover:bg-[var(--color-neutral-2)] border border-transparent'
            }`}
            title={`${agent.firstName} — ${agent.jobTitle}`}
          >
            <div className="relative">
              <img src={agent.photo} alt={agent.firstName} className="w-9 h-9 rounded-full object-cover" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${availabilityDot[agent.availability]}`} />
            </div>
            <span className={`text-[9px] font-medium truncate max-w-full ${selectedId === agent.id ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-7)]'}`}>{agent.firstName}</span>
          </button>
        ))}
      </div>

      {/* Right: Chat area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden" style={{ background: 'linear-gradient(357deg, #F0F4FF 5%, #FFFFFF 98%)' }}>
        {/* Header — pinned top */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border-default)] bg-[var(--surface-primary)] shrink-0 z-10">
          <span className="text-[14px] font-semibold text-[var(--color-neutral-12)]">
            {selectedMate ? `${selectedMate.firstName} ${selectedMate.lastName}` : 'AI-Team Chat'}
          </span>
          <button onClick={onClose} className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
            <X size={15} className="text-[var(--color-neutral-7)]" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {showWelcome ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="flex items-center -space-x-4">
                {EXISTING_AGENTS.map(a => (
                  <img key={a.id} src={a.photo} alt={a.firstName} className="w-[60px] h-[60px] rounded-full object-cover border-[3px] border-white shadow-sm" />
                ))}
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <h2 className="text-[20px] font-bold text-[var(--color-neutral-12)]">Good Morning, Leti</h2>
                <p className="text-[13px] text-[var(--color-neutral-8)]">Your team is ready to work with you!</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                {[...DEFAULT_CHIPS, ...MULTI_AGENT_EXTRA_CHIPS].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleChipClick(chip)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)] text-[12px] text-[var(--color-neutral-9)] font-medium hover:bg-[var(--color-neutral-2)] hover:border-[var(--color-neutral-5)] cursor-pointer transition-all"
                  >
                    {chip.icon && (() => { const Icon = chip.icon; return <Icon size={13} className="text-[var(--color-neutral-7)]" /> })()}
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <SidebarMessageBubble key={msg.id} message={msg} onOptionClick={handleMessageOption} />
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 text-[13px] text-[var(--color-neutral-7)]">
                  <Sparkles size={14} className="text-[var(--color-accent-9)] animate-pulse" />
                  Thinking…
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input bar — pinned bottom */}
        <div className="px-4 pb-4 pt-2 shrink-0 z-10">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-sm focus-within:border-[var(--color-accent-8)] focus-within:shadow-[0_0_0_3px_rgba(59,91,219,0.12)] transition-all">
            <div className="flex items-center px-3 py-2.5 gap-2">
              <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[var(--color-neutral-3)] cursor-pointer shrink-0">
                <Plus size={15} className="text-[var(--color-neutral-7)]" />
              </button>
              <textarea
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={inputLockedForWorkflow}
                className="flex-1 resize-none bg-transparent text-[13px] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-6)] outline-none! ring-0! shadow-none! disabled:opacity-50"
                placeholder={
                  inputLockedForWorkflow
                    ? 'Choose a suggestion above to continue…'
                    : selectedMate
                      ? `Ask ${selectedMate.firstName}…`
                      : 'Ask Agents…'
                }
              />
              <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[var(--color-neutral-3)] cursor-pointer shrink-0">
                <Mic size={15} className="text-[var(--color-neutral-7)]" />
              </button>
              <button
                onClick={handleSend}
                disabled={!chatInput.trim() || inputLockedForWorkflow}
                className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer transition-colors shrink-0 ${
                  chatInput.trim() && !inputLockedForWorkflow
                    ? 'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)]'
                    : 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-7)] opacity-40'
                }`}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Agents List View ── */

function AIMatesView({ onClose, onSelectMate }: { onClose: () => void; onSelectMate: (id: string) => void }) {
  const [search, setSearch] = useState('')

  const filtered = ALL_AGENTS.filter(a => {
    if (!search) return true
    return `${a.firstName} ${a.lastName} ${a.jobTitle}`.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-default)] shrink-0">
        <h2 className="text-[16px] font-semibold text-[var(--color-neutral-12)]">Agents</h2>
        <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
          <X size={16} className="text-[var(--color-neutral-7)]" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-6)]" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-6)] focus:outline-none focus:border-[var(--color-accent-8)] transition-colors"
          />
        </div>
      </div>

      {/* New Agent */}
      <div className="px-5 pb-3">
        <Button variant="primary" size="md" className="w-full justify-center">
          <Plus size={14} />
          New Agent
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neutral-7)]">All Agents</p>

        {/* Multi Agent */}
        <button
          onClick={() => onSelectMate('team')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-xl)] mb-1 cursor-pointer transition-all bg-[var(--color-accent-1)] border border-[var(--color-accent-7)] shadow-[0_0_0_1px_var(--color-accent-3)]"
        >
          <div className="flex items-center shrink-0 -space-x-2">
            {EXISTING_AGENTS.map(a => (
              <img key={a.id} src={a.photo} alt={a.firstName} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
            ))}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-semibold text-[var(--color-neutral-12)] truncate">Multi Agent</p>
            <p className="text-[11px] text-[var(--color-neutral-7)] truncate">All your Agents</p>
          </div>
          <ChevronRight size={14} className="text-[var(--color-accent-9)] shrink-0" />
        </button>

        {/* Individual agents */}
        {filtered.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelectMate(agent.id)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-xl)] mb-1 cursor-pointer border border-transparent hover:bg-[var(--color-neutral-2)] transition-all"
          >
            <div className="relative shrink-0">
              <img src={agent.photo} alt={`${agent.firstName} ${agent.lastName}`} className="w-10 h-10 rounded-full object-cover" />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${availabilityDot[agent.availability]}`} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-[var(--color-neutral-12)] truncate">{agent.firstName}</p>
              <p className="text-[11px] text-[var(--color-neutral-7)] truncate">{agent.jobTitle.split(' ')[0]} Skill</p>
            </div>
            <Star size={14} className="text-[var(--color-neutral-5)] shrink-0 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Workflows View ── */

function WorkflowsView({ onClose, workflows }: { onClose: () => void; workflows: SidebarWorkflowRow[] }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-default)] shrink-0">
        <h2 className="text-[16px] font-semibold text-[var(--color-neutral-12)]">Workflows</h2>
        <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
          <X size={16} className="text-[var(--color-neutral-7)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-2">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3.5 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] shrink-0 mt-0.5 ${wf.active ? 'bg-[var(--color-accent-1)]' : 'bg-[var(--color-neutral-2)]'}`}>
                <Zap size={14} className={wf.active ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-6)]'} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-medium text-[var(--color-neutral-12)] leading-tight">{wf.title}</p>
                  {!wf.active && (
                    <span className="text-[10px] font-medium text-[var(--color-neutral-7)] bg-[var(--color-neutral-2)] px-1.5 py-0.5 rounded">Paused</span>
                  )}
                </div>
                <p className={`text-[11px] font-medium ${wf.schedule.startsWith('Today') ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-8)]'}`}>
                  {wf.schedule}
                </p>
                <p className="text-[11px] text-[var(--color-neutral-7)] mt-0.5">{wf.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="secondary" size="md" className="w-full justify-center gap-1.5 mt-4">
          <Plus size={14} />
          New workflow
        </Button>
      </div>
    </div>
  )
}

/* ── Message Bubble ── */

function SidebarMessageBubble({
  message,
  onOptionClick,
}: {
  message: ChatMessage
  onOptionClick?: (opt: ActionOption) => void
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-[var(--color-neutral-3)] text-[var(--color-neutral-12)] px-4 py-3 rounded-2xl rounded-br-md text-[13px] leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  const photo = message.teammate?.photo
  const name = message.teammate?.firstName
  const opts = message.options

  return (
    <div className="flex flex-col gap-2 max-w-[90%]">
      <div className="flex items-start gap-2.5">
        {photo ? (
          <img src={photo} alt={name ?? ''} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
        ) : (
          <div className="flex -space-x-1.5 shrink-0 mt-0.5">
            {EXISTING_AGENTS.map(a => (
              <img key={a.id} src={a.photo} alt={a.firstName} className="w-5 h-5 rounded-full object-cover border border-white" />
            ))}
          </div>
        )}
        <div className="text-[13px] text-[var(--color-neutral-12)] leading-relaxed whitespace-pre-line min-w-0">
          <FormattedText text={message.content} />
        </div>
      </div>
      {opts && opts.length > 0 && onOptionClick && (
        <div className="flex flex-col gap-1.5 pl-9 w-full max-w-[100%]">
          {opts.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onOptionClick(opt)}
              className="text-left px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[12px] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-1)] hover:border-[var(--color-accent-5)] cursor-pointer transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Formatted text ── */

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/* ── Simulated response ── */

function getSimulatedResponse(teammate: Teammate, input: string): string {
  const snippet = input.length > 50 ? input.slice(0, 50) + '…' : input
  switch (teammate.id) {
    case 'sofia':
      return `I looked into "${snippet}". Your team has 12 open work orders — 3 are critical and overdue. I'd suggest prioritizing the HVAC issues in Building A first.\n\nWant me to create a detailed breakdown?`
    case 'marcus':
      return `Analyzing "${snippet}". Your PM schedule has 3 conflicts this week. I've identified the most efficient resolution path.\n\nShould I walk you through the optimized schedule?`
    case 'elena':
      return `Processing "${snippet}". You have 15 new requests since yesterday — 4 critical, 6 medium, 5 low. Let me walk you through the critical ones first.`
    case 'david':
      return `Looking into "${snippet}". 4 items are below reorder threshold. I've prepared the PO details — they just need your approval.\n\nWant the full inventory status?`
    case 'amanda':
      return `Reviewing "${snippet}". Compliance review for Q3 inspections: 94% overall. Two items need attention before the March 30 deadline.\n\nShall I prepare the audit report?`
    default:
      return `Working on "${snippet}". Let me get back to you with my analysis.`
  }
}
