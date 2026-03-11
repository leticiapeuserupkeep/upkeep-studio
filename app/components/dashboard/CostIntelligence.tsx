import { DollarSign, Sparkles, Wrench, Zap, Package, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { DonutChart } from '@/app/components/ui/DonutChart'
import type { CostResult } from '@/app/lib/models'

interface CostIntelligenceProps {
  lines: CostResult[]
}

const SEGMENT_COLORS = [
  'var(--color-accent-9)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-accent-11)',
]

const CATEGORY_ICONS: Record<string, typeof DollarSign> = {
  'Parts & Materials': Package,
  Labor: Wrench,
  Contractors: Shield,
  Energy: Zap,
}

export function CostIntelligence({ lines }: CostIntelligenceProps) {
  const totalBudget = lines.reduce((s, l) => s + l.budget, 0)
  const totalSpent = lines.reduce((s, l) => s + l.spent, 0)
  const totalPct = Math.round((totalSpent / totalBudget) * 100)
  const overrunCount = lines.filter((l) => l.overrun).length

  const segments = lines.map((line, i) => ({
    value: line.spent,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    label: line.category,
  }))

  return (
    <Card>
      <CardHeader
        action={
          overrunCount > 0 ? (
            <Badge severity="warning" dot>{overrunCount} over budget</Badge>
          ) : (
            <Badge severity="success" dot>On track</Badge>
          )
        }
      >
        <CardTitle>Cost Intelligence</CardTitle>
        <CardDescription>${(totalBudget / 1000).toFixed(1)}k Total Budget</CardDescription>
      </CardHeader>

      <div className="px-[var(--widget-padding)] pb-[var(--widget-padding)]">
        <div className="flex items-center gap-8 mb-6">
          <div className="flex flex-col">
            <span className="text-[length:var(--font-size-3xl)] font-bold text-[var(--color-neutral-12)] tabular-nums leading-none">
              ${(totalSpent / 1000).toFixed(1)}k
            </span>
            <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] mt-1">
              Total Spent
            </span>
          </div>

          <DonutChart
            segments={segments}
            size={100}
            strokeWidth={10}
            centerValue={`${totalPct}%`}
            centerLabel="Used"
          />
        </div>

        <div className="flex flex-col gap-4">
          {lines.map((line, i) => {
            const Icon = CATEGORY_ICONS[line.category] || DollarSign
            const segColor = SEGMENT_COLORS[i % SEGMENT_COLORS.length]

            return (
              <div key={line.id} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${segColor} 12%, transparent)` }}
                >
                  <Icon size={18} style={{ color: segColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-12)]">
                      {line.category}
                    </span>
                    {line.overrun && (
                      <Sparkles size={12} className="text-[var(--color-warning)]" />
                    )}
                  </div>
                  <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
                    {line.explanation}
                  </span>
                </div>

                <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)] tabular-nums shrink-0">
                  ${(line.spent / 1000).toFixed(1)}k
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
