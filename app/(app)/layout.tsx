'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { SideNav } from '@/app/components/dashboard/SideNav'
import { TopBar } from '@/app/components/dashboard/TopBar'
import { Button } from '@/app/components/ui/Button'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { DashboardProvider } from '@/app/lib/dashboard/dashboard-context'
import { sites } from '@/app/lib/mock-data'
import type { Role } from '@/app/lib/models'

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/studio/create')) return 'New App'
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

  const pathname = usePathname()

  const handleCollapseSidebar = useCallback(() => setSidebarCollapsed(true), [])
  const handleToggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), [])

  useEffect(() => {
    window.addEventListener('collapse-sidebar', handleCollapseSidebar)
    window.addEventListener('toggle-sidebar', handleToggleSidebar)
    return () => {
      window.removeEventListener('collapse-sidebar', handleCollapseSidebar)
      window.removeEventListener('toggle-sidebar', handleToggleSidebar)
    }
  }, [handleCollapseSidebar, handleToggleSidebar])

  const title = getPageTitle(pathname)
  const isCreateApp = pathname === '/studio/create'
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
      return undefined
    }
    if (isRuntimeDetail) {
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent('open-edit-runtime'))}
        >
          <Pencil size={14} />
          Edit
        </Button>
      )
    }
    return undefined
  }

  return (
    <div className="flex min-h-screen bg-[var(--surface-secondary)]">
      <SideNav collapsed={sidebarCollapsed} />

      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        {!isCreateApp && (
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
        )}
        {isEdge && !isCreateApp && (
          <div data-orientation="horizontal" role="separator" className="h-px bg-[var(--border-default)]" />
        )}
        <div id="runtime-sensor-bar-portal" />
        <div id="runtime-kpi-portal" />
        {isCreateApp ? (
          children
        ) : (
          <DashboardProvider role={role} site={site}>
            <div className="flex flex-col flex-1 items-center">
              {children}
            </div>
          </DashboardProvider>
        )}
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
