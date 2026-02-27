'use client'

import { useMemo, type ReactNode } from 'react'
import { DashboardShell } from '@/app/components/dashboard/DashboardShell'
import { KPIStrip } from '@/app/components/dashboard/KPIStrip'
import { FocusToday } from '@/app/components/dashboard/FocusToday'
import { TeamPulse } from '@/app/components/dashboard/TeamPulse'
import { PartsRisk } from '@/app/components/dashboard/PartsRisk'
import { SensorInsights } from '@/app/components/dashboard/SensorInsights'
import { PredictedFailures } from '@/app/components/dashboard/PredictedFailures'
import { CostIntelligence } from '@/app/components/dashboard/CostIntelligence'
import { ComplianceCountdown } from '@/app/components/dashboard/ComplianceCountdown'
import { WeatherScheduling } from '@/app/components/dashboard/WeatherScheduling'
import { ShiftHandoff } from '@/app/components/dashboard/ShiftHandoff'
import { ManageWidgets } from '@/app/components/dashboard/ManageWidgets'
import { useDashboardContext } from '@/app/lib/dashboard/dashboard-context'
import { useDashboardLayout } from '@/app/lib/dashboard/use-dashboard-layout'
import { assembleDashboardData } from '@/app/lib/dashboard/dashboard-data'
import type { WidgetId } from '@/app/lib/dashboard/widget-types'

export default function DashboardPage() {
  const { role } = useDashboardContext()
  const {
    placements, reorderColumn, removeWidget,
    toggleWidget, resetLayout,
  } = useDashboardLayout(role)
  const data = useMemo(() => assembleDashboardData(), [])

  const stableContent: Partial<Record<WidgetId, ReactNode>> = useMemo(() => ({
    'focus-today':          <FocusToday items={data.focusItems} />,
    'team-pulse':           <TeamPulse technicians={data.technicians} activity={data.activityFeed} />,
    'parts-risk':           <PartsRisk parts={data.partsRisk} />,
    'cost-intelligence':    <CostIntelligence lines={data.costData} />,
    'weather-scheduling':   <WeatherScheduling forecast={data.weatherForecast} />,
    'sensor-insights':      <SensorInsights readings={data.anomalies.length > 0 ? data.anomalies : data.sensorReadings} />,
    'predicted-failures':   <PredictedFailures assets={data.failures} />,
    'compliance-countdown': <ComplianceCountdown items={data.complianceItems} />,
    'shift-handoff':        <ShiftHandoff handoff={data.shiftHandoff} />,
  }), [data])

  const widgetContent: Partial<Record<WidgetId, ReactNode>> = {
    ...stableContent,
    'manage-widgets': (
      <ManageWidgets
        role={role}
        placements={placements}
        onToggleWidget={toggleWidget}
        onResetLayout={resetLayout}
      />
    ),
  }

  return (
    <DashboardShell
      role={role}
      topStrip={<KPIStrip kpis={data.kpis} />}
      widgetContent={widgetContent}
      placements={placements}
      onReorderColumn={reorderColumn}
      onRemoveWidget={removeWidget}
    />
  )
}
