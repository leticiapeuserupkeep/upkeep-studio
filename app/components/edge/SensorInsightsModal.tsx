'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Modal, ModalBody, ModalHeader } from '@/app/components/ui/Modal'
import type { SensorInsight, SensorInsightTone } from '@/app/lib/models'

/** Simulated generation delay before insight cards animate in (skipped when reduced motion). */
const GENERATING_MS = 2200

const toneStyles: Record<
  SensorInsightTone,
  { bar: string; surface: string }
> = {
  warning: {
    bar: 'bg-[var(--color-warning)]',
    surface:
      'bg-[var(--color-warning-light)] border border-[var(--color-warning-border)]',
  },
  neutral: {
    bar: 'bg-[var(--color-neutral-6)]',
    surface: 'bg-[var(--surface-secondary)] border border-[var(--border-default)]',
  },
  success: {
    bar: 'bg-[var(--color-success)]',
    surface:
      'bg-[var(--color-success-light)] border border-[var(--color-success-border)]',
  },
}

function InsightCard({ insight }: { insight: SensorInsight }) {
  const t = toneStyles[insight.tone]
  return (
    <div
      className={`flex min-w-0 overflow-hidden rounded-[var(--radius-md)] ${t.surface}`}
    >
      <div className={`w-1 shrink-0 self-stretch rounded-l-[2px] ${t.bar}`} aria-hidden />
      <p className="min-w-0 flex-1 px-3 py-2.5 text-[length:var(--font-size-sm)] leading-snug text-[var(--color-neutral-12)]">
        {insight.message}
      </p>
    </div>
  )
}

function InsightCardAnimated({
  insight,
  index,
}: {
  insight: SensorInsight
  index: number
}) {
  return (
    <div
      className="card-animate motion-reduce:opacity-100 motion-reduce:animate-none"
      style={{
        animationDelay: `${index * 75}ms`,
      }}
    >
      <InsightCard insight={insight} />
    </div>
  )
}

/** Spinner + copy only (no skeleton “ghost” cards). */
function InsightsGeneratingState() {
  return (
    <div
      className="flex min-h-[140px] flex-col items-center justify-center gap-4 px-4 py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <Loader2
          size={36}
          className="animate-spin text-[var(--color-accent-9)]"
          aria-hidden
        />
        <Sparkles
          size={15}
          className="absolute -right-0.5 -top-0.5 text-[var(--color-accent-9)] motion-safe:animate-pulse"
          aria-hidden
        />
      </div>
      <div className="max-w-[280px] text-center">
        <p className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-12)]">
          Generating insights
        </p>
        <p className="mt-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
          AI is analyzing telemetry for this sensor…
        </p>
      </div>
    </div>
  )
}

interface SensorInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sensorName: string
  insights: SensorInsight[]
}

export function SensorInsightsModal({
  open,
  onOpenChange,
  sensorName,
  insights,
}: SensorInsightsModalProps) {
  const [insightsReady, setInsightsReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setInsightsReady(false)
      return
    }
    if (insights.length === 0) return

    let cancelled = false
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setInsightsReady(false)
    if (reduced) {
      setInsightsReady(true)
      return
    }

    const id = window.setTimeout(() => {
      if (!cancelled) setInsightsReady(true)
    }, GENERATING_MS)

    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [open, insights.length, sensorName])

  return (
    <Modal open={open} onOpenChange={onOpenChange} maxWidth="520px">
      <ModalHeader title="Insights" description={sensorName} />
      <ModalBody className="py-4">
        {insights.length === 0 ? (
          <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] py-4 text-center">
            No insights available for this sensor yet.
          </p>
        ) : !insightsReady ? (
          <InsightsGeneratingState />
        ) : (
          <div className="flex flex-col gap-2">
            {insights.map((insight, i) => (
              <InsightCardAnimated key={`${insight.message}-${i}`} insight={insight} index={i} />
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}
