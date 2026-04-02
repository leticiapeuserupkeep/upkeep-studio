'use client'

import { useRef, useEffect, useCallback } from 'react'

import { Switch, Tooltip, TooltipProvider } from '@/app/components/ui'
import {
  PanelLeft, Plus, Mic, ArrowUp,
  Camera, Settings,
  RotateCw, Smartphone, Tablet,
  ArrowRight, FileText, ChevronDown,
  Check, X, Monitor,
  Eye, Lock, Building2, Sparkles,
  Zap, ClipboardList,
  Upload, Info, Tag, Link2, Square,
  History, BarChart3, RotateCcw, GitCompare,
  TrendingUp, Users, Pencil, Share2,
} from 'lucide-react'
import { KPI } from '@/app/components/ui/KPI'
import { Sparkline } from '@/app/components/ui/Sparkline'
import { MiniBarChart } from '@/app/components/ui/MiniBarChart'
import { EmptyState } from '@/app/components/ui/EmptyState'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/components/ui/Modal'
import { Button } from '@/app/components/ui/Button'
import type { VersionEntry } from '@/app/lib/hooks/use-builder-state'
import { PublishSuccessOverlay } from './PublishSuccessOverlay'
import { PublishRatingPrompt } from './PublishRatingPrompt'
import { GeneratedAppPreview, BuilderSkeletons } from './GeneratedAppPreview'
import { useBuilderState } from '@/app/lib/hooks/use-builder-state'

type AiPhase = 'waiting' | 'thinking' | 'responded'
type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
type AudienceOption = 'company' | 'private' | 'restricted'
type AgentMode = 'plan' | 'action'

const recommendedSteps = [
  { text: 'Status & Availability — real-time asset status (active/inactive), downtime status (available/not-available)', lines: 3 },
  { text: 'Work Order Metrics — open work orders, past due WOs, WO trends per asset', lines: 3 },
  { text: 'Meter Readings — current meter values, trends, thresholds/alerts', lines: 2 },
  { text: 'Warranty Tracking — warranty expiration dates, expired warranties', lines: 2 },
]

const settingsSuggestions = [
  { text: 'Set who can access this app', action: 'audience' as const, icon: 'Lock' },
  { text: 'Update the app name and description', action: 'details' as const, icon: 'FileText' },
  { text: 'Choose a category and add tags', action: 'tags' as const, icon: 'Tag' },
  { text: 'Configure publishing to marketplace', action: 'marketplace' as const, icon: 'Globe' },
]

const thinkingSteps = [
  { label: 'Understanding your request', detail: 'Parsing intent and scope' },
  { label: 'Analyzing your UpKeep data', detail: 'Reading work orders, assets, and meters' },
  { label: 'Designing app layout', detail: 'Choosing components and structure' },
  { label: 'Generating your app', detail: 'Building views, logic, and connections' },
]

const audienceOptions: { value: AudienceOption; label: string; description: string; icon: typeof Building2 }[] = [
  { value: 'company', label: 'Anyone at my company', description: 'App will be available for anyone at your company', icon: Building2 },
  { value: 'private', label: 'Private', description: 'Only visible for you', icon: Lock },
  { value: 'restricted', label: 'Restricted access', description: 'Available only to selected users or groups', icon: Eye },
]

const agentModeOptions: { value: AgentMode; label: string; description: string; icon: typeof ClipboardList }[] = [
  { value: 'plan', label: 'Plan mode', description: 'Review the approach before acting', icon: ClipboardList },
  { value: 'action', label: 'Action mode', description: 'Execute actions directly', icon: Zap },
]

function playTadaSound() {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    function playNote(freq: number, start: number, dur: number, vol: number, type: OscillatorType = 'sine') {
      const gain = ctx.createGain()
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(vol, now + start)
      gain.gain.setValueAtTime(vol, now + start + dur * 0.7)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)

      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(now + start)
      osc.stop(now + start + dur)
    }

    playNote(523.25, 0, 0.15, 0.06, 'triangle')
    playNote(659.25, 0.08, 0.15, 0.06, 'triangle')
    playNote(783.99, 0.16, 0.15, 0.06, 'triangle')

    playNote(523.25, 0.26, 0.6, 0.045, 'sine')
    playNote(659.25, 0.26, 0.6, 0.04, 'sine')
    playNote(783.99, 0.26, 0.6, 0.04, 'sine')
    playNote(1046.50, 0.26, 0.6, 0.035, 'sine')

    playNote(1567.98, 0.3, 0.4, 0.015, 'sine')
    playNote(2093.00, 0.34, 0.3, 0.01, 'sine')

    setTimeout(() => ctx.close(), 2000)
  } catch { /* AudioContext not available */ }
}

function playCompletionChime() {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    const g1 = ctx.createGain()
    g1.connect(ctx.destination)
    g1.gain.setValueAtTime(0.06, now)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    const o1 = ctx.createOscillator()
    o1.type = 'sine'
    o1.frequency.value = 587.33
    o1.connect(g1)
    o1.start(now)
    o1.stop(now + 0.15)

    const g2 = ctx.createGain()
    g2.connect(ctx.destination)
    g2.gain.setValueAtTime(0.06, now + 0.12)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)

    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = 783.99
    o2.connect(g2)
    o2.start(now + 0.12)
    o2.stop(now + 0.35)

    setTimeout(() => ctx.close(), 1000)
  } catch { /* AudioContext not available */ }
}

type PreviewTab = 'desktop' | 'code' | 'history' | 'analytics'

interface BuilderViewProps {
  submittedPrompt: string
  aiPhase: AiPhase
  chatInput: string
  setChatInput: (v: string) => void
  chatRef: React.RefObject<HTMLTextAreaElement | null>
  previewTab: PreviewTab
  setPreviewTab: (v: PreviewTab) => void
  previewDevice: PreviewDevice
  setPreviewDevice: (d: PreviewDevice) => void
}

/* ── Mock analytics data ── */
const mockOpensPerDay = [12, 18, 15, 22, 28, 24, 31, 19, 26, 35, 29, 33, 38, 42]
const mockSectionUsage = [85, 62, 45, 30, 18]
const mockSectionLabels = ['Dashboard', 'WO List', 'Asset Detail', 'Settings', 'Reports']

