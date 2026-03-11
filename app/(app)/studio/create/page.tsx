'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  PanelLeft, Plus, Mic, ArrowUp,
  BarChart3, Camera, Settings,
  ChevronsDown, RotateCw, AppWindow, Smartphone, Tablet,
  ArrowRight, FileText, ChevronDown,
  LayoutGrid, Medal, Briefcase, CircleDot,
  RefreshCcw, ShieldCheck, PhoneCall,
  HelpCircle, Check, X, Monitor, AlertCircle,
  Users, Eye, Lock, Building2, Globe, Sparkles,
  Zap, Wrench, ClipboardList, Gauge, Package,
  Bell, Upload, Image,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

/* ── Static data ── */

const rotatingPlaceholders = [
  'Create a dashboard showing overdue work orders by technician\u2026',
  'Build a daily safety inspection checklist for forklifts\u2026',
  'Make an app that tracks asset warranty expiry dates\u2026',
  'Generate a shift handoff report with open issues\u2026',
]

const suggestions = [
  { label: 'Track my team\u2019s work', prefill: 'Build an app that tracks my team\u2019s open work orders, assignments, and completion rates across all locations.', color: '#6E7C2F', borderColor: '#8B9A3C', hoverBg: 'rgba(110, 124, 47, 0.08)' },
  { label: 'Monitor asset health', prefill: 'Create a dashboard that monitors asset health scores, downtime trends, and maintenance history for all critical equipment.', color: '#C2850C', borderColor: '#D4A030', hoverBg: 'rgba(194, 133, 12, 0.08)' },
  { label: 'Digitize inspections', prefill: 'Make a mobile-friendly inspection app with customizable checklists, photo capture, and automatic follow-up work order creation.', color: '#2E8540', borderColor: '#3DA352', hoverBg: 'rgba(46, 133, 64, 0.08)' },
]

const templates = [
  { icon: BarChart3, title: 'Dashboard Template', description: 'Visual reporting and operational KPIs', prefill: 'Create an operations dashboard with KPIs for work order completion rate, asset uptime, and team utilization across all sites.', category: 'Reporting', complexity: 'starter' as const, role: 'manager' as const },
  { icon: LayoutGrid, title: 'Inspections Template', description: 'Inspection workflows and follow-ups', prefill: 'Build a mobile-friendly inspection app with custom checklists, photo capture, and automatic follow-up work order creation.', category: 'Compliance', complexity: 'intermediate' as const, role: 'technician' as const },
  { icon: Medal, title: 'Data Quality Template', description: 'Audit and fix record issues', prefill: 'Make an app that audits asset records for missing fields, duplicate entries, and stale data — with one-click fix actions.', category: 'Data Management', complexity: 'advanced' as const, role: 'admin' as const },
  { icon: Briefcase, title: 'Work Order Automation Template', description: 'Tools to manage work orders more efficiently', prefill: 'Build a work order automation tool that auto-assigns tasks based on technician skills, location, and current workload.', category: 'Work Orders', complexity: 'intermediate' as const, role: 'manager' as const },
  { icon: Camera, title: 'Scan & Capture Template', description: 'Convert paper or physical information into digital records', prefill: 'Create an app that scans barcodes and QR codes on assets to instantly pull up maintenance history and create new work orders.', category: 'Data Management', complexity: 'starter' as const, role: 'technician' as const },
  { icon: CircleDot, title: 'Inventory & Parts Template', description: 'Inventory operations and forecasting', prefill: 'Build an inventory tracker with low-stock alerts, reorder automation, and parts usage forecasting based on historical work orders.', category: 'Inventory', complexity: 'intermediate' as const, role: 'manager' as const },
  { icon: RefreshCcw, title: 'Asset Lifecycle Template', description: 'Asset lifecycle and replacement decisions', prefill: 'Create an asset lifecycle dashboard showing total cost of ownership, depreciation curves, and replacement recommendations.', category: 'Assets', complexity: 'advanced' as const, role: 'manager' as const },
  { icon: ShieldCheck, title: 'Safety & Compliance Template', description: 'Track hazards, incidents, and regulatory compliance', prefill: 'Build a safety compliance tracker with incident reporting, OSHA log generation, and corrective action workflows.', category: 'Compliance', complexity: 'intermediate' as const, role: 'admin' as const },
  { icon: PhoneCall, title: 'Operations & Dispatch Template', description: 'Coordinate teams, assignments, and operational workload', prefill: 'Create a dispatch board showing real-time technician locations, open assignments, and priority-based routing.', category: 'Operations', complexity: 'advanced' as const, role: 'manager' as const },
]

const featuredTemplateIndices = [0, 3, 1, 5, 7, 8]
const templateCategories = ['All', 'Reporting', 'Work Orders', 'Compliance', 'Data Management', 'Inventory', 'Assets', 'Operations']
const roleFilters = ['All Roles', 'Manager', 'Technician', 'Admin'] as const
const complexityFilters = ['All Levels', 'Starter', 'Intermediate', 'Advanced'] as const

const recommendedSteps = [
  { text: 'Status & Availability — real-time asset status (active/inactive), downtime status (available/not-available)', lines: 3 },
  { text: 'Work Order Metrics — open work orders, past due WOs, WO trends per asset', lines: 3 },
  { text: 'Meter Readings — current meter values, trends, thresholds/alerts', lines: 2 },
  { text: 'Warranty Tracking — warranty expiration dates, expired warranties', lines: 2 },
]

const onboardingSteps = [
  { target: 'chat-panel', title: 'Describe what you want', body: 'In plain English. No code needed.' },
  { target: 'preview-panel', title: 'Live preview', body: 'See your app update in real time as you chat.' },
  { target: 'publish-button', title: 'Publish instantly', body: 'When you\u2019re happy, publish to your team in one click.' },
]

const thinkingSteps = [
  { label: 'Understanding your request', detail: 'Parsing intent and scope' },
  { label: 'Analyzing your UpKeep data', detail: 'Reading work orders, assets, and meters' },
  { label: 'Designing app layout', detail: 'Choosing components and structure' },
  { label: 'Generating your app', detail: 'Building views, logic, and connections' },
]

type ViewState = 'prompt' | 'transitioning' | 'building'
type AiPhase = 'thinking' | 'responded'
type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
type SaveState = 'saved' | 'saving' | 'unsaved'
type SelectedTemplate = typeof templates[number] | null

