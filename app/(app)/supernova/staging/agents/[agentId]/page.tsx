'use client'

import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, History, Mic, Minimize2, MoreVertical, Plus, Send, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
} from '@/app/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/Tabs'
import { SuperNovaStagingOrb } from '@/app/components/supernova-staging/SuperNovaStagingOrb'
import { SuperNovaStagingAgentsWorkspace } from '@/app/components/supernova-staging/SuperNovaStagingAgentsWorkspace'
import { SuperNovaStagingIntegrationsContent } from '@/app/components/supernova-staging/SuperNovaStagingIntegrationsContent'
import { SuperNovaStagingWorkflowsContent } from '@/app/components/supernova-staging/SuperNovaStagingWorkflowsContent'
import { getStagingAgentById } from '@/app/(app)/supernova/staging/lib/staging-agents'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  name?: string
}

const AGENT_TABS = [
  { id: 'chat' as const, label: 'Chat' },
  { id: 'inbox' as const, label: 'Inbox' },
  { id: 'workflows' as const, label: 'Workflows' },
  { id: 'workbench' as const, label: 'Workbench' },
  { id: 'integrations' as const, label: 'My Integrations' },
]

type AgentTabId = (typeof AGENT_TABS)[number]['id']

const RECOMMENDED_STEPS = [
  'Can you go into more detail?',
  'Put together a report for me',
  'I have a different question',
] as const

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'user-compact',
    role: 'user',
    text: '/compact',
  },
  {
    id: 'asst-compact',
    role: 'assistant',
    name: 'Demo',
    text: 'Nothing to compact yet — this is the start of our conversation! Ready when you are. What can I help you with?',
  },
  {
    id: 'user-1',
    role: 'user',
    text: 'How many open work orders does my team have?',
  },
  {
    id: 'asst-1',
    role: 'assistant',
    name: 'Demo',
    text: 'I took a look at your request. Your team has 12 open work orders across maintenance and facilities. I can break that down by site or priority if you want.',
  },
]

