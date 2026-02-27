'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SideNav } from '@/app/components/dashboard/SideNav'
import { TopBar } from '@/app/components/dashboard/TopBar'
import { Button } from '@/app/components/ui/Button'
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
  const pathname = usePathname()

  const title = getPageTitle(pathname)
  const isStudioBrowse = pathname.startsWith('/studio/browse')
  const isEdge = pathname.startsWith('/edge/')
  const isRuntimeDetail = /^\/edge\/runtime\/[^/]+/.test(pathname)

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
          actions={
            isStudioBrowse ? (
              <Button variant="primary" size="md" asChild>
                <Link href="/studio/create">Create Your Own App</Link>
              </Button>
            ) : undefined
          }
        />
        <DashboardProvider role={role} site={site}>
          {children}
        </DashboardProvider>
      </div>
    </div>
  )
}
