type StatusDotColor = 'success' | 'warning' | 'danger' | 'neutral' | 'info'
type StatusDotSize = 'sm' | 'md'

interface StatusDotProps {
  color: StatusDotColor
  size?: StatusDotSize
  pulse?: boolean
  label?: string
  className?: string
}

const colorStyles: Record<StatusDotColor, string> = {
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger:  'bg-[var(--color-error)]',
  neutral: 'bg-[var(--color-neutral-7)]',
  info:    'bg-[var(--color-info)]',
}

const pulseRingStyles: Record<StatusDotColor, string> = {
  success: 'ring-[var(--color-success-border)]',
  warning: 'ring-[var(--color-warning-border)]',
  danger:  'ring-[var(--color-error-border)]',
  neutral: 'ring-[var(--color-neutral-5)]',
  info:    'ring-[var(--color-info-border)]',
}

const sizeMap: Record<StatusDotSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
}

export function StatusDot({ color, size = 'sm', pulse = false, label, className = '' }: StatusDotProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      className={`inline-block rounded-full shrink-0 ${colorStyles[color]} ${sizeMap[size]} ${
        pulse ? `ring-2 ${pulseRingStyles[color]}` : ''
      } ${className}`}
    />
  )
}
