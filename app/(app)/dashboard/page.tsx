'use client'

import { useState, useMemo, useCallback, type ReactNode } from 'react'
import { FocusToday } from '@/app/components/dashboard/FocusToday'
import { TeamPulse } from '@/app/components/dashboard/TeamPulse'
import { ShiftHandoff } from '@/app/components/dashboard/ShiftHandoff'
import { PartsRisk } from '@/app/components/dashboard/PartsRisk'
import { SensorInsights } from '@/app/components/dashboard/SensorInsights'
import { PredictedFailures } from '@/app/components/dashboard/PredictedFailures'
import { CostIntelligence } from '@/app/components/dashboard/CostIntelligence'
import { ComplianceCountdown } from '@/app/components/dashboard/ComplianceCountdown'
import { WeatherScheduling } from '@/app/components/dashboard/WeatherScheduling'
import { StudioApps } from '@/app/components/dashboard/StudioApps'
import { SortableColumn } from '@/app/components/ui/SortableColumn'
import { KPI } from '@/app/components/ui/KPI'
import {
  ClipboardList, AlertTriangle, Clock, CheckCircle2,
} from 'lucide-react'

import {
  workOrders, assets, parts, technicians, activityFeed,
  studioApps, budgetLines, complianceItems, weatherForecast,
  sensorReadings, shiftHandoff,
} from '@/app/lib/mock-data'
import {
  prioritizeFocusToday, detectAnomalies, predictStockout,
  predictFailures, costOverrunInsights,
} from '@/app/lib/ai-stubs'

const DEFAULT_LEFT_ORDER = [
  'focus-today', 'team-pulse', 'shift-handoff',
  'parts-risk', 'cost-intelligence', 'weather-scheduling',
]

const DEFAULT_RIGHT_ORDER = [
  'sensor-insights', 'predicted-failures',
  'compliance-countdown', 'studio-apps',
]

export default function DashboardPage() {
  const [leftOrder, setLeftOrder] = useState(DEFAULT_LEFT_ORDER)
  const [rightOrder, setRightOrder] = useState(DEFAULT_RIGHT_ORDER)

  const focusItems = useMemo(() => prioritizeFocusToday(workOrders), [])
  const anomalies = useMemo(() => detectAnomalies(sensorReadings), [])
  const partsRisk = useMemo(() => predictStockout(parts), [])
  const failures = useMemo(() => predictFailures(assets), [])
  const costData = useMemo(() => costOverrunInsights(budgetLines), [])

  const openWOs = workOrders.filter((w) => w.status === 'open').length
  const overdueWOs = workOrders.filter((w) => new Date(w.dueDate) < new Date('2026-02-24')).length
  const inProgressWOs = workOrders.filter((w) => w.status === 'in_progress').length
  const completedToday = technicians.reduce((s, t) => s + t.completedToday, 0)

  const cardRegistry: Record<string, { content: ReactNode; visible: boolean }> = useMemo(() => ({
    'focus-today': { content: <FocusToday items={focusItems} />, visible: true },
    'team-pulse': { content: <TeamPulse technicians={technicians} activity={activityFeed} />, visible: true },
    'shift-handoff': { content: <ShiftHandoff handoff={shiftHandoff} />, visible: true },
    'parts-risk': { content: <PartsRisk parts={partsRisk} />, visible: true },
    'cost-intelligence': { content: <CostIntelligence lines={costData} />, visible: true },
    'weather-scheduling': { content: <WeatherScheduling forecast={weatherForecast} />, visible: true },
    'sensor-insights': { content: <SensorInsights readings={anomalies.length > 0 ? anomalies : sensorReadings} />, visible: true },
    'predicted-failures': { content: <PredictedFailures assets={failures} />, visible: true },
    'compliance-countdown': { content: <ComplianceCountdown items={complianceItems} />, visible: true },
    'studio-apps': { content: <StudioApps apps={studioApps} />, visible: true },
  }), [focusItems, partsRisk, costData, anomalies, failures])

  const leftItems = useMemo(
    () => leftOrder.filter((id) => cardRegistry[id]?.visible).map((id) => ({ id, content: cardRegistry[id].content })),
    [leftOrder, cardRegistry]
  )

  const rightItems = useMemo(
    () => rightOrder.filter((id) => cardRegistry[id]?.visible).map((id) => ({ id, content: cardRegistry[id].content })),
    [rightOrder, cardRegistry]
  )

  const handleLeftReorder = useCallback((ids: string[]) => {
    setLeftOrder((prev) => {
      const hidden = prev.filter((id) => !cardRegistry[id]?.visible)
      return [...ids, ...hidden]
    })
  }, [cardRegistry])

  const handleRightReorder = useCallback((ids: string[]) => {
    setRightOrder((prev) => {
      const hidden = prev.filter((id) => !cardRegistry[id]?.visible)
      return [...ids, ...hidden]
    })
  }, [cardRegistry])

  return (
    <main className="flex-1 px-[var(--space-xl)] py-[var(--space-lg)]">
      <div className="grid grid-cols-4 gap-[var(--space-md)] mb-[var(--space-lg)]">
        <KPI
          label="Open Work Orders"
          value={openWOs}
          icon={<ClipboardList size={18} className="text-[var(--color-accent-9)]" />}
          accent
        />
        <KPI
          label="Overdue"
          value={overdueWOs}
          subtitle={overdueWOs > 0 ? 'Requires immediate attention' : 'All on track'}
          icon={<AlertTriangle size={18} className="text-[var(--color-error)]" />}
        />
        <KPI
          label="In Progress"
          value={inProgressWOs}
          icon={<Clock size={18} className="text-[var(--color-warning)]" />}
        />
        <KPI
          label="Completed Today"
          value={completedToday}
          icon={<CheckCircle2 size={18} className="text-[var(--color-success)]" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-[var(--space-lg)]">
        <div className="col-span-8">
          <SortableColumn items={leftItems} onReorder={handleLeftReorder} />
        </div>
        <div className="col-span-4">
          <SortableColumn items={rightItems} onReorder={handleRightReorder} />
        </div>
      </div>
    </main>
  )
}