export function BuilderView({
  submittedPrompt, aiPhase, chatInput, setChatInput, chatRef, previewTab, setPreviewTab,
  previewDevice, setPreviewDevice,
}: BuilderViewProps) {
  const { state: s, dispatch, closeSettings } = useBuilderState(submittedPrompt, aiPhase)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasPublishedOnce = useRef(false)
  const hasShownRating = useRef(false)
  const prevPhaseRef = useRef<AiPhase>(aiPhase)
  const responseCountRef = useRef(0)
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPromptRef = useRef(submittedPrompt)

  useEffect(() => {
    if (aiPhase === 'responded' && responseCountRef.current === 0) {
      dispatch({ type: 'SET_LOCAL_PHASE', value: 'responded' })
      responseCountRef.current = 1
    }
    if (aiPhase === 'thinking' && s.localPhase === 'waiting') {
      dispatch({ type: 'SET_LOCAL_PHASE', value: 'thinking' })
    }
  }, [aiPhase, s.localPhase, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [s.localPhase, s.thinkingStep, s.messages.length])

  useEffect(() => {
    if (s.localPhase !== 'thinking') return
    dispatch({ type: 'SET_THINKING_STEP', value: 0 })
    const timers = thinkingSteps.map((_, i) =>
      i > 0 ? setTimeout(() => dispatch({ type: 'SET_THINKING_STEP', value: i }), i * 800) : null
    ).filter(Boolean) as ReturnType<typeof setTimeout>[]
    return () => timers.forEach(clearTimeout)
  }, [s.localPhase, dispatch])

  useEffect(() => {
    if (prevPhaseRef.current === 'thinking' && s.localPhase === 'responded') {
      dispatch({ type: 'SET_COMPLETION_SIGNAL', value: true })
      setTimeout(() => dispatch({ type: 'SET_COMPLETION_SIGNAL', value: false }), 2500)

      const orig = document.title
      document.title = '\u2713 Ready \u2014 New App'
      setTimeout(() => { document.title = orig }, 4000)

      if (s.soundEnabled) playCompletionChime()
    }
    prevPhaseRef.current = s.localPhase
  }, [s.localPhase, s.soundEnabled, dispatch])

  const followUpResponses = [
    "I've updated the app based on your feedback. The changes are now visible in the preview.",
    "Done! I've restructured the layout as you described. Check the preview to see the result.",
    "Changes applied. I've adjusted the components and data connections to match your request.",
    "All set — the modifications are live in the preview. Let me know if you need anything else.",
  ]

  const handleChatSend = useCallback(() => {
    if (!chatInput.trim() || s.localPhase === 'thinking' || s.localPhase === 'waiting') return
    const userMsg = chatInput.trim()
    lastPromptRef.current = userMsg
    setChatInput('')
    dispatch({ type: 'APPEND_MESSAGE', message: { role: 'user', content: userMsg } })
    dispatch({ type: 'CHAT_SENT' })

    const idx = responseCountRef.current
    thinkingTimerRef.current = setTimeout(() => {
      thinkingTimerRef.current = null
      responseCountRef.current += 1
      dispatch({ type: 'CHAT_RESPONSE_RECEIVED', content: followUpResponses[idx % followUpResponses.length] })
      setTimeout(() => dispatch({ type: 'AUTO_SAVED' }), 800)
    }, 8000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInput, setChatInput, s.localPhase, dispatch])

  const handleStop = useCallback(() => {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
    setChatInput(lastPromptRef.current)
    dispatch({ type: 'SET_LOCAL_PHASE', value: 'responded' })
    dispatch({ type: 'SET_SAVE_STATE', value: 'saved' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChatInput, dispatch])

  const triggerPublish = useCallback(() => {
    dispatch({ type: 'PUBLISH_STARTED' })
    setTimeout(() => {
      hasPublishedOnce.current = true
      dispatch({ type: 'PUBLISH_COMPLETED' })
      playTadaSound()
    }, 1800)
  }, [dispatch])

  useEffect(() => {
    const saveTimer = setInterval(() => {
      dispatch({ type: 'SET_SAVE_STATE', value: 'saving' })
      setTimeout(() => dispatch({ type: 'AUTO_SAVED' }), 800)
    }, 15000)

    const agoTimer = setInterval(() => {
      dispatch({ type: 'INCREMENT_SAVED_AGO', by: 5 })
    }, 5000)

    return () => { clearInterval(saveTimer); clearInterval(agoTimer) }
  }, [dispatch])

  useEffect(() => {
    if (chatInput.trim()) dispatch({ type: 'SET_SAVE_STATE', value: 'unsaved' })
  }, [chatInput, dispatch])

  useEffect(() => {
    if (s.localPhase !== 'thinking' && s.localPhase !== 'responded') {
      dispatch({ type: 'SET_LOCAL_PHASE', value: 'thinking' })
      thinkingTimerRef.current = setTimeout(() => {
        thinkingTimerRef.current = null
        responseCountRef.current += 1
        dispatch({ type: 'CHAT_RESPONSE_RECEIVED', content: "Here's what I created for you:" })
        setTimeout(() => dispatch({ type: 'AUTO_SAVED' }), 800)
      }, 8000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        dispatch({ type: 'SET_PUBLISH_OPEN', open: true })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  const deviceConfig: { device: PreviewDevice; icon: typeof Monitor; label: string }[] = [
    { device: 'desktop', icon: Monitor, label: 'Desktop' },
    { device: 'tablet', icon: Tablet, label: 'Tablet' },
    { device: 'mobile', icon: Smartphone, label: 'Mobile' },
  ]

  const saveLabel = s.saveState === 'saving'
    ? 'Saving\u2026'
    : s.saveState === 'unsaved'
    ? '\u25CF Unsaved changes'
    : s.savedAgo < 5
    ? '\u2713 Auto-saved just now'
    : `\u2713 Saved ${s.savedAgo}s ago`

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-[var(--surface-primary)] opacity-0"
      style={{ animation: 'fadeInUp 0.5s var(--ease-default) forwards' }}
    >
      {/* ── Builder top nav ── */}
      <header className="flex items-center h-[60px] border-b border-[var(--border-default)] bg-[var(--surface-primary)] shrink-0 sticky top-0 z-10">
        <div className="flex items-center w-[400px] h-[60px] shrink-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="flex items-center justify-center w-[68px] h-[60px] border-r border-[var(--border-default)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer shrink-0"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={20} className="text-[var(--color-neutral-10)]" />
          </button>
          <span className="text-[length:var(--font-size-xl)] font-semibold leading-7 text-[var(--color-neutral-12)] pl-4">New App</span>
        </div>

        <div className="w-px h-8 bg-[var(--border-default)] shrink-0" />

        <div className="flex items-center flex-1 gap-5">
          <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1 pl-5">
            <Tooltip content="Reload preview" side="bottom" sideOffset={6}>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Refresh preview">
                <RotateCw size={20} strokeWidth={1.5} className="text-[var(--color-neutral-9)]" />
              </button>
            </Tooltip>
            <div className="w-px h-5 bg-[var(--border-default)] mx-1" />
            {deviceConfig.map(({ device, icon: DeviceIcon, label }) => (
              <Tooltip key={device} content={`Preview as ${label.toLowerCase()}`} side="bottom" sideOffset={6}>
                <button
                  onClick={() => setPreviewDevice(device)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-xl transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                    previewDevice === device
                      ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)]'
                      : 'text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]'
                  }`}
                  aria-label={`${label} preview`}
                >
                  <DeviceIcon size={18} strokeWidth={1.5} />
                  <span className={`text-[length:var(--font-size-xs)] font-medium leading-none ${
                    previewDevice === device ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-8)]'
                  }`}>{label}</span>
                </button>
              </Tooltip>
            ))}
          </div>
          </TooltipProvider>

          {/* Segmented control — centered */}
          <div className="flex-1 flex justify-center">
            <div id="preview-switcher" className="flex items-center h-8 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, rgba(0,0,51,0.06) 0%, rgba(0,0,51,0.06) 100%), #FFFFFF' }}>
              {([
                { key: 'desktop' as PreviewTab, label: 'Preview' },
                { key: 'code' as PreviewTab, label: 'Code' },
                { key: 'history' as PreviewTab, label: 'History', icon: History },
                { key: 'analytics' as PreviewTab, label: 'Analytics', icon: BarChart3 },
              ]).map(({ key, label, icon: TabIcon }) => (
                <button
                  key={key}
                  onClick={() => setPreviewTab(key)}
                  className={`flex items-center justify-center gap-1.5 px-4 h-8 text-[length:var(--font-size-base)] rounded-lg transition-all duration-[var(--duration-normal)] cursor-pointer ${
                    previewTab === key
                      ? 'bg-[var(--surface-primary)] border border-[var(--border-default)] text-[var(--color-neutral-12)] font-medium shadow-sm'
                      : 'text-[var(--color-neutral-12)]'
                  }`}
                >
                  {TabIcon && <TabIcon size={14} />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right section */}
        <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-2 pr-4">
          {/* Status badge */}
          {s.publishStatus === 'draft' && (
            <span className="px-2.5 py-1 rounded-full border border-[var(--border-default)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">
              Draft
            </span>
          )}
          {(s.publishStatus === 'published' || s.publishStatus === 'dirty') && (
            <span className={`px-2.5 py-1 rounded-full border text-[length:var(--font-size-sm)] font-medium ${
              s.publishStatus === 'dirty'
                ? 'border-[var(--color-warning-border)] text-[var(--color-warning)] bg-[var(--color-warning-light)]'
                : 'border-[var(--color-success-light)] text-[var(--color-success)]'
            }`}>
              {s.publishStatus === 'dirty' ? 'Unpublished changes' : 'Published'}
            </span>
          )}

          <Tooltip content="Settings" side="bottom" sideOffset={6}>
            <button
              id="settings-button"
              onClick={() => dispatch({ type: 'SET_SETTINGS_OPEN', open: true })}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
              aria-label="Settings"
            >
              <Settings size={20} strokeWidth={1.5} className="text-[var(--color-neutral-9)]" />
            </button>
          </Tooltip>

          {/* Share button — visible when published or dirty */}
          {(s.publishStatus === 'published' || s.publishStatus === 'dirty') && (
            <Tooltip content={s.linkCopied ? 'Copied!' : 'Copy share link'} side="bottom" sideOffset={6} open={s.linkCopied || undefined}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://upkeep.app/apps/${s.appTitle.toLowerCase().replace(/\s+/g, '-')}`)
                  dispatch({ type: 'SET_LINK_COPIED', value: true })
                  setTimeout(() => dispatch({ type: 'SET_LINK_COPIED', value: false }), 2000)
                }}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                  s.linkCopied
                    ? 'border-[var(--color-success-light)] bg-[var(--color-success-light)]'
                    : 'border-[var(--border-default)] hover:bg-[var(--color-neutral-3)]'
                }`}
                aria-label="Share"
              >
                {s.linkCopied
                  ? <Check size={16} className="text-[var(--color-success)]" />
                  : <Link2 size={16} className="text-[var(--color-neutral-9)]" />
                }
              </button>
            </Tooltip>
          )}

          <div className="relative">
            <button
              id="publish-button"
              disabled={s.publishStatus === 'published' || s.publishStatus === 'publishing'}
              onClick={() => {
                if (s.publishStatus === 'dirty') {
                  triggerPublish()
                  return
                }
                if (s.publishStatus === 'draft' && !hasPublishedOnce.current) {
                  dispatch({ type: 'SET_PUBLISH_OPEN', open: !s.publishOpen })
                  return
                }
                triggerPublish()
              }}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl transition-colors duration-[var(--duration-fast)] cursor-pointer group disabled:opacity-50 disabled:cursor-default bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)]"
            >
              {s.publishStatus === 'publishing' && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-[length:var(--font-size-base)] font-medium text-white">
                {s.publishStatus === 'publishing' ? 'Publishing…' : 'Publish'}
              </span>
            </button>

            {s.publishOpen && (
              <>
                <div className="fixed inset-0 z-[var(--z-overlay)] bg-black/10" onClick={() => dispatch({ type: 'SET_PUBLISH_OPEN', open: false })} />
                <div className="absolute right-0 top-full mt-2 z-[var(--z-modal)] w-[360px] bg-[var(--surface-primary)] rounded-2xl shadow-[var(--shadow-xl)] p-6 flex flex-col gap-5 dropdown-animate">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[length:var(--font-size-lg)] font-semibold text-[var(--color-neutral-12)]">Publish</h3>
                    <button
                      onClick={() => dispatch({ type: 'SET_PUBLISH_OPEN', open: false })}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
                      aria-label="Close"
                    >
                      <X size={18} className="text-[var(--color-neutral-9)]" />
                    </button>
                  </div>

                  <p className="sr-only">Publish your app</p>

                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] shrink-0">Title</span>
                      <input
                        type="text"
                        value={s.appTitle}
                        onChange={(e) => dispatch({ type: 'SET_APP_TITLE', value: e.target.value })}
                        className="text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] bg-transparent outline-none border border-[var(--border-default)] rounded-lg px-3 py-2 w-full max-w-[220px]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">Status</span>
                      <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)] px-2.5 py-1 rounded-full border border-[var(--border-default)]">
                        Draft
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">Who can view</span>
                      <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-9)]">
                        {audienceOptions.find(o => o.value === s.publishAudience)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => dispatch({ type: 'OPEN_SETTINGS_FROM_PUBLISH' })}
                      className="flex-1 flex items-center justify-center h-10 rounded-xl border border-[var(--border-default)] text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                    >
                      Manage Settings
                    </button>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_PUBLISH_OPEN', open: false })
                        triggerPublish()
                      }}
                      className="flex-1 flex items-center justify-center h-10 rounded-xl bg-[var(--color-accent-9)] text-[length:var(--font-size-base)] font-medium text-white hover:bg-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </TooltipProvider>
      </header>

      {/* ── Two-panel content ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── Chat panel (left, 400px) ── */}
        <div id="chat-panel" className="flex flex-col w-[400px] shrink-0 h-full relative">
          {s.completionSignal && <div className="completion-edge-glow" />}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {s.messages.map((msg, idx) => {
              if (msg.role === 'user') {
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-end pl-6 opacity-0"
                    style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
                  >
                    <div className="bg-[var(--color-accent-1)] rounded-xl p-3 max-w-full">
                      <p className="text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-9)]">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              const assistantIndex = s.messages.slice(0, idx + 1).filter(m => m.role === 'assistant').length - 1
              const isFirst = assistantIndex === 0
              const isSecond = assistantIndex === 1

              return (
                <div key={idx} className="flex flex-col gap-3">
                  {/* Completion status */}
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_ACTIVITY_LOG' })}
                    className={`flex items-center gap-2 opacity-0 cursor-pointer group px-2 py-1.5 -mx-2 ${s.completionSignal && idx === s.messages.length - 1 ? 'completion-row-highlight' : ''}`}
                    style={{ animation: 'fadeInUp 0.4s var(--ease-default) forwards' }}
                  >
                    <div className="w-[18px] h-[18px] rounded-full bg-[var(--color-success)] flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </div>
                    <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">
                      {isFirst ? 'Completed in 3m 50s' : 'Changes applied'}
                    </span>
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">·</span>
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]">
                      {s.showActivityLog && idx === s.messages.length - 1 ? 'Hide details' : 'View details'}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)] ${s.showActivityLog && idx === s.messages.length - 1 ? 'rotate-180' : ''}`} />
                  </button>

                  {s.showActivityLog && idx === s.messages.length - 1 && (
                    <div
                      className="flex flex-col gap-1 pl-[30px] pb-1 border-l-2 border-[var(--border-default)] ml-[8px] opacity-0"
                      style={{ animation: 'fadeInUp 0.25s var(--ease-default) forwards' }}
                    >
                      {thinkingSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 py-0.5">
                          <Check size={12} strokeWidth={2} className="text-[var(--color-success)] shrink-0" />
                          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Response card */}
                  <div
                    className="border border-[var(--border-default)] rounded-xl p-3 flex flex-col gap-2 opacity-0"
                    style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
                  >
                    <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)] leading-5">
                      {isFirst ? "Here's what I created for you:" : msg.content}
                    </p>
                    {isFirst && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 px-0.5">
                          <FileText size={16} className="text-[var(--color-neutral-9)] shrink-0" />
                          <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">WO-042 — Pump Station 3</span>
                        </div>
                        <div className="flex items-center gap-2 px-0.5">
                          <FileText size={16} className="text-[var(--color-neutral-9)] shrink-0" />
                          <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">WO-043 — Conveyor Belt 12</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommended steps — only after first AI response, hidden once published */}
                  {isFirst && s.publishStatus === 'draft' && (
                    <div
                      className="px-0 py-0 flex flex-col gap-3 opacity-0"
                      style={{ animation: 'fadeInUp 0.5s var(--ease-default) 0.2s forwards' }}
                    >
                      <h4 className="text-[length:var(--font-size-sm)] font-medium uppercase tracking-wider text-[var(--color-neutral-8)]">What would you like to focus on?</h4>
                      <p className="text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-12)]">
                        I found several directions based on your UpKeep data. Pick one to continue, or describe something else:
                      </p>
                      <div className="flex flex-col gap-3">
                        {recommendedSteps.map((step, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setChatInput(step.text)
                              chatRef.current?.focus()
                            }}
                            className="flex items-center gap-2.5 p-3 bg-[var(--color-neutral-2)] border border-[var(--color-neutral-5)] rounded-xl text-left hover:bg-[var(--color-neutral-3)] hover:border-[var(--color-accent-5)] transition-all duration-[var(--duration-fast)] cursor-pointer group opacity-0"
                            style={{ animation: `fadeInUp 0.4s var(--ease-default) ${0.3 + i * 0.08}s forwards` }}
                          >
                            <span className="flex-1 text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-12)]">{step.text}</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] opacity-0 group-hover:opacity-100 transition-opacity">Add this</span>
                              <ArrowRight size={16} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]" />
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-9)]">
                        You can select multiple, or tell me exactly what you need — I&apos;ll combine them.
                      </p>
                    </div>
                  )}

                  {/* Settings suggestions — after second AI response */}
                  {/* Settings suggestions — after second AI response */}
                  {isSecond && s.publishStatus === 'draft' && !s.settingsSaved && (
                    <div
                      className="rounded-xl border border-[var(--color-accent-5)] bg-[var(--color-accent-1)] overflow-hidden opacity-0"
                      style={{ animation: 'fadeInUp 0.5s var(--ease-default) 0.2s forwards' }}
                    >
                      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                        <Settings size={15} className="text-[var(--color-accent-9)] shrink-0" />
                        <h4 className="text-[length:var(--font-size-sm)] font-semibold uppercase tracking-wider text-[var(--color-accent-9)]">Want to publish your app?</h4>
                      </div>
                      <p className="text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-11)] px-4 pb-3">
                        Configure your app settings to get the best visibility and control:
                      </p>
                      <div className="flex flex-col gap-0 px-2 pb-2">
                        {settingsSuggestions.map((item, i) => (
                          <button
                            key={item.action}
                            onClick={() => { dispatch({ type: 'SET_SETTINGS_OPEN', open: true }) }}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-[var(--color-accent-2)] transition-all duration-[var(--duration-fast)] cursor-pointer group opacity-0"
                            style={{ animation: `fadeInUp 0.4s var(--ease-default) ${0.3 + i * 0.08}s forwards` }}
                          >
                            <span className="flex-1 text-[length:var(--font-size-base)] leading-5 text-[var(--color-neutral-12)]">{item.text}</span>
                            <ArrowRight size={14} className="text-[var(--color-accent-7)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)] shrink-0" />
                          </button>
                        ))}
                      </div>
                      <p className="text-[length:var(--font-size-sm)] leading-5 text-[var(--color-neutral-8)] px-4 pb-3">
                        You can always change these later in Settings.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Thinking state — always at the bottom when active */}
            {s.localPhase === 'thinking' && (
              <div
                className="flex flex-col gap-0.5 opacity-0"
                style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.3s forwards' }}
              >
                <span className="text-[length:var(--font-size-xs)] font-medium uppercase tracking-wider text-[var(--color-neutral-8)] mb-1.5">Working on it…</span>
                {thinkingSteps.map((step, i) => {
                  const isComplete = i < s.thinkingStep
                  const isActive = i === s.thinkingStep
                  const isPending = i > s.thinkingStep
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 py-1.5 transition-all duration-[var(--duration-normal)] ${isPending ? 'opacity-30' : 'opacity-100'}`}
                    >
                      {isComplete ? (
                        <div className="w-[18px] h-[18px] rounded-full bg-[var(--color-success)] flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} className="text-white" />
                        </div>
                      ) : isActive ? (
                        <div className="w-[18px] h-[18px] rounded-full bg-[var(--color-accent-9)] shrink-0" style={{ animation: 'ai-pulse 1.5s ease-in-out infinite' }} />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--color-neutral-5)] shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className={`text-[length:var(--font-size-base)] leading-tight ${isActive ? 'font-medium shimmer-text' : isComplete ? 'font-medium text-[var(--color-neutral-12)]' : 'text-[var(--color-neutral-7)]'}`}>
                          {step.label}
                        </span>
                        {isActive && (
                          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5">{step.detail}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Post-publish CTAs */}
          {(s.publishStatus === 'published' || s.publishStatus === 'dirty') && !s.postPublishCTAsDismissed && (
            <div className="px-6 pb-3 fade-animate">
              <div className="rounded-xl border border-[var(--color-accent-5)] bg-[var(--color-accent-1)] overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                  <span className="text-[length:var(--font-size-sm)] font-medium uppercase tracking-wider text-[var(--color-accent-9)]">Finish setting up</span>
                  <button
                    onClick={() => dispatch({ type: 'SET_POST_PUBLISH_CTAS_DISMISSED', value: true })}
                    className="flex items-center justify-center w-5 h-5 rounded-md hover:bg-[var(--color-accent-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                    aria-label="Dismiss"
                  >
                    <X size={12} className="text-[var(--color-accent-8)]" />
                  </button>
                </div>
                <button
                  onClick={() => { dispatch({ type: 'SET_SETTINGS_OPEN', open: true }); dispatch({ type: 'SET_POST_PUBLISH_CTAS_DISMISSED', value: true }) }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-[var(--color-accent-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer group"
                >
                  <Settings size={15} className="text-[var(--color-accent-9)] shrink-0" />
                  <span className="flex-1 text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Add setup instructions</span>
                  <ArrowRight size={14} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]" />
                </button>
                <button
                  onClick={() => { dispatch({ type: 'SET_SETTINGS_OPEN', open: true }); dispatch({ type: 'SET_POST_PUBLISH_CTAS_DISMISSED', value: true }) }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-[var(--color-accent-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer group"
                >
                  <Tag size={15} className="text-[var(--color-accent-9)] shrink-0" />
                  <span className="flex-1 text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Add tags so users can find your app</span>
                  <ArrowRight size={14} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]" />
                </button>
              </div>
            </div>
          )}

          <div className="px-6 pb-6 flex flex-col gap-2">
            <div
              id="chat-input"
              className="w-full bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-3 flex flex-col gap-3 transition-[border-color,box-shadow] duration-[var(--duration-normal)] focus-within:border-[var(--color-accent-8)] focus-within:shadow-[0_0_0_3px_rgba(59,91,219,0.12),0px_4px_16px_-8px_rgba(59,91,219,0.18),0px_3px_12px_-4px_rgba(59,91,219,0.12)]"
              style={{ boxShadow: '0px 2px 8px -4px rgba(0,0,0,0.06), 0px 1px 4px -2px rgba(0,0,51,0.04)' }}
            >
              <textarea
                ref={chatRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() }
                }}
                placeholder={(s.publishStatus === 'published' || s.publishStatus === 'dirty') ? 'Ask for changes' : 'Tell me what to change or add…'}
                className="w-full resize-none text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-7)] outline-none ring-0 focus:outline-none focus:ring-0 bg-[var(--color-neutral-2)] rounded-xl px-3 py-2.5 leading-5 border-none shadow-none appearance-none"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => dispatch({ type: 'SET_MODE_DROPDOWN', open: !s.modeDropdownOpen })}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                    >
                      {(() => { const opt = agentModeOptions.find(o => o.value === s.agentMode); const Icon = opt?.icon || ClipboardList; return <Icon size={14} className="text-[var(--color-neutral-8)]" /> })()}
                      <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">{agentModeOptions.find(o => o.value === s.agentMode)?.label}</span>
                      <ChevronDown size={12} className={`text-[var(--color-neutral-7)] transition-transform duration-[var(--duration-fast)] ${s.modeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {s.modeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => dispatch({ type: 'SET_MODE_DROPDOWN', open: false })} />
                        <div className="absolute left-0 bottom-full mb-1 z-[var(--z-modal)] rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 w-[260px] dropdown-animate">
                          {agentModeOptions.map((opt) => {
                            const Icon = opt.icon
                            return (
                              <button
                                key={opt.value}
                                onClick={() => { dispatch({ type: 'SET_AGENT_MODE', value: opt.value }); dispatch({ type: 'SET_MODE_DROPDOWN', open: false }) }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-neutral-2)] cursor-pointer transition-colors duration-[var(--duration-fast)] ${s.agentMode === opt.value ? 'bg-[var(--color-accent-1)]' : ''}`}
                              >
                                <Icon size={16} className="text-[var(--color-neutral-8)] shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">{opt.label}</p>
                                  <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">{opt.description}</p>
                                </div>
                                {s.agentMode === opt.value && (
                                  <Check size={16} className="text-[var(--color-accent-9)] shrink-0" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Attach file">
                    <Plus size={16} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {s.localPhase === 'thinking' ? (
                    <button
                      onClick={handleStop}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-neutral-12)] hover:bg-[var(--color-neutral-10)] hover:scale-110 cursor-pointer transition-all duration-[var(--duration-normal)]"
                      aria-label="Stop generating"
                    >
                      <Square size={10} fill="white" className="text-white" />
                    </button>
                  ) : (
                    <>
                      <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Voice input">
                        <Mic size={16} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
                      </button>
                      <button
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || s.localPhase === 'waiting'}
                        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-[var(--duration-normal)] ${
                          chatInput.trim() && s.localPhase !== 'waiting' ? 'bg-[var(--color-neutral-12)] hover:bg-[var(--color-neutral-10)] hover:scale-110 cursor-pointer' : 'bg-[rgba(0,0,51,0.06)] cursor-default'
                        }`}
                        aria-label="Send"
                      >
                        <ArrowUp size={16} strokeWidth={1.5} className="text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Preview panel (always visible) ── */}
        <div id="preview-panel" className="flex-1 bg-[var(--color-neutral-2)] border-l border-[var(--border-default)] p-8 flex flex-col gap-4 overflow-auto relative">
          {previewTab === 'history' ? (
            <VersionHistoryPanel
              versions={s.versions}
              selectedVersions={s.selectedVersions}
              editingVersionId={s.editingVersionId}
              onToggleSelect={(id) => dispatch({ type: 'TOGGLE_VERSION_SELECTION', id })}
              onClearSelection={() => dispatch({ type: 'CLEAR_VERSION_SELECTION' })}
              onRestore={(id) => dispatch({ type: 'SET_RESTORE_CONFIRM', id })}
              onStartEdit={(id) => dispatch({ type: 'SET_EDITING_VERSION', id })}
              onRename={(id, desc) => dispatch({ type: 'RENAME_VERSION', id, description: desc })}
            />
          ) : previewTab === 'analytics' ? (
            <AnalyticsPanel publishStatus={s.publishStatus} appTitle={s.appTitle} />
          ) : s.localPhase === 'thinking' || s.localPhase === 'waiting' ? (
            <BuilderSkeletons />
          ) : (
            <GeneratedAppPreview prompt={submittedPrompt} />
          )}
        </div>

        {/* Restore confirmation modal */}
        <Modal open={!!s.restoreConfirmId} onOpenChange={(open) => { if (!open) dispatch({ type: 'SET_RESTORE_CONFIRM', id: null }) }}>
          <ModalHeader title="Restore version" description={`Are you sure you want to restore to ${s.versions.find(v => v.id === s.restoreConfirmId)?.version || ''}? Your current changes will be saved as a new version.`} />
          <ModalFooter>
            <div className="flex-1" />
            <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'SET_RESTORE_CONFIRM', id: null })}>Cancel</Button>
            <Button variant="primary" size="md" onClick={() => { if (s.restoreConfirmId) dispatch({ type: 'RESTORE_VERSION', id: s.restoreConfirmId }) }}>Restore</Button>
          </ModalFooter>
        </Modal>

        {/* ── Settings Drawer ── */}
        {s.settingsOpen && (
          <>
            <div
              className="fixed inset-0 z-[var(--z-overlay)] bg-black/40"
              style={{ animation: 'overlay-in var(--duration-normal) var(--ease-default) forwards' }}
              onClick={() => dispatch({ type: 'SET_SETTINGS_OPEN', open: false })}
            />
            <div
              className="fixed right-0 top-0 bottom-0 z-[var(--z-modal)] w-full max-w-[680px] bg-[var(--surface-primary)] shadow-[var(--shadow-xl)] flex flex-col"
              style={{ animation: 'settings-drawer-in var(--duration-slow) var(--ease-default) forwards' }}
            >
              {/* Settings header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0">
                <h2 className="text-[length:var(--font-size-lg)] font-semibold text-[var(--color-neutral-12)]">Settings</h2>
                <button
                  onClick={() => dispatch({ type: 'SET_SETTINGS_OPEN', open: false })}
                  className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
                  aria-label="Close settings"
                >
                  <X size={18} className="text-[var(--color-neutral-9)]" />
                </button>
              </div>

              {/* Settings content */}
              <div className="flex-1 overflow-auto px-6 pt-6 pb-10 flex flex-col gap-6">
                {/* Published app access card */}
                <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">Published app access</h3>
                      <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Changing audience will take effect immediately</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-[length:var(--font-size-base)] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)] cursor-pointer shrink-0">
                      <Link2 size={14} />
                      Copy link
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Who can view</label>
                    <div className="relative">
                      <button
                        onClick={() => dispatch({ type: 'SET_AUDIENCE_DROPDOWN', open: !s.audienceDropdownOpen })}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] cursor-pointer hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)]"
                      >
                        <div className="flex items-center gap-2">
                          {(() => { const opt = audienceOptions.find(o => o.value === s.publishAudience); const Icon = opt?.icon || Building2; return <Icon size={16} className="text-[var(--color-neutral-8)]" /> })()}
                          <span>{audienceOptions.find(o => o.value === s.publishAudience)?.label}</span>
                        </div>
                        <ChevronDown size={16} className={`text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)] ${s.audienceDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {s.audienceDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => dispatch({ type: 'SET_AUDIENCE_DROPDOWN', open: false })} />
                          <div className="absolute left-0 right-0 top-full mt-1 z-[var(--z-modal)] rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 dropdown-animate">
                            {audienceOptions.map((opt) => {
                              const Icon = opt.icon
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => { dispatch({ type: 'SET_PUBLISH_AUDIENCE', value: opt.value }); dispatch({ type: 'SET_AUDIENCE_DROPDOWN', open: false }) }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-neutral-2)] cursor-pointer transition-colors duration-[var(--duration-fast)] ${s.publishAudience === opt.value ? 'bg-[var(--color-accent-1)]' : ''}`}
                                >
                                  <Icon size={16} className="text-[var(--color-neutral-8)] shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">{opt.label}</p>
                                    <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">{opt.description}</p>
                                  </div>
                                  {s.publishAudience === opt.value && (
                                    <Check size={16} className="text-[var(--color-accent-9)] shrink-0" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Marketplace toggle */}
                  <div className="flex items-center gap-3 py-2">
                    <Switch
                      checked={s.marketplacePublish}
                      onCheckedChange={(v) => { dispatch({ type: 'SET_MARKETPLACE_PUBLISH', value: v }) }}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Publish to Marketplace</span>
                      <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)]"> (Visible for anyone in the UpKeep community</span>
                    </div>
                  </div>

                  {/* Info banner — only when marketplace toggle is on */}
                  {s.marketplacePublish && (
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[var(--color-accent-1)] border border-[var(--color-accent-3)]">
                      <Info size={16} className="text-[var(--color-accent-9)] shrink-0 mt-0.5" />
                      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] leading-relaxed">
                        Publishing makes it available to your team instantly. Marketplace visibility requires review first.
                      </span>
                    </div>
                  )}

                </div>

                {/* App Details card */}
                <div className="flex flex-col gap-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
                  <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">App Details</h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">Name</label>
                    <input
                      type="text"
                      value={s.appTitle}
                      onChange={(e) => { dispatch({ type: 'SET_APP_TITLE', value: e.target.value }); dispatch({ type: 'SET_SETTINGS_DIRTY', value: true }) }}
                      className="w-full text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] bg-[var(--color-neutral-2)] rounded-lg px-3 py-2.5 outline-none ring-0 focus:outline-none focus:ring-0 border-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">Description</label>
                    <div className="relative">
                      <textarea
                        value={s.appDescription}
                        onChange={(e) => { dispatch({ type: 'SET_APP_DESCRIPTION', value: e.target.value }) }}
                        placeholder="Briefly describe what this app does and who it's for…"
                        className="w-full resize-none text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-7)] bg-[var(--color-neutral-2)] rounded-lg px-3 py-2.5 leading-5 outline-none ring-0 focus:outline-none focus:ring-0 border-none shadow-none appearance-none"
                        rows={3}
                      />
                      <button className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-accent-5)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                        <Sparkles size={12} />
                        Writing Assistant
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">Category</label>
                      <select
                        value={s.appCategory}
                        onChange={(e) => { dispatch({ type: 'SET_APP_CATEGORY', value: e.target.value }) }}
                        className="w-full text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] bg-[var(--color-neutral-2)] rounded-lg px-3 py-2.5 outline-none border-none cursor-pointer appearance-none"
                      >
                        {['Operations', 'Reporting', 'Compliance', 'Work Orders', 'Inventory', 'Assets', 'Data Management', 'Safety'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">Version</label>
                      <input
                        type="text"
                        defaultValue="1.0.0"
                        className="w-full text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] bg-[var(--color-neutral-2)] rounded-lg px-3 py-2.5 outline-none ring-0 focus:outline-none focus:ring-0 border-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">Tags</label>
                    <div className="flex flex-wrap items-center gap-1.5 bg-[var(--color-neutral-2)] rounded-lg px-3 py-2 min-h-[38px]">
                      {s.appTags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-default)] text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-11)]">
                          {tag}
                          <button onClick={() => { dispatch({ type: 'REMOVE_TAG', tag }) }} className="text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-12)] cursor-pointer">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Add tag…"
                        className="flex-1 min-w-[60px] text-[length:var(--font-size-sm)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-7)] bg-transparent outline-none border-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            dispatch({ type: 'ADD_TAG', tag: e.currentTarget.value.trim() })
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)]">Instructions</label>
                    <div className="relative">
                      <textarea
                        value={s.appInstructions}
                        onChange={(e) => { dispatch({ type: 'SET_APP_INSTRUCTIONS', value: e.target.value }) }}
                        placeholder="step by step for users to install and use the app"
                        className="w-full resize-none text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-7)] bg-[var(--color-neutral-2)] rounded-lg px-3 py-2.5 leading-5 outline-none ring-0 focus:outline-none focus:ring-0 border-none shadow-none appearance-none"
                        rows={4}
                      />
                      <button className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-accent-5)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                        <Sparkles size={12} />
                        Writing Assistant
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images card */}
                <div className="flex flex-col gap-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
                  <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">Images</h3>

                  {/* Favicon */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Favicon</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-neutral-2)] border border-[var(--border-default)]">
                        <Camera size={20} className="text-[var(--color-neutral-7)]" />
                      </div>
                      <button className="flex items-center justify-center h-8 px-3 rounded-lg bg-[var(--color-accent-9)] text-[length:var(--font-size-sm)] font-medium text-white hover:bg-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                        Upload an image
                      </button>
                      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">Recommended dimensions: 48×48</span>
                    </div>
                  </div>

                  {/* Preview app Images */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Preview app Images (up to 5)</label>
                    <div className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-dashed border-[var(--color-accent-5)] bg-[var(--color-neutral-2)]">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-accent-2)]">
                        <Upload size={20} className="text-[var(--color-accent-7)]" />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Drag and drop your file here to upload</p>
                        <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">Recommended dimensions: 1920×1080 px</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:bg-[var(--color-accent-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                          <Sparkles size={12} />
                          Make an Image
                        </button>
                        <button className="flex items-center justify-center h-8 px-3 rounded-lg bg-[var(--color-accent-9)] text-[length:var(--font-size-sm)] font-medium text-white hover:bg-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                          Browse files
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border-default)] bg-[var(--color-neutral-2)] shrink-0">
                <button
                  onClick={() => closeSettings()}
                  className="mr-auto flex items-center justify-center h-10 px-5 rounded-xl border border-[var(--border-default)] text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                >
                  Cancel
                </button>
                {s.settingsFromPublish && (
                  <button
                    onClick={() => { closeSettings(); triggerPublish() }}
                    className="flex items-center justify-center h-10 px-5 rounded-xl border border-[var(--border-default)] text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                  >
                    Save &amp; Publish
                  </button>
                )}
                <button
                  disabled={!s.settingsDirty}
                  onClick={() => dispatch({ type: 'SETTINGS_SAVED' })}
                  className="flex items-center justify-center h-10 px-5 rounded-xl bg-[var(--color-accent-9)] text-[length:var(--font-size-base)] font-medium text-white hover:bg-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  Save changes
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Publishing loading overlay */}
      {s.showPublishing && (
        <div
          className="fixed inset-0 z-[var(--z-toast)] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 20, 0.55)',
            backdropFilter: 'blur(6px)',
            animation: 'success-overlay-in 0.3s ease forwards',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-white/80 border-t-transparent rounded-full animate-spin" />
            <p className="text-[length:var(--font-size-base)] font-medium text-white/70">Publishing your app…</p>
          </div>
        </div>
      )}

      {/* Publish success overlay */}
      {s.showPublishSuccess && (
        <PublishSuccessOverlay
          appTitle={s.appTitle}
          onDismiss={() => {
            dispatch({ type: 'SET_SHOW_PUBLISH_SUCCESS', value: false })
            if (!hasShownRating.current) {
              hasShownRating.current = true
              setTimeout(() => dispatch({ type: 'SET_SHOW_RATING_PROMPT', value: true }), 400)
            }
          }}
        />
      )}

      {/* Post-publish rating prompt */}
      {s.showRatingPrompt && (
        <PublishRatingPrompt onDismiss={() => dispatch({ type: 'SET_SHOW_RATING_PROMPT', value: false })} />
      )}

    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Version History Panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function VersionHistoryPanel({
  versions,
  selectedVersions,
  editingVersionId,
  onToggleSelect,
  onClearSelection,
  onRestore,
  onStartEdit,
  onRename,
}: {
  versions: VersionEntry[]
  selectedVersions: string[]
  editingVersionId: string | null
  onToggleSelect: (id: string) => void
  onClearSelection: () => void
  onRestore: (id: string) => void
  onStartEdit: (id: string) => void
  onRename: (id: string, desc: string) => void
}) {
  const isComparing = selectedVersions.length === 2

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[length:var(--font-size-lg)] font-semibold text-[var(--color-neutral-12)]">Version History</h2>
          <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)] mt-0.5">
            {versions.length} version{versions.length !== 1 ? 's' : ''} · Select two to compare
          </p>
        </div>
        {selectedVersions.length > 0 && (
          <button
            onClick={onClearSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] rounded-lg hover:bg-[var(--color-accent-1)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <X size={12} /> Clear selection
          </button>
        )}
      </div>

      {isComparing && (
        <div className="mb-6 rounded-xl border border-[var(--color-accent-3)] bg-[var(--color-accent-1)] p-5 fade-animate">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare size={16} className="text-[var(--color-accent-9)]" />
            <h3 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">
              Comparing {selectedVersions[0]} → {selectedVersions[1]}
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            <DiffEntry type="added" text="Added status availability section with real-time indicators" />
            <DiffEntry type="added" text="New work order metrics widget with trend charts" />
            <DiffEntry type="modified" text="Dashboard layout restructured from 2-column to 3-column grid" />
            <DiffEntry type="removed" text="Removed placeholder data table from initial view" />
            <DiffEntry type="modified" text="Updated color scheme to match brand guidelines" />
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[var(--border-default)]" />
        <div className="flex flex-col gap-1">
          {versions.map((v, i) => {
            const isSelected = selectedVersions.includes(v.id)
            const isLatest = i === 0
            return (
              <div
                key={v.id}
                className={`relative flex items-start gap-4 pl-10 pr-4 py-3 rounded-xl transition-colors duration-[var(--duration-fast)] group ${
                  isSelected ? 'bg-[var(--color-accent-1)]' : 'hover:bg-[var(--color-neutral-3)]'
                }`}
              >
                <button
                  onClick={() => onToggleSelect(v.id)}
                  className={`absolute left-2 top-3.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-accent-9)] bg-[var(--color-accent-9)]'
                      : v.type === 'publish'
                        ? 'border-[var(--color-success)] bg-[var(--color-success)]'
                        : 'border-[var(--color-neutral-5)] bg-[var(--surface-primary)]'
                  }`}
                >
                  {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                  {!isSelected && v.type === 'publish' && <Check size={10} strokeWidth={3} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">{v.version}</span>
                    {isLatest && (
                      <span className="px-1.5 py-0.5 text-[length:var(--font-size-xs)] font-medium rounded bg-[var(--color-accent-1)] text-[var(--color-accent-9)] border border-[var(--color-accent-3)]">
                        Current
                      </span>
                    )}
                    {v.type === 'publish' && (
                      <span className="px-1.5 py-0.5 text-[length:var(--font-size-xs)] font-medium rounded bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                        Published
                      </span>
                    )}
                  </div>
                  {editingVersionId === v.id ? (
                    <input
                      autoFocus
                      defaultValue={v.description}
                      onBlur={(e) => onRename(v.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') onRename(v.id, e.currentTarget.value); if (e.key === 'Escape') onStartEdit('') }}
                      className="mt-1 w-full text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] bg-[var(--surface-primary)] border border-[var(--color-accent-5)] rounded-lg px-2 py-1 outline-none"
                    />
                  ) : (
                    <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-9)] mt-0.5">{v.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">{v.timestamp}</span>
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-6)]">·</span>
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">{v.author}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)] shrink-0 pt-0.5">
                  <button
                    onClick={() => onStartEdit(v.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                    aria-label="Rename"
                  >
                    <Pencil size={12} className="text-[var(--color-neutral-8)]" />
                  </button>
                  {!isLatest && (
                    <button
                      onClick={() => onRestore(v.id)}
                      className="flex items-center gap-1 px-2 py-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] rounded-lg hover:bg-[var(--color-accent-1)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DiffEntry({ type, text }: { type: 'added' | 'removed' | 'modified'; text: string }) {
  const config = {
    added: { label: 'Added', color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-light)]' },
    removed: { label: 'Removed', color: 'text-[var(--color-error)]', bg: 'bg-[var(--color-error-light)]' },
    modified: { label: 'Modified', color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-light)]' },
  }[type]

  return (
    <div className="flex items-start gap-2">
      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[length:var(--font-size-xs)] font-medium ${config.color} ${config.bg}`}>
        {config.label}
      </span>
      <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-11)]">{text}</span>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Analytics Panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function AnalyticsPanel({ publishStatus, appTitle }: { publishStatus: string; appTitle: string }) {
  if (publishStatus === 'draft') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<BarChart3 size={24} className="text-[var(--color-neutral-7)]" />}
          title="Analytics available after publishing"
          description="Publish your app to start tracking installs, usage, and engagement."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-[length:var(--font-size-lg)] font-semibold text-[var(--color-neutral-12)]">Analytics</h2>
        <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)] mt-0.5">{appTitle} · Last 14 days</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPI
          label="Total Installs"
          value="42"
          subtitle="+8 this week"
          subtitleIcon={<TrendingUp size={12} className="text-[var(--color-success)]" />}
          accent
        />
        <KPI
          label="Active Users (7d)"
          value="18"
          subtitle="43% of installs"
          icon={<Users size={16} className="text-[var(--color-neutral-8)]" />}
        />
        <KPI
          label="Avg Opens / Day"
          value="6.2"
          subtitle="+12% vs last week"
          subtitleIcon={<TrendingUp size={12} className="text-[var(--color-success)]" />}
        />
      </div>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
        <h3 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] mb-4">Opens per day</h3>
        <Sparkline
          data={mockOpensPerDay}
          width={600}
          height={120}
          color="var(--color-accent-9)"
          className="w-full"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">Mar 6</span>
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">Mar 19</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
          <h3 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] mb-4">Most-used sections</h3>
          <MiniBarChart
            data={mockSectionUsage}
            labels={mockSectionLabels}
            width={260}
            height={100}
            color="var(--color-accent-3)"
            highlightIndex={0}
            highlightColor="var(--color-accent-9)"
            className="w-full"
          />
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
          <h3 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] mb-4">Drop-off point</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-light)] flex items-center justify-center">
                <Share2 size={14} className="text-[var(--color-warning)]" />
              </div>
              <div>
                <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Settings tab</p>
                <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Most users leave after this section</p>
              </div>
            </div>
            <div className="h-px bg-[var(--border-subtle)]" />
            <div className="flex items-center justify-between">
              <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Avg session duration</span>
              <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">3m 24s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Bounce rate</span>
              <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
