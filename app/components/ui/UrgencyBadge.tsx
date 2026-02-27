import type { UrgencyLevel } from '@/app/lib/models'
import { Badge } from './Badge'

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  className?: string
}

const urgencyToSeverity = {
  critical: 'danger',
  high:     'warning',
  medium:   'info',
  low:      'neutral',
} as const satisfies Record<UrgencyLevel, 'danger' | 'warning' | 'info' | 'neutral'>

const urgencyLabels: Record<UrgencyLevel, string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  return (
    <Badge severity={urgencyToSeverity[urgency]} dot className={className}>
      {urgencyLabels[urgency]}
    </Badge>
  )
}

/** Re-export the mapping for components that need the severity only. */
export { urgencyToSeverity }
