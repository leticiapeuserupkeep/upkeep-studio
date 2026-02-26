import { DollarSign, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Progress } from '@/app/components/ui/Progress'
import { InlineAlert } from '@/app/components/ui/InlineAlert'
import type { BudgetLine } from '@/app/lib/models'

interface CostIntelligenceProps {
  lines: Array<BudgetLine & { percentUsed: number; overrun: boolean }>
}

export function CostIntelligence({ lines }: CostIntelligenceProps) {
  const totalBudget = lines.reduce((s, l) => s + l.budget, 0)
  const totalSpent = lines.reduce((s, l) => s + l.spent, 0)
  const totalPct = Math.round((totalSpent / totalBudget) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Intelligence</CardTitle>
        <CardDescription>Budget utilization across categories</CardDescription>
      </CardHeader>

      <div className="px-[var(--space-lg)] pb-[var(--space-lg)]">
        <div className="flex items-baseline gap-3 mb-4">
          <DollarSign size={16} className="text-[var(--color-neutral-7)]" />
          <span className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] tabular-nums">
            ${(totalSpent / 1000).toFixed(0)}k
          </span>
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
            of ${(totalBudget / 1000).toFixed(0)}k budget ({totalPct}%)
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <div key={line.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">
                  {line.category}
                </span>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] tabular-nums">
                  ${(line.spent / 1000).toFixed(1)}k / ${(line.budget / 1000).toFixed(0)}k
                </span>
              </div>
              <Progress
                value={line.spent}
                max={line.budget}
                color={line.percentUsed > 90 ? 'danger' : line.percentUsed > 75 ? 'warning' : 'accent'}
                size="sm"
              />
              {line.alertReason && (
                <div className="mt-1.5">
                  <InlineAlert severity="warning">
                    <AlertCircle size={12} className="inline mr-1" />
                    {line.alertReason}
                  </InlineAlert>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
