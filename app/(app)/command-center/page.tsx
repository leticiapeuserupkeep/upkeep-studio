'use client'

import { useState, useCallback, useEffect, type CSSProperties } from 'react'
import { PanelLeft, MessageCircle } from 'lucide-react'
import { SystemPulseKPIs, SupernovaSavingsCard } from '@/app/components/command-center/SystemPulse'
import { AttentionQueue } from '@/app/components/command-center/AttentionQueue'
import { AIMatesColumn } from '@/app/components/command-center/AIMatesColumn'
// WorkflowsColumn is now rendered inside AIMatesColumn
// IntegrationsStrip is now rendered inside AttentionQueue
import { UsageThisMonthCard, CostByActionCard, TokensByAgentCard } from '@/app/components/command-center/UsagePanel'
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

const ENTRANCE_DURATION = '0.38s'
const ENTRANCE_STAGGER_SEC = 0.042
const ENTRANCE_BASE_SEC = 0.03

function entranceStyle(skip: boolean, slot: number): CSSProperties | undefined {
  if (skip) return undefined
  const delay = ENTRANCE_BASE_SEC + slot * ENTRANCE_STAGGER_SEC
  return { animation: `fadeInUp ${ENTRANCE_DURATION} var(--ease-default) ${delay}s forwards` }
}

function entranceOpacityClass(skip: boolean): string {
  return skip ? '' : 'opacity-0'
}

export default function CommandCenterPage() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)
  const [skipAnimations, setSkipAnimations] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<SidebarView | null>(null)
  const [chatMateId, setChatMateId] = useState<string | null>(null)
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true'
    setShowOnboarding(!done)
    if (done) setSkipAnimations(false)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const noEntranceMotion = skipAnimations || prefersReducedMotion

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

  if (showOnboarding === null) {
    return (
      <div
        className="flex flex-col flex-1 w-full min-h-0 h-full overflow-hidden bg-[var(--surface-canvas)]"
        aria-busy="true"
      >
        <div className="h-14 shrink-0 border-b border-[var(--border-default)] bg-[var(--surface-primary)]" />
        <div className="flex-1 min-h-0 bg-[var(--surface-canvas)]" />
      </div>
    )
  }

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
            {/* Greeting — slot 0 */}
            <div
              className={entranceOpacityClass(noEntranceMotion)}
              style={entranceStyle(noEntranceMotion, 0)}
            >
              <h2 className="text-[22px] font-medium text-[var(--color-neutral-12)]">
                {getGreeting()}, Leti
              </h2>
              <p className="text-[14px] text-[var(--color-neutral-8)] mt-0.5">
                {getDateString()} · 4 signals need your attention
              </p>
            </div>

            {/* Row 1: KPI cards (staggered) + Savings — savings after four KPI slots */}
            <div className="grid grid-cols-3 gap-x-7 gap-y-4">
              <div className="col-span-2">
                <SystemPulseKPIs skipEntrance={noEntranceMotion} slotStart={1} />
              </div>
              <div
                className={entranceOpacityClass(noEntranceMotion)}
                style={entranceStyle(noEntranceMotion, 5)}
              >
                <SupernovaSavingsCard />
              </div>
            </div>

            <div className="h-px my-6 bg-[var(--color-neutral-5)]" />

            {/* Row 2: Credits & Usage — header then cards one by one */}
            <div className="flex flex-col gap-3">
              <div
                className={`flex items-center justify-between ${entranceOpacityClass(noEntranceMotion)}`}
                style={entranceStyle(noEntranceMotion, 6)}
              >
                <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">Credits & Usage</h3>
                <button className="text-[13px] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] cursor-pointer transition-colors">
                  Upgrade
                </button>
              </div>
              <div className="grid grid-cols-3 gap-x-7 gap-y-5">
                <div className={entranceOpacityClass(noEntranceMotion)} style={entranceStyle(noEntranceMotion, 7)}>
                  <UsageThisMonthCard />
                </div>
                <div className={entranceOpacityClass(noEntranceMotion)} style={entranceStyle(noEntranceMotion, 8)}>
                  <CostByActionCard />
                </div>
                <div className={entranceOpacityClass(noEntranceMotion)} style={entranceStyle(noEntranceMotion, 9)}>
                  <TokensByAgentCard />
                </div>
              </div>
            </div>

            <div className="h-px my-6 bg-[var(--color-neutral-5)]" />

            {/* Row 3: Attention + Agents */}
            <div className="grid grid-cols-3 gap-x-7 gap-y-4">
              <div
                className={`col-span-2 ${entranceOpacityClass(noEntranceMotion)}`}
                style={entranceStyle(noEntranceMotion, 10)}
              >
                <AttentionQueue onOpenChat={openChatWith} />
              </div>
              <div className={entranceOpacityClass(noEntranceMotion)} style={entranceStyle(noEntranceMotion, 11)}>
                <AIMatesColumn onOpenChat={openChatWith} onManage={openManage} onOpenWorkflows={openWorkflows} />
              </div>
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
