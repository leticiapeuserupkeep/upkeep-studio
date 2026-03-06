'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  PanelLeft, Plus, Mic, ArrowUp,
  BarChart3, Camera, BadgeCheck, Settings,
  ChevronsDown, RotateCw, AppWindow, Smartphone,
  ArrowRight, FileText, ChevronDown,
} from 'lucide-react'

/* ── Static data ── */

const suggestions = [
  { label: 'Build an inspection app', bg: '#EDF2FE', color: '#3A5BC7', hoverBg: '#D2DEFF' },
  { label: 'Create a maintenance log', bg: '#FEFBE9', color: '#AB6400', hoverBg: '#FEF3C7' },
  { label: 'Generate a safety report', bg: '#F4FBF6', color: '#218358', hoverBg: '#D3F9D8' },
]

const templates = [
  { icon: BarChart3, title: 'Asset Health Score Orchestrator', description: 'A tool for health score orchestration for your assets' },
  { icon: Camera, title: 'Visual Inspection Tracker', description: 'A tool for visual inspection tracking across sites' },
  { icon: BadgeCheck, title: 'Compliance Verification Hub', description: 'A tool for compliance verification and regulatory tracking' },
]

const recommendedSteps = [
  { text: 'Status & Availability — real-time asset status (active/inactive), downtime status (available/not-available)', lines: 3 },
  { text: 'Work Order Metrics — open work orders, past due WOs, WO trends per asset', lines: 3 },
  { text: 'Meter Readings — current meter values, trends, thresholds/alerts', lines: 2 },
  { text: 'Warranty Tracking — warranty expiration dates, expired warranties', lines: 2 },
]

type ViewState = 'prompt' | 'transitioning' | 'building'
type AiPhase = 'thinking' | 'responded'

