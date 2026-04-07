'use client'

import { useState, useEffect } from 'react'
import {
  ClipboardList, Shield, AlertTriangle, Package, Clock,
  MessageCircle, ArrowRight, Zap, Check,
} from 'lucide-react'
import { ProgressDots } from './ProgressDots'

/* ── Reveal stages (staggered) ── */

const STAGES = [
  { id: 'header', delay: 0 },
  { id: 'pulse', delay: 300 },
  { id: 'aimates', delay: 800 },
  { id: 'attention', delay: 1200 },
  { id: 'bottom', delay: 1600 },
] as const

type StageId = (typeof STAGES)[number]['id']

interface RevealScreenProps {
  onFinish: () => void
}

export function RevealScreen({ onFinish }: RevealScreenProps) {
  const [revealed, setRevealed] = useState<Set<StageId>>(new Set())

  useEffect(() => {
    STAGES.forEach(({ id, delay }) => {
      setTimeout(() => setRevealed(prev => new Set([...prev, id])), delay)
    })
    const autoFinish = setTimeout(onFinish, 2400)
    return () => clearTimeout(autoFinish)
  }, [onFinish])

  const isRevealed = (id: StageId) => revealed.has(id)

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-canvas)]">
      {/* Header */}
      <div className={`px-8 pt-8 pb-4 transition-all duration-500 ${isRevealed('header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[var(--color-neutral-12)]">
            Your Command Center is ready!
          </h2>
          <span className="text-[13px] font-medium text-[var(--color-neutral-8)] bg-[var(--color-neutral-2)] px-2.5 py-1 rounded-full">
            6 / 6
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-[960px] mx-auto space-y-5">

          {/* System Pulse — skeleton → real */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Open work orders', value: '47', icon: <ClipboardList size={16} className="text-[var(--color-accent-9)]" />, trend: '↓ 8 from yesterday', trendColor: 'text-[var(--color-success)]', delay: 300 },
              { label: 'SLA compliance', value: '94%', icon: <Shield size={16} className="text-[var(--color-success)]" />, trend: 'Target: 95%', trendColor: 'text-[var(--color-neutral-8)]', delay: 450 },
              { label: 'Overdue PMs', value: '6', icon: <AlertTriangle size={16} className="text-[var(--color-warning)]" />, trend: '2 critical', trendColor: 'text-[var(--color-warning)]', delay: 600 },
              { label: 'Low stock alerts', value: '3', icon: <Package size={16} className="text-[var(--color-neutral-8)]" />, trend: 'Auto-reorder: 2', trendColor: 'text-[var(--color-neutral-8)]', delay: 750 },
            ].map((card) => (
              <RevealCard key={card.label} delay={card.delay} isRevealed={isRevealed('pulse')}>
                <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[var(--color-neutral-8)]">{card.label}</span>
                    {card.icon}
                  </div>
                  <span className="text-[22px] font-semibold text-[var(--color-neutral-12)]">{card.value}</span>
                  <span className={`text-[11px] font-medium ${card.trendColor}`}>{card.trend}</span>
                </div>
              </RevealCard>
            ))}
          </div>

          {/* 3-column grid */}
          <div className="grid gap-5" style={{ gridTemplateColumns: '1.3fr 1fr 0.9fr' }}>
            {/* Attention Queue */}
            <div className={`flex flex-col gap-2.5 transition-all duration-500 ${isRevealed('attention') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">Needs your attention</h3>
              {[
                { type: 'sla' as const, ref: 'WO-4521', title: 'HVAC unit failure — Building A', time: '2h left' },
                { type: 'anomaly' as const, ref: 'Asset #1847', title: 'Compressor vibration pattern', time: undefined },
                { type: 'approval' as const, ref: 'PO-892', title: 'Part reorder — $1,240', time: undefined },
              ].map((item, i) => {
                const borderColor = item.type === 'sla' ? 'border-l-red-500' : item.type === 'anomaly' ? 'border-l-amber-500' : 'border-l-blue-500'
                return (
                  <div
                    key={item.ref}
                    className={`rounded-[var(--radius-lg)] border border-[var(--border-default)] border-l-[3px] ${borderColor} bg-[var(--surface-primary)] p-3 transition-all duration-400`}
                    style={{
                      transitionDelay: isRevealed('attention') ? `${i * 150}ms` : '0ms',
                      opacity: isRevealed('attention') ? 1 : 0,
                      transform: isRevealed('attention') ? 'translateY(0)' : 'translateY(8px)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-[var(--color-neutral-8)]">{item.ref}</span>
                      {item.time && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
                          <Clock size={10} /> {item.time}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-[var(--color-neutral-12)]">{item.title}</p>
                  </div>
                )
              })}
            </div>

            {/* Agents */}
            <div className={`flex flex-col gap-2.5 transition-all duration-500 ${isRevealed('aimates') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">Agents</h3>
              {[
                { name: 'Sofia', skill: 'Scheduling', photo: 'https://i.pravatar.cc/150?u=sofia-chen-upkeep', act: 'Assigned 14 WOs' },
                { name: 'Elena', skill: 'Inventory', photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep', act: 'Reordered 3 parts' },
                { name: 'Marcus', skill: 'Triage', photo: 'https://i.pravatar.cc/150?u=marcus-johnson-upkeep', act: '8 requests sorted' },
              ].map((mate, i) => (
                <div
                  key={mate.name}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3"
                  style={{
                    transitionDelay: isRevealed('aimates') ? `${i * 100}ms` : '0ms',
                    opacity: isRevealed('aimates') ? 1 : 0,
                    transform: isRevealed('aimates') ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.4s ease-out',
                  }}
                >
                  <div className="relative shrink-0">
                    <img src={mate.photo} alt={mate.name} className="w-9 h-9 rounded-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[var(--color-success)] border border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium text-[var(--color-neutral-12)]">{mate.name}</span>
                      <Check size={12} className="text-[var(--color-success)]" />
                    </div>
                    <span className="text-[11px] text-[var(--color-neutral-8)]">{mate.act}</span>
                  </div>
                  <MessageCircle size={14} className="text-[var(--color-neutral-6)] shrink-0" />
                </div>
              ))}

              {/* Handled today mini */}
              <div className={`rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3 transition-all duration-500 ${isRevealed('bottom') ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[12px] font-semibold text-[var(--color-neutral-12)] mb-2">Handled today</p>
                <p className="text-[12px] text-[var(--color-neutral-8)]"><strong>25 actions</strong> completed by your AI team</p>
                <button className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-[var(--color-accent-9)] cursor-pointer hover:text-[var(--color-accent-10)]">
                  View activity log <ArrowRight size={10} />
                </button>
              </div>
            </div>

            {/* Workflows */}
            <div className={`flex flex-col gap-2.5 transition-all duration-500 ${isRevealed('bottom') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">Scheduled workflows</h3>
              {[
                { title: 'Weekly PM digest', time: 'Today 5pm', isToday: true },
                { title: 'Inventory check', time: 'Mon 8am', isToday: false },
                { title: 'SLA compliance report', time: 'Daily 6am', isToday: false },
              ].map((wf) => (
                <div key={wf.title} className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3">
                  <Zap size={13} className="text-[var(--color-neutral-7)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-[var(--color-neutral-12)]">{wf.title}</p>
                    <p className={`text-[11px] ${wf.isToday ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-8)]'}`}>{wf.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center pt-2">
            <ProgressDots currentPhase="reveal" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Reveal Card wrapper ── */

function RevealCard({ children, delay: delayMs, isRevealed }: { children: React.ReactNode; delay: number; isRevealed: boolean }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isRevealed) {
      const timer = setTimeout(() => setShow(true), delayMs)
      return () => clearTimeout(timer)
    }
  }, [isRevealed, delayMs])

  if (!show) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
        <div className="h-3 w-20 rounded bg-[var(--color-neutral-3)] mb-2 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--color-neutral-3)] via-[var(--color-neutral-5)] to-[var(--color-neutral-3)] bg-[length:200%_100%]" />
        <div className="h-6 w-12 rounded bg-[var(--color-neutral-3)] mb-1 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--color-neutral-3)] via-[var(--color-neutral-5)] to-[var(--color-neutral-3)] bg-[length:200%_100%]" />
        <div className="h-3 w-24 rounded bg-[var(--color-neutral-3)] animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--color-neutral-3)] via-[var(--color-neutral-5)] to-[var(--color-neutral-3)] bg-[length:200%_100%]" />
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}>
      {children}
    </div>
  )
}
