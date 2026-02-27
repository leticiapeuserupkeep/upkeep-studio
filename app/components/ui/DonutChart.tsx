interface DonutSegment {
  value: number
  color: string
  label?: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string
  className?: string
}

export function DonutChart({
  segments,
  size = 120,
  strokeWidth = 12,
  centerLabel,
  centerValue,
  className = '',
}: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  let accumulated = 0
  const arcs = segments.map((seg) => {
    const pct = seg.value / total
    const dashLength = pct * circumference
    const dashOffset = -(accumulated / total) * circumference
    accumulated += seg.value
    return { ...seg, dashLength, dashOffset, pct }
  })

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-neutral-3)"
          strokeWidth={strokeWidth}
        />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="round"
            className="transition-all duration-[var(--duration-slow)] ease-[var(--ease-default)]"
          />
        ))}
      </svg>

      {(centerValue || centerLabel) && (
        <div className="absolute flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-[length:var(--font-size-xl)] font-bold text-[var(--color-neutral-12)] tabular-nums leading-none">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