export default function CreateAppPage() {
  const [view, setView] = useState<ViewState>('prompt')
  const [prompt, setPrompt] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [aiPhase, setAiPhase] = useState<AiPhase>('thinking')
  const [previewTab, setPreviewTab] = useState<'desktop' | 'code'>('desktop')
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!prompt.trim()) return
    setSubmittedPrompt(prompt.trim())
    setPrompt('')
    setView('transitioning')

    setTimeout(() => {
      setView('building')
      setAiPhase('thinking')
      window.dispatchEvent(new CustomEvent('collapse-sidebar'))
      setTimeout(() => setAiPhase('responded'), 3500)
    }, 350)
  }, [prompt])

  const handleSuggestionClick = useCallback((label: string) => {
    setSubmittedPrompt(label)
    setPrompt('')
    setView('transitioning')

    setTimeout(() => {
      setView('building')
      setAiPhase('thinking')
      window.dispatchEvent(new CustomEvent('collapse-sidebar'))
      setTimeout(() => setAiPhase('responded'), 3500)
    }, 350)
  }, [])

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
      fading={view === 'transitioning'}
    />
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Prompt View (initial screen)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PromptView({
  prompt, setPrompt, promptRef, handleSend, handleSuggestionClick, fading,
}: {
  prompt: string
  setPrompt: (v: string) => void
  promptRef: React.RefObject<HTMLTextAreaElement | null>
  handleSend: () => void
  handleSuggestionClick: (label: string) => void
  fading: boolean
}) {
  return (
    <div
      className="flex flex-col flex-1 min-h-0 bg-white transition-all duration-500"
      style={fading ? { opacity: 0, transform: 'scale(0.98)' } : { opacity: 1, transform: 'scale(1)' }}
    >
      <header className="flex items-center h-[60px] border-b border-[#E8E8EC] bg-white shrink-0">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="flex items-center justify-center w-[68px] h-[60px] border-r border-[#E0E1E6] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer shrink-0"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={20} className="text-[#323233]" />
        </button>
        <div className="flex items-center flex-1 px-5">
          <h1 className="text-[20px] font-semibold leading-7 text-[#1C2024]">New App</h1>
        </div>
        <div className="flex items-center gap-6 pr-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer" aria-label="Settings">
            <Settings size={20} strokeWidth={1.5} className="text-[#60646C]" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-6 py-6 gap-[60px] overflow-auto">
        <div className="flex flex-col items-center gap-4 w-full max-w-[1112px] pb-[30px]">
          <h2
            className="text-[28px] font-bold text-black opacity-0"
            style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
            Good Morning, Leti
          </h2>

          <div
            className="w-full max-w-[600px] bg-white border border-[#D9D9E0] rounded-2xl p-3 flex flex-col gap-3 opacity-0 transition-[border-color,box-shadow] duration-350 focus-within:border-[var(--color-accent-8)] focus-within:shadow-[0px_4px_16px_-8px_rgba(59,91,219,0.18),0px_3px_12px_-4px_rgba(59,91,219,0.12),0px_2px_3px_-2px_rgba(0,0,51,0.06)]"
            style={{
              minWidth: 400,
              boxShadow: '0px 4px 16px -8px rgba(0,0,0,0.1), 0px 3px 12px -4px rgba(0,0,0,0.1), 0px 2px 3px -2px rgba(0,0,51,0.06)',
              animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards',
            }}
          >
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
              placeholder="Describe the app you want to build..."
              className="w-full resize-none text-sm text-[#1C2024] placeholder:text-[#60646C] outline-none bg-transparent leading-5"
              rows={1}
            />
            <div className="flex items-center justify-between">
              <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors cursor-pointer" aria-label="Attach file">
                <Plus size={16} strokeWidth={1.5} className="text-[#1C2024]" />
              </button>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors cursor-pointer" aria-label="Voice input">
                  <Mic size={16} strokeWidth={1.5} className="text-[#1C2024]" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-350 ${
                    prompt.trim() ? 'bg-[#3A5BC7] hover:bg-[#2F4AB3] hover:scale-110 cursor-pointer' : 'bg-[rgba(0,0,51,0.06)] cursor-default'
                  }`}
                  aria-label="Send"
                >
                  <ArrowUp size={16} strokeWidth={1.5} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-3 pt-[10px] opacity-0"
            style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards' }}
          >
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestionClick(s.label)}
                className="px-3 py-1 text-sm font-medium rounded-xl transition-all duration-350 cursor-pointer hover:scale-[1.04] active:scale-[0.97]"
                style={{ backgroundColor: s.bg, color: s.color }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = s.hoverBg }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = s.bg }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col gap-4 w-full max-w-[888px] opacity-0"
          style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1C2024]">Feature Templates</h3>
            <button className="flex items-center gap-1 px-1.5 py-1 text-xs font-medium text-[#3A5BC7] rounded hover:bg-[#EDF2FE] transition-colors cursor-pointer">
              Browse all templates
              <ChevronsDown size={16} className="rotate-180 text-[#3A5BC7]" />
            </button>
          </div>
          <div className="flex gap-10">
            {templates.map((t, i) => {
              const Icon = t.icon
              return (
                <button
                  key={t.title}
                  className="flex flex-col items-start flex-1 bg-white border border-[#F0F0F3] rounded-lg p-5 gap-5 text-left opacity-0 hover:-translate-y-1 transition-all duration-350 cursor-pointer"
                  style={{
                    boxShadow: '0px 4px 16px -8px rgba(0,0,0,0.1), 0px 3px 12px -4px rgba(0,0,0,0.1), 0px 2px 3px -2px rgba(0,0,51,0.06)',
                    animation: `fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.4 + i * 0.1}s forwards`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0px 8px 24px -8px rgba(0,0,0,0.15), 0px 6px 16px -4px rgba(0,0,0,0.12), 0px 2px 6px -2px rgba(0,0,51,0.08)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0px 4px 16px -8px rgba(0,0,0,0.1), 0px 3px 12px -4px rgba(0,0,0,0.1), 0px 2px 3px -2px rgba(0,0,51,0.06)' }}
                >
                  <div className="flex items-center justify-center w-full h-[90px] bg-[#F9F9FB] rounded-2xl">
                    <Icon size={50} strokeWidth={1.2} className="text-[#3A5BC7]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-base font-medium text-[#1C2024]">{t.title}</h4>
                    <p className="text-sm text-[#8B8D98] leading-5 line-clamp-2">{t.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Builder View (after prompt submission)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function BuilderView({
  submittedPrompt, aiPhase, chatInput, setChatInput, chatRef, previewTab, setPreviewTab,
}: {
  submittedPrompt: string
  aiPhase: AiPhase
  chatInput: string
  setChatInput: (v: string) => void
  chatRef: React.RefObject<HTMLTextAreaElement | null>
  previewTab: 'desktop' | 'code'
  setPreviewTab: (v: 'desktop' | 'code') => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiPhase])

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-white opacity-0"
      style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
    >
      {/* ── Builder top nav ── */}
      <header className="flex items-center h-[60px] border-b border-[#E8E8EC] bg-white shrink-0 sticky top-0 z-10">
        {/* Left section — back + title (400px aligned with chat panel) */}
        <div className="flex items-center w-[400px] h-[60px] shrink-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="flex items-center justify-center w-[68px] h-[60px] border-r border-[#E0E1E6] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={20} className="text-[#323233]" />
          </button>
          <span className="text-[20px] font-semibold leading-7 text-[#1C2024] pl-4">New App</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#E8E8EC] shrink-0" />

        {/* Center group */}
        <div className="flex items-center flex-1 gap-5">
          {/* Device preview icons */}
          <div className="flex items-center gap-2 pl-5">
            <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer" aria-label="Refresh">
              <RotateCw size={20} strokeWidth={1.5} className="text-[#60646C]" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer" aria-label="Desktop preview">
              <AppWindow size={20} strokeWidth={1.5} className="text-[#60646C]" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer" aria-label="Mobile preview">
              <Smartphone size={20} strokeWidth={1.5} className="text-[#60646C]" />
            </button>
          </div>

          {/* Segmented control — centered */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center h-8 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, rgba(0,0,51,0.06) 0%, rgba(0,0,51,0.06) 100%), #FFFFFF' }}>
              <button
                onClick={() => setPreviewTab('desktop')}
                className={`flex items-center justify-center px-4 h-8 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                  previewTab === 'desktop'
                    ? 'bg-white border border-[#E0E1E6] text-[#1C2024] shadow-sm'
                    : 'text-[#1C2024]'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewTab('code')}
                className={`flex items-center justify-center px-4 h-8 text-sm rounded-lg transition-all duration-300 cursor-pointer ${
                  previewTab === 'code'
                    ? 'bg-white border border-[#E0E1E6] text-[#1C2024] font-medium shadow-sm'
                    : 'text-[#1C2024]'
                }`}
              >
                Code
              </button>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 pr-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer" aria-label="Settings">
            <Settings size={20} strokeWidth={1.5} className="text-[#60646C]" />
          </button>
          <button className="flex items-center justify-center h-10 px-3 rounded-xl bg-[#F0F0F3] hover:bg-[#E8E8EC] transition-colors cursor-pointer">
            <span className="text-base font-medium text-[#8B8D98]">Publish</span>
          </button>
        </div>
      </header>

      {/* ── Two-panel content ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Chat panel (left, 400px) ── */}
        <div className="flex flex-col w-[400px] shrink-0 h-full">
          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* User bubble */}
            <div
              className="flex flex-col items-end pl-6 opacity-0"
              style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards' }}
            >
              <div className="bg-[#E1E9FF] rounded-xl p-3 max-w-full">
                <p className="text-sm leading-5 text-[#60646C]">{submittedPrompt}</p>
              </div>
            </div>

            {/* AI Thinking indicator */}
            {aiPhase === 'thinking' && (
              <div
                className="flex items-center gap-2 opacity-0"
                style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards' }}
              >
                <div className="w-4 h-4 rounded-full bg-[#FF3C4D] shrink-0" style={{ animation: 'ai-pulse 1.5s ease-in-out infinite' }} />
                <span className="text-sm font-medium shimmer-text">Thinking...</span>
              </div>
            )}

            {/* AI Response */}
            {aiPhase === 'responded' && (
              <>
                {/* Duration bar */}
                <div
                  className="flex items-center gap-2 opacity-0"
                  style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
                >
                  <FileText size={16} className="text-[#60646C] shrink-0" />
                  <span className="text-sm font-medium text-[#60646C]">Duration: 3m 50s</span>
                  <ChevronDown size={16} className="text-[#60646C]" />
                </div>

                {/* Work orders block */}
                <div
                  className="border border-[#E0E1E6] rounded-xl p-3 flex flex-col gap-2 opacity-0"
                  style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards' }}
                >
                  <p className="text-sm font-medium text-[#1C2024] leading-5">
                    Your work orders are all set.
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-0.5">
                      <FileText size={16} className="text-[#60646C] shrink-0" />
                      <span className="text-sm font-medium text-[#1C2024]">WO-042 — Pump Station 3</span>
                    </div>
                    <div className="flex items-center gap-2 px-0.5">
                      <FileText size={16} className="text-[#60646C] shrink-0" />
                      <span className="text-sm font-medium text-[#1C2024]">WO-043 — Conveyor Belt 12</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recommended steps */}
            {aiPhase === 'responded' && (
              <div
                className="px-0 py-0 flex flex-col gap-3 opacity-0"
                style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards' }}
              >
                <h4 className="text-xs font-medium uppercase tracking-wider text-black">Recommended steps</h4>
                <p className="text-sm leading-5 text-black">
                  What would you like your Asset Health Monitor to show? Here are potential focus areas based on UpKeep&apos;s asset data:
                </p>
                <div className="flex flex-col gap-3">
                  {recommendedSteps.map((step, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2.5 p-3 bg-[#F9F9FB] border border-[#D9D9E0] rounded-xl text-left hover:bg-[#F0F0F3] hover:border-[#B9BBC6] transition-colors cursor-pointer group opacity-0"
                      style={{ animation: `fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + i * 0.08}s forwards` }}
                    >
                      <span className="flex-1 text-sm leading-5 text-black">{step.text}</span>
                      <ArrowRight size={18} className="text-[#B9BBC6] shrink-0 group-hover:text-[#60646C] transition-colors" />
                    </button>
                  ))}
                </div>
                <p className="text-sm leading-5 text-black">
                  Which fields/metrics are most important to you? Select from above or describe your specific use case. I can also combine multiple focus areas if needed.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input bar */}
          <div className="px-6 pb-6">
            <div
              className="w-full bg-white border border-[#D9D9E0] rounded-2xl p-3 flex flex-col gap-3 transition-[border-color,box-shadow] duration-350 focus-within:border-[var(--color-accent-8)] focus-within:shadow-[0px_4px_16px_-8px_rgba(59,91,219,0.18),0px_3px_12px_-4px_rgba(59,91,219,0.12),0px_2px_3px_-2px_rgba(0,0,51,0.06)]"
              style={{ boxShadow: '0px 4px 16px -8px rgba(0,0,0,0.1), 0px 3px 12px -4px rgba(0,0,0,0.1), 0px 2px 3px -2px rgba(0,0,51,0.06)' }}
            >
              <textarea
                ref={chatRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow up..."
                className="w-full resize-none text-sm text-[#1C2024] placeholder:text-[#60646C] outline-none bg-transparent leading-5"
                rows={1}
              />
              <div className="flex items-center justify-between">
                <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors cursor-pointer" aria-label="Attach file">
                  <Plus size={16} strokeWidth={1.5} className="text-[#1C2024]" />
                </button>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-neutral-4)] transition-colors cursor-pointer" aria-label="Voice input">
                    <Mic size={16} strokeWidth={1.5} className="text-[#1C2024]" />
                  </button>
                  <button
                    disabled={!chatInput.trim()}
                    className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-350 ${
                      chatInput.trim() ? 'bg-[#1C2024] hover:bg-[#323233] hover:scale-110 cursor-pointer' : 'bg-[rgba(0,0,51,0.06)] cursor-default'
                    }`}
                    aria-label="Send"
                  >
                    <ArrowUp size={16} strokeWidth={1.5} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Builder panel (right, flexible) ── */}
        <div className="flex-1 bg-[#F9F9FB] border-l border-[#E0E1E6] p-8 flex flex-col gap-4 overflow-auto">
          <BuilderSkeletons />
        </div>
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
            animation: `fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.06}s forwards`,
          }}
        />
      ))}
    </>
  )
}
