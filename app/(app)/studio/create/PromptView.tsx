'use client'

import { useState } from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import * as Dialog from '@radix-ui/react-dialog'
import {
  PanelLeft, Plus, Mic, ArrowUp,
  BarChart3, Camera,
  ChevronsDown, LayoutGrid, Medal, Briefcase, CircleDot,
  RefreshCcw, ShieldCheck, PhoneCall,
  X, Sparkles,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { useRotatingPlaceholder } from '@/app/lib/hooks/use-rotating-placeholder'

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

export type SelectedTemplate = typeof templates[number] | null

interface PromptViewProps {
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
}

export function PromptView({
  prompt, setPrompt, promptRef, handleSend, handleSuggestionClick,
  handleTemplateSelect, handleStartTemplate, selectedTemplate, setSelectedTemplate, fading,
}: PromptViewProps) {
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
      </header>

      <main className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden px-6 py-6 relative" style={{ isolation: 'isolate' }}>
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
              className="w-full bg-[var(--surface-primary)] border border-[var(--color-neutral-6)] rounded-2xl p-3 flex flex-col gap-0 opacity-0 transition-[border-color,box-shadow] duration-[var(--duration-normal)] focus-within:border-[var(--color-accent-8)] focus-within:shadow-[0_0_0_3px_rgba(59,91,219,0.12),0px_4px_16px_-8px_rgba(59,91,219,0.18),0px_3px_12px_-4px_rgba(59,91,219,0.12)]"
              style={{
                minWidth: 400,
                boxShadow: '0px 4px 20px -6px rgba(0,0,0,0.12), 0px 3px 12px -4px rgba(0,0,0,0.08), 0px 2px 4px -2px rgba(0,0,51,0.06)',
                animation: 'fadeInUp 0.6s var(--ease-default) 0.1s forwards',
              }}
            >
              <div className="relative bg-[var(--color-neutral-2)] rounded-xl">
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    const el = e.target
                    el.style.height = 'auto'
                    const maxH = 20 * 6 + 20
                    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                  }}
                  placeholder=""
                  className="w-full resize-none text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] outline-none ring-0 focus:outline-none focus:ring-0 bg-transparent rounded-xl px-3 py-2.5 leading-5 relative z-[1] border-none shadow-none appearance-none overflow-auto"
                  rows={3}
                  style={{ maxHeight: 20 * 6 + 20 }}
                />
                {!prompt && (
                  <span
                    className="absolute top-2.5 left-3 text-[length:var(--font-size-base)] text-[var(--color-neutral-7)] pointer-events-none leading-5 transition-opacity duration-[var(--duration-fast)]"
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
                    <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] select-none">
                      <kbd className="px-1 py-0.5 rounded bg-[var(--color-neutral-3)] border border-[var(--border-default)] text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-8)]">↵</kbd> to send
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
                    className="px-4 py-1.5 text-[length:var(--font-size-base)] font-medium rounded-full border transition-all duration-[var(--duration-fast)] cursor-pointer hover:scale-[1.04] active:scale-[0.97]"
                    style={{ borderColor: s.borderColor, color: s.color, backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = s.hoverBg }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Describe what you need in your own words — or pick a template below to start faster</p>
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
                  <button className="flex items-center gap-1 px-1.5 py-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] rounded hover:bg-[rgba(59,91,219,0.08)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
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
                {templates.slice(3).map((t, i) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.title}
                      onClick={() => handleTemplateSelect(t)}
                      className={`flex flex-col items-start bg-[var(--surface-primary)] border rounded-2xl p-5 gap-3 text-left transition-all duration-[var(--duration-fast)] cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 opacity-0 ${
                        selectedTemplate?.title === t.title ? 'border-[var(--color-accent-9)] ring-1 ring-[var(--color-accent-9)]' : 'border-[var(--border-default)]'
                      }`}
                      style={templatesOpen ? { animation: `fadeInUp 0.35s var(--ease-default) ${i * 0.05}s forwards` } : { opacity: 1 }}
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
                className={`pb-2 text-[length:var(--font-size-base)] font-medium border-b-2 transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                  templateTab === 'official' ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)]' : 'border-transparent text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-9)]'
                }`}
              >
                UpKeep Official
              </button>
              <button
                onClick={() => setTemplateTab('mine')}
                className={`pb-2 text-[length:var(--font-size-base)] font-medium border-b-2 transition-colors duration-[var(--duration-fast)] cursor-pointer ${
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
                    className={`px-2.5 py-1 text-[length:var(--font-size-sm)] font-medium rounded-full transition-colors duration-[var(--duration-fast)] cursor-pointer ${
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
                  <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)]">You haven&apos;t created any templates yet.</p>
                  <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">Templates you build and save will appear here.</p>
                </div>
              ) : (
                <>
                  {/* Most Used as Starting Point */}
                  {categoryFilter === 'All' && roleFilter === 'All Roles' && complexityFilter === 'All Levels' && (
                    <div className="mb-6">
                      <h3 className="text-[length:var(--font-size-sm)] font-medium uppercase tracking-wider text-[var(--color-neutral-8)] mb-3">Most Used as Starting Point</h3>
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
                                <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)] truncate">{t.title}</p>
                                <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] truncate">{t.description}</p>
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
                        <span className="text-[length:var(--font-size-sm)] font-medium uppercase tracking-wider text-[var(--color-neutral-8)]">{category}</span>
                        <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">({items.length})</span>
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
                                className="flex flex-col items-start bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 gap-2 text-left hover:shadow-[var(--shadow-sm)] hover:border-[var(--color-accent-5)] transition-all duration-[var(--duration-fast)] cursor-pointer"
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-1)] shrink-0">
                                    <Icon size={16} strokeWidth={1.5} className="text-[var(--color-accent-9)]" />
                                  </div>
                                  <span className="text-[length:var(--font-size-sm)] px-1.5 py-0.5 rounded bg-[var(--color-neutral-3)] text-[var(--color-neutral-8)] capitalize">{t.complexity}</span>
                                </div>
                                <h4 className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">{t.title}</h4>
                                <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] leading-relaxed line-clamp-2">{t.description}</p>
                              </button>
                            )
                          })}
                        </div>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  ))}

                  {filteredTemplates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                      <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)]">No templates match your filters.</p>
                      <button
                        onClick={() => { setRoleFilter('All Roles'); setComplexityFilter('All Levels'); setCategoryFilter('All') }}
                        className="text-[length:var(--font-size-sm)] text-[var(--color-accent-9)] hover:underline cursor-pointer"
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
