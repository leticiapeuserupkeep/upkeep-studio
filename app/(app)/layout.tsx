'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Download, Plus, MoreVertical, Pencil, RotateCcw } from 'lucide-react'
import { SideNav } from '@/app/components/dashboard/SideNav'
import { TopBar } from '@/app/components/dashboard/TopBar'
import { Button } from '@/app/components/ui/Button'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { DashboardProvider } from '@/app/lib/dashboard/dashboard-context'
import { sites } from '@/app/lib/mock-data'
import type { Role } from '@/app/lib/models'

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/studio/browse')) return 'Studio'
  if (pathname.startsWith('/studio')) return 'Studio'
  if (pathname.startsWith('/edge/runtime')) return 'Runtime'
  if (pathname.startsWith('/edge/sensors')) return 'Sensors'
  if (pathname.startsWith('/edge/gateways')) return 'Gateways'
  if (pathname.startsWith('/edge/alerts')) return 'Alerts'
  if (pathname.startsWith('/edge/settings')) return 'Settings'
  return 'Dashboard'
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [role, setRole] = useState<Role>('supervisor')
  const [site, setSite] = useState('All Sites')
  const [timeRange, setTimeRange] = useState('Today')
  const [showAddRuntime, setShowAddRuntime] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const pathname = usePathname()

  const title = getPageTitle(pathname)
  const isStudioBrowse = pathname.startsWith('/studio/browse')
  const isEdge = pathname.startsWith('/edge/')
  const isRuntimeList = pathname === '/edge/runtime'
  const isRuntimeDetail = /^\/edge\/runtime\/[^/]+/.test(pathname)

  function getActions() {
    if (isStudioBrowse) {
      return (
        <Button variant="primary" size="md" asChild>
          <Link href="/studio/create">Create Your Own App</Link>
        </Button>
      )
    }
    if (isRuntimeList) {
      return (
        <>
          <Button variant="secondary" size="sm">
            <Download size={14} />
            Export Readings
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddRuntime(true)}>
            <Plus size={14} />
            Add Runtime
          </Button>
        </>
      )
    }
    if (isRuntimeDetail) {
      return (
        <>
          <Button variant="secondary" size="sm">
            <Download size={14} />
            Export Readings
          </Button>
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={16} className="text-[var(--color-neutral-9)]" />
            </button>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] w-[160px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1">
                  <button
                    onClick={() => {
                      setShowMoreMenu(false)
                      window.dispatchEvent(new CustomEvent('open-edit-runtime'))
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
                  >
                    <Pencil size={14} className="text-[var(--color-neutral-8)]" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-error)] hover:bg-[var(--color-error-light)] cursor-pointer transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )
    }
    return undefined
  }

  return (
    <div className="flex min-h-screen bg-[var(--surface-secondary)]">
      <SideNav collapsed={sidebarCollapsed} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          title={title}
          role={role}
          site={site}
          timeRange={timeRange}
          onRoleChange={setRole}
          onSiteChange={setSite}
          onTimeRangeChange={setTimeRange}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          sites={sites}
          minimal={isEdge}
          backHref={isRuntimeDetail ? '/edge/runtime' : undefined}
          actions={getActions()}
        />
        <DashboardProvider role={role} site={site}>
          <div className="flex flex-col flex-1 items-center">
            {children}
          </div>
        </DashboardProvider>
      </div>

      <MeterConfigModal
        open={showAddRuntime}
        onOpenChange={setShowAddRuntime}
        sensorName=""
        totalRuntime={0}
      />
    </div>
  )
}
