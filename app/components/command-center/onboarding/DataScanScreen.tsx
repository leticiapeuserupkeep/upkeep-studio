'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Check, AlertTriangle, Loader2, Lightbulb } from 'lucide-react'
import { ProgressDots } from './ProgressDots'
import type { ScanStatus, ScanCategory } from '@/app/lib/hooks/use-onboarding-state'

/* ── Scan configuration ── */

interface ScanConfig {
  key: ScanCategory
  label: string
  mockCount: number
  insight: string
}

const scanOrder: ScanConfig[] = [
  { key: 'workOrders', label: 'Work Orders', mockCount: 2847, insight: '2 years of maintenance history' },
  { key: 'assets', label: 'Assets', mockCount: 342, insight: 'Across 3 locations' },
  { key: 'inventory', label: 'Inventory', mockCount: 1247, insight: '47 parts below reorder threshold' },
  { key: 'preventiveMaintenance', label: 'Preventive Maintenance', mockCount: 156, insight: '12 active PM schedules' },
  { key: 'vendors', label: 'Vendors & Providers', mockCount: 28, insight: '5 preferred vendors identified' },
  { key: 'teamMembers', label: 'Team Members', mockCount: 24, insight: '12 technicians, 4 supervisors' },
]

const tips = [
  'Your work order history will help your AI team understand maintenance patterns.',
  'Asset data lets AIMates predict failures before they happen.',
  'Inventory patterns help auto-manage reorder points.',
  'PM schedules help optimize technician workload.',
  'Vendor history enables smarter procurement suggestions.',
  'Team data personalizes assignments and schedules.',
]

/* ── Props ── */

interface DataScanScreenProps {
  scanState: Record<ScanCategory, ScanStatus>
  onUpdateScan: (category: ScanCategory, update: Partial<ScanStatus>) => void
  onComplete: () => void
}

/* ── Component ── */

export function DataScanScreen({ scanState, onUpdateScan, onComplete }: DataScanScreenProps) {
  const [activeTip, setActiveTip] = useState(0)
  const startedRef = useRef(false)

  const runScans = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true

    for (let i = 0; i < scanOrder.length; i++) {
      const config = scanOrder[i]

      if (scanState[config.key].status === 'complete') {
        continue
      }

      onUpdateScan(config.key, { status: 'scanning' })
      setActiveTip(i)

      await delay(1500 + Math.random() * 800)

      onUpdateScan(config.key, {
        status: 'complete',
        count: config.mockCount,
        insight: config.insight,
      })
    }

    await delay(600)
    onComplete()
  }, [scanState, onUpdateScan, onComplete])

  useEffect(() => {
    const allDone = scanOrder.every(c => scanState[c.key].status === 'complete')
    if (!allDone) {
      runScans()
    }
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
            Setting up your Command Center
          </h2>
          <span className="text-[13px] font-medium text-[var(--color-neutral-8)] bg-[var(--color-neutral-2)] px-2.5 py-1 rounded-full">
            2 / 6
          </span>
        </div>

        <p
          className="text-[14px] text-[var(--color-neutral-8)] mb-6 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
        >
          We&apos;re scanning your UpKeep data to prepare your AI team.
        </p>

        {/* Scan rows */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden mb-5 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.15s forwards' }}
        >
          {scanOrder.map((config, i) => (
            <ScanRow
              key={config.key}
              label={config.label}
              status={scanState[config.key]}
              isLast={i === scanOrder.length - 1}
            />
          ))}
        </div>

        {/* Tip */}
        <div
          className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-accent-3)] bg-[var(--color-accent-1)] p-4 mb-8 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.2s forwards' }}
        >
          <Lightbulb size={16} className="text-[var(--color-accent-9)] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[var(--color-neutral-9)] leading-relaxed transition-all duration-300">
            {tips[activeTip]}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center">
          <ProgressDots currentPhase="data-scan" />
        </div>
      </div>
    </div>
  )
}

/* ── Scan Row ── */

function ScanRow({ label, status, isLast }: { label: string; status: ScanStatus; isLast: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 ${!isLast ? 'border-b border-[var(--border-subtle)]' : ''}`}>
      {/* Status icon */}
      <div className="shrink-0 w-5 flex items-center justify-center">
        {status.status === 'complete' && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-success)] text-white" style={{ animation: 'checkPop 0.3s ease-out' }}>
            <Check size={12} strokeWidth={3} />
          </span>
        )}
        {status.status === 'scanning' && (
          <Loader2 size={18} className="text-[var(--color-accent-9)] animate-spin" />
        )}
        {status.status === 'issue' && (
          <AlertTriangle size={18} className="text-[var(--color-warning)]" />
        )}
        {status.status === 'pending' && (
          <span className="w-4 h-4 rounded-full border-2 border-[var(--color-neutral-4)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-[14px] font-medium ${
            status.status === 'pending' ? 'text-[var(--color-neutral-7)]' : 'text-[var(--color-neutral-12)]'
          }`}>
            {label}
          </span>
          <span className={`text-[13px] font-medium ${
            status.status === 'complete' ? 'text-[var(--color-neutral-11)]'
            : status.status === 'scanning' ? 'text-[var(--color-accent-9)]'
            : 'text-[var(--color-neutral-7)]'
          }`}>
            {status.status === 'complete' && `${status.count?.toLocaleString()} found`}
            {status.status === 'scanning' && 'Scanning…'}
            {status.status === 'pending' && 'Pending'}
          </span>
        </div>

        {/* Insight or shimmer */}
        {status.status === 'complete' && status.insight && (
          <p className="text-[12px] text-[var(--color-neutral-8)] mt-1">&ldquo;{status.insight}&rdquo;</p>
        )}
        {status.status === 'scanning' && (
          <div className="mt-2 h-3 rounded-full overflow-hidden bg-[var(--color-neutral-3)]">
            <div className="h-full w-full bg-gradient-to-r from-[var(--color-neutral-3)] via-[var(--color-neutral-5)] to-[var(--color-neutral-3)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Helpers ── */

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
