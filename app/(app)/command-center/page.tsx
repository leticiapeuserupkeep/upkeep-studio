'use client'

import { useState, useCallback, useEffect } from 'react'
import { PanelLeft, MessageCircle } from 'lucide-react'
import { SystemPulse } from '@/app/components/command-center/SystemPulse'
import { AttentionQueue } from '@/app/components/command-center/AttentionQueue'
import { AIMatesColumn } from '@/app/components/command-center/AIMatesColumn'
// WorkflowsColumn is now rendered inside AIMatesColumn
// IntegrationsStrip is now rendered inside AttentionQueue
import { UsagePanel } from '@/app/components/command-center/UsagePanel'
import { CommandSidebar, type SidebarView } from '@/app/components/command-center/CommandSidebar'
import { OnboardingFlow } from '@/app/components/command-center/onboarding/OnboardingFlow'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const ONBOARDING_KEY = 'supernova_onboarded'

export default function CommandCenterPage() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)
  const [skipAnimations, setSkipAnimations] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<SidebarView | null>(null)
  const [chatMateId, setChatMateId] = useState<string | null>(null)
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true'
    setShowOnboarding(!done)
    if (done) setSkipAnimations(false)
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    window.dispatchEvent(new Event('supernova-onboarding-complete'))
    setSkipAnimations(true)
    setShowOnboarding(false)
  }, [])

  const toggleSidebar = useCallback((view: SidebarView) => {
    setActiveSidebar(prev => prev === view ? null : view)
    if (view !== 'chat') setChatMateId(null)
  }, [])

  const closeSidebar = useCallback(() => {
    setActiveSidebar(null)
    setChatMateId(null)
    setChatInitialMessage(null)
  }, [])

  const openChatWith = useCallback((mateId?: string, initialMessage?: string) => {
    setChatMateId(mateId ?? null)
    setChatInitialMessage(initialMessage ?? null)
    setActiveSidebar('chat')
  }, [])

  const openManage = useCallback(() => {
    setActiveSidebar('aimates')
  }, [])

  const openWorkflows = useCallback(() => {
    setActiveSidebar('workflows')
  }, [])

  if (showOnboarding === null) return null

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 h-full overflow-hidden">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-[var(--surface-primary)] border-b border-[var(--border-default)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={20} className="text-[var(--color-neutral-7)]" />
          </button>
          <h1 className="text-[18px] font-medium text-[var(--color-neutral-12)]">Command Center</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              localStorage.removeItem(ONBOARDING_KEY)
              localStorage.removeItem('upkeep-supernova-onboarding')
              setSkipAnimations(false)
              setShowOnboarding(true)
            }}
            className="text-[12px] font-medium text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-9)] cursor-pointer transition-colors"
          >
            Test Onboarding
          </button>
          <button
            onClick={() => toggleSidebar('chat')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-all duration-150 ${
              activeSidebar === 'chat'
                ? 'bg-[var(--color-accent-10)] text-white shadow-sm'
                : 'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)]'
            }`}
          >
            <MessageCircle size={15} />
            Ask Agents
          </button>
        </div>
      </header>

      {/* ── Body: Main + Sidebar inline ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-y-auto min-w-0 overscroll-y-contain">
          <div className="w-full max-w-[1400px] mx-auto px-6 py-6 space-y-6">
            {/* Greeting */}
            <div
              className={skipAnimations ? '' : 'opacity-0'}
              style={skipAnimations ? undefined : { animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
            >
              <h2 className="text-[22px] font-medium text-[var(--color-neutral-12)]">
                {getGreeting()}, Leti
              </h2>
              <p className="text-[14px] text-[var(--color-neutral-8)] mt-0.5">
                {getDateString()} · 4 items need your attention
              </p>
            </div>

            {/* System Pulse */}
            <div
              className={skipAnimations ? '' : 'opacity-0'}
              style={skipAnimations ? undefined : { animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
            >
              <SystemPulse />
            </div>

            {/* Usage Panel */}
            <div
              className={skipAnimations ? '' : 'opacity-0'}
              style={skipAnimations ? undefined : { animation: 'fadeInUp 0.4s var(--ease-default) 0.15s forwards' }}
            >
              <UsagePanel />
            </div>

            {/* 2-Column Grid */}
            <div
              className={`grid gap-8 ${skipAnimations ? '' : 'opacity-0'}`}
              style={{
                gridTemplateColumns: '1.6fr 1fr',
                ...(skipAnimations ? {} : { animation: 'fadeInUp 0.4s var(--ease-default) 0.22s forwards' }),
              }}
            >
              <AttentionQueue onOpenChat={openChatWith} />
              <AIMatesColumn onOpenChat={openChatWith} onManage={openManage} onOpenWorkflows={openWorkflows} />
            </div>
          </div>
        </main>

        {/* Sidebar (inline drawer) */}
        <CommandSidebar
          view={activeSidebar ?? 'chat'}
          isOpen={activeSidebar !== null}
          onClose={closeSidebar}
          onChangeView={setActiveSidebar}
          initialChatMateId={chatMateId}
          initialChatMessage={chatInitialMessage}
        />
      </div>
    </div>
  )
}
