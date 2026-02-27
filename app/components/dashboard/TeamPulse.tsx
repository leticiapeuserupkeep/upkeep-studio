'use client'

import { Users, MapPin, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Avatar } from '@/app/components/ui/Avatar'
import type { Technician, ActivityEvent } from '@/app/lib/models'

interface TeamPulseProps {
  technicians: Technician[]
  activity: ActivityEvent[]
}

const statusConfig = {
  available: { severity: 'success' as const, label: 'Available' },
  busy: { severity: 'info' as const, label: 'Busy' },
  overloaded: { severity: 'danger' as const, label: 'Overloaded' },
  off_shift: { severity: 'neutral' as const, label: 'Off Shift' },
}

export function TeamPulse({ technicians, activity }: TeamPulseProps) {
  const available = technicians.filter((t) => t.status === 'available').length
  const overloaded = technicians.filter((t) => t.status === 'overloaded').length

  return (
    <Card className="flex flex-col">
      <CardHeader
        action={
          <div className="flex items-center gap-2">
            <Badge severity="success" dot>{available} available</Badge>
            {overloaded > 0 && <Badge severity="danger" dot>{overloaded} overloaded</Badge>}
          </div>
        }
      >
        <CardTitle>Team Pulse</CardTitle>
        <CardDescription>{technicians.length} technicians on shift</CardDescription>
      </CardHeader>

      <div className="px-[var(--widget-padding)] pb-[var(--space-md)]">
        <div className="flex flex-col gap-2">
          {technicians.map((tech) => (
            <TechCard key={tech.id} tech={tech} />
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] px-[var(--widget-padding)] py-[var(--space-sm)]">
        <p className="text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-8)] uppercase tracking-wider mb-2">
          Recent Activity
        </p>
        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
          {activity.slice(0, 5).map((evt) => (
            <div key={evt.id} className="flex items-start gap-2">
              <Avatar name={evt.technicianName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-11)] truncate">
                  <span className="font-semibold">{evt.technicianName.split(' ')[0]}</span>{' '}
                  {evt.action}{' '}
                  <span className="text-[var(--color-neutral-8)]">{evt.target}</span>
                </p>
              </div>
              <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] whitespace-nowrap shrink-0">
                {evt.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function TechCard({ tech }: { tech: Technician }) {
  const config = statusConfig[tech.status]
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-2)] transition-colors">
      <Avatar name={tech.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] truncate">
            {tech.name}
          </span>
          <Badge severity={config.severity} dot>{config.label}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="inline-flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            <Users size={11} /> {tech.activeWOs} active
          </span>
          <span className="inline-flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            <Clock size={11} /> {tech.completedToday} done
          </span>
          {tech.status !== 'off_shift' && (
            <span className="inline-flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
              <MapPin size={11} /> {tech.distanceToNextWO} mi
            </span>
          )}
        </div>
      </div>
      {tech.status === 'available' && (
        <Button variant="secondary" size="sm">Assign</Button>
      )}
    </div>
  )
}
