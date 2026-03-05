export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low'
export type WOStatus = 'open' | 'in_progress' | 'on_hold' | 'completed'
export type TechnicianStatus = 'available' | 'busy' | 'overloaded' | 'off_shift'
export type Role = 'technician' | 'supervisor' | 'manager'

export interface WorkOrder {
  id: string
  title: string
  assetName: string
  siteName: string
  status: WOStatus
  urgency: UrgencyLevel
  dueDate: string
  assigneeId?: string
  priorityScore: number
  priorityReason: string
  category: 'work_order' | 'asset_risk' | 'compliance' | 'anomaly'
}

export interface Asset {
  id: string
  name: string
  siteName: string
  category: string
  healthScore: number
  failureProbability: number
  failureDrivers: string[]
  recommendedAction: string
  lastInspection: string
}

export interface Part {
  id: string
  name: string
  onHand: number
  minRequired: number
  consumptionRate: number
  predictedStockout: string
  riskLevel: UrgencyLevel
  vendors: Vendor[]
}

export interface Vendor {
  name: string
  lastPrice: number
  lastDate: string
}

export interface Technician {
  id: string
  name: string
  avatar?: string
  status: TechnicianStatus
  activeWOs: number
  completedToday: number
  distanceToNextWO: number
  siteId: string
}

export interface ActivityEvent {
  id: string
  technicianName: string
  action: string
  target: string
  timestamp: string
}

export interface StudioApp {
  id: string
  name: string
  category: string
  description: string
  installed: boolean
  recommended: boolean
  lastUsed?: string
}

export interface BudgetLine {
  id: string
  category: string
  siteName: string
  budget: number
  spent: number
  alertReason?: string
}

export interface ComplianceItem {
  id: string
  title: string
  assetName: string
  dueDate: string
  daysLeft: number
  urgency: UrgencyLevel
  type: 'pm' | 'inspection' | 'certification'
}

export interface WeatherDay {
  date: string
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow'
  tempHigh: number
  tempLow: number
  windMph: number
  affectedAssets: string[]
  rescheduleReason?: string
}

export interface SensorReading {
  assetId: string
  assetName: string
  metric: string
  currentValue: number
  baseline: { min: number; max: number }
  unit: string
  history: number[]
  anomaly: boolean
  interpretation: string
}

export interface ShiftHandoff {
  generatedAt: string
  completed: string[]
  escalated: string[]
  unfinished: string[]
  notes: string[]
}

export interface FocusItem {
  id: string
  type: WorkOrder['category']
  title: string
  description: string
  urgency: UrgencyLevel
  priorityScore: number
  priorityReason: string
  cta: { label: string; href: string }
}

/* ── Site ── */

export interface Site {
  id: string
  name: string
  region?: string
}

/* ── Dashboard KPIs ── */

export interface DashboardKPIs {
  openWOs: number
  overdueWOs: number
  inProgressWOs: number
  completedToday: number
  totalTechnicians: number
  availableTechnicians: number
}

/* ── AI Stub Results ── */

export interface AnomalyResult extends SensorReading {
  severity: 'warning' | 'critical'
  deviationPercent: number
  explanation: string
}

export interface StockoutResult extends Part {
  daysUntilStockout: number
  urgencyLabel: string
  explanation: string
}

export interface FailureResult extends Asset {
  riskLabel: string
  explanation: string
}

export interface CostResult extends BudgetLine {
  percentUsed: number
  overrun: boolean
  explanation: string
}

/* ── Edge: Runtime ── */

export type SensorStatus = 'connected' | 'disconnected' | 'warning'

export interface DailyRuntime {
  date: string
  hours: number
  cycles: number
}

export interface MeterInfo {
  currentReading: number
  unit: string
  lastResetDate: string
  totalCycles: number
  avgCyclesPerDay: number
  nextServiceAt: number
}

export interface RuntimeWorkOrder {
  id: string
  title: string
  status: WOStatus
  createdAt: string
  urgency: UrgencyLevel
}

export interface RuntimeSensor {
  id: string
  name: string
  assetId: string
  assetName: string
  locationName: string
  gatewayId: string
  gatewayName: string
  type: string
  status: SensorStatus
  totalHours: number
  previousPeriodHours: number
  avgDailyHours: number
  peakDay: { date: string; hours: number }
  uptimePercent: number
  dailyRuntime: DailyRuntime[]
  meter?: MeterInfo
  meterName?: string
  meterSyncEnabled?: boolean
  runtimeThreshold?: number
  workOrders: RuntimeWorkOrder[]
  lastReading: string
  insights: string[]
}
