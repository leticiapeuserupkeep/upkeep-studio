import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Progress } from '@/app/components/ui/Progress'
import { ProgressRing } from '@/app/components/ui/ProgressRing'
import type { FailureResult } from '@/app/lib/models'

interface PredictedFailuresProps {
  assets: FailureResult[]
}

function riskColor(probability: number) {
  if (probability > 0.7) return { severity: 'danger' as const, progress: 'danger' as const, ring: 'var(--color-error)' }
  if (probability > 0.5) return { severity: 'warning' as const, progress: 'warning' as const, ring: 'var(--color-warning)' }
  return { severity: 'info' as const, progress: 'accent' as const, ring: 'var(--color-accent-9)' }
}

export function PredictedFailures({ assets }: PredictedFailuresProps) {
  return (
    <Card>
      <CardHeader
        action={
          <Badge severity="info" dot>
            <Sparkles size={12} /> AI Predicted
          </Badge>
        }
      >
        <CardTitle>Predicted Failures</CardTitle>
        <CardDescription>{assets.length} assets at risk (7–14 day window)</CardDescription>
      </CardHeader>

      <div className="px-[var(--widget-padding)] pb-[var(--widget-padding)] flex flex-col gap-3">
        {assets.map((asset) => {
          const colors = riskColor(asset.failureProbability)
          return (
            <div
              key={asset.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] p-3 hover:shadow-[var(--shadow-sm)] transition-shadow duration-[var(--duration-fast)]"
            >
              <div className="flex items-start gap-3 mb-2">
                <ProgressRing
                  value={asset.healthScore}
                  size={38}
                  strokeWidth={3}
                  fillColor={colors.ring}
                  label={`Health: ${asset.healthScore}%`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                      {asset.name}
                    </span>
                    <Badge severity={colors.severity}>{asset.riskLabel}</Badge>
                  </div>
                  <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5 block">
                    {asset.siteName} · {asset.category}
                  </span>
                </div>
                <span className="text-[length:var(--font-size-xl)] font-bold text-[var(--color-neutral-12)] tabular-nums shrink-0">
                  {Math.round(asset.failureProbability * 100)}%
                </span>
              </div>

              <Progress
                value={asset.failureProbability * 100}
                color={colors.progress}
                size="sm"
                className="mb-2"
              />

              <div className="flex flex-wrap gap-1 mb-2">
                {asset.failureDrivers.map((d, i) => (
                  <span key={i} className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] bg-[var(--color-neutral-3)] px-2 py-0.5 rounded-full">
                    {d}
                  </span>
                ))}
              </div>

              <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-9)] leading-[var(--line-height-relaxed)] mb-2">
                {asset.explanation}
              </p>

              <div className="flex items-center justify-end">
                <Button variant="ghost" size="sm">
                  Action <ArrowRight size={12} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
