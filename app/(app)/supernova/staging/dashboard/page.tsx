'use client'

import type { ComponentProps } from 'react'
import Link from 'next/link'
import { Bot, Zap, Coins, Users } from 'lucide-react'
import { StagingPageHeader } from '@/app/components/supernova-staging/StagingPageHeader'
import { KPI } from '@/app/components/ui/KPI'
import { Card, CardBody, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { MiniBarChart } from '@/app/components/ui/MiniBarChart'

/** Staging dashboard metrics: no subtitle row; `subtitle` is not accepted (type-safe). */
function StagingMetricKPI(props: Omit<ComponentProps<typeof KPI>, 'subtitle' | 'subtitleIcon' | 'compact'>) {
  return <KPI {...props} compact />
}

/** Mock 30-day token usage — last day highlighted (orange) in chart */
const DAILY_TOKEN_USAGE = Array.from({ length: 30 }, (_, i) => {
  const base = 12 + Math.sin(i * 0.35) * 8 + (i % 5) * 2
  if (i === 29) return Math.round(base + 28)
  return Math.max(4, Math.round(base + (i % 3)))
})

const COST_BY_ACTION = [
  { label: 'Searches', shortLabel: 'Searches', amount: 340, barColor: 'var(--color-accent-12)' },
  {
    label: 'Work order creation',
    shortLabel: 'Work order crea…',
    amount: 220,
    barColor: 'var(--color-accent-9)',
  },
  {
    label: 'Analysis / reports',
    shortLabel: 'Analysis / reports',
    amount: 178,
    barColor: 'var(--color-accent-7)',
  },
  {
    label: 'Notifications',
    shortLabel: 'Notifications',
    amount: 117,
    barColor: 'var(--color-accent-5)',
  },
] as const

const maxActionCost = Math.max(...COST_BY_ACTION.map((a) => a.amount))

export default function SuperNovaStagingDashboardPage() {
  return (
    <div className="w-full flex flex-col min-h-0">
      <StagingPageHeader title="Dashboard" />

      <div className="w-full px-[var(--dashboard-padding-x)] py-[var(--dashboard-padding-y)] flex flex-col gap-[var(--space-xl)]">
        {/* Row 1 — summary metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[var(--space-md)]">
          <StagingMetricKPI
            label="AGENTS ONLINE"
            value="1/1"
            icon={<Users size={20} strokeWidth={2} aria-hidden />}
          />
          <StagingMetricKPI
            label="ACTIVE WORKFLOWS"
            value={0}
            icon={<Zap size={20} strokeWidth={2} aria-hidden />}
          />
          <StagingMetricKPI
            label="WORKFLOW RUNS TODAY"
            value={0}
            icon={<Bot size={20} strokeWidth={2} aria-hidden />}
          />
          <StagingMetricKPI
            label={'Monthly\ntoken usage'}
            value={0}
            icon={<Coins size={20} strokeWidth={2} aria-hidden />}
          />
        </div>

        {/* Row 2 — System + Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-md)]">
          <Card>
            <CardHeader className="border-b border-[var(--border-subtle)]">
              <CardTitle>System</CardTitle>
            </CardHeader>
            <CardBody className="pt-[var(--space-sm)]">
              <dl className="flex flex-col gap-[var(--space-sm)] text-[length:var(--font-size-sm)]">
                <div className="flex items-center justify-between gap-[var(--space-md)]">
                  <dt className="text-[var(--color-neutral-8)]">Agents</dt>
                  <dd className="font-medium text-[var(--color-neutral-12)] tabular-nums">1 configured</dd>
                </div>
                <div className="flex items-center justify-between gap-[var(--space-md)]">
                  <dt className="text-[var(--color-neutral-8)]">Last data sync</dt>
                  <dd className="font-medium text-[var(--color-neutral-11)]">—</dd>
                </div>
                <div className="flex items-center justify-between gap-[var(--space-md)]">
                  <dt className="text-[var(--color-neutral-8)]">Data sources</dt>
                  <dd className="font-medium text-[var(--color-neutral-12)] tabular-nums">0 connected</dd>
                </div>
                <div className="flex items-center justify-between gap-[var(--space-md)]">
                  <dt className="text-[var(--color-neutral-8)]">Gateway</dt>
                  <dd className="font-semibold text-[var(--color-success)]">Running</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-b border-[var(--border-subtle)]">
              <CardTitle>$ Usage this month</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-[var(--space-md)] pt-[var(--space-md)]">
              <div className="flex flex-wrap gap-x-[var(--space-2xl)] gap-y-[var(--space-xs)] text-[length:var(--font-size-sm)]">
                <p>
                  <span className="text-[var(--color-neutral-8)]">Total tokens used: </span>
                  <span className="font-semibold text-[var(--color-neutral-12)] tabular-nums">0</span>
                </p>
                <p>
                  <span className="text-[var(--color-neutral-8)]">Total cost: </span>
                  <span className="font-semibold text-[var(--color-neutral-12)] tabular-nums">$0</span>
                </p>
              </div>
              <div>
                <p className="text-[length:var(--font-size-xs)] font-semibold tracking-wide text-[var(--color-neutral-7)] uppercase mb-[var(--space-xs)]">
                  Daily token usage (30 days)
                </p>
                <div className="w-full pb-1">
                  <MiniBarChart
                    data={DAILY_TOKEN_USAGE}
                    width={420}
                    height={112}
                    color="var(--color-accent-5)"
                    highlightIndex={29}
                    highlightColor="var(--color-accent-11)"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Row 3 — By agent + Cost by action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-md)]">
          <Card>
            <CardHeader className="border-b border-[var(--border-subtle)]">
              <CardTitle>By Agent</CardTitle>
            </CardHeader>
            <CardBody className="pt-[var(--space-md)]">
              <div className="flex items-center justify-between gap-[var(--space-md)] text-[length:var(--font-size-sm)]">
                <div className="flex items-center gap-[var(--space-xs)] min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-success)]"
                    aria-hidden
                  />
                  <span className="font-medium text-[var(--color-neutral-12)] truncate">Demo</span>
                </div>
                <div className="flex items-center gap-[var(--space-xl)] shrink-0 tabular-nums">
                  <span className="text-[var(--color-neutral-11)]">0</span>
                  <span className="text-[var(--color-neutral-11)]">$0</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-b border-[var(--border-subtle)]">
              <CardTitle>Cost by Action Type</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-[var(--space-sm)] pt-[var(--space-md)]">
              {COST_BY_ACTION.map((row) => (
                <div key={row.label} className="flex flex-col gap-[var(--space-2xs)]">
                  <div className="flex items-center justify-between gap-[var(--space-xs)] text-[length:var(--font-size-sm)]">
                    <span
                      className="text-[var(--color-neutral-11)] truncate"
                      title={row.label}
                    >
                      {row.shortLabel}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-[var(--color-neutral-12)]">
                      ${row.amount}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full bg-[var(--color-neutral-3)] overflow-hidden"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full min-w-[4px]"
                      style={{
                        width: `${(row.amount / maxActionCost) * 100}%`,
                        backgroundColor: row.barColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Row 4 — Live activity */}
        <Card>
          <CardHeader
            className="border-b border-[var(--border-subtle)]"
            action={
              <Link
                href="/supernova/staging/audit"
                className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:underline"
              >
                Full feed →
              </Link>
            }
          >
            <CardTitle>Live Activity</CardTitle>
          </CardHeader>
          <CardBody className="pt-[var(--space-md)]">
            <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] leading-relaxed min-w-0">
              <span className="font-semibold text-[var(--color-neutral-12)]">Demo</span> checked system status
              and reported all clear.
            </p>
            <div className="mt-[var(--space-sm)] flex flex-wrap items-center gap-[var(--space-xs)]">
              <span className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--color-accent-1)] px-2 py-0.5 text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-accent-11)]">
                UpKeep
              </span>
              <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] tabular-nums">
                1 min ago
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
