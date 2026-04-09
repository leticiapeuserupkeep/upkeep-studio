'use client'

import type { ReactNode } from 'react'
import { PanelLeft } from 'lucide-react'
import { useSuperNovaStagingNav } from './supernova-staging-nav-context'

export function StagingPageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  const { toggleSidebar } = useSuperNovaStagingNav()

  return (
    <header className="shrink-0 flex items-center gap-[var(--space-sm)] min-h-[var(--supernova-staging-header-height)] px-[var(--space-2xl)] border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={20} className="text-[color:var(--color-neutral-7)]" aria-hidden />
      </button>
      <h1 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] leading-6">
        {title}
      </h1>
      <div className="flex-1 min-w-0" />
      {actions}
    </header>
  )
}
