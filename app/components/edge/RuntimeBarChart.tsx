'use client'

import { useState } from 'react'
import type { DailyRuntime } from '@/app/lib/models'

interface RuntimeBarChartProps {
  data: DailyRuntime[]
  height?: number
  className?: string
  onDayClick?: (day: DailyRuntime) => void
  selectedDate?: string
}

function formatLabel(date: string, total: number): string {
  const dt = new Date(date + 'T00:00:00')
  if (total <= 7) return dt.toLocaleDateString('en-US', { weekday: 'short' })
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function shouldShowLabel(index: number, total: number): boolean {
  if (total <= 14) return true
  if (total <= 21) return index % 2 === 0
  return index % 3 === 0
}

export function RuntimeBarChart({ data, height = 260, className = '', onDayClick, selectedDate }: RuntimeBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const ceilMax = 24
  const yTicks = [0, 6, 12, 18, 24]

  const chartPaddingTop = 16
  const chartPaddingBottom = 40
  const yAxisWidth = 44

  const barCount = data.length
  const gap = barCount <= 7 ? '12px' : barCount <= 14 ? '8px' : '4px'
  const pad = barCount <= 7 ? '12px' : '4px'
  const maxBarWidth = barCount <= 7 ? '44px' : barCount <= 14 ? '28px' : '18px'
  const radius = barCount <= 14 ? '4px 4px 2px 2px' : '3px 3px 1px 1px'

  return (
    <div className={`relative select-none ${className}`} style={{ height: '100%', minHeight: height }}>
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
              {tick}h
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          <div
            className="absolute"
            style={{ left: 0, right: 0, top: chartPaddingTop, bottom: chartPaddingBottom }}
          >
            {/* Horizontal grid lines */}
            {yTicks.map((tick) => {
              const pct = (tick / ceilMax) * 100
              return (
                <div
                  key={tick}
                  className="absolute w-full border-t border-[var(--color-neutral-3)]"
                  style={{ bottom: `${pct}%` }}
                />
              )
            })}

            {/* Bars container */}
            <div
              className="absolute inset-0 flex items-end"
              style={{ gap, paddingLeft: pad, paddingRight: pad }}
            >
            {data.map((day, i) => {
              const barPct = (Math.min(day.hours, 24) / ceilMax) * 100
              const isHovered = hoveredIndex === i
              const isSelected = selectedDate === day.date
              const label = formatLabel(day.date, barCount)

              return (
                <div
                  key={day.date}
                  className="flex-1 relative flex flex-col items-center"
                  style={{ height: '100%', minWidth: 0 }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onDayClick?.(day)}
                >
                  {/* Bar */}
                  <div className="flex-1 w-full flex items-end justify-center">
                    <div
                      className="relative w-full transition-all duration-300 cursor-pointer"
                      style={{
                        height: `${Math.max(barPct, day.hours > 0 ? 1.5 : 0)}%`,
                        maxWidth: maxBarWidth,
                        borderRadius: radius,
                        backgroundColor: isSelected ? 'var(--color-accent-9)' : 'var(--color-accent-7)',
                        opacity: hoveredIndex !== null && !isHovered && !isSelected ? 0.5 : 1,
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
                            {day.hours}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* X-axis label */}
                  {shouldShowLabel(i, barCount) && (
                    <span
                      className="absolute text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] whitespace-nowrap leading-none"
                      style={{ bottom: `-${chartPaddingBottom - 8}px` }}
                    >
                      {label}
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
