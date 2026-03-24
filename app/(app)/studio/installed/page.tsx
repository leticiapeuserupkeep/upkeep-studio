'use client'

import { useRouter } from 'next/navigation'
import { AppCard } from '@/app/components/studio/AppCard'

const installedApps = [
  {
    title: 'Asset Health Score Orchestrator',
    description: 'A tool for health score orchestration for your assets. View inspection results, meter readings, and overall asset health in one place.',
    likes: 12,
    downloads: 423,
    tags: ['Maintenance'],
    creator: 'UpKeep',
    lastUsed: 'Last used: 2 hs ago',
    image: '/images/apps/asset-health.png',
    screenshots: ['/images/apps/asset-health.png', '/images/apps/impact-dashboard.png'],
    hasUpdate: true,
  },
  {
    title: 'Work Order Bulk Creator',
    description: 'Create dozens of work orders at once from spreadsheets, templates, or CSV imports.',
    likes: 8,
    downloads: 312,
    tags: ['Work Orders'],
    creator: 'UpKeep',
    lastUsed: 'Last used: Yesterday',
    image: '/images/apps/bulk-wo-creator.png',
    screenshots: ['/images/apps/bulk-wo-creator.png', '/images/apps/wo-grab.png'],
    hasUpdate: false,
  },
  {
    title: 'Inspection Follow-Up Tracker',
    description: 'Automatically generate follow-up work orders from failed inspection items and track remediation progress.',
    likes: 15,
    downloads: 587,
    tags: ['Inspections'],
    creator: 'UpKeep',
    lastUsed: 'Last used: 2 months ago',
    image: '/images/apps/inspection-followup.png',
    screenshots: ['/images/apps/inspection-followup.png', '/images/apps/inspection-wizard.png'],
    hasUpdate: false,
    lastUsedStale: true,
  },
] as const

export default function InstalledAppsPage() {
  const router = useRouter()
  return (
    <main className="flex-1 overflow-auto bg-[var(--surface-primary)]">
      <div className="max-w-[1280px] mx-auto w-full px-[var(--space-2xl)] py-[var(--space-2xl)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[length:var(--font-size-title-1)] font-bold text-[var(--color-neutral-12)]">
            Installed Apps
          </h1>
          <p className="mt-1 text-[length:var(--font-size-body-2)] text-[var(--color-neutral-8)]">
            You can install up to 10 apps on your current plan
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-[var(--space-xl)]">
          {installedApps.map((app, i) => (
            <div key={app.title} className="card-animate h-full" style={{ animationDelay: `${i * 80}ms` }}>
              <AppCard
                title={app.title}
                description={app.description}
                likes={app.likes}
                downloads={app.downloads}
                status={app.hasUpdate ? 'update' : 'installed'}
                tags={[...app.tags]}
                creator={app.creator}
                lastUpdated={app.lastUsed}
                image={app.image}
                screenshots={[...app.screenshots]}
                lastUpdatedStale={'lastUsedStale' in app && !!app.lastUsedStale}
                onReuse={() => router.push(`/studio/create?from=${encodeURIComponent(app.title)}&prompt=${encodeURIComponent(app.description)}`)}
                reuseLabel="Clone and customize"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
