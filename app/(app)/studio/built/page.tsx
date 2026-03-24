'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { AppCard } from '@/app/components/studio/AppCard'
import { SearchInput } from '@/app/components/ui/SearchInput'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/app/components/ui/DropdownMenu'
import type { BuildStatus } from '@/app/components/studio/AppCard'

const categories = [
  'All Categories',
  'Maintenance',
  'Operations',
  'Inspections',
  'Inventory',
  'Dashboards',
]

const sortOptions = [
  { value: 'most-recent', label: 'Most Recent' },
  { value: 'name-az', label: 'Name A–Z' },
  { value: 'most-downloads', label: 'Most Downloads' },
]

const builtApps = [
  {
    title: 'Asset Health Score Orchestrator',
    description: 'A tool for health score orchestration for your assets. View inspection results, meter readings, and overall asset health in one place.',
    likes: 0,
    downloads: 423,
    tags: ['Maintenance'],
    creator: 'You',
    date: 'Mon, 25 Sep',
    image: '/images/apps/asset-health.png',
    screenshots: ['/images/apps/asset-health.png', '/images/apps/impact-dashboard.png'],
    buildStatus: 'rejected' as BuildStatus,
    category: 'Maintenance',
  },
  {
    title: 'PM Planner Pro',
    description: 'Plan and schedule preventive maintenance programs with drag-and-drop calendar views and automatic conflict detection.',
    likes: 0,
    downloads: 423,
    tags: ['Maintenance'],
    creator: 'You',
    date: 'Mon, 25 Sep',
    image: '/images/apps/pm-planner.png',
    screenshots: ['/images/apps/pm-planner.png', '/images/apps/workload-chart.png'],
    buildStatus: 'draft' as BuildStatus,
    category: 'Maintenance',
  },
  {
    title: 'Shift Handover Report',
    description: 'Generate and share shift handover reports with open issues, completed tasks, and notes for the next crew.',
    likes: 0,
    downloads: 423,
    tags: ['Operations'],
    creator: 'You',
    date: 'Mon, 25 Sep',
    image: '/images/apps/shift-handover.png',
    screenshots: ['/images/apps/shift-handover.png', '/images/apps/time-tracking.png'],
    buildStatus: 'in-review' as BuildStatus,
    category: 'Operations',
  },
  {
    title: 'Warranty Tracker',
    description: 'Track warranty expiration dates across all assets and receive proactive alerts before coverage expires.',
    likes: 0,
    downloads: 423,
    tags: ['Maintenance'],
    creator: 'You',
    date: 'Mon, 25 Sep',
    image: '/images/apps/warranty-tracker.png',
    screenshots: ['/images/apps/warranty-tracker.png', '/images/apps/asset-replacement.png'],
    buildStatus: 'published' as BuildStatus,
    category: 'Maintenance',
  },
]

const analyticsPreviewData: Record<string, string> = {
  'Warranty Tracker': '42 installs · Last opened 2h ago',
}

export default function AppsIBuiltPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('most-recent')
  

  const filtered = useMemo(() => {
    let result = builtApps
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      )
    }
    if (category !== 'All Categories') {
      result = result.filter((a) => a.category === category)
    }
    if (sortBy === 'name-az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'most-downloads') {
      result = [...result].sort((a, b) => b.downloads - a.downloads)
    }
    return result
  }, [searchQuery, category, sortBy])

  return (
    <main className="flex-1 overflow-auto bg-[var(--surface-primary)]">
      <div className="max-w-[1280px] mx-auto w-full px-[var(--space-2xl)] py-[var(--space-2xl)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[length:var(--font-size-title-1)] font-bold text-[var(--color-neutral-12)]">
            Apps I built
          </h1>
          <p className="mt-1 text-[length:var(--font-size-body-2)] text-[var(--color-neutral-8)]">
            All the apps you&apos;ve created and published on UpKeep Studio
          </p>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-8">
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex-1 max-w-[360px]"
          />

          {/* Category dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-primary)] text-[length:var(--font-size-body-2)] font-medium text-[var(--color-neutral-11)] cursor-pointer hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)]">
                {category}
                <ChevronDown size={14} className="text-[var(--color-neutral-8)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent minWidth="200px">
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onSelect={() => setCategory(c)}
                  className={category === c ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium' : ''}
                >
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-primary)] text-[length:var(--font-size-body-2)] text-[var(--color-neutral-9)] cursor-pointer hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)]">
                Sort By: <span className="font-medium text-[var(--color-neutral-11)]">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
                <ArrowUpDown size={14} className="text-[var(--color-neutral-8)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onSelect={() => setSortBy(s.value)}
                  className={sortBy === s.value ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium' : ''}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-[var(--space-xl)]">
          {filtered.map((app, i) => (
            <div key={app.title} className="card-animate h-full" style={{ animationDelay: `${i * 80}ms` }}>
              <AppCard
                title={app.title}
                description={app.description}
                likes={app.likes}
                downloads={app.downloads}
                status="built"
                buildStatus={app.buildStatus}
                tags={app.tags}
                creator={app.creator}
                lastUpdated={app.date}
                image={app.image}
                screenshots={app.screenshots}
                onReuse={() => router.push(`/studio/create?from=${encodeURIComponent(app.title)}&prompt=${encodeURIComponent(app.description)}`)}
                reuseLabel="Duplicate and edit"
                analyticsPreview={app.buildStatus === 'published' ? analyticsPreviewData[app.title] : undefined}
              />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[length:var(--font-size-body-1)] font-medium text-[var(--color-neutral-9)]">No apps found</p>
            <p className="mt-1 text-[length:var(--font-size-body-2)] text-[var(--color-neutral-7)]">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
