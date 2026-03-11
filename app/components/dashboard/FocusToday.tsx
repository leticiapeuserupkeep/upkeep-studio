'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { UrgencyBadge } from '@/app/components/ui/UrgencyBadge'
import { Button } from '@/app/components/ui/Button'
import { Chip } from '@/app/components/ui/Chip'
import type { FocusItem } from '@/app/lib/models'

interface FocusTodayProps {
  items: FocusItem[]
}

const filters = ['All', 'Work Orders', 'Assets', 'Compliance', 'Anomalies'] as const
type FilterType = (typeof filters)[number]

const filterMap: Record<FilterType, FocusItem['type'] | null> = {
  All: null,
  'Work Orders': 'work_order',
  Assets: 'asset_risk',
  Compliance: 'compliance',
  Anomalies: 'anomaly',
}

const categoryIcons: Record<FocusItem['type'], string> = {
  work_order: '🔧',
  asset_risk: '⚠️',
  compliance: '📋',
  anomaly: '📡',
}

export function FocusToday({ items }: FocusTodayProps) {
  const [filter, setFilter] = useState<FilterType>('All')

  const filtered = filterMap[filter]
    ? items.filter((i) => i.type === filterMap[filter])
    : items

  return (
    <Card className="flex flex-col">
      <CardHeader
        action={
          <Badge severity="info" dot>
            <Sparkles size={12} /> AI Prioritized
          </Badge>
        }
      >
        <CardTitle>Focus Today</CardTitle>
      </CardHeader>

      <div className="flex items-center gap-1.5 px-[var(--widget-padding)] pb-[var(--space-sm)]">
        {filters.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[480px] px-[var(--widget-padding)] pb-[var(--widget-padding)]">
        <div className="flex flex-col gap-1">
          {filtered.map((item, idx) => (
            <FocusRow key={item.id} item={item} rank={idx + 1} />
          ))}
        </div>
      </div>
    </Card>
  )
}

function FocusRow({ item, rank }: { item: FocusItem; rank: number }) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)] group">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-neutral-3)] text-[length:var(--font-size-xs)] font-bold text-[var(--color-neutral-8)] shrink-0 mt-0.5">
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--font-size-base)]">{categoryIcons[item.type]}</span>
          <UrgencyBadge urgency={item.urgency} />
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] cursor-help ml-auto tabular-nums">
                  Score: {item.priorityScore}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="max-w-[240px] px-3 py-2 rounded-[var(--radius-lg)] bg-[var(--color-neutral-12)] text-white text-[length:var(--font-size-sm)] shadow-[var(--shadow-lg)] z-[var(--z-toast)]"
                  sideOffset={5}
                >
                  {item.priorityReason}
                  <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        <p className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] mt-1 truncate">
          {item.title}
        </p>
        <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5 truncate">
          {item.description}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)] shrink-0 mt-1"
      >
        {item.cta.label} <ArrowRight size={14} />
      </Button>
    </div>
  )
}
