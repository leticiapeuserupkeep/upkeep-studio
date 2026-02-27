interface ProgressRingProps {
  /** 0–100 */
  value: number
  size?: number
  strokeWidth?: number
  trackColor?: string
  fillColor?: string
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressRing({
  value,
  size = 40,
  strokeWidth = 3,
  trackColor = 'var(--color-neutral-4)',
  fillColor = 'var(--color-accent-9)',
  showLabel = true,
  label,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clamped}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-default)]"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-11)] tabular-nums">
          {clamped}
        </span>
      )}
    </div>
  )
}
