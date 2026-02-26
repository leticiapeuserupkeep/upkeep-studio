import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Progress } from '@/app/components/ui/Progress'
import type { Asset } from '@/app/lib/models'

interface PredictedFailuresProps {
  assets: Array<Asset & { riskLabel: string }>
}

export function PredictedFailures({ assets }: PredictedFailuresProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicted Failures (7–14 days)</CardTitle>
        <CardDescription>{assets.length} assets at risk</CardDescription>
      </CardHeader>

      <div className="px-[var(--space-lg)] pb-[var(--space-lg)] flex flex-col gap-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border-default)] p-3 hover:shadow-[var(--shadow-sm)] transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={14}
                    className={
                      asset.failureProbability > 0.7
                        ? 'text-[var(--color-error)]'
                        : asset.failureProbability > 0.5
                        ? 'text-[var(--color-warning)]'
                        : 'text-[var(--color-neutral-7)]'
                    }
                  />
                  <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                    {asset.name}
                  </span>
                  <Badge severity={asset.failureProbability > 0.7 ? 'danger' : asset.failureProbability > 0.5 ? 'warning' : 'info'}>
                    {asset.riskLabel}
                  </Badge>
                </div>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5 block">
                  {asset.siteName} • {asset.category}
                </span>
              </div>
              <span className="text-[length:var(--font-size-xl)] font-bold text-[var(--color-neutral-12)] tabular-nums">
                {Math.round(asset.failureProbability * 100)}%
              </span>
            </div>

            <Progress
              value={asset.failureProbability * 100}
              color={asset.failureProbability > 0.7 ? 'danger' : asset.failureProbability > 0.5 ? 'warning' : 'accent'}
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

            <div className="flex items-center justify-between">
              <span className="text-[length:var(--font-size-xs)] text-[var(--color-accent-9)] font-medium">
                {asset.recommendedAction}
              </span>
              <Button variant="ghost" size="sm">
                Action <ArrowRight size={12} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