export default function CreateAppPage() {
  const [view, setView] = useState<ViewState>('prompt')
  const [prompt, setPrompt] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [aiPhase, setAiPhase] = useState<AiPhase>('thinking')
  const [previewTab, setPreviewTab] = useState<'desktop' | 'code'>('desktop')
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate>(null)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!prompt.trim()) return
    setSubmittedPrompt(prompt.trim())
    setPrompt('')
    setSelectedTemplate(null)
    setView('transitioning')

    setTimeout(() => {
      setView('building')
      setAiPhase('thinking')
      window.dispatchEvent(new CustomEvent('collapse-sidebar'))
      setTimeout(() => setAiPhase('responded'), 3500)
    }, 350)
  }, [prompt])

  const handleSuggestionClick = useCallback((prefill: string) => {
    setPrompt(prefill)
    setSelectedTemplate(null)
    promptRef.current?.focus()
  }, [promptRef])

  const handleTemplateSelect = useCallback((t: typeof templates[number]) => {
    setSelectedTemplate(t)
    setPrompt(t.prefill)
    promptRef.current?.focus()
  }, [])

  const handleStartTemplate = useCallback(() => {
    if (!selectedTemplate) return
    setSubmittedPrompt(selectedTemplate.prefill)
    setPrompt('')
    setSelectedTemplate(null)
    setView('transitioning')

    setTimeout(() => {
      setView('building')
      setAiPhase('thinking')
      window.dispatchEvent(new CustomEvent('collapse-sidebar'))
      setTimeout(() => setAiPhase('responded'), 3500)
    }, 350)
  }, [selectedTemplate])

  if (view === 'building') {
    return (
      <BuilderView
        submittedPrompt={submittedPrompt}
        aiPhase={aiPhase}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatRef={chatRef}
        previewTab={previewTab}
        setPreviewTab={setPreviewTab}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
      />
    )
  }

  return (
    <PromptView
      prompt={prompt}
      setPrompt={setPrompt}
      promptRef={promptRef}
      handleSend={handleSend}
      handleSuggestionClick={handleSuggestionClick}
      handleTemplateSelect={handleTemplateSelect}
      handleStartTemplate={handleStartTemplate}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      fading={view === 'transitioning'}
    />
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Rotating Placeholder Hook
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function useRotatingPlaceholder(items: string[], intervalMs = 4000) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length)
        setVisible(true)
      }, 300)
    }, intervalMs)
    return () => clearInterval(id)
  }, [items.length, intervalMs])

  return { text: items[index], visible }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Prompt View (initial screen)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PromptView({
  prompt, setPrompt, promptRef, handleSend, handleSuggestionClick,
  handleTemplateSelect, handleStartTemplate, selectedTemplate, setSelectedTemplate, fading,
}: {
  prompt: string
  setPrompt: (v: string) => void
  promptRef: React.RefObject<HTMLTextAreaElement | null>
  handleSend: () => void
  handleSuggestionClick: (label: string) => void
  handleTemplateSelect: (t: typeof templates[number]) => void
  handleStartTemplate: () => void
  selectedTemplate: SelectedTemplate
  setSelectedTemplate: (t: SelectedTemplate) => void
  fading: boolean
}) {
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [allTemplatesOpen, setAllTemplatesOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('All Roles')
  const [complexityFilter, setComplexityFilter] = useState<string>('All Levels')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [templateTab, setTemplateTab] = useState<'official' | 'mine'>('official')
  const placeholder = useRotatingPlaceholder(rotatingPlaceholders)

  const filteredTemplates = templates.filter((t) => {
    if (roleFilter !== 'All Roles' && t.role !== roleFilter.toLowerCase()) return false
    if (complexityFilter !== 'All Levels' && t.complexity !== complexityFilter.toLowerCase()) return false
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false
    return true
  })

  const groupedTemplates: Record<string, typeof templates> = {}
  for (const t of filteredTemplates) {
    if (!groupedTemplates[t.category]) groupedTemplates[t.category] = []
    groupedTemplates[t.category].push(t)
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 bg-[var(--surface-primary)] transition-all duration-[var(--duration-slow)]"
      style={fading ? { opacity: 0, transform: 'scale(0.98)' } : { opacity: 1, transform: 'scale(1)' }}
    >
      <header className="sticky top-0 z-[var(--z-sticky)] flex items-center gap-[var(--space-sm)] h-[52px] px-[var(--space-md)] bg-[var(--surface-primary)] border-b border-[var(--border-default)] shrink-0">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={20} className="text-[color:var(--color-neutral-7)]" />
        </button>
        <h1 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] whitespace-nowrap">New App</h1>
        <div className="flex-1" />
        <button
          className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={20} strokeWidth={1.5} className="text-[color:var(--color-neutral-7)]" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center overflow-auto px-6 py-6 relative" style={{ isolation: 'isolate' }}>
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 349, height: 344, left: 37, top: 109,
            background: 'linear-gradient(144.85deg, rgba(255,168,235,0.24) 24.86%, rgba(57,57,255,0.24) 47.92%, rgba(0,47,255,0.24) 72.03%)',
            filter: 'blur(167px)', transform: 'rotate(57.04deg)', zIndex: 0,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1548, height: 976, left: 381, top: 423,
            background: 'linear-gradient(144.85deg, rgba(255,216,246,0.07) 22.39%, rgba(140,0,255,0.07) 47.58%, rgba(0,47,255,0.07) 67.59%)',
            filter: 'blur(167px)', zIndex: 0,
          }}
        />
        <div className="my-auto flex flex-col items-center gap-[60px] w-full py-6 relative" style={{ zIndex: 1 }}>
          {/* Prompt + Suggestions */}
          <div className="flex flex-col items-center gap-4 w-full max-w-[600px]">
            <div
              className="w-full bg-[var(--surface-primary)] border border-[var(--color-neutral-6)] rounded-2xl p-3 flex flex-col gap-3 opacity-0 transition-[border-color,box-shadow] duration-[var(--duration-normal)] focus-within:border-[var(--color-accent-8)] focus-within:shadow-[0_0_0_3px_rgba(59,91,219,0.12),0px_4px_16px_-8px_rgba(59,91,219,0.18),0px_3px_12px_-4px_rgba(59,91,219,0.12)]"
              style={{
                minWidth: 400,
                boxShadow: '0px 4px 20px -6px rgba(0,0,0,0.12), 0px 3px 12px -4px rgba(0,0,0,0.08), 0px 2px 4px -2px rgba(0,0,51,0.06)',
                animation: 'fadeInUp 0.6s var(--ease-default) 0.1s forwards',
              }}
            >
              <div className="relative">
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    const el = e.target
                    el.style.height = 'auto'
                    const maxH = 20 * 6 + 20 // 6 lines (20px each) + padding
                    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                  }}
                  placeholder=""
                  className="w-full resize-none text-sm text-[var(--color-neutral-12)] outline-none ring-0 focus:outline-none focus:ring-0 bg-[var(--color-neutral-2)] rounded-xl px-3 py-2.5 leading-5 relative z-[1] border-none shadow-none appearance-none overflow-auto"
                  rows={3}
                  style={{ maxHeight: 20 * 6 + 20 }}
                />
                {!prompt && (
                  <span
                    className="absolute top-2.5 left-3 text-sm text-[#9CA0A8] pointer-events-none leading-5 transition-opacity duration-[var(--duration-fast)]"
                    style={{ opacity: placeholder.visible ? 1 : 0 }}
                  >
                    {placeholder.text}
                  </span>
                )}
              </div>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Attach file">
                    <Plus size={16} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
                  </button>
                  {prompt.trim() && (
                    <span className="text-[11px] text-[var(--color-neutral-7)] select-none">
                      <kbd className="px-1 py-0.5 rounded bg-[var(--color-neutral-3)] border border-[var(--border-default)] text-[10px] font-medium text-[var(--color-neutral-8)]">↵</kbd> to send
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Voice input">
                    <Mic size={16} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!prompt.trim()}
                    className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-[var(--duration-normal)] ${
                      prompt.trim() ? 'bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-11)] hover:scale-110 cursor-pointer' : 'bg-[rgba(0,0,51,0.06)] cursor-default'
                    }`}
                    aria-label="Send"
                  >
                    <ArrowUp size={16} strokeWidth={1.5} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col items-center gap-3 pt-[10px] opacity-0"
              style={{ animation: 'fadeInUp 0.6s var(--ease-default) 0.2s forwards' }}
            >
              <div className="flex items-center gap-3">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSuggestionClick(s.prefill)}
                    className="px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-[var(--duration-fast)] cursor-pointer hover:scale-[1.04] active:scale-[0.97]"
                    style={{ borderColor: s.borderColor, color: s.color, backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = s.hoverBg }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-[var(--color-neutral-8)]">Describe what you need in your own words — or pick a template below to start faster</p>
            </div>
          </div>

          {/* Feature Templates */}
          <Collapsible.Root
            open={templatesOpen}
            onOpenChange={setTemplatesOpen}
            className="flex flex-col w-full max-w-[888px] opacity-0"
            style={{ animation: 'fadeInUp 0.6s var(--ease-default) 0.3s forwards' }}
          >
            <div className="flex items-center justify-between mb-[var(--space-md)]">
              <h3 className="text-base font-semibold text-[var(--color-neutral-12)]">Feature Templates</h3>
              <div className="flex items-center gap-2">
                <Collapsible.Trigger asChild>
                  <button className="flex items-center gap-1 px-1.5 py-1 text-xs font-medium text-[var(--color-accent-9)] rounded hover:bg-[rgba(59,91,219,0.08)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                    {templatesOpen ? 'Show Less' : 'View All Templates'}
                    <ChevronsDown
                      size={16}
                      className={`text-[var(--color-accent-9)] transition-transform duration-[var(--duration-fast)] ${templatesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </Collapsible.Trigger>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[var(--space-md)]">
              {templates.slice(0, 3).map((t, i) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.title}
                    onClick={() => handleTemplateSelect(t)}
                    className={`flex flex-col items-start bg-[var(--surface-primary)] border rounded-2xl p-5 gap-3 text-left transition-all duration-[var(--duration-fast)] cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 opacity-0 ${
                      selectedTemplate?.title === t.title ? 'border-[var(--color-accent-9)] ring-1 ring-[var(--color-accent-9)]' : 'border-[var(--border-default)]'
                    }`}
                    style={{ animation: `fadeInUp 0.5s var(--ease-default) ${0.4 + i * 0.1}s forwards` }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--color-accent-1)]">
                      <Icon size={20} strokeWidth={1.5} className="text-[var(--color-accent-9)]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">{t.title}</h4>
                      <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] leading-relaxed">{t.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <Collapsible.Content>
              <div className="grid grid-cols-3 gap-[var(--space-md)] pt-[var(--space-md)]">
                {templates.slice(3).map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.title}
                      onClick={() => handleTemplateSelect(t)}
                      className={`flex flex-col items-start bg-[var(--surface-primary)] border rounded-2xl p-5 gap-3 text-left transition-all duration-[var(--duration-fast)] cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 ${
                        selectedTemplate?.title === t.title ? 'border-[var(--color-accent-9)] ring-1 ring-[var(--color-accent-9)]' : 'border-[var(--border-default)]'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--color-accent-1)]">
                        <Icon size={20} strokeWidth={1.5} className="text-[var(--color-accent-9)]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">{t.title}</h4>
                        <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] leading-relaxed">{t.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </main>

      {/* #10 — Browse All Templates Modal */}
      <Dialog.Root open={allTemplatesOpen} onOpenChange={setAllTemplatesOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/50" data-dialog-overlay />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-[var(--z-modal)] flex flex-col w-[90vw] max-w-[960px] max-h-[85vh] bg-[var(--surface-primary)] rounded-2xl shadow-[var(--shadow-xl)]"
            data-dialog-content
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0">
              <h2 className="text-lg font-semibold text-[var(--color-neutral-12)]">All Templates</h2>
              <Dialog.Close asChild>
                <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]" aria-label="Close">
                  <X size={18} className="text-[var(--color-neutral-9)]" />
                </button>
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 px-6 pt-4 shrink-0">
              <button
                onClick={() => setTemplateTab('official')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                  templateTab === 'official' ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)]' : 'border-transparent text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-9)]'
                }`}
              >
                UpKeep Official
              </button>
              <button
                onClick={() => setTemplateTab('mine')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                  templateTab === 'mine' ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)]' : 'border-transparent text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-9)]'
                }`}
              >
                Made by You
              </button>
            </div>

            {/* Sticky filter bar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border-subtle)] shrink-0 flex-wrap">
              <FilterDropdown label={roleFilter} options={[...roleFilters]} value={roleFilter} onChange={setRoleFilter} />
              <FilterDropdown label={complexityFilter} options={[...complexityFilters]} value={complexityFilter} onChange={setComplexityFilter} />
              <div className="flex items-center gap-1 flex-wrap">
                {templateCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-[var(--color-accent-9)] text-white'
                        : 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-4)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              {templateTab === 'mine' ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                  <Sparkles size={32} className="text-[var(--color-neutral-6)]" />
                  <p className="text-sm text-[var(--color-neutral-8)]">You haven&apos;t created any templates yet.</p>
                  <p className="text-xs text-[var(--color-neutral-7)]">Templates you build and save will appear here.</p>
                </div>
              ) : (
                <>
                  {/* Most Used as Starting Point */}
                  {categoryFilter === 'All' && roleFilter === 'All Roles' && complexityFilter === 'All Levels' && (
                    <div className="mb-6">
                      <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-neutral-8)] mb-3">Most Used as Starting Point</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {featuredTemplateIndices.map((idx) => {
                          const t = templates[idx]
                          const Icon = t.icon
                          return (
                            <button
                              key={t.title}
                              onClick={() => { handleTemplateSelect(t); setAllTemplatesOpen(false) }}
                              className="flex items-center gap-3 bg-[var(--color-accent-1)] border border-[var(--color-accent-3)] rounded-xl p-3 text-left hover:bg-[var(--color-accent-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                            >
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--surface-primary)] shrink-0">
                                <Icon size={18} strokeWidth={1.5} className="text-[var(--color-accent-9)]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[var(--color-neutral-12)] truncate">{t.title}</p>
                                <p className="text-xs text-[var(--color-neutral-8)] truncate">{t.description}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grouped templates */}
                  {Object.entries(groupedTemplates).map(([category, items]) => (
                    <Collapsible.Root key={category} defaultOpen className="mb-4">
                      <Collapsible.Trigger className="flex items-center gap-2 w-full py-2 cursor-pointer group">
                        <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-neutral-8)]">{category}</span>
                        <span className="text-xs text-[var(--color-neutral-7)]">({items.length})</span>
                        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                        <ChevronsDown size={14} className="text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-normal)] group-data-[state=closed]:rotate-180" />
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          {items.map((t) => {
                            const Icon = t.icon
                            return (
                              <button
                                key={t.title}
                                onClick={() => { handleTemplateSelect(t); setAllTemplatesOpen(false) }}
                                className="flex flex-col items-start bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 gap-2 text-left hover:shadow-[var(--shadow-sm)] hover:border-[var(--color-accent-5)] transition-all cursor-pointer"
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-1)] shrink-0">
                                    <Icon size={16} strokeWidth={1.5} className="text-[var(--color-accent-9)]" />
                                  </div>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-neutral-3)] text-[var(--color-neutral-8)] capitalize">{t.complexity}</span>
                                </div>
                                <h4 className="text-sm font-medium text-[var(--color-neutral-12)]">{t.title}</h4>
                                <p className="text-xs text-[var(--color-neutral-8)] leading-relaxed line-clamp-2">{t.description}</p>
                              </button>
                            )
                          })}
                        </div>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  ))}

                  {filteredTemplates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                      <p className="text-sm text-[var(--color-neutral-8)]">No templates match your filters.</p>
                      <button
                        onClick={() => { setRoleFilter('All Roles'); setComplexityFilter('All Levels'); setCategoryFilter('All') }}
                        className="text-xs text-[var(--color-accent-9)] hover:underline cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

/* ── Filter dropdown helper ── */

function FilterDropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none px-2.5 py-1 pr-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] cursor-pointer outline-none"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

/* ── Completion chime (Web Audio API) ── */

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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Builder View (after prompt submission)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function BuilderView({
  submittedPrompt, aiPhase, chatInput, setChatInput, chatRef, previewTab, setPreviewTab,
  previewDevice, setPreviewDevice,
}: {
  submittedPrompt: string
  aiPhase: AiPhase
  chatInput: string
  setChatInput: (v: string) => void
  chatRef: React.RefObject<HTMLTextAreaElement | null>
  previewTab: 'desktop' | 'code'
  setPreviewTab: (v: 'desktop' | 'code') => void
  previewDevice: PreviewDevice
  setPreviewDevice: (d: PreviewDevice) => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [planMode, setPlanMode] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [savedAgo, setSavedAgo] = useState(0)
  const [publishOpen, setPublishOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [publishAudience, setPublishAudience] = useState<string>('team')
  const [thinkingStep, setThinkingStep] = useState(-1)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completionSignal, setCompletionSignal] = useState(false)

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'user', content: submittedPrompt },
  ])
  const [localPhase, setLocalPhase] = useState<AiPhase>(aiPhase)
  const prevPhaseRef = useRef<AiPhase>(aiPhase)
  const responseCountRef = useRef(0)

  // Sync the initial thinking→responded transition from parent
  useEffect(() => {
    if (aiPhase === 'responded' && responseCountRef.current === 0) {
      setLocalPhase('responded')
      responseCountRef.current = 1
    }
  }, [aiPhase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localPhase, thinkingStep, messages.length])

  useEffect(() => {
    if (localPhase !== 'thinking') return
    setThinkingStep(0)
    const timers = thinkingSteps.map((_, i) =>
      i > 0 ? setTimeout(() => setThinkingStep(i), i * 800) : null
    ).filter(Boolean) as ReturnType<typeof setTimeout>[]
    return () => timers.forEach(clearTimeout)
  }, [localPhase])

  useEffect(() => {
    if (prevPhaseRef.current === 'thinking' && localPhase === 'responded') {
      setCompletionSignal(true)
      setTimeout(() => setCompletionSignal(false), 2500)

      const orig = document.title
      document.title = '\u2713 Ready \u2014 New App'
      setTimeout(() => { document.title = orig }, 4000)

      if (soundEnabled) playCompletionChime()
    }
    prevPhaseRef.current = localPhase
  }, [localPhase, soundEnabled])

  const followUpResponses = [
    "I've updated the app based on your feedback. The changes are now visible in the preview.",
    "Done! I've restructured the layout as you described. Check the preview to see the result.",
    "Changes applied. I've adjusted the components and data connections to match your request.",
    "All set — the modifications are live in the preview. Let me know if you need anything else.",
  ]

  const handleChatSend = useCallback(() => {
    if (!chatInput.trim() || localPhase === 'thinking') return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLocalPhase('thinking')
    setShowActivityLog(false)

    const idx = responseCountRef.current
    setTimeout(() => {
      responseCountRef.current += 1
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: followUpResponses[idx % followUpResponses.length],
      }])
      setLocalPhase('responded')
    }, 3500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInput, setChatInput, localPhase])

  // Auto-save simulation
  useEffect(() => {
    const saveTimer = setInterval(() => {
      setSaveState('saving')
      setTimeout(() => {
        setSaveState('saved')
        setSavedAgo(0)
      }, 800)
    }, 15000)

    const agoTimer = setInterval(() => {
      setSavedAgo((prev) => prev + 5)
    }, 5000)

    return () => { clearInterval(saveTimer); clearInterval(agoTimer) }
  }, [])

  // Mark unsaved on chat input
  useEffect(() => {
    if (chatInput.trim()) setSaveState('unsaved')
  }, [chatInput])

  // Onboarding check
  useEffect(() => {
    const seen = localStorage.getItem('builder-onboarding-complete')
    if (!seen) {
      const timer = setTimeout(() => setShowOnboarding(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false)
    localStorage.setItem('builder-onboarding-complete', 'true')
  }, [])

  const nextOnboardingStep = useCallback(() => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep((prev) => prev + 1)
    } else {
      dismissOnboarding()
    }
  }, [onboardingStep, dismissOnboarding])

  const restartOnboarding = useCallback(() => {
    setOnboardingStep(0)
    setShowOnboarding(true)
    localStorage.removeItem('builder-onboarding-complete')
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setPublishOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const deviceConfig: { device: PreviewDevice; icon: typeof Monitor; label: string }[] = [
    { device: 'desktop', icon: Monitor, label: 'Desktop' },
    { device: 'tablet', icon: Tablet, label: 'Tablet' },
    { device: 'mobile', icon: Smartphone, label: 'Mobile' },
  ]

  const saveLabel = saveState === 'saving'
    ? 'Saving\u2026'
    : saveState === 'unsaved'
    ? '\u25CF Unsaved changes'
    : savedAgo < 5
    ? '\u2713 Auto-saved just now'
    : `\u2713 Saved ${savedAgo}s ago`

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
            className="flex items-center justify-center w-[68px] h-[60px] border-r border-[var(--border-default)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={20} className="text-[var(--color-neutral-10)]" />
          </button>
          <span className="text-[20px] font-semibold leading-7 text-[var(--color-neutral-12)] pl-4">New App</span>
        </div>

        <div className="w-px h-8 bg-[var(--border-default)] shrink-0" />

        <div className="flex items-center flex-1 gap-5">
          <Tooltip.Provider delayDuration={300}>
          <div className="flex items-center gap-1 pl-5">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Refresh preview">
                  <RotateCw size={20} strokeWidth={1.5} className="text-[var(--color-neutral-9)]" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content side="bottom" sideOffset={6} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-neutral-12)] text-white text-xs shadow-[var(--shadow-lg)] z-[var(--z-toast)]">
                  Reload preview
                  <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <div className="w-px h-5 bg-[var(--border-default)] mx-1" />
            {deviceConfig.map(({ device, icon: DeviceIcon, label }) => (
              <Tooltip.Root key={device}>
                <Tooltip.Trigger asChild>
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
                    <span className={`text-[10px] font-medium leading-none ${
                      previewDevice === device ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-8)]'
                    }`}>{label}</span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="bottom" sideOffset={6} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-neutral-12)] text-white text-xs shadow-[var(--shadow-lg)] z-[var(--z-toast)]">
                    Preview as {label.toLowerCase()}
                    <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>
          </Tooltip.Provider>

          {/* Segmented control — centered */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center h-8 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, rgba(0,0,51,0.06) 0%, rgba(0,0,51,0.06) 100%), #FFFFFF' }}>
              <button
                onClick={() => setPreviewTab('desktop')}
                className={`flex items-center justify-center px-4 h-8 text-sm font-medium rounded-lg transition-all duration-[var(--duration-normal)] cursor-pointer ${
                  previewTab === 'desktop'
                    ? 'bg-[var(--surface-primary)] border border-[var(--border-default)] text-[var(--color-neutral-12)] shadow-sm'
                    : 'text-[var(--color-neutral-12)]'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewTab('code')}
                className={`flex items-center justify-center px-4 h-8 text-sm rounded-lg transition-all duration-[var(--duration-normal)] cursor-pointer ${
                  previewTab === 'code'
                    ? 'bg-[var(--surface-primary)] border border-[var(--border-default)] text-[var(--color-neutral-12)] font-medium shadow-sm'
                    : 'text-[var(--color-neutral-12)]'
                }`}
              >
                Code
              </button>
            </div>
          </div>
        </div>

        {/* Right section */}
        <Tooltip.Provider delayDuration={200}>
        <div className="flex items-center gap-2 pr-4">
          {/* Auto-save indicator */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className={`text-xs font-medium mr-1 transition-colors duration-[var(--duration-fast)] cursor-default ${
                saveState === 'saving' ? 'text-[var(--color-accent-9)]'
                  : saveState === 'unsaved' ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-neutral-8)]'
              }`}>
                {saveState === 'saving' && (
                  <span className="inline-block w-3 h-3 mr-1 border-2 border-[var(--color-accent-9)] border-t-transparent rounded-full animate-spin align-middle" />
                )}
                {saveLabel}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="bottom" sideOffset={6} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-neutral-12)] text-white text-xs shadow-[var(--shadow-lg)] z-[var(--z-toast)]">
                {saveState === 'unsaved' ? 'Changes will be saved automatically' : 'Your work is saved continuously'}
                <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <div className="w-px h-5 bg-[var(--border-default)]" />

          {/* Review Before Applying toggle */}
          <div className="flex items-center gap-1.5">
            <Switch.Root
              checked={planMode}
              onCheckedChange={setPlanMode}
              className={`relative inline-flex items-center w-8 h-[18px] rounded-full transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                planMode ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-5)]'
              }`}
            >
              <Switch.Thumb className="block w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[14px] data-[state=unchecked]:translate-x-0.5" />
            </Switch.Root>
            <span className="text-xs font-medium text-[var(--color-neutral-9)] whitespace-nowrap">Review</span>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="flex items-center justify-center w-4 h-4 cursor-pointer" aria-label="What is review mode?">
                  <HelpCircle size={13} className="text-[var(--color-neutral-7)]" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  className="max-w-[220px] px-3 py-2 rounded-[var(--radius-lg)] bg-[var(--color-neutral-12)] text-white text-xs leading-relaxed shadow-[var(--shadow-lg)] z-[var(--z-toast)]"
                >
                  <strong>Review Before Applying:</strong> Changes will be described before being applied, so you can approve or adjust first.
                  <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>

          <div className="w-px h-5 bg-[var(--border-default)]" />

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={restartOnboarding}
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                aria-label="Settings & restart tour"
              >
                <Settings size={20} strokeWidth={1.5} className="text-[var(--color-neutral-9)]" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="bottom" sideOffset={6} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-neutral-12)] text-white text-xs shadow-[var(--shadow-lg)] z-[var(--z-toast)]">
                Settings & restart tour
                <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                  soundEnabled ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-7)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-9)]'
                }`}
                aria-label={soundEnabled ? 'Sound on' : 'Sound off'}
              >
                <Bell size={18} strokeWidth={1.5} />
                {!soundEnabled && (
                  <span className="absolute w-[2px] h-[18px] bg-current rounded-full rotate-45 opacity-50" />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="bottom" sideOffset={6} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-neutral-12)] text-white text-xs shadow-[var(--shadow-lg)] z-[var(--z-toast)]">
                {soundEnabled ? 'Sound notifications on' : 'Sound notifications off'}
                <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <button
            id="publish-button"
            onClick={() => setPublishOpen(true)}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)] transition-colors cursor-pointer group"
          >
            <span className="text-sm font-medium text-white">Publish</span>
            <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 rounded bg-white/20 text-[10px] font-medium text-white/70 group-hover:text-white/90 transition-colors duration-[var(--duration-fast)]">⌘P</kbd>
          </button>
        </div>
        </Tooltip.Provider>
      </header>

      {/* ── Two-panel content ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── Chat panel (left, 400px) ── */}
        <div id="chat-panel" className="flex flex-col w-[400px] shrink-0 h-full relative">
          {completionSignal && <div className="completion-edge-glow" />}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {messages.map((msg, idx) => {
              if (msg.role === 'user') {
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-end pl-6 opacity-0"
                    style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
                  >
                    <div className="bg-[var(--color-accent-1)] rounded-xl p-3 max-w-full">
                      <p className="text-sm leading-5 text-[var(--color-neutral-9)]">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              const assistantIndex = messages.slice(0, idx + 1).filter(m => m.role === 'assistant').length - 1
              const isFirst = assistantIndex === 0

              return (
                <div key={idx} className="flex flex-col gap-3">
                  {/* Completion status */}
                  <button
                    onClick={() => setShowActivityLog(!showActivityLog)}
                    className={`flex items-center gap-2 opacity-0 cursor-pointer group px-2 py-1.5 -mx-2 ${completionSignal && idx === messages.length - 1 ? 'completion-row-highlight' : ''}`}
                    style={{ animation: 'fadeInUp 0.4s var(--ease-default) forwards' }}
                  >
                    <div className="w-[18px] h-[18px] rounded-full bg-[var(--color-success)] flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-neutral-12)]">
                      {isFirst ? 'Completed in 3m 50s' : 'Changes applied'}
                    </span>
                    <span className="text-xs text-[var(--color-neutral-7)]">·</span>
                    <span className="text-xs text-[var(--color-neutral-8)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]">
                      {showActivityLog && idx === messages.length - 1 ? 'Hide details' : 'View details'}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)] ${showActivityLog && idx === messages.length - 1 ? 'rotate-180' : ''}`} />
                  </button>

                  {showActivityLog && idx === messages.length - 1 && (
                    <div
                      className="flex flex-col gap-1 pl-[30px] pb-1 border-l-2 border-[var(--border-default)] ml-[8px] opacity-0"
                      style={{ animation: 'fadeInUp 0.25s var(--ease-default) forwards' }}
                    >
                      {thinkingSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 py-0.5">
                          <Check size={12} strokeWidth={2} className="text-[var(--color-success)] shrink-0" />
                          <span className="text-xs text-[var(--color-neutral-9)]">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Response card */}
                  <div
                    className="border border-[var(--border-default)] rounded-xl p-3 flex flex-col gap-2 opacity-0"
                    style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
                  >
                    <p className="text-sm font-medium text-[var(--color-neutral-12)] leading-5">
                      {isFirst ? "Here's what I created for you:" : msg.content}
                    </p>
                    {isFirst && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 px-0.5">
                          <FileText size={16} className="text-[var(--color-neutral-9)] shrink-0" />
                          <span className="text-sm font-medium text-[var(--color-neutral-12)]">WO-042 — Pump Station 3</span>
                        </div>
                        <div className="flex items-center gap-2 px-0.5">
                          <FileText size={16} className="text-[var(--color-neutral-9)] shrink-0" />
                          <span className="text-sm font-medium text-[var(--color-neutral-12)]">WO-043 — Conveyor Belt 12</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommended steps — only after the first AI response */}
                  {isFirst && (
                    <div
                      className="px-0 py-0 flex flex-col gap-3 opacity-0"
                      style={{ animation: 'fadeInUp 0.5s var(--ease-default) 0.2s forwards' }}
                    >
                      <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--color-neutral-8)]">What would you like to focus on?</h4>
                      <p className="text-sm leading-5 text-[var(--color-neutral-12)]">
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
                            className="flex items-center gap-2.5 p-3 bg-[var(--color-neutral-2)] border border-[var(--color-neutral-5)] rounded-xl text-left hover:bg-[var(--color-neutral-3)] hover:border-[var(--color-accent-5)] transition-all cursor-pointer group opacity-0"
                            style={{ animation: `fadeInUp 0.4s var(--ease-default) ${0.3 + i * 0.08}s forwards` }}
                          >
                            <span className="flex-1 text-sm leading-5 text-[var(--color-neutral-12)]">{step.text}</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <span className="text-[11px] text-[var(--color-neutral-7)] opacity-0 group-hover:opacity-100 transition-opacity">Add this</span>
                              <ArrowRight size={16} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]" />
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-sm leading-5 text-[var(--color-neutral-9)]">
                        You can select multiple, or tell me exactly what you need — I&apos;ll combine them.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Thinking state — always at the bottom when active */}
            {localPhase === 'thinking' && (
              <div
                className="flex flex-col gap-0.5 opacity-0"
                style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.3s forwards' }}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-neutral-8)] mb-1.5">Working on it…</span>
                {thinkingSteps.map((step, i) => {
                  const isComplete = i < thinkingStep
                  const isActive = i === thinkingStep
                  const isPending = i > thinkingStep
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
                        <span className={`text-sm leading-tight ${isActive ? 'font-medium shimmer-text' : isComplete ? 'font-medium text-[var(--color-neutral-12)]' : 'text-[var(--color-neutral-7)]'}`}>
                          {step.label}
                        </span>
                        {isActive && (
                          <span className="text-[11px] text-[var(--color-neutral-8)] mt-0.5">{step.detail}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 pb-6">
            <div
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
                placeholder="Tell me what to change or add…"
                className="w-full resize-none text-sm text-[var(--color-neutral-12)] placeholder:text-[#9CA0A8] outline-none ring-0 focus:outline-none focus:ring-0 bg-[var(--color-neutral-2)] rounded-xl px-3 py-2.5 leading-5 border-none shadow-none appearance-none"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Attach file">
                    <Plus size={16} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
                  </button>
                  <span className="text-[10px] text-[var(--color-neutral-7)] select-none">
                    <kbd className="px-1 py-0.5 rounded bg-[var(--color-neutral-3)] border border-[var(--border-default)] text-[10px] font-medium text-[var(--color-neutral-8)]">↵</kbd> send
                    <span className="mx-1 text-[var(--color-neutral-5)]">·</span>
                    <kbd className="px-1 py-0.5 rounded bg-[var(--color-neutral-3)] border border-[var(--border-default)] text-[10px] font-medium text-[var(--color-neutral-8)]">⇧↵</kbd> new line
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer" aria-label="Voice input">
                    <Mic size={16} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
                  </button>
                  <button
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || localPhase === 'thinking'}
                    className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-[var(--duration-normal)] ${
                      chatInput.trim() && localPhase !== 'thinking' ? 'bg-[var(--color-neutral-12)] hover:bg-[var(--color-neutral-10)] hover:scale-110 cursor-pointer' : 'bg-[rgba(0,0,51,0.06)] cursor-default'
                    }`}
                    aria-label="Send"
                  >
                    <ArrowUp size={16} strokeWidth={1.5} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding tooltip — Chat panel (#11) */}
          {showOnboarding && onboardingStep === 0 && (
            <OnboardingTooltip
              step={onboardingSteps[0]}
              current={1}
              total={3}
              onNext={nextOnboardingStep}
              onDismiss={dismissOnboarding}
              position="right"
            />
          )}
        </div>

        {/* ── Builder panel (right, flexible) ── */}
        <div id="preview-panel" className="flex-1 bg-[var(--color-neutral-2)] border-l border-[var(--border-default)] p-8 flex flex-col gap-4 overflow-auto relative">
          {localPhase === 'thinking' ? (
            <BuilderSkeletons />
          ) : (
            <GeneratedAppPreview prompt={submittedPrompt} />
          )}

          {/* Onboarding tooltip — Preview panel (#11) */}
          {showOnboarding && onboardingStep === 1 && (
            <OnboardingTooltip
              step={onboardingSteps[1]}
              current={2}
              total={3}
              onNext={nextOnboardingStep}
              onDismiss={dismissOnboarding}
              position="left"
            />
          )}
        </div>

        {/* Onboarding tooltip — Publish button (#11) */}
        {showOnboarding && onboardingStep === 2 && (
          <OnboardingTooltip
            step={onboardingSteps[2]}
            current={3}
            total={3}
            onNext={nextOnboardingStep}
            onDismiss={dismissOnboarding}
            position="bottom-right"
          />
        )}
      </div>

      {/* Pre-Publish Confirmation Modal (#15) */}
      <Dialog.Root open={publishOpen} onOpenChange={setPublishOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/50" data-dialog-overlay />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[480px] bg-[var(--surface-primary)] rounded-2xl shadow-[var(--shadow-xl)] p-6 flex flex-col gap-5"
            data-dialog-content
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-accent-1)] shrink-0">
                <Sparkles size={24} className="text-[var(--color-accent-9)]" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-[var(--color-neutral-12)]">Ready to publish?</Dialog.Title>
                <Dialog.Description className="text-sm text-[var(--color-neutral-8)] mt-0.5">Quick review before your team can use it</Dialog.Description>
              </div>
            </div>

            {/* Audience selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--color-neutral-8)]">Who can see this app?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'me', label: 'Only Me', icon: Lock },
                  { value: 'team', label: 'My Team', icon: Users },
                  { value: 'company', label: 'Entire Company', icon: Building2 },
                  { value: 'restricted', label: 'Restricted', icon: Eye },
                ].map(({ value, label, icon: AudIcon }) => (
                  <button
                    key={value}
                    onClick={() => setPublishAudience(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                      publishAudience === value
                        ? 'border-[var(--color-accent-9)] bg-[var(--color-accent-1)] text-[var(--color-accent-9)]'
                        : 'border-[var(--border-default)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]'
                    }`}
                  >
                    <AudIcon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Publish checklist */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--color-neutral-8)]">Checklist</label>
              {[
                { label: 'App has a name', ok: true },
                { label: 'App has a description', ok: true },
                { label: 'App has been previewed on mobile', ok: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 py-1">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full ${item.ok ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'}`}>
                    {item.ok ? <Check size={12} strokeWidth={2.5} /> : <AlertCircle size={12} />}
                  </div>
                  <span className={`text-sm ${item.ok ? 'text-[var(--color-neutral-12)]' : 'text-[var(--color-warning)]'}`}>{item.label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-[var(--color-neutral-7)] leading-relaxed">
              You can unpublish or update this app at any time from Apps I Built.
            </p>

            <div className="flex gap-3 pt-1">
              <Dialog.Close asChild>
                <Button variant="secondary" size="lg" className="flex-1 gap-2">
                  Keep Editing
                  <kbd className="px-1 py-0.5 rounded bg-[var(--color-neutral-4)] text-[10px] font-medium text-[var(--color-neutral-8)]">esc</kbd>
                </Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button variant="primary" size="lg" className="flex-1 gap-2">
                  Publish
                  <kbd className="px-1 py-0.5 rounded bg-white/20 text-[10px] font-medium text-white/70">⌘↵</kbd>
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Onboarding Tooltip (#11)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function OnboardingTooltip({
  step, current, total, onNext, onDismiss, position,
}: {
  step: typeof onboardingSteps[number]
  current: number
  total: number
  onNext: () => void
  onDismiss: () => void
  position: 'right' | 'left' | 'bottom-right'
}) {
  const posClass =
    position === 'right' ? 'absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+12px)]'
    : position === 'left' ? 'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+12px)]'
    : 'absolute right-4 top-[68px]'

  return (
    <div
      className={`${posClass} z-[var(--z-modal)] w-[260px] bg-[var(--color-neutral-12)] text-white rounded-2xl p-4 shadow-[var(--shadow-xl)] opacity-0`}
      style={{ animation: 'fadeInUp 0.4s var(--ease-default) forwards' }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-medium text-[var(--color-neutral-8)]">{current}/{total}</span>
        <button onClick={onDismiss} className="text-[var(--color-neutral-8)] hover:text-white cursor-pointer transition-colors duration-[var(--duration-fast)]" aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
      <h4 className="text-sm font-semibold mb-0.5">{step.title}</h4>
      <p className="text-xs text-[var(--color-neutral-7)] leading-relaxed mb-3">{step.body}</p>
      <div className="flex items-center justify-between">
        <button onClick={onDismiss} className="text-xs text-[var(--color-neutral-8)] hover:text-white cursor-pointer transition-colors duration-[var(--duration-fast)]">
          Don&apos;t show again
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[var(--color-neutral-12)] text-xs font-medium hover:bg-[var(--color-neutral-4)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
        >
          {current === total ? 'Done' : 'Next'}
          {current < total && <ArrowRight size={12} />}
        </button>
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Generated App Preview
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function deriveAppMeta(prompt: string) {
  const lower = prompt.toLowerCase()
  if (lower.includes('photo') || lower.includes('camera') || lower.includes('scan') || lower.includes('capture')) {
    return { name: 'Photo Intake', icon: Camera, headline: 'Take a photo.', headlineAccent: 'Get the job done.', subtitle: 'Turn handwritten notes, job sheets, or sketches into work orders.', kind: 'upload' as const }
  }
  if (lower.includes('dashboard') || lower.includes('kpi') || lower.includes('report') || lower.includes('metric')) {
    return { name: 'Impact Dashboard', icon: BarChart3, headline: 'See everything.', headlineAccent: 'Decide faster.', subtitle: 'Real-time KPIs, trends, and operational insights across all your sites.', kind: 'dashboard' as const }
  }
  if (lower.includes('inspection') || lower.includes('checklist') || lower.includes('safety') || lower.includes('audit')) {
    return { name: 'Smart Inspections', icon: ClipboardList, headline: 'Inspect once.', headlineAccent: 'Fix everything.', subtitle: 'Mobile-friendly checklists with photo evidence and automatic follow-ups.', kind: 'checklist' as const }
  }
  if (lower.includes('inventory') || lower.includes('parts') || lower.includes('stock') || lower.includes('warehouse')) {
    return { name: 'Parts Tracker', icon: Package, headline: 'Track every part.', headlineAccent: 'Never run out.', subtitle: 'Real-time inventory levels, low-stock alerts, and reorder automation.', kind: 'checklist' as const }
  }
  if (lower.includes('work order') || lower.includes('assign') || lower.includes('dispatch') || lower.includes('task')) {
    return { name: 'Work Order Hub', icon: Wrench, headline: 'Assign work.', headlineAccent: 'Track progress.', subtitle: 'Auto-assign tasks based on skills, location, and workload.', kind: 'dashboard' as const }
  }
  if (lower.includes('asset') || lower.includes('lifecycle') || lower.includes('warranty') || lower.includes('depreciation')) {
    return { name: 'Asset Lifecycle', icon: Gauge, headline: 'Know your assets.', headlineAccent: 'Plan ahead.', subtitle: 'Total cost of ownership, depreciation, and replacement planning.', kind: 'dashboard' as const }
  }
  return { name: 'Custom App', icon: Zap, headline: 'Built for you.', headlineAccent: 'Ready to use.', subtitle: 'A custom app built from your description, connected to your UpKeep data.', kind: 'dashboard' as const }
}

function GeneratedAppPreview({ prompt }: { prompt: string }) {
  const app = deriveAppMeta(prompt)
  const AppIcon = app.icon

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] opacity-0"
      style={{ animation: 'fadeInUp 0.5s var(--ease-default) forwards' }}
    >
      {/* App header — dark gradient */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-8 pt-12 pb-10 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(80,80,120,0.25) 0%, rgba(18,18,22,1) 70%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 80%, rgba(140,100,255,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(100,140,255,0.06) 0%, transparent 50%)' }} />
        <div className="relative z-[1] flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <AppIcon size={20} className="text-white/90" />
            </div>
            <span className="text-[13px] font-semibold tracking-[0.15em] uppercase text-white/70">{app.name}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-[28px] font-bold leading-tight text-white/60">
              {app.headline.split(' ').map((word, i) => (
                <span key={i}>{i > 0 ? ' ' : ''}<span className={i === app.headline.split(' ').length - 1 ? 'text-white' : ''}>{word}</span></span>
              ))}
            </h2>
            <h2 className="text-[28px] font-bold leading-tight">
              {app.headlineAccent.split(' ').map((word, i) => (
                <span key={i}>{i > 0 ? ' ' : ''}<span className={i === app.headlineAccent.split(' ').length - 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#818cf8]' : 'text-white/60'}>{word}</span></span>
              ))}
            </h2>
          </div>
          <p className="text-sm text-white/50 max-w-[360px] leading-relaxed">{app.subtitle}</p>
        </div>
      </div>

      {/* App body — content card */}
      <div className="flex-1 flex flex-col items-center px-8 -mt-4 pb-8 relative z-[1]">
        <div className="w-full max-w-[400px] bg-[var(--surface-primary)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border-default)] p-8 flex flex-col items-center gap-5">
          {app.kind === 'upload' ? (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--color-accent-5)] flex items-center justify-center">
                <Camera size={24} className="text-[var(--color-accent-7)]" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-semibold text-[var(--color-neutral-12)]">Choose a file or drag & drop it here</p>
                <p className="text-xs text-[var(--color-neutral-7)]">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
              </div>
              <button className="px-5 py-2 rounded-lg bg-[var(--color-accent-9)] text-white text-sm font-medium hover:bg-[var(--color-accent-10)] transition-colors cursor-pointer">
                Browse File
              </button>
            </>
          ) : app.kind === 'checklist' ? (
            <>
              <div className="w-full flex flex-col gap-3">
                {['Equipment condition check', 'Safety hazards identified', 'PPE compliance verified', 'Area cleanliness confirmed'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-default)]">
                    <div className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 ${i < 2 ? 'bg-[var(--color-accent-9)] border-[var(--color-accent-9)]' : 'border-[var(--color-neutral-6)]'}`}>
                      {i < 2 && <Check size={12} strokeWidth={3} className="text-white" />}
                    </div>
                    <span className={`text-sm ${i < 2 ? 'text-[var(--color-neutral-8)] line-through' : 'text-[var(--color-neutral-12)]'}`}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="w-full flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--color-neutral-7)]">2 of 4 complete</span>
                <div className="w-24 h-1.5 rounded-full bg-[var(--color-neutral-3)]">
                  <div className="w-1/2 h-full rounded-full bg-[var(--color-accent-9)]" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full grid grid-cols-2 gap-3">
                {[
                  { label: 'Open WOs', value: '24', trend: '+3' },
                  { label: 'Completed', value: '148', trend: '+12' },
                  { label: 'Avg Response', value: '2.4h', trend: '-0.3h' },
                  { label: 'Uptime', value: '96.2%', trend: '+1.1%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-default)]">
                    <span className="text-[11px] font-medium text-[var(--color-neutral-8)] uppercase tracking-wider">{kpi.label}</span>
                    <span className="text-lg font-bold text-[var(--color-neutral-12)]">{kpi.value}</span>
                    <span className="text-[11px] font-medium text-[var(--color-accent-9)]">{kpi.trend}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-20 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-default)] flex items-end gap-1 px-3 pb-2 pt-3">
                {[40, 65, 50, 80, 60, 75, 90, 55, 70, 85, 45, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[var(--color-accent-9)] opacity-0"
                    style={{ height: `${h}%`, animation: `fadeInUp 0.3s var(--ease-default) ${0.5 + i * 0.04}s forwards` }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center gap-2 mt-6">
          <div className="w-6 h-2 rounded-full bg-[var(--color-accent-9)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--color-neutral-5)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--color-neutral-5)]" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 py-4 border-t border-[var(--border-default)]">
        <Sparkles size={14} className="text-[var(--color-neutral-7)]" />
        <span className="text-xs text-[var(--color-neutral-7)]">Created by UpKeep Studio — 2026</span>
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Builder Skeleton Placeholders
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function BuilderSkeletons() {
  const skeletons = [
    { width: '100%', height: 72 },
    { width: 376, height: 72 },
    { width: 497, height: 31 },
    { width: 329, height: 16 },
    { width: 329, height: 16 },
    { width: 329, height: 16 },
    { width: 329, height: 16 },
    { width: '100%', height: 136 },
    { width: '100%', height: 136 },
    { width: '100%', height: 136 },
    { width: '100%', height: 136 },
  ]

  return (
    <>
      {skeletons.map((s, i) => (
        <div
          key={i}
          className="skeleton opacity-0"
          style={{
            width: typeof s.width === 'number' ? s.width : s.width,
            height: s.height,
            animation: `fadeInUp 0.4s var(--ease-default) ${0.1 + i * 0.06}s forwards`,
          }}
        />
      ))}
    </>
  )
}
