'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Check, Camera, RefreshCw } from 'lucide-react'
import { ProgressDots } from './ProgressDots'
import type { AIMateActivation, AIMateId, PreferenceMode } from '@/app/lib/hooks/use-onboarding-state'

/* ── AI Mate config ── */

interface IntegrationRef {
  id: string
  name: string
  logo: string
}

interface MateConfig {
  id: AIMateId
  name: string
  skill: string
  skillColor: string
  skillBg: string
  photo: string
  learningSummary: string
  milestones: string[]
  integrations: IntegrationRef[]
  introMessage: string
  prefKey: 'schedulingMode' | 'inventoryMode' | 'escalationMode'
}

const AVATAR_OPTIONS = [
  'https://i.pravatar.cc/150?u=sofia-chen-upkeep',
  'https://i.pravatar.cc/150?u=sofia-alt-1',
  'https://i.pravatar.cc/150?u=sofia-alt-2',
  'https://i.pravatar.cc/150?u=sofia-alt-3',
  'https://i.pravatar.cc/150?u=sofia-alt-4',
  'https://i.pravatar.cc/150?u=sofia-alt-5',
]

const mateConfigs: MateConfig[] = [
  {
    id: 'sam',
    name: 'Sofia',
    skill: 'Scheduling',
    skillColor: 'text-blue-700',
    skillBg: 'bg-blue-50 border-blue-200',
    photo: 'https://i.pravatar.cc/150?u=sofia-chen-upkeep',
    learningSummary: 'Learned your team\'s schedules and SLA rules. Found 12 technicians.',
    milestones: ['Scanning work orders…', 'Analyzing scheduling patterns…', 'Learning SLA thresholds…', 'Mapping technician skills…'],
    integrations: [
      { id: 'google-calendar', name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' },
      { id: 'slack', name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    introMessage: "👋 Hey! I'm {name}. I'll help you manage work orders, technician schedules, and assignments — so nothing falls through the cracks. Let's make sure I feel like your kind of teammate.",
    prefKey: 'schedulingMode',
  },
  {
    id: 'elena',
    name: 'Elena',
    skill: 'Inventory',
    skillColor: 'text-emerald-700',
    skillBg: 'bg-emerald-50 border-emerald-200',
    photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep',
    learningSummary: 'Analyzed 1,247 parts across 3 locations. Found 47 low-stock items.',
    milestones: ['Scanning inventory data…', 'Analyzing stock patterns…', 'Learning reorder thresholds…', 'Mapping vendor relationships…'],
    integrations: [
      { id: 'quickbooks', name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
      { id: 'google-sheets', name: 'Google Sheets', logo: '/images/integrations/google-sheets.svg' },
    ],
    introMessage: "👋 Hey! I'm {name}. I'll keep your parts stocked, vendors managed, and reorder points optimized — so your team never waits on inventory. Let me learn your style.",
    prefKey: 'inventoryMode',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    skill: 'Triage',
    skillColor: 'text-amber-700',
    skillBg: 'bg-amber-50 border-amber-200',
    photo: 'https://i.pravatar.cc/150?u=marcus-johnson-upkeep',
    learningSummary: 'Reviewed 892 historical requests. Learned your escalation patterns.',
    milestones: ['Scanning request history…', 'Analyzing priority patterns…', 'Learning escalation rules…', 'Mapping response times…'],
    integrations: [
      { id: 'gmail', name: 'Gmail', logo: '/images/integrations/gmail.svg' },
      { id: 'slack', name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    introMessage: "👋 Hey! I'm {name}. I'll sort incoming requests, flag what's urgent, and escalate when things go quiet — so your team stays focused on what matters. Let's set my personality.",
    prefKey: 'escalationMode',
  },
]

/* ── Dynamic intro message ── */

function buildIntroMessage(name: string, skill: string, tone: number, proactivity: number, style: number): string {
  const greeting = tone <= 2
    ? `Hey there! 👋 I'm ${name}.`
    : tone >= 4
    ? `Hi, I'm ${name}.`
    : `👋 Hey! I'm ${name}.`

  const roleMap: Record<string, [string, string, string]> = {
    Scheduling: [
      "I'll help manage work orders, technician schedules, and assignments — so nothing falls through the cracks.",
      "I handle work order routing, schedule optimization, and technician assignments for your team.",
      "I manage work orders, schedules, and assignments — keeping your team running smoothly.",
    ],
    Inventory: [
      "I'll keep your parts stocked, vendors managed, and reorder points optimized — so your team never waits.",
      "I monitor stock levels, manage vendor relationships, and optimize reorder thresholds.",
      "I handle inventory tracking, vendor management, and reorder optimization for your operations.",
    ],
    Triage: [
      "I'll sort incoming requests, flag what's urgent, and make sure nothing slips through the cracks.",
      "I classify, prioritize, and route incoming requests to the right people.",
      "I handle request triage, priority classification, and escalation management.",
    ],
  }

  const roles = roleMap[skill] || roleMap.Scheduling!
  const roleDesc = style <= 2 ? roles[0] : style >= 4 ? roles[2] : roles[1]

  const closing = proactivity <= 2
    ? "I'll always check with you before taking action."
    : proactivity >= 4
    ? "I'll handle things proactively and keep you in the loop."
    : "I'll suggest next steps and wait for your go-ahead."

  return `${greeting} ${roleDesc} ${closing}`
}

/* ── Props ── */

interface AIActivationScreenProps {
  aiMates: Record<AIMateId, AIMateActivation>
  onUpdateMate: (id: AIMateId, update: Partial<AIMateActivation>) => void
  onSetPreference: (key: 'schedulingMode' | 'inventoryMode' | 'escalationMode', value: PreferenceMode) => void
  onComplete: () => void
}

/* ── Component ── */

export function AIActivationScreen({ aiMates, onUpdateMate, onSetPreference, onComplete }: AIActivationScreenProps) {
  const [inputMateId, setInputMateId] = useState<AIMateId | null>(null)
  const startedRef = useRef(false)
  const inputResolverRef = useRef<(() => void) | null>(null)

  function waitForInput(): Promise<void> {
    return new Promise(resolve => { inputResolverRef.current = resolve })
  }

  const handleInputContinue = useCallback(() => {
    if (inputMateId) {
      const config = mateConfigs.find(c => c.id === inputMateId)
      if (config) onSetPreference(config.prefKey, 'suggest')
    }
    inputResolverRef.current?.()
    inputResolverRef.current = null
  }, [inputMateId, onSetPreference])

  const handleSkip = useCallback(() => {
    if (inputMateId) {
      const config = mateConfigs.find(c => c.id === inputMateId)
      if (config) onSetPreference(config.prefKey, 'skip')
    }
    inputResolverRef.current?.()
    inputResolverRef.current = null
  }, [inputMateId, onSetPreference])

  const runActivation = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true

    for (const config of mateConfigs) {
      if (aiMates[config.id].status === 'ready') continue

      onUpdateMate(config.id, { status: 'learning', progress: 0, learningText: config.milestones[0] })

      for (let pct = 0; pct <= 100; pct += 2) {
        await delay(80)
        const milestoneIdx = pct < 30 ? 0 : pct < 60 ? 1 : pct < 90 ? 2 : 3
        onUpdateMate(config.id, { progress: pct, learningText: config.milestones[milestoneIdx] })
      }

      onUpdateMate(config.id, { status: 'needs-input', progress: 100, learningText: '' })
      setInputMateId(config.id)

      await waitForInput()

      onUpdateMate(config.id, { status: 'ready', summary: config.learningSummary })
      setInputMateId(null)
    }

    await delay(600)
    onComplete()
  }, [aiMates, onUpdateMate, onComplete])

  useEffect(() => {
    const allReady = mateConfigs.every(c => aiMates[c.id].status === 'ready')
    if (!allReady) runActivation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--surface-canvas)]">
      <div className="w-full max-w-[560px]">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-2 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
        >
          <h2 className="text-[20px] font-semibold text-[var(--color-neutral-12)]">
            Creating your Agents
          </h2>
          <span className="text-[13px] font-medium text-[var(--color-neutral-8)] bg-[var(--color-neutral-2)] px-2.5 py-1 rounded-full">
            4 / 6
          </span>
        </div>

        <p
          className="text-[14px] text-[var(--color-neutral-8)] mb-6 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
        >
          Your AI team is learning your operations.
        </p>

        {/* Mate cards */}
        <div
          className="flex flex-col gap-3 mb-8 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.15s forwards' }}
        >
          {mateConfigs.map((config) => {
            const mate = aiMates[config.id]
            const isInputActive = inputMateId === config.id

            return (
              <MateCard
                key={config.id}
                config={config}
                mate={mate}
                isInputActive={isInputActive}
                onContinue={handleInputContinue}
                onSkip={handleSkip}
              />
            )
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center">
          <ProgressDots currentPhase="ai-activation" />
        </div>
      </div>
    </div>
  )
}

/* ── Mate Card ── */

function MateCard({
  config, mate, isInputActive, onContinue, onSkip,
}: {
  config: MateConfig
  mate: AIMateActivation
  isInputActive: boolean
  onContinue: () => void
  onSkip: () => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [customName, setCustomName] = useState(config.name)
  const [avatarUrl, setAvatarUrl] = useState(config.photo)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [tone, setTone] = useState(3)
  const [proactivity, setProactivity] = useState(4)
  const [style, setStyle] = useState(3)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  const displayName = customName.trim() || config.name
  const introText = buildIntroMessage(displayName, config.skill, tone, proactivity, style)

  return (
    <div
      className={`rounded-[var(--radius-lg)] border bg-[var(--surface-primary)] transition-all duration-300 overflow-hidden ${
        isInputActive
          ? 'border-[var(--color-accent-7)] shadow-[0_0_0_1px_var(--color-accent-3)]'
          : 'border-[var(--border-default)]'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        {/* Avatar with hover edit */}
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={displayName}
            className={`w-12 h-12 rounded-full object-cover transition-all duration-300 ${
              mate.status === 'waiting' ? 'grayscale opacity-50' : 'grayscale-0 opacity-100'
            }`}
          />
          {isInputActive && (
            <button
              onClick={() => setShowAvatarPicker(p => !p)}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 hover:bg-black/40 transition-all duration-200 cursor-pointer group"
            >
              <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isInputActive && editingName ? (
              <input
                ref={nameInputRef}
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => { if (e.key === 'Enter') setEditingName(false) }}
                className="text-[16px] font-medium text-[var(--color-neutral-12)] bg-transparent border-b-2 border-[var(--color-accent-9)] outline-none py-0 px-0 w-[140px]"
                maxLength={20}
              />
            ) : (
              <span
                className={`text-[16px] font-medium text-[var(--color-neutral-12)] ${isInputActive ? 'cursor-text hover:text-[var(--color-accent-9)] transition-colors' : ''}`}
                onClick={() => { if (isInputActive) setEditingName(true) }}
              >
                {displayName}
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.skillBg} ${config.skillColor}`}>
              {config.skill}
            </span>
          </div>

          {/* Progress bar — learning state */}
          {(mate.status === 'learning' || (mate.status === 'needs-input' && !isInputActive)) && (
            <div className="mt-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[var(--color-accent-9)] font-medium">{mate.learningText || 'Finalizing…'}</span>
                <span className="text-[11px] text-[var(--color-neutral-8)] font-medium">{mate.progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-[var(--color-neutral-3)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-accent-9)] transition-[width] duration-300 ease-out" style={{ width: `${mate.progress}%` }} />
              </div>
            </div>
          )}

          {/* Ready state */}
          {mate.status === 'ready' && mate.summary && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-[var(--color-neutral-8)]">{mate.summary}</span>
            </div>
          )}

          {/* Waiting state */}
          {mate.status === 'waiting' && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[12px] text-[var(--color-neutral-7)]">Waiting</span>
              <div className="flex-1 h-3 rounded-full bg-[var(--color-neutral-3)] overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-[var(--color-neutral-3)] via-[var(--color-neutral-5)] to-[var(--color-neutral-3)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
              </div>
            </div>
          )}
        </div>

        {config.integrations.length > 0 && (
          <span className="inline-flex items-center gap-1 shrink-0">
            {config.integrations.map((integ) => (
              <img key={integ.id} src={integ.logo} alt={integ.name} title={integ.name} className="w-4 h-4 rounded-[3px] object-cover" />
            ))}
          </span>
        )}

        {mate.status === 'ready' && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-success)] text-white shrink-0" style={{ animation: 'checkPop 0.3s ease-out' }}>
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Avatar picker */}
      {isInputActive && showAvatarPicker && (
        <div className="px-4 pb-3 opacity-0" style={{ animation: 'fadeInUp 0.2s ease-out forwards' }}>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-subtle)]">
            {AVATAR_OPTIONS.map((url) => (
              <button
                key={url}
                onClick={() => { setAvatarUrl(url); setShowAvatarPicker(false) }}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-150 hover:scale-110 ${avatarUrl === url ? 'border-[var(--color-accent-9)] ring-2 ring-[var(--color-accent-4)]' : 'border-transparent'}`}
              >
                <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded input — personalization experience */}
      {isInputActive && (
        <div
          className="border-t border-[var(--border-subtle)] px-4 pb-5 pt-4 opacity-0"
          style={{ animation: 'fadeInUp 0.25s ease-out forwards' }}
        >
          {/* Speech bubble */}
          <div className="relative mb-5">
            <div className="absolute -top-[7px] left-6 w-3 h-3 rotate-45 bg-[var(--color-accent-1)] border-l border-t border-[var(--color-accent-3)]" />
            <div className="rounded-xl bg-[var(--color-accent-1)] border border-[var(--color-accent-3)] px-4 py-3.5">
              <p className="text-[13px] text-[#374151] leading-relaxed">{introText}</p>
            </div>
          </div>

          {/* Personality ratings */}
          <div className="mb-5">
            <p className="text-[14px] font-medium text-[var(--color-neutral-12)] mb-3">Set my personality</p>

            <div className="flex flex-col gap-2">
              <StarRow
                label="Tone"
                value={tone}
                onChange={setTone}
                labels={['Very empathetic', 'Empathetic', 'Balanced', 'Direct', 'Very direct']}
              />
              <StarRow
                label="Proactivity"
                value={proactivity}
                onChange={setProactivity}
                labels={['Always asks', 'Asks first', 'Balanced', 'Takes initiative', 'Fully autonomous']}
              />
              <StarRow
                label="Style"
                value={style}
                onChange={setStyle}
                labels={['Very casual', 'Casual', 'Balanced', 'Professional', 'Very formal']}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setTone(3); setProactivity(4); setStyle(3); setCustomName(config.name); setAvatarUrl(config.photo) }}
              className="inline-flex items-center px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] cursor-pointer transition-colors"
            >
              Reset
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onSkip}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] cursor-pointer transition-colors"
              >
                <RefreshCw size={13} className="text-[#6b7280]" />
                Try another
              </button>
              <button
                onClick={onContinue}
                className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-[var(--color-accent-9)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-10)] cursor-pointer transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Star Row ── */

function StarRow({ label, value, onChange, labels }: {
  label: string
  value: number
  onChange: (v: number) => void
  labels: [string, string, string, string, string]
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  const displayLabel = labels[(active || 1) - 1]

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[12px] font-medium text-[var(--color-neutral-11)] w-[80px] shrink-0">{label}</span>
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="p-0.5 cursor-pointer transition-transform duration-100 hover:scale-110"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={star <= active ? '#3b5bdb' : 'none'} stroke={star <= active ? '#3b5bdb' : '#d1d5db'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      <span className={`text-[11px] font-medium transition-opacity duration-150 ${active ? 'text-[var(--color-neutral-8)] opacity-100' : 'text-[var(--color-neutral-7)] opacity-0'}`}>
        {displayLabel}
      </span>
    </div>
  )
}

/* ── Helpers ── */

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
