import type {
  DashboardKPIs, FocusItem, AnomalyResult, StockoutResult,
  FailureResult, CostResult, Technician, ActivityEvent,
  ComplianceItem, WeatherDay, SensorReading, ShiftHandoff,
} from '../models'
import {
  workOrders, assets, parts, technicians, activityFeed,
  budgetLines, complianceItems, weatherForecast,
  sensorReadings, shiftHandoff,
} from '../mock-data'
import {
  prioritizeFocusToday, detectAnomalies, predictStockout,
  predictFailures, costOverrunInsights,
} from '../ai-stubs'

const REFERENCE_DATE = '2026-02-24'

/**
 * All pre-computed data needed by dashboard widgets.
 *
 * Computed once per render, memoized by the consuming component.
 * When this moves to a backend, each field becomes an API call
 * and this function becomes an aggregator / data loader.
 */
export interface DashboardData {
  kpis: DashboardKPIs
  focusItems: FocusItem[]
  anomalies: AnomalyResult[]
  partsRisk: StockoutResult[]
  failures: FailureResult[]
  costData: CostResult[]
  technicians: Technician[]
  activityFeed: ActivityEvent[]
  complianceItems: ComplianceItem[]
  weatherForecast: WeatherDay[]
  sensorReadings: SensorReading[]
  shiftHandoff: ShiftHandoff
}

export function assembleDashboardData(): DashboardData {
  const focusItems = prioritizeFocusToday(workOrders)
  const anomalies = detectAnomalies(sensorReadings)
  const partsRiskData = predictStockout(parts)
  const failuresData = predictFailures(assets)
  const costDataResult = costOverrunInsights(budgetLines)

  const refDate = new Date(REFERENCE_DATE)
  const kpis: DashboardKPIs = {
    openWOs: workOrders.filter((w) => w.status === 'open').length,
    overdueWOs: workOrders.filter((w) => new Date(w.dueDate) < refDate).length,
    inProgressWOs: workOrders.filter((w) => w.status === 'in_progress').length,
    completedToday: technicians.reduce((s, t) => s + t.completedToday, 0),
    totalTechnicians: technicians.length,
    availableTechnicians: technicians.filter((t) => t.status === 'available').length,
  }

  return {
    kpis,
    focusItems,
    anomalies,
    partsRisk: partsRiskData,
    failures: failuresData,
    costData: costDataResult,
    technicians,
    activityFeed,
    complianceItems,
    weatherForecast,
    sensorReadings,
    shiftHandoff,
  }
}
