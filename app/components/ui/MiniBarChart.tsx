interface MiniBarChartProps {
  data: number[]
  labels?: string[]
  width?: number
  height?: number
  color?: string
  highlightIndex?: number
  highlightColor?: string
  className?: string
}

export function MiniBarChart({
  data,
  labels,
  width = 160,
  height = 64,
  color = 'var(--color-neutral-4)',
  highlightIndex,
  highlightColor = 'var(--color-accent-9)',
  className = '',
}: MiniBarChartProps) {
  if (data.length === 0) return null

  const max = Math.max(...data, 1)
  const barGap = 4
  const labelHeight = labels ? 18 : 0
  const chartHeight = height - labelHeight
  const barWidth = (width - barGap * (data.length - 1)) / data.length

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {data.map((value, i) => {
        const barH = Math.max(2, (value / max) * (chartHeight - 4))
        const x = i * (barWidth + barGap)
        const y = chartHeight - barH
        const isHighlight = highlightIndex === i
        const fill = isHighlight ? highlightColor : color
        const radius = Math.min(barWidth / 2, 4)

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={radius}
              ry={radius}
              fill={fill}
              opacity={isHighlight ? 1 : 0.6}
            />
            {labels?.[i] && (
              <text
                x={x + barWidth / 2}
                y={height - 2}
                textAnchor="middle"
                fill="var(--color-neutral-7)"
                fontSize="10"
                fontFamily="var(--font-family-base)"
              >
                {labels[i]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
