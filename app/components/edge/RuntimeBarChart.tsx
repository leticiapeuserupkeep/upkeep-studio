'use client'

import { useState, useMemo } from 'react'
import type { DailyRuntime } from '@/app/lib/models'

interface RuntimeBarChartProps {
  data: DailyRuntime[]
  height?: number
  className?: string
}

interface ChartBar {
  label: string
  hours: number
  cycles: number
  dateRange: string
}

function bucketData(data: DailyRuntime[]): ChartBar[] {
  if (data.length <= 7) {
    return data.map((d) => {
      const dt = new Date(d.date + 'T00:00:00')
      return {
        label: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: d.hours,
        cycles: d.cycles,
        dateRange: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }
    })
  }

  if (data.length <= 14) {
    return data.map((d) => {
      const dt = new Date(d.date + 'T00:00:00')
      return {
        label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: d.hours,
        cycles: d.cycles,
        dateRange: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }
    })
  }

  const bucketSize = 3
  const bars: ChartBar[] = []
  for (let i = 0; i < data.length; i += bucketSize) {
    const chunk = data.slice(i, i + bucketSize)
    const totalHours = Math.round(chunk.reduce((s, d) => s + d.hours, 0) * 10) / 10
    const totalCycles = chunk.reduce((s, d) => s + d.cycles, 0)
    const firstDate = new Date(chunk[0].date + 'T00:00:00')
    const lastDate = new Date(chunk[chunk.length - 1].date + 'T00:00:00')
    const label = firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const rangeEnd = lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    bars.push({
      label,
      hours: totalHours,
      cycles: totalCycles,
      dateRange: chunk.length > 1 ? `${label} – ${rangeEnd}` : label,
    })
  }
  return bars
}

export function RuntimeBarChart({ data, height = 260, className = '' }: RuntimeBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const bars = useMemo(() => bucketData(data), [data])

  const maxVal = Math.max(...bars.map((b) => b.hours), 1)
  const ceilMax = Math.ceil(maxVal / 6) * 6 || 6
  const yTickCount = 5
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => Math.round((ceilMax / yTickCount) * i))

  const chartPaddingTop = 16
  const chartPaddingBottom = 40
  const yAxisWidth = 44
  const chartAreaHeight = height - chartPaddingTop - chartPaddingBottom

  const barCount = bars.length
  const gap = barCount <= 7 ? '12px' : barCount <= 10 ? '10px' : '8px'
  const pad = barCount <= 7 ? '12px' : '6px'
  const maxBarWidth = barCount <= 7 ? '44px' : barCount <= 10 ? '36px' : '28px'
  const radius = barCount <= 10 ? '6px 6px 2px 2px' : '4px 4px 1px 1px'

  return (
    <div className={`relative select-none ${className}`} style={{ height }}>
      <div className="absolute inset-0 flex">
        {/* Y-axis */}
        <div
          className="flex flex-col justify-between shrink-0"
          style={{ width: yAxisWidth, paddingTop: chartPaddingTop, paddingBottom: chartPaddingBottom }}
        >
          {[...yTicks].reverse().map((tick) => (
            <span
              key={tick}
              className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] text-right pr-3 leading-none"
            >
              {tick}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Horizontal grid lines */}
          {yTicks.map((tick) => {
            const pct = ceilMax > 0 ? (tick / ceilMax) * 100 : 0
            return (
              <div
                key={tick}
                className="absolute w-full border-t border-[var(--color-neutral-3)]"
                style={{
                  bottom: `${chartPaddingBottom + (pct / 100) * chartAreaHeight}px`,
                }}
              />
            )
          })}

          {/* Bars container */}
          <div
            className="absolute flex items-end"
            style={{
              left: 0,
              right: 0,
              top: chartPaddingTop,
              bottom: chartPaddingBottom,
              gap,
              paddingLeft: pad,
              paddingRight: pad,
            }}
          >
            {bars.map((bar, i) => {
              const barPct = ceilMax > 0 ? (bar.hours / ceilMax) * 100 : 0
              const isHovered = hoveredIndex === i

              return (
                <div
                  key={i}
                  className="flex-1 relative flex flex-col items-center"
                  style={{ height: '100%', minWidth: 0 }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Bar */}
                  <div className="flex-1 w-full flex items-end justify-center">
                    <div
                      className="relative w-full transition-opacity duration-150 cursor-pointer"
                      style={{
                        height: `${Math.max(barPct, bar.hours > 0 ? 1.5 : 0)}%`,
                        maxWidth: maxBarWidth,
                        borderRadius: radius,
                        backgroundColor: 'var(--color-accent-7)',
                        opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                      }}
                    >
                      {isHovered && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-[var(--color-neutral-12)] text-white shadow-[var(--shadow-lg)] pointer-events-none z-10"
                          style={{
                            top: '-14px',
                            minWidth: '32px',
                            height: '26px',
                            padding: '0 8px',
                          }}
                        >
                          <span className="text-[length:var(--font-size-xs)] font-semibold whitespace-nowrap leading-none">
                            {bar.hours}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* X-axis label */}
                  <span
                    className="absolute text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] whitespace-nowrap leading-none"
                    style={{ bottom: `-${chartPaddingBottom - 8}px` }}
                  >
                    {bar.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
