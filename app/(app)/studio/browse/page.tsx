'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { AppCard } from '@/app/components/studio/AppCard'

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-[#E0E1E6] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-[var(--space-md)] pt-[var(--space-md)] pb-[var(--space-xs)]">
        <div className="flex items-center gap-[var(--space-xs)]">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-5 w-5 rounded-full" />
      </div>
      <div className="px-[var(--space-md)]">
        <div className="skeleton h-[180px] rounded-[var(--radius-lg)]" />
      </div>
      <div className="flex flex-col px-[var(--space-md)] py-[var(--space-md)] gap-[var(--space-sm)]">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-9 w-full mt-[var(--space-xs)] rounded-full" />
      </div>
    </div>
  )
}

const tabs = [
  'All apps',
  'Suggested for you',
  'Your company apps',
  'Most liked',
  'Works With Your Stack',
  'Used by Your Team',
  'New & Updated',
]

const apps = [
  { title: 'Impact Dashboard', description: 'A tool for health score orchestration for your assets. View inspection results, meter readin...', likes: 12, downloads: 423, status: 'install' as const },
  { title: 'Paper Work Order Scan', description: 'Scan and digitize paper work orders automatically. Convert handwritten notes into structured data...', likes: 24, downloads: 891, status: 'installed' as const },
  { title: 'Asset Health Orchestrator', description: 'A tool for health score orchestration for your assets. View inspection results, meter readin...', likes: 8, downloads: 312, status: 'update' as const },
  { title: 'Inspection Failure Follow-Up', description: 'Automatically create follow-up work orders when inspections fail. Configure thresholds and rules...', likes: 31, downloads: 1205, status: 'install' as const },
  { title: 'Work Order Duplicate Detector', description: 'Identify and merge duplicate work orders to reduce redundancy and improve team efficiency...', likes: 15, downloads: 567, status: 'built' as const },
  { title: 'Fleet Mileage Tracker', description: 'Track vehicle mileage automatically and generate maintenance schedules based on usage patterns...', likes: 19, downloads: 743, status: 'installed' as const },
  { title: 'Parts Reorder Automation', description: 'Set reorder points for parts and automatically generate purchase orders when stock runs low...', likes: 27, downloads: 982, status: 'install' as const },
  { title: 'Vendor Performance Scorecard', description: 'Rate and track vendor performance over time. Compare pricing, delivery speed, and quality metrics...', likes: 11, downloads: 289, status: 'update' as const },
  { title: 'Preventive Maintenance Planner', description: 'AI-powered scheduling that optimizes preventive maintenance based on asset condition and usage...', likes: 42, downloads: 1534, status: 'built' as const },
]

export default function BrowseAppsPage() {
  const [activeTab, setActiveTab] = useState('Suggested for you')
  const [loading, setLoading] = useState(false)

  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setLoading(true)
  }, [activeTab])

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <main className="flex-1">
      {/* Hero */}
      <div
        className="relative px-[var(--space-2xl)] pt-[var(--space-3xl)] pb-[var(--space-xl)]"
        style={{ background: 'linear-gradient(180deg, #EDE9F8 0%, #F5F3FC 60%, #FFFFFF 100%)' }}
      >
        <div className="flex flex-col items-center text-center gap-[var(--space-sm)] max-w-xl mx-auto">
          <h1 className="text-[length:var(--font-size-title-1)] font-extrabold text-[#1C2024]">
            Turn Ideas into Apps in Minutes
          </h1>
          <p className="text-[length:var(--font-size-body-1)] text-[#1C2024]">
            Describe what you need in plain language →{' '}
            <span className="font-semibold text-[color:var(--color-accent-9)]">Studio does the rest</span>
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="sticky top-[53px] z-10 flex items-center gap-[var(--space-md)] px-[var(--space-2xl)] py-[var(--space-md)] border-b border-[#E0E1E6] bg-white">
        <div className="flex items-center gap-[var(--space-xs)] flex-1 max-w-[240px] px-3 py-2 border border-[#E0E1E6] rounded-[var(--radius-lg)] bg-white">
          <Search size={16} className="text-[color:var(--color-neutral-8)]" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 text-[length:var(--font-size-body-2)] outline-none bg-transparent placeholder:text-[color:var(--color-neutral-7)]"
          />
        </div>
        <button className="flex items-center gap-1 px-3 py-2 border border-[#E0E1E6] rounded-[var(--radius-lg)] text-[length:var(--font-size-body-2)] text-[#1C2024] bg-white">
          All Categories <ChevronDown size={14} />
        </button>
        <div className="flex-1" />
        <span className="text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)]">Created By: All</span>
        <ChevronDown size={14} className="text-[color:var(--color-neutral-8)]" />
        <span className="text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)]">Sort By: Top Installed</span>
        <ArrowUpDown size={14} className="text-[color:var(--color-neutral-8)]" />
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-[var(--space-xs)] px-[var(--space-2xl)] py-[var(--space-md)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-1.5 rounded-full text-[length:var(--font-size-body-2)] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-[color:var(--color-accent-9)] text-white'
                : 'bg-white border border-[#E0E1E6] text-[#1C2024] hover:bg-[#F0F0F3]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="px-[var(--space-2xl)] pt-[var(--space-md)] pb-[var(--space-sm)]">
        {loading ? (
          <>
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-72 mt-2" />
          </>
        ) : (
          <div key={activeTab} className="fade-animate">
            <h2 className="text-[length:var(--font-size-title-2)] font-bold text-[#1C2024]">{activeTab}</h2>
            <p className="text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)] mt-1">
              Based on what&apos;s happening in your account right now
            </p>
          </div>
        )}
      </div>

      {/* App grid */}
      <div className="grid grid-cols-3 gap-[var(--space-xl)] px-[var(--space-2xl)] pb-[var(--space-2xl)]">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : apps.map((app, i) => (
              <div
                key={`${activeTab}-${app.title}`}
                className="card-animate"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <AppCard {...app} />
              </div>
            ))
        }
      </div>

      {/* Bottom CTA */}
      <div className="mx-[var(--space-2xl)] mb-[var(--space-2xl)] rounded-[var(--radius-xl)] px-[var(--space-2xl)] py-[var(--space-3xl)] text-center"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F7EF5 50%, #7C3AED 100%)' }}
      >
        <h2 className="text-[length:var(--font-size-title-2)] font-bold text-white">
          Ready to build your own app?
        </h2>
        <p className="text-[length:var(--font-size-body-1)] text-white/80 mt-[var(--space-xs)]">
          Describe what you need in plain language. Build in minutes.
        </p>
        <div className="mt-[var(--space-lg)]">
          <Button variant="secondary" size="lg" className="bg-white text-[#1C2024] border-none hover:bg-white/90">
            Create Your Own App
          </Button>
        </div>
      </div>
    </main>
  )
}
