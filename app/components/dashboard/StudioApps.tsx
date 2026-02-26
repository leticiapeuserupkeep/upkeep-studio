'use client'

import { useState } from 'react'
import { Package, Download, Trash2, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import type { StudioApp } from '@/app/lib/models'

interface StudioAppsProps {
  apps: StudioApp[]
}

export function StudioApps({ apps: initialApps }: StudioAppsProps) {
  const [apps, setApps] = useState(initialApps)

  const installed = apps.filter((a) => a.installed)
  const recommended = apps.filter((a) => a.recommended && !a.installed)

  const toggleInstall = (id: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, installed: !a.installed, lastUsed: a.installed ? undefined : 'Just now' } : a
      )
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Studio Apps</CardTitle>
        <CardDescription>{installed.length} installed</CardDescription>
      </CardHeader>

      <div className="px-[var(--space-lg)] pb-[var(--space-lg)]">
        {recommended.length > 0 && (
          <div className="mb-4">
            <p className="text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-8)] uppercase tracking-wider mb-2">
              Recommended
            </p>
            <div className="flex flex-col gap-1.5">
              {recommended.map((app) => (
                <AppRow key={app.id} app={app} onToggle={() => toggleInstall(app.id)} />
              ))}
            </div>
          </div>
        )}

        {installed.length > 0 && (
          <div>
            <p className="text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-8)] uppercase tracking-wider mb-2">
              Installed
            </p>
            <div className="flex flex-col gap-1.5">
              {installed.map((app) => (
                <AppRow key={app.id} app={app} onToggle={() => toggleInstall(app.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function AppRow({ app, onToggle }: { app: StudioApp; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-2)] transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] bg-[var(--color-accent-1)] shrink-0">
        <Package size={16} className="text-[var(--color-accent-9)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] truncate">
          {app.name}
        </p>
        <div className="flex items-center gap-2">
          <Badge severity="neutral">{app.category}</Badge>
          {app.lastUsed && (
            <span className="inline-flex items-center gap-0.5 text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
              <Clock size={10} /> {app.lastUsed}
            </span>
          )}
        </div>
      </div>
      {app.installed ? (
        <Button variant="danger" size="sm" onClick={onToggle}>
          <Trash2 size={12} /> Remove
        </Button>
      ) : (
        <Button variant="secondary" size="sm" onClick={onToggle}>
          <Download size={12} /> Install
        </Button>
      )}
    </div>
  )
}
