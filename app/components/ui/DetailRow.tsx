interface DetailRowProps {
  label: string
  value: string
  className?: string
}

export function DetailRow({ label, value, className = '' }: DetailRowProps) {
  return (
    <div className={`flex items-center justify-between py-[var(--space-xs)] border-b border-[var(--border-subtle)] last:border-0 ${className}`}>
      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">{label}</span>
      <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">{value}</span>
    </div>
  )
}
