'use client'

import type { MeterInfo } from '@/app/lib/models'
import { Progress } from '@/app/components/ui/Progress'

interface MeterGaugeProps {
  meter: MeterInfo
  className?: string
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function MeterGauge({ meter, className = '' }: MeterGaugeProps) {
  const progress = (meter.currentReading / meter.nextServiceAt) * 100
  const remaining = meter.nextServiceAt - meter.currentReading
  const progressColor = progress >= 90 ? 'danger' : progress >= 75 ? 'warning' : 'accent'

  return (
    <div className={`grid grid-cols-2 gap-[var(--space-md)] ${className}`}>
      {/* Current Reading */}
      <div className="col-span-2 rounded-[var(--radius-lg)] bg-[var(--color-neutral-2)] p-[var(--space-md)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">
            Service Progress
          </span>
          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
            {formatNumber(remaining)} {meter.unit} remaining
          </span>
        </div>
        <Progress value={meter.currentReading} max={meter.nextServiceAt} color={progressColor} size="md" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            {formatNumber(meter.currentReading)} {meter.unit}
          </span>
          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            {formatNumber(meter.nextServiceAt)} {meter.unit}
          </span>
        </div>
      </div>

      {/* Stat cells */}
      <MetricCell label="Current Reading" value={`${formatNumber(meter.currentReading)} ${meter.unit}`} />
      <MetricCell label="Next Service At" value={`${formatNumber(meter.nextServiceAt)} ${meter.unit}`} />
      <MetricCell label="Total Cycles" value={formatNumber(meter.totalCycles)} />
      <MetricCell label="Avg Cycles / Day" value={formatNumber(meter.avgCyclesPerDay)} />
      <MetricCell
        label="Last Reset"
        value={new Date(meter.lastResetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      />
      <MetricCell label="Hours to Service" value={formatNumber(remaining)} highlight={remaining < 500} />
    </div>
  )
}

function MetricCell({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[var(--radius-lg)] bg-[var(--color-neutral-2)] p-[var(--space-sm)]">
      <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] font-medium">{label}</span>
      <span className={`text-[length:var(--font-size-base)] font-semibold leading-tight ${highlight ? 'text-[var(--color-warning)]' : 'text-[var(--color-neutral-11)]'}`}>
        {value}
      </span>
    </div>
  )
}
