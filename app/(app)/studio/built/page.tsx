'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown, ArrowUpDown, X } from 'lucide-react'
import { AppCard } from '@/app/components/studio/AppCard'
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

export default function AppsIBuiltPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('most-recent')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

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
          {/* Search */}
          <div className="flex items-center gap-[var(--space-xs)] flex-1 max-w-[360px] px-3 py-2 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-primary)]">
            <Search size={16} className="text-[color:var(--color-neutral-8)] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-[length:var(--font-size-body-2)] outline-none bg-transparent placeholder:text-[color:var(--color-neutral-7)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-9)] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <button
              onClick={() => { setCategoryOpen(!categoryOpen); setSortOpen(false) }}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-primary)] text-[length:var(--font-size-body-2)] font-medium text-[var(--color-neutral-11)] cursor-pointer hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)]"
            >
              {category}
              <ChevronDown size={14} className={`text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)] ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoryOpen && (
              <>
                <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setCategoryOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-[var(--z-modal)] min-w-[200px] rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 dropdown-animate">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); setCategoryOpen(false) }}
                      className={`w-full px-4 py-2 text-left text-[length:var(--font-size-body-2)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)] ${
                        category === c ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium' : 'text-[var(--color-neutral-11)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => { setSortOpen(!sortOpen); setCategoryOpen(false) }}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-primary)] text-[length:var(--font-size-body-2)] text-[var(--color-neutral-9)] cursor-pointer hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)]"
            >
              Sort By: <span className="font-medium text-[var(--color-neutral-11)]">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
              <ArrowUpDown size={14} className="text-[var(--color-neutral-8)]" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] min-w-[180px] rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 dropdown-animate">
                  {sortOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setSortBy(s.value); setSortOpen(false) }}
                      className={`w-full px-4 py-2 text-left text-[length:var(--font-size-body-2)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)] ${
                        sortBy === s.value ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium' : 'text-[var(--color-neutral-11)]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
