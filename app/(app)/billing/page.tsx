'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { PanelLeft, ChevronDown, Download, Clock, Calendar } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Card, CardBody } from '@/app/components/ui/Card'
import * as ProgressPrimitive from '@radix-ui/react-progress'

/* ── Mock data ── */

const PLAN = { name: 'Studio Pro', credits: 1000, price: 50 }
const USED_CREDITS = 890

const invoices = [
  { month: 'February, 2026', id: 'inv-feb-2026' },
  { month: 'January, 2026', id: 'inv-jan-2026' },
  { month: 'December, 2026', id: 'inv-dec-2026' },
]

function generateDailyUsage(year: number, month: number): number[] {
  const days = new Date(year, month + 1, 0).getDate()
  const seed = year * 100 + month
  return Array.from({ length: days }, (_, i) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233280) * 10000
    return Math.round((x - Math.floor(x)) * 85 + 5)
  })
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/* ── Usage Bar Chart ── */

function UsageBarChart({ data, animate }: { data: number[]; animate: boolean }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxVal = 100
  const yTicks = [0, 20, 40, 60, 80, 100]

  return (
    <div className="relative select-none" style={{ height: 220 }}>
      <div className="absolute inset-0 flex">
        {/* Y-axis */}
        <div
          className="flex flex-col justify-between shrink-0"
          style={{ width: 36, paddingTop: 4, paddingBottom: 32 }}
        >
          {[...yTicks].reverse().map((tick) => (
            <span
              key={tick}
              className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] text-right pr-2 leading-none"
            >
              {tick}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          <div className="absolute" style={{ left: 0, right: 0, top: 4, bottom: 32 }}>
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="absolute w-full border-t border-[var(--color-neutral-3)]"
                style={{ bottom: `${(tick / maxVal) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div
              className="absolute inset-0 flex items-end"
              style={{ gap: '3px', paddingLeft: '2px', paddingRight: '2px' }}
            >
              {data.map((val, i) => {
                const pct = (Math.min(val, maxVal) / maxVal) * 100
                const isHovered = hoveredIndex === i

                return (
                  <div
                    key={i}
                    className="flex-1 relative flex flex-col items-center"
                    style={{ height: '100%', minWidth: 0 }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex-1 w-full flex items-end justify-center">
                      <div
                        className="relative w-full cursor-pointer"
                        style={{
                          height: animate ? `${Math.max(pct, val > 0 ? 1.5 : 0)}%` : '0%',
                          maxWidth: '18px',
                          borderRadius: '3px 3px 1px 1px',
                          backgroundColor: isHovered ? 'var(--color-accent-9)' : 'var(--color-accent-7)',
                          opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                          transition: animate
                            ? `height 0.8s var(--ease-default) ${i * 20}ms, background-color var(--duration-fast) var(--ease-default), opacity var(--duration-fast) var(--ease-default)`
                            : `background-color var(--duration-fast) var(--ease-default), opacity var(--duration-fast) var(--ease-default)`,
                        }}
                      >
                        {isHovered && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-[var(--color-neutral-12)] text-white shadow-[var(--shadow-lg)] pointer-events-none z-10"
                            style={{ top: '-14px', minWidth: '28px', height: '22px', padding: '0 6px' }}
                          >
                            <span className="text-[length:var(--font-size-xs)] font-semibold whitespace-nowrap leading-none">
                              {val}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* X-axis label */}
                    {(i % 1 === 0) && (
                      <span
                        className="absolute text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] whitespace-nowrap leading-none"
                        style={{ bottom: '-22px' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Month Selector ── */

function MonthSelector({
  month, year, onChange,
}: {
  month: number
  year: number
  onChange: (m: number, y: number) => void
}) {
  const [open, setOpen] = useState(false)

  const options = useMemo(() => {
    const result: { month: number; year: number; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      result.push({ month: d.getMonth(), year: d.getFullYear(), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` })
    }
    return result
  }, [])

  const current = `${MONTHS[month].slice(0, 3)} ${year}`

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
      >
        <Calendar size={14} className="text-[var(--color-neutral-8)]" />
        {current}
        <ChevronDown size={14} className={`text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)] ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-[var(--z-dropdown)] min-w-[180px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 overflow-hidden"
            style={{ animation: 'dropdown-in var(--duration-normal) var(--ease-default) forwards' }}
          >
            {options.map((opt) => {
              const selected = opt.month === month && opt.year === year
              return (
                <button
                  key={`${opt.year}-${opt.month}`}
                  onClick={() => { onChange(opt.month, opt.year); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-[length:var(--font-size-sm)] transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                    selected
                      ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium'
                      : 'text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Invoice Row ── */

function InvoiceRow({ label, delay }: { label: string; delay: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center justify-between py-3 px-1 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer group opacity-0"
      style={{ animation: `fadeInUp 0.4s var(--ease-default) ${delay}ms forwards` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={`text-[length:var(--font-size-base)] font-medium transition-colors duration-[var(--duration-fast)] ${
        hovered ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-12)]'
      }`}>
        {label}
      </span>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-all duration-[var(--duration-fast)] cursor-pointer"
        aria-label={`Download ${label} invoice`}
        onClick={(e) => { e.stopPropagation() }}
      >
        <Download size={16} />
      </button>
    </div>
  )
}

/* ── More Invoices Button ── */

function MoreInvoicesButton() {
  return (
    <div className="flex items-center justify-center py-3 opacity-0" style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.5s forwards' }}>
      <button
        className="flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
        aria-label="Show more invoices"
      >
        <span className="text-[length:var(--font-size-xl)] leading-none tracking-wider">···</span>
      </button>
    </div>
  )
}

/* ── Main Page ── */

export default function BillingPage() {
  const [mounted, setMounted] = useState(false)
  const [chartAnimate, setChartAnimate] = useState(false)
  const [progressAnimate, setProgressAnimate] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const dailyData = useMemo(() => generateDailyUsage(selectedYear, selectedMonth), [selectedYear, selectedMonth])

  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setProgressAnimate(true), 400)
    const t2 = setTimeout(() => setChartAnimate(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleMonthChange = useCallback((m: number, y: number) => {
    setChartAnimate(false)
    setSelectedMonth(m)
    setSelectedYear(y)
    setTimeout(() => setChartAnimate(true), 50)
  }, [])

  const usagePct = Math.round((USED_CREDITS / PLAN.credits) * 100)
  const resetDate = 'Sep 12, 2026'

  if (!mounted) return null

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Header */}
      <header
        className="flex items-center gap-3 h-[52px] px-[var(--space-lg)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] shrink-0 sticky top-0 z-[var(--z-sticky)] opacity-0"
        style={{ animation: 'fadeInUp 0.35s var(--ease-default) forwards' }}
      >
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={20} className="text-[color:var(--color-neutral-7)]" />
        </button>
        <h1 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">
          Billing & Usage
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-[var(--space-2xl)] py-[var(--space-3xl)]">

          {/* ── Usage Section ── */}
          <section
            className="mb-[var(--space-3xl)] opacity-0"
            style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.05s forwards' }}
          >
            <h2 className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] mb-1">
              Usage
            </h2>
            <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)] mb-[var(--space-xl)]">
              Monitor your AI credit consumption
            </p>

            {/* Usage Summary Card */}
            <Card className="mb-[var(--space-xl)] opacity-0" style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.15s forwards' }}>
              <CardBody className="!py-[var(--space-xl)]">
                {/* Top row */}
                <div className="flex items-start justify-between mb-[var(--space-md)]">
                  <div>
                    <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-neutral-8)] mb-[var(--space-xs)] block">
                      This month usage
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[length:var(--font-size-3xl)] font-bold text-[var(--color-neutral-12)] leading-tight">
                        {USED_CREDITS}
                      </span>
                      <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)]">
                        / {PLAN.credits} credits ({PLAN.name})
                      </span>
                    </div>
                  </div>
                  <Button variant="primary" size="md">
                    Upgrade Plan
                  </Button>
                </div>

                {/* Progress bar */}
                <ProgressPrimitive.Root
                  value={progressAnimate ? USED_CREDITS : 0}
                  max={PLAN.credits}
                  className="relative overflow-hidden rounded-full bg-[var(--color-neutral-3)] h-2.5 mb-[var(--space-sm)]"
                >
                  <ProgressPrimitive.Indicator
                    className="h-full rounded-full bg-[var(--color-error)]"
                    style={{
                      width: progressAnimate ? `${usagePct}%` : '0%',
                      transition: 'width 1s var(--ease-default)',
                    }}
                  />
                </ProgressPrimitive.Root>

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                    <Clock size={13} className="shrink-0" />
                    <span>Resets in 2 days · {resetDate}</span>
                  </div>
                  <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                    {usagePct}% Used
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Daily Usage Chart Card */}
            <Card className="opacity-0" style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.25s forwards' }}>
              <div className="flex items-center justify-between px-[var(--widget-padding)] pt-[var(--widget-padding)] pb-[var(--space-sm)]">
                <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-neutral-8)]">
                  Daily usage
                </span>
                <MonthSelector
                  month={selectedMonth}
                  year={selectedYear}
                  onChange={handleMonthChange}
                />
              </div>
              <CardBody>
                <UsageBarChart data={dailyData} animate={chartAnimate} />
              </CardBody>
            </Card>
          </section>

          {/* ── Billing Section ── */}
          <section
            className="opacity-0"
            style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.35s forwards' }}
          >
            <h2 className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] mb-1">
              Billing
            </h2>
            <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)] mb-[var(--space-xl)]">
              Manage your plan
            </p>

            {/* Plan + Payment cards */}
            <div className="grid grid-cols-2 gap-[var(--space-lg)] mb-[var(--space-xl)]">
              {/* Current Plan */}
              <Card className="opacity-0" style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.4s forwards' }}>
                <CardBody className="!py-[var(--space-xl)] flex flex-col gap-[var(--space-md)]">
                  <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-neutral-8)]">
                    Current Plan
                  </span>
                  <div>
                    <p className="text-[length:var(--font-size-lg)] font-bold text-[var(--color-neutral-12)] leading-tight">
                      {PLAN.name}
                    </p>
                    <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] mt-0.5">
                      {PLAN.credits} credits / Month ${PLAN.price}.00
                    </p>
                  </div>
                  <div>
                    <Button variant="primary" size="md">
                      Upgrade Plan
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Payment Method */}
              <Card className="opacity-0" style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.45s forwards' }}>
                <CardBody className="!py-[var(--space-xl)] flex flex-col gap-[var(--space-md)]">
                  <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-neutral-8)]">
                    Payment Method
                  </span>
                  <div>
                    <p className="text-[length:var(--font-size-lg)] font-bold text-[var(--color-neutral-12)] leading-tight">
                      ****9273
                    </p>
                    <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] mt-0.5">
                      Next billing date Nov 12, 2024
                    </p>
                  </div>
                  <div>
                    <Button variant="secondary" size="md">
                      Update Payment Method
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Invoices */}
            <Card className="mb-[var(--space-xl)] opacity-0" style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.5s forwards' }}>
              <CardBody className="!py-[var(--space-lg)]">
                <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-neutral-8)] block mb-[var(--space-sm)]">
                  Invoices
                </span>
                <div>
                  {invoices.map((inv, i) => (
                    <InvoiceRow key={inv.id} label={inv.month} delay={520 + i * 60} />
                  ))}
                </div>
                <MoreInvoicesButton />
              </CardBody>
            </Card>

            {/* Cancel Subscription */}
            <Card className="opacity-0" style={{ animation: 'fadeInUp 0.45s var(--ease-default) 0.6s forwards' }}>
              <CardBody className="!py-[var(--space-lg)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-neutral-8)] block mb-1">
                      Cancel Subscription
                    </span>
                    <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                      Cancel your Studio Subscription
                    </p>
                  </div>
                  <Button variant="danger" size="md">
                    Cancel Subscription
                  </Button>
                </div>
              </CardBody>
            </Card>
          </section>

          <div className="h-[var(--space-3xl)]" />
        </div>
      </main>
    </div>
  )
}