function RecommendedStepsCard({ onPick, headingId }: { onPick: (text: string) => void; headingId: string }) {
  return (
    <div
      className="w-full max-w-[min(100%,560px)] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-xs)]"
      role="region"
      aria-labelledby={headingId}
    >
      <p id={headingId} className="mb-3 text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)]">
        Recommended steps
      </p>
      <ul className="flex flex-col gap-1.5">
        {RECOMMENDED_STEPS.map((step) => (
          <li key={step}>
            <button
              type="button"
              onClick={() => onPick(step)}
              className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] transition-colors hover:bg-[var(--color-neutral-3)]"
            >
              <span>{step}</span>
              <ChevronRight size={16} className="shrink-0 text-[var(--color-neutral-7)]" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StagingAgentComingSoonEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex min-h-[min(100%,480px)] w-full max-w-[min(100%,560px)] flex-col justify-center">
      <EmptyState
        iconPresentation="orb"
        icon={<SuperNovaStagingOrb size="xl" />}
        title={title}
        titleClassName="text-[length:var(--font-size-xl)]"
        description={description}
        descriptionClassName="text-[length:var(--font-size-md)] max-w-[360px]"
      />
    </div>
  )
}

export default function SuperNovaStagingAgentChatPage() {
  const params = useParams()
  const router = useRouter()
  const stepsHeadingId = useId()
  const agentId = typeof params.agentId === 'string' ? params.agentId : ''
  const agent = getStagingAgentById(agentId)
  const [draft, setDraft] = useState('')
  const [activeTab, setActiveTab] = useState<AgentTabId>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...INITIAL_MESSAGES])
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (agentId && !agent) {
      router.replace('/supernova/staging/agents')
    }
  }, [agentId, agent, router])

  /** Keep the thread pinned to the bottom so new messages stay in view (and short threads align to the bottom). */
  useEffect(() => {
    if (activeTab !== 'chat') return
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [activeTab, messages])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setDraft('')
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          name: agent?.name ?? 'Demo',
          text: 'Thanks — I received your message. Full agent replies will connect here in production; this is staging-only behavior.',
        },
      ])
    }, 450)
  }, [draft, agent?.name])

  const handlePickStep = useCallback((text: string) => {
    setDraft(text)
    setActiveTab('chat')
  }, [])

  if (!agentId || !agent) {
    return (
      <div className="w-full px-[var(--space-xl)] py-[var(--space-xl)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
        {!agentId ? 'Loading…' : 'Unknown agent — redirecting…'}
      </div>
    )
  }

  return (
    <SuperNovaStagingAgentsWorkspace selectedAgentId={agent.id}>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AgentTabId)}
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface-canvas)]"
      >
        <header className="flex min-h-[var(--supernova-staging-header-height)] shrink-0 items-center justify-between gap-4 border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-[var(--space-xl)]">
          <h1 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">
            {agent.name}
          </h1>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              label="Staging settings"
              variant="secondary"
              size="lg"
              type="button"
              onClick={() => router.push('/supernova/staging/settings')}
            >
              <Settings size={20} aria-hidden />
            </IconButton>
            {activeTab === 'chat' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton label="Chat options" variant="secondary" size="lg" type="button">
                    <MoreVertical size={20} aria-hidden />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} minWidth="200px">
                  <DropdownMenuItem
                    textValue="History"
                    onSelect={() => {
                      chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <History
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[var(--color-neutral-8)]"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-left">History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    textValue="Compact Context"
                    onSelect={() => {
                      setDraft('/compact')
                      window.setTimeout(() => composerRef.current?.focus(), 0)
                    }}
                  >
                    <Minimize2
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[var(--color-neutral-8)]"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-left">Compact Context</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <nav
          className="shrink-0 border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-[var(--space-xl)] pt-[var(--space-xs)]"
          aria-label="Agent sections"
        >
          <TabsList>
            {AGENT_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} id={`agent-tab-${tab.id}`}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </nav>

        <div
          ref={chatScrollRef}
          className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${
            activeTab === 'chat'
              ? 'flex flex-col px-[var(--space-xl)] py-[var(--space-xl)]'
              : 'px-[var(--space-xl)] py-[var(--space-xl)]'
          }`}
          role="tabpanel"
          id={`agent-tabpanel-${activeTab}`}
          aria-labelledby={`agent-tab-${activeTab}`}
        >
          {activeTab === 'chat' ? (
            <div className="mx-auto mt-auto flex w-full max-w-[min(100%,720px)] flex-col gap-6">
              {messages.map((m) => (
                <Fragment key={m.id}>
                  {m.role === 'user' && (
                    <div className="flex justify-end">
                      <div
                        className={
                          m.text.startsWith('/')
                            ? 'max-w-[min(100%,85%)] rounded-[var(--radius-xl)] border border-[var(--color-accent-6)] bg-[var(--color-accent-1)] px-4 py-2.5 text-[length:var(--font-size-sm)] font-mono leading-relaxed text-[var(--color-accent-11)]'
                            : 'max-w-[min(100%,85%)] rounded-[var(--radius-xl)] bg-[var(--color-neutral-4)] px-4 py-2.5 text-[length:var(--font-size-base)] leading-relaxed text-[var(--color-neutral-12)]'
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  )}
                  {m.role === 'assistant' && (
                    <div className="flex gap-3">
                      <span
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-4)] text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-11)]"
                        aria-hidden
                      >
                        {(m.name ?? agent.name).slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-10)]">
                          {m.name ?? agent.name}
                        </p>
                        <div className="inline-block max-w-[min(100%,560px)] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 text-[length:var(--font-size-base)] leading-relaxed text-[var(--color-neutral-11)] shadow-[var(--shadow-xs)]">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  )}
                  {m.id === 'asst-1' && (
                    <RecommendedStepsCard onPick={handlePickStep} headingId={stepsHeadingId} />
                  )}
                </Fragment>
              ))}
              <div ref={messagesEndRef} className="h-px w-full shrink-0" aria-hidden />
            </div>
          ) : activeTab === 'workflows' ? (
            <div className="mx-auto w-full max-w-[var(--supernova-staging-content-max)]">
              <SuperNovaStagingWorkflowsContent />
            </div>
          ) : activeTab === 'inbox' ? (
            <StagingAgentComingSoonEmpty
              title="Inbox — Coming Soon"
              description="Your agent inbox, threads, and notifications will live here in a future release."
            />
          ) : activeTab === 'workbench' ? (
            <StagingAgentComingSoonEmpty
              title="Workbench"
              description="Coming soon. Tools, drafts, and hands-on tasks for this agent will appear here in a future release."
            />
          ) : activeTab === 'integrations' ? (
            <div className="mx-auto w-full max-w-[var(--supernova-staging-content-max)]">
              <SuperNovaStagingIntegrationsContent />
            </div>
          ) : (
            <div className="mx-auto max-w-[min(100%,720px)] rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)]/80 px-6 py-10 text-center">
              <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                {AGENT_TABS.find((t) => t.id === activeTab)?.label} — coming soon in staging.
              </p>
            </div>
          )}
        </div>

        {activeTab === 'chat' && (
          <div className="shrink-0 border-t border-[var(--border-default)] bg-[var(--surface-primary)] px-[var(--space-xl)] py-[var(--space-md)]">
            <div className="flex w-full items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus-within:border-[var(--color-accent-7)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent-9)_14%,transparent)]">
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-neutral-7)] transition-colors hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-11)]"
                aria-label="Add attachment"
              >
                <Plus size={20} aria-hidden />
              </button>
              <textarea
                ref={composerRef}
                data-composer-input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                rows={1}
                placeholder="Ask the team something…"
                className="h-fit max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-12)] outline-none placeholder:text-[var(--color-neutral-7)]"
              />
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-neutral-7)] transition-colors hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-11)]"
                aria-label="Voice input"
              >
                <Mic size={20} aria-hidden />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-9)] text-white shadow-sm transition-opacity hover:bg-[var(--color-accent-10)] disabled:pointer-events-none disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={18} className="shrink-0" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </Tabs>
    </SuperNovaStagingAgentsWorkspace>
  )
}
