'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
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
  inputQuestion: string
  inputContext: string
  inputOptions: { value: PreferenceMode; title: string; description: string }[]
  prefKey: 'schedulingMode' | 'inventoryMode' | 'escalationMode'
}

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
      { id: 'google-calendar', name: 'Google Calendar', logo: '/images/integrations/google-calendar.png' },
      { id: 'slack', name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    inputQuestion: 'How should I handle work order assignments?',
    inputContext: 'I found 47 unassigned work orders and 12 available technicians.',
    inputOptions: [
      { value: 'auto', title: 'Auto-assign based on availability', description: 'I\'ll match skills, proximity, and workload automatically' },
      { value: 'suggest', title: 'Suggest only, I\'ll decide', description: 'I\'ll recommend assignments but wait for your approval' },
      { value: 'skip', title: 'Skip for now', description: 'I\'ll configure this later' },
    ],
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
    inputQuestion: 'How should I handle low stock?',
    inputContext: 'I found 47 parts with low stock levels across your locations.',
    inputOptions: [
      { value: 'auto', title: 'Auto-reorder when below threshold', description: 'I\'ll ask for approval on orders over $500' },
      { value: 'notify', title: 'Notify me only, I\'ll decide each time', description: 'I\'ll alert you but won\'t create purchase orders' },
      { value: 'skip', title: 'Skip for now', description: 'I\'ll configure this later' },
    ],
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
      { id: 'gmail', name: 'Gmail', logo: '/images/integrations/gmail.png' },
      { id: 'slack', name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    inputQuestion: 'When should I escalate requests?',
    inputContext: 'I noticed some requests sit unresolved for 24+ hours on average.',
    inputOptions: [
      { value: 'auto', title: 'Auto-escalate after 4 hours', description: 'I\'ll bump priority and notify supervisors automatically' },
      { value: 'suggest', title: 'Suggest escalation, I\'ll approve', description: 'I\'ll flag overdue requests and recommend escalation' },
      { value: 'skip', title: 'Skip for now', description: 'I\'ll configure this later' },
    ],
    prefKey: 'escalationMode',
  },
]

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
  const [selectedOption, setSelectedOption] = useState<PreferenceMode>(null)
  const startedRef = useRef(false)
  const inputResolverRef = useRef<(() => void) | null>(null)

  function waitForInput(): Promise<void> {
    return new Promise(resolve => { inputResolverRef.current = resolve })
  }

  const handleInputContinue = useCallback(() => {
    if (inputMateId && selectedOption) {
      const config = mateConfigs.find(c => c.id === inputMateId)
      if (config) onSetPreference(config.prefKey, selectedOption)
    }
    inputResolverRef.current?.()
    inputResolverRef.current = null
  }, [inputMateId, selectedOption, onSetPreference])

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
      setSelectedOption(null)

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
            Creating your AIMates
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

        {/* Mate cards — input expands inline inside the active card */}
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
                selectedOption={isInputActive ? selectedOption : null}
                onSelectOption={setSelectedOption}
                onContinue={handleInputContinue}
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

/* ── Mate Card (with inline expandable input) ── */

function MateCard({
  config, mate, isInputActive, selectedOption, onSelectOption, onContinue,
}: {
  config: MateConfig
  mate: AIMateActivation
  isInputActive: boolean
  selectedOption: PreferenceMode
  onSelectOption: (v: PreferenceMode) => void
  onContinue: () => void
}) {
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
        <img
          src={config.photo}
          alt={config.name}
          className={`w-12 h-12 rounded-full object-cover transition-all duration-300 ${
            mate.status === 'waiting' ? 'grayscale opacity-50' : 'grayscale-0 opacity-100'
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-medium text-[var(--color-neutral-12)]">{config.name}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.skillBg} ${config.skillColor}`}>
              {config.skill}
            </span>
            {config.integrations.length > 0 && (
              <span className="inline-flex items-center gap-1 ml-1">
                {config.integrations.map((integ) => (
                  <img key={integ.id} src={integ.logo} alt={integ.name} title={integ.name} className="w-4 h-4 rounded-[3px] object-cover" />
                ))}
              </span>
            )}
          </div>

          {/* Progress bar — shown during learning, and during needs-input when not expanded */}
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

        {mate.status === 'ready' && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-success)] text-white shrink-0" style={{ animation: 'checkPop 0.3s ease-out' }}>
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Inline input — expands inside the card */}
      {isInputActive && (
        <div
          className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3 opacity-0"
          style={{ animation: 'fadeInUp 0.25s ease-out forwards' }}
        >
          <p className="text-[14px] font-medium text-[var(--color-neutral-12)] mb-0.5">{config.inputQuestion}</p>
          <p className="text-[13px] text-[var(--color-neutral-8)] mb-3">{config.inputContext}</p>

          <div className="flex flex-col gap-2 mb-3">
            {config.inputOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelectOption(opt.value)}
                className={`flex items-start gap-3 p-3 rounded-[var(--radius-lg)] border text-left cursor-pointer transition-all duration-150 ${
                  selectedOption === opt.value
                    ? 'border-[var(--color-accent-9)] bg-[var(--color-accent-1)]'
                    : 'border-[var(--border-default)] hover:border-[var(--color-neutral-6)] bg-[var(--surface-primary)]'
                }`}
              >
                <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === opt.value ? 'border-[var(--color-accent-9)]' : 'border-[var(--color-neutral-5)]'
                }`}>
                  {selectedOption === opt.value && <span className="w-2 h-2 rounded-full bg-[var(--color-accent-9)]" />}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-neutral-12)]">{opt.title}</p>
                  <p className="text-[11px] text-[var(--color-neutral-8)] mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" disabled={!selectedOption} onClick={onContinue} className="gap-1.5">
              Continue <span className="text-white/80">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Helpers ── */

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
