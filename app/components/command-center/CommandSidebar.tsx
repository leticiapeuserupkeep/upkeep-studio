'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import {
  X, Search, Plus, Send, Mic, Settings, ChevronRight,
  Star, Zap, BarChart3, ClipboardList, Sparkles, Users,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import {
  EXISTING_AGENTS, AVAILABLE_AGENTS,
  suggestTeammate, getTeammateGreeting, getTeammateWelcomeActions,
} from '@/app/lib/agents-data'
import type { Teammate, ChatMessage, ActionOption } from '@/app/lib/agents-data'
import {
  DEMO_INBOX_EMAILS,
  DEMO_CALL_REMINDER,
  MAGIC_INBOX_WORKFLOW_NAME,
  MAGIC_INBOX_WORKFLOW_META,
} from '@/app/lib/magic-inbox-demo'

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
    <div className="w-[420px] shrink-0 border-l border-[var(--border-default)] bg-[var(--surface-primary)] flex flex-col overflow-hidden h-full min-h-0 max-h-[calc(100vh-3.5rem)] sticky top-0 z-20">
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

/** Matches textarea `leading-5`; composer grows to this many lines then scrolls. */
const CHAT_COMPOSER_LINE_HEIGHT_PX = 20
const CHAT_COMPOSER_MAX_LINES = 4
const CHAT_COMPOSER_MAX_HEIGHT_PX = CHAT_COMPOSER_LINE_HEIGHT_PX * CHAT_COMPOSER_MAX_LINES

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
  const [magicScriptRunning, setMagicScriptRunning] = useState(false)
  const firstMultiUserMessageSentRef = useRef(false)
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

  const pendingMagicOptions = [...messages].reverse().find(
    (m) =>
      m.role === 'teammate' &&
      m.options?.some((o) => typeof o.action === 'string' && o.action.startsWith('magic_')),
  )
  const pendingEmailCard = [...messages].reverse().find(
    (m) => m.role === 'teammate' && m.emailCard && !m.emailCardHandled,
  )
  /** Only lock after the user has started a thread — avoids stale magicScriptRunning blocking the empty welcome view */
  const inputLockedForMagic =
    isMulti &&
    messages.length > 0 &&
    (magicScriptRunning || !!pendingMagicOptions || !!pendingEmailCard)
  const inputLocked = inputLockedForWorkflow || inputLockedForMagic

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, CHAT_COMPOSER_MAX_HEIGHT_PX)}px`
  }, [chatInput])

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
      setMagicScriptRunning(false)
    } else {
      setMessages([])
      setSmartInboxStep(0)
      firstMultiUserMessageSentRef.current = false
      setMagicScriptRunning(false)
    }
  }, [selectedMate, initialMessage])

  const runMagicAfterAuth = useCallback(() => {
    setMagicScriptRunning(true)
    const addLoader = (text: string) => {
      const id = `magic-L-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'teammate',
          teammate: tElena,
          content: '',
          loaderLine: text,
          timestamp: new Date(),
        },
      ])
      return id
    }
    const rm = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id))

    setTimeout(() => {
      const l1 = addLoader('Checking new emails…')
      setTimeout(() => {
        rm(l1)
        setMessages((prev) => [
          ...prev,
          {
            id: `magic-${Date.now()}-m1`,
            role: 'teammate',
            teammate: tElena,
            content: 'I found 3 new emails. I\'m checking the importance of each one.',
            timestamp: new Date(),
          },
        ])
        const l2 = addLoader('Scoring importance…')
        setTimeout(() => {
          rm(l2)
          const l3 = addLoader('Reviewing past conversations and related context.')
          setTimeout(() => {
            rm(l3)
            setMessages((prev) => [
              ...prev,
              {
                id: `magic-${Date.now()}-m2`,
                role: 'teammate',
                teammate: tElena,
                content: 'I found **3 related conversations** and **17 emails** from the last 30 days.',
                timestamp: new Date(),
              },
            ])
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: `magic-${Date.now()}-m3`,
                  role: 'teammate',
                  teammate: tElena,
                  content:
                    'There are **2 emails** that need an **immediate response**, and **1** that requires a **phone call in 1 hour**.\n\nI already have the context and drafted replies for both.',
                  timestamp: new Date(),
                },
              ])
              setTimeout(() => {
                const e = DEMO_INBOX_EMAILS[0]
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `magic-ec1`,
                    role: 'teammate',
                    teammate: tElena,
                    content: '**Email 1**',
                    emailCard: { id: e.id, subject: e.subject, draftReply: e.draftReply },
                    timestamp: new Date(),
                  },
                ])
                setMagicScriptRunning(false)
              }, 520)
            }, 420)
          }, 920)
        }, 780)
      }, 880)
    }, 380)
  }, [])

  const finishMagicSchedule = useCallback(
    (scheduleLabel: string, action: string) => {
      const id = `sw-${Date.now()}`
      onWorkflowSaved({
        id,
        ...MAGIC_INBOX_WORKFLOW_META,
        schedule: scheduleLabel,
      })
      setMessages((prev) => {
        const stripped = prev.map((m) =>
          m.id === 'magic-wf-prompt' ? { ...m, options: undefined } : m,
        )
        return [
          ...stripped,
          {
            id: `magic-user-${Date.now()}`,
            role: 'user',
            content: scheduleLabel,
            timestamp: new Date(),
          },
          {
            id: `magic-done-${Date.now()}`,
            role: 'teammate',
            teammate: tElena,
            content:
              action === 'magic_sched_other'
                ? `Perfect. Your workflow was saved as **${MAGIC_INBOX_WORKFLOW_NAME}** with a **custom cadence** — fine-tune it anytime in **Workflows**, or ask me here if you want to change it.`
                : `Perfect. Your workflow was saved as **${MAGIC_INBOX_WORKFLOW_NAME}**. You can view and edit it in **Workflows**, or ask me anytime if you want to update it.`,
            timestamp: new Date(),
          },
        ]
      })
    },
    [onWorkflowSaved],
  )

  const handleMagicDemoOption = useCallback(
    (opt: ActionOption) => {
      if (opt.action === 'magic_auth_once' || opt.action === 'magic_auth_always') {
        setMessages((prev) => [
          ...prev,
          { id: `magic-user-${Date.now()}`, role: 'user', content: opt.label, timestamp: new Date() },
        ])
        runMagicAfterAuth()
        return
      }
      if (opt.action === 'magic_dismiss') {
        setMessages((prev) => {
          const stripped = prev.map((m) =>
            m.id === 'magic-wf-prompt' ? { ...m, options: undefined } : m,
          )
          return [
            ...stripped,
            { id: `magic-user-${Date.now()}`, role: 'user', content: opt.label, timestamp: new Date() },
            {
              id: `magic-dismiss-${Date.now()}`,
              role: 'teammate',
              teammate: tElena,
              content: 'No problem — I\'ll keep helping in chat whenever you need. If you change your mind about automating this, just say the word.',
              timestamp: new Date(),
            },
          ]
        })
        return
      }
      if (opt.action === 'magic_sched_30') {
        finishMagicSchedule('Every 30 minutes', opt.action)
        return
      }
      if (opt.action === 'magic_sched_60') {
        finishMagicSchedule('Every 1 hour', opt.action)
        return
      }
      if (opt.action === 'magic_sched_6h') {
        finishMagicSchedule('Every 6 hours', opt.action)
        return
      }
      if (opt.action === 'magic_sched_other') {
        finishMagicSchedule('Custom schedule', opt.action)
        return
      }
    },
    [runMagicAfterAuth, finishMagicSchedule],
  )

  const handleMagicEmailAction = useCallback(
    (emailId: string, kind: 'accept' | 'edit') => {
      const e1 = DEMO_INBOX_EMAILS[0]
      const e2 = DEMO_INBOX_EMAILS[1]
      if (emailId === e1.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === 'magic-ec1' ? { ...m, emailCardHandled: true } : m)),
        )
        if (kind === 'accept') {
          setMessages((prev) => [
            ...prev,
            {
              id: `magic-u-e1-${Date.now()}`,
              role: 'user',
              content: 'Accept and send',
              timestamp: new Date(),
            },
            {
              id: `magic-r-e1-${Date.now()}`,
              role: 'teammate',
              teammate: tElena,
              content: 'On it — sending the first one now.',
              timestamp: new Date(),
            },
            {
              id: `magic-ec2-intro`,
              role: 'teammate',
              teammate: tElena,
              content: 'Perfect — the second email is for **Facilities**.',
              timestamp: new Date(),
            },
            {
              id: `magic-ec2`,
              role: 'teammate',
              teammate: tElena,
              content: '**Email 2**',
              emailCard: { id: e2.id, subject: e2.subject, draftReply: e2.draftReply },
              timestamp: new Date(),
            },
          ])
        } else {
          setChatInput(e1.draftReply)
          setTimeout(() => inputRef.current?.focus(), 0)
          setMessages((prev) => [
            ...prev,
            {
              id: `magic-edit-${Date.now()}`,
              role: 'teammate',
              teammate: tElena,
              content: 'I dropped the draft in the composer — edit anything, then send when you\'re ready.',
              timestamp: new Date(),
            },
          ])
        }
        return
      }
      if (emailId === e2.id) {
        setMessages((prev) => prev.map((m) => (m.id === 'magic-ec2' ? { ...m, emailCardHandled: true } : m)))
        if (kind === 'accept') {
          setMessages((prev) => [
            ...prev,
            {
              id: `magic-u-e2-${Date.now()}`,
              role: 'user',
              content: 'Accept and send',
              timestamp: new Date(),
            },
            {
              id: `magic-r-e2-${Date.now()}`,
              role: 'teammate',
              teammate: tElena,
              content: 'Sent. You\'re all set on both replies.',
              timestamp: new Date(),
            },
          ])
        } else {
          setChatInput(e2.draftReply)
          setTimeout(() => inputRef.current?.focus(), 0)
          setMessages((prev) => [
            ...prev,
            {
              id: `magic-edit2-${Date.now()}`,
              role: 'teammate',
              teammate: tElena,
              content: 'Draft\'s in the composer for the Facilities note — adjust as needed.',
              timestamp: new Date(),
            },
          ])
        }
        const t0 = kind === 'accept' ? 450 : 320
        setTimeout(() => {
          setMagicScriptRunning(true)
          setMessages((prev) => [
            ...prev,
            {
              id: `magic-rem-${Date.now()}`,
              role: 'teammate',
              teammate: tElena,
              content: `I'm also creating a reminder for you to call **${DEMO_CALL_REMINDER.name}** at **${DEMO_CALL_REMINDER.phone}** in 2 hours.`,
              timestamp: new Date(),
            },
          ])
          setTimeout(() => {
            const l = `magic-L-rem-${Date.now()}`
            setMessages((prev) => [
              ...prev,
              {
                id: l,
                role: 'teammate',
                teammate: tElena,
                content: '',
                loaderLine: 'Creating reminder…',
                timestamp: new Date(),
              },
            ])
            setTimeout(() => {
              setMessages((prev) => prev.filter((m) => m.id !== l))
              setMessages((prev) => [
                ...prev,
                {
                  id: `magic-wf-prompt`,
                  role: 'teammate',
                  teammate: tElena,
                  content: `This looks like a **strong workflow** to save and automate. Here's the idea:

-> Revise periodically your inbox
-> Check important messages
-> View for history and older messages for context
-> Create an email to answer and send

**How often do you want me to trigger this workflow?**`,
                  timestamp: new Date(),
                  options: [
                    { id: 'ms30', label: 'Every 30 minutes', action: 'magic_sched_30' },
                    { id: 'ms60', label: 'Every 1 hour', action: 'magic_sched_60' },
                    { id: 'ms6', label: 'Every 6 hours', action: 'magic_sched_6h' },
                    { id: 'mso', label: 'Other', action: 'magic_sched_other' },
                    { id: 'msd', label: 'Dismiss', action: 'magic_dismiss' },
                  ],
                },
              ])
              setMagicScriptRunning(false)
            }, 720)
          }, 600)
        }, t0)
        return
      }
    },
    [],
  )

  const beginMagicInboxDemo = useCallback((userText: string) => {
    const display = userText.length > 48 ? `${userText.slice(0, 48)}…` : userText
    setMagicScriptRunning(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `magic-open-${Date.now()}`,
          role: 'teammate',
          teammate: tElena,
          content: `Perfect — let me review your inbox and check whether there's anything important related to **${display}**.`,
          timestamp: new Date(),
        },
      ])
    }, 420)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `magic-auth-req-${Date.now()}`,
          role: 'teammate',
          teammate: tElena,
          content: 'To do that, I\'ll need access to your inbox (**leti@mail.com**).',
          timestamp: new Date(),
          options: [
            { id: 'magic-a1', label: 'Allow Once', action: 'magic_auth_once' },
            { id: 'magic-a2', label: 'Allow Always', action: 'magic_auth_always' },
          ],
        },
      ])
      setMagicScriptRunning(false)
    }, 1080)
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
      if (typeof opt.action === 'string' && opt.action.startsWith('magic_')) {
        handleMagicDemoOption(opt)
        return
      }
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
    [selectedMate, handleWorkflowOption, handleMagicDemoOption],
  )

  const handleSend = useCallback(() => {
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')

    const smartInboxIntent =
      isMulti &&
      smartInboxStep === 0 &&
      /smart inbox|inbox reply|reply draft|gmail draft|design a workflow/i.test(text)

    if (isMulti && smartInboxStep === 0 && !firstMultiUserMessageSentRef.current) {
      firstMultiUserMessageSentRef.current = true
      setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: new Date() }])

      if (smartInboxIntent) {
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

      beginMagicInboxDemo(text)
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
  }, [selectedMate, isMulti, smartInboxStep, beginMagicInboxDemo, chatInput])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const showWelcome = isMulti && messages.length === 0

  return (
    <div className="flex h-full">
      {/* Left: Agent selector (vertical) */}
      <div className="flex flex-col items-center gap-1.5 py-2 px-1.5 border-r border-[var(--border-subtle)] bg-[var(--surface-primary)] shrink-0 w-[73px]">
        {/* Multi-agent */}
        <button
          onClick={() => setSelectedId(null)}
          className={`flex flex-col items-center gap-1 w-full py-2 rounded-[var(--radius-lg)] cursor-pointer transition-all ${
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
            {selectedMate ? `${selectedMate.firstName} ${selectedMate.lastName}` : 'Multi Agents Chat'}
          </span>
          <button onClick={onClose} className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
            <X size={15} className="text-[var(--color-neutral-7)]" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-7">
          {showWelcome ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="flex items-center -space-x-4">
                {EXISTING_AGENTS.map(a => (
                  <img key={a.id} src={a.photo} alt={a.firstName} className="w-[60px] h-[60px] rounded-full object-cover border-[3px] border-white shadow-sm" />
                ))}
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-[13px] text-[var(--color-neutral-8)]">Your team is ready to work with you!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <SidebarMessageBubble
                  key={msg.id}
                  message={msg}
                  onOptionClick={handleMessageOption}
                  onMagicEmailAction={handleMagicEmailAction}
                />
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
            <div className="flex items-end px-3 py-2.5 gap-2">
              <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[var(--color-neutral-3)] cursor-pointer shrink-0">
                <Plus size={15} className="text-[var(--color-neutral-7)]" />
              </button>
              <textarea
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ maxHeight: CHAT_COMPOSER_MAX_HEIGHT_PX }}
                className={`flex-1 resize-none overflow-y-auto bg-transparent text-[13px] leading-5 placeholder:text-[var(--color-neutral-6)] outline-none! ring-0! shadow-none! ${
                  chatInput.trim()
                    ? 'text-[var(--color-neutral-12)]'
                    : 'text-[var(--color-neutral-8)]'
                }`}
                placeholder={
                  inputLocked
                    ? 'Choose a suggestion or action above to continue…'
                    : selectedMate
                      ? `Ask ${selectedMate.firstName}…`
                      : 'Ask Agents…'
                }
              />
              <button className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[var(--color-neutral-3)] cursor-pointer shrink-0">
                <Mic size={15} className="text-[var(--color-neutral-7)]" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!chatInput.trim()}
                className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0 ${
                  chatInput.trim()
                    ? 'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)] cursor-pointer'
                    : 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-7)] opacity-40 cursor-not-allowed'
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

function formatSidebarMessageTime(d: Date): string {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function isMagicInboxAuthOptions(opts: ActionOption[]) {
  return (
    opts.length === 2 &&
    opts.some((o) => o.action === 'magic_auth_once') &&
    opts.some((o) => o.action === 'magic_auth_always')
  )
}

function sortMagicInboxAuthOptions(opts: ActionOption[]) {
  return [...opts].sort((a, b) => {
    if (a.action === 'magic_auth_always') return -1
    if (b.action === 'magic_auth_always') return 1
    return 0
  })
}

function SidebarMessageBubble({
  message,
  onOptionClick,
  onMagicEmailAction,
}: {
  message: ChatMessage
  onOptionClick?: (opt: ActionOption) => void
  onMagicEmailAction?: (emailId: string, kind: 'accept' | 'edit') => void
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
  const firstName = message.teammate?.firstName
  const displayName = message.teammate
    ? [message.teammate.firstName, message.teammate.lastName].filter(Boolean).join(' ')
    : 'Your team'
  const opts = message.options
  const loader = message.loaderLine
  const card = message.emailCard
  const cardDone = message.emailCardHandled
  const hasText = message.content.trim().length > 0
  const timeLabel = formatSidebarMessageTime(message.timestamp)

  return (
    <div className="flex w-full max-w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        {photo ? (
          <img
            src={photo}
            alt={firstName ?? ''}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex shrink-0 -space-x-1">
            {EXISTING_AGENTS.map(a => (
              <img
                key={a.id}
                src={a.photo}
                alt={a.firstName}
                className="h-3.5 w-3.5 rounded-full border border-white object-cover"
              />
            ))}
          </div>
        )}
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--color-neutral-12)]">
          {displayName}
        </span>
        {timeLabel ? (
          <span className="shrink-0 text-[10px] tabular-nums text-[var(--color-neutral-7)]">{timeLabel}</span>
        ) : null}
      </div>
      {loader && (
        <div className="flex w-full items-center gap-2 text-[10px] text-[var(--color-neutral-9)]">
          <span
            className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--color-accent-9)] border-t-transparent animate-spin"
            aria-hidden
          />
          <span>{loader}</span>
        </div>
      )}
      {hasText && (
        <div className="w-full min-w-0 text-[14px] leading-relaxed whitespace-pre-line text-[var(--color-neutral-12)]">
          <FormattedText text={message.content} />
        </div>
      )}
      {card && !cardDone && onMagicEmailAction && (
        <div className="w-full max-w-full space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)]">Subject</p>
          <p className="text-[10px] font-medium leading-snug text-[var(--color-neutral-12)]">{card.subject}</p>
          <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)]">
            Draft reply
          </p>
          <p className="text-[10px] leading-relaxed text-[var(--color-neutral-9)]">{card.draftReply}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onMagicEmailAction(card.id, 'accept')}
              className="inline-flex items-center rounded-md bg-[var(--color-accent-9)] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[var(--color-accent-10)] cursor-pointer"
            >
              Accept and send
            </button>
            <button
              type="button"
              onClick={() => onMagicEmailAction(card.id, 'edit')}
              className="inline-flex cursor-pointer items-center rounded-md border border-[var(--border-default)] bg-white px-2.5 py-1 text-[10px] font-medium text-[var(--color-neutral-12)] transition-colors hover:bg-[var(--color-neutral-2)]"
            >
              Edit
            </button>
          </div>
        </div>
      )}
      {card && cardDone && (
        <p className="text-[10px] font-medium text-[var(--color-neutral-7)]">Done</p>
      )}
      {opts && opts.length > 0 && onOptionClick && isMagicInboxAuthOptions(opts) && (
        <div className="flex w-full max-w-full flex-row flex-wrap justify-end gap-2">
          {sortMagicInboxAuthOptions(opts).map((opt) => {
            const isPrimary = opt.action === 'magic_auth_once'
            return (
              <Button
                key={opt.id}
                type="button"
                variant={isPrimary ? 'primary' : 'secondary'}
                size="sm"
                className="shrink-0 justify-center !text-[10px]"
                onClick={() => onOptionClick(opt)}
              >
                {opt.label}
              </Button>
            )
          })}
        </div>
      )}
      {opts && opts.length > 0 && onOptionClick && !isMagicInboxAuthOptions(opts) && (
        <div className="flex w-full max-w-full flex-col gap-1.5">
          {opts.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onOptionClick(opt)}
              className="cursor-pointer rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-left text-[10px] font-medium text-[var(--color-accent-9)] transition-colors hover:border-[var(--color-accent-5)] hover:bg-[var(--color-accent-1)]"
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
