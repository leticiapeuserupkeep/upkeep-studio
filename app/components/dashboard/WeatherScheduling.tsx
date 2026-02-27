import { Cloud, Sun, CloudRain, CloudLightning, Snowflake, Wind, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { InlineAlert } from '@/app/components/ui/InlineAlert'
import type { WeatherDay } from '@/app/lib/models'

interface WeatherSchedulingProps {
  forecast: WeatherDay[]
}

const weatherIcons: Record<WeatherDay['condition'], typeof Sun> = {
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
}

const weatherColors: Record<WeatherDay['condition'], string> = {
  sunny: 'text-[var(--color-warning)]',
  cloudy: 'text-[var(--color-neutral-7)]',
  rain: 'text-[var(--color-accent-9)]',
  storm: 'text-[var(--color-error)]',
  snow: 'text-[var(--color-info)]',
}

export function WeatherScheduling({ forecast }: WeatherSchedulingProps) {
  const hasAlerts = forecast.some((d) => d.rescheduleReason)

  return (
    <Card>
      <CardHeader
        action={hasAlerts ? <Badge severity="warning" dot>Reschedule needed</Badge> : undefined}
      >
        <CardTitle>Weather-Aware Scheduling</CardTitle>
      </CardHeader>

      <div className="px-[var(--widget-padding)] pb-[var(--widget-padding)]">
        <div className="flex gap-2 mb-4">
          {forecast.map((day) => {
            const Icon = weatherIcons[day.condition]
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
            const hasIssue = !!day.rescheduleReason
            return (
              <div
                key={day.date}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[var(--radius-lg)] border ${
                  hasIssue
                    ? 'border-[var(--color-warning-border)] bg-[var(--color-warning-light)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-primary)]'
                }`}
              >
                <span className="text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-8)]">{dayName}</span>
                <Icon size={20} className={weatherColors[day.condition]} />
                <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] tabular-nums">
                  {day.tempHigh}°
                </span>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] tabular-nums">
                  {day.tempLow}°
                </span>
                {day.windMph > 20 && (
                  <span className="inline-flex items-center gap-0.5 text-[length:var(--font-size-xs)] text-[var(--color-warning)]">
                    <Wind size={10} /> {day.windMph}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {forecast
          .filter((d) => d.rescheduleReason)
          .map((day) => (
            <div key={day.date} className="mb-2">
              <InlineAlert severity="warning">
                <AlertTriangle size={12} className="inline mr-1" />
                <strong>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}:</strong>{' '}
                {day.rescheduleReason}
                {day.affectedAssets.length > 0 && (
                  <span className="text-[var(--color-neutral-8)]"> — Affects: {day.affectedAssets.join(', ')}</span>
                )}
              </InlineAlert>
            </div>
          ))}
      </div>
    </Card>
  )
}
