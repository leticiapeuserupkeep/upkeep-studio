import { CalendarClock, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import type { ComplianceItem } from '@/app/lib/models'

interface ComplianceCountdownProps {
  items: ComplianceItem[]
}

const urgencySeverity = {
  critical: 'danger' as const,
  high: 'warning' as const,
  medium: 'info' as const,
  low: 'neutral' as const,
}

const typeLabels: Record<ComplianceItem['type'], string> = {
  pm: 'PM',
  inspection: 'Inspection',
  certification: 'Certification',
}

export function ComplianceCountdown({ items }: ComplianceCountdownProps) {
  const overdue = items.filter((i) => i.daysLeft < 0).length

  return (
    <Card>
      <CardHeader
        action={overdue > 0 ? <Badge severity="danger" dot>{overdue} overdue</Badge> : undefined}
      >
        <CardTitle>Compliance Countdown</CardTitle>
        <CardDescription>Upcoming PMs, inspections & certifications</CardDescription>
      </CardHeader>

      <div className="px-[var(--space-lg)] pb-[var(--space-lg)] flex flex-col gap-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2.5 px-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-2)] transition-colors group"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] shrink-0 ${
              item.daysLeft < 0
                ? 'bg-[var(--color-error-light)]'
                : item.daysLeft <= 3
                ? 'bg-[var(--color-warning-light)]'
                : 'bg-[var(--color-neutral-3)]'
            }`}>
              <CalendarClock
                size={18}
                className={
                  item.daysLeft < 0
                    ? 'text-[var(--color-error)]'
                    : item.daysLeft <= 3
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-neutral-7)]'
                }
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] truncate">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge severity="neutral">{typeLabels[item.type]}</Badge>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
                  {item.assetName}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-[length:var(--font-size-sm)] font-bold tabular-nums ${
                item.daysLeft < 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-neutral-11)]'
              }`}>
                {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : `${item.daysLeft}d left`}
              </span>
              <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
                {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {item.daysLeft < 0 ? 'Schedule' : 'Assign'}
              <ArrowRight size={12} />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
