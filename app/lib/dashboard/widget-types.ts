import type { Role } from '../models'

/* ── Widget Identifiers ── */

export type WidgetId =
  | 'focus-today'
  | 'kpi-strip'
  | 'team-pulse'
  | 'parts-risk'
  | 'sensor-insights'
  | 'predicted-failures'
  | 'cost-intelligence'
  | 'compliance-countdown'
  | 'weather-scheduling'
  | 'shift-handoff'
  | 'manage-widgets'

export type WidgetSize = 'sm' | 'md' | 'lg' | 'full'

export type WidgetColumn = 'left' | 'right'

/* ── Static Widget Definition ── */

/**
 * Describes a widget's static metadata. Lives in the registry.
 * This never changes at runtime — it defines *what* a widget is.
 */
export interface WidgetConfig {
  id: WidgetId
  title: string
  description?: string
  defaultSize: WidgetSize
  defaultColumn: WidgetColumn
  roles: Role[]
  isRemovable: boolean
  isDraggable: boolean
}

/* ── Runtime Widget Placement ── */

/**
 * Describes a widget's position and visibility in the current layout.
 * This is the user-mutable state that gets persisted.
 */
export interface WidgetPlacement {
  widgetId: WidgetId
  visible: boolean
  order: number
  column: WidgetColumn
}

/* ── Persisted Dashboard Layout ── */

/**
 * The full serializable dashboard state.
 * Stored in localStorage now, designed for backend persistence later.
 */
export interface DashboardLayout {
  widgets: WidgetPlacement[]
  lastModified: string
}

/* ── Dashboard Context ── */

/**
 * Runtime dashboard state passed through context.
 * Combines the user's role, site filter, and their current layout.
 */
export interface DashboardState {
  role: Role
  siteFilter: string
  layout: DashboardLayout
  availableWidgets: WidgetConfig[]
}
