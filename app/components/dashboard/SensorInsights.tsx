import { Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Sparkline } from '@/app/components/ui/Sparkline'
import type { SensorReading } from '@/app/lib/models'

interface SensorInsightsProps {
  readings: Array<SensorReading & { severity?: 'warning' | 'critical' }>
}

export function SensorInsights({ readings }: SensorInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Sensor Insights</CardTitle>
      </CardHeader>

      <div className="px-[var(--space-lg)] pb-[var(--space-lg)] flex flex-col gap-3">
        {readings.map((r) => (
          <SensorCard key={`${r.assetId}-${r.metric}`} reading={r} />
        ))}
      </div>
    </Card>
  )
}

function SensorCard({ reading }: { reading: SensorReading & { severity?: 'warning' | 'critical' } }) {
  const isAbove = reading.currentValue > reading.baseline.max
  const sparkColor = reading.anomaly
    ? isAbove
      ? 'var(--color-error)'
      : 'var(--color-warning)'
    : 'var(--color-accent-9)'

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--color-neutral-7)] shrink-0" />
            <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] truncate">
              {reading.assetName}
            </span>
            {reading.anomaly && (
              <Badge severity={reading.severity === 'critical' ? 'danger' : 'warning'} dot>
                {reading.severity === 'critical' ? 'Critical' : 'Warning'}
              </Badge>
            )}
          </div>
          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5 block">
            {reading.metric}
          </span>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className={`text-[length:var(--font-size-lg)] font-bold tabular-nums ${
            reading.anomaly ? 'text-[var(--color-error)]' : 'text-[var(--color-neutral-11)]'
          }`}>
            {reading.currentValue}
          </span>
          <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] ml-0.5">
            {reading.unit}
          </span>
          <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            Range: {reading.baseline.min}–{reading.baseline.max}
          </p>
        </div>
      </div>

      <Sparkline data={reading.history} width={280} height={36} color={sparkColor} className="w-full" />

      <p className="mt-2 text-[length:var(--font-size-xs)] text-[var(--color-neutral-9)] leading-[var(--line-height-relaxed)]">
        {reading.interpretation}
      </p>
    </div>
  )
}
