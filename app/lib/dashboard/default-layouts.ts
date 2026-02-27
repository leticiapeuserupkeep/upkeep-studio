import type { Role } from '../models'
import type { WidgetPlacement } from './widget-types'

/**
 * Default widget layouts per role.
 *
 * These define the initial dashboard state for each role before any
 * user customization. When the user resets their layout, we restore
 * these defaults.
 *
 * Order values determine vertical stacking within a column.
 * The KPI strip sits outside the two-column grid (rendered separately),
 * but is tracked here for persistence and visibility toggling.
 */

const TECHNICIAN_LAYOUT: WidgetPlacement[] = [
  { widgetId: 'kpi-strip',             visible: true, order: 0, column: 'left' },
  { widgetId: 'focus-today',           visible: true, order: 1, column: 'left' },
  { widgetId: 'sensor-insights',       visible: true, order: 2, column: 'right' },
  { widgetId: 'weather-scheduling',    visible: true, order: 3, column: 'right' },
  { widgetId: 'manage-widgets',        visible: true, order: 4, column: 'right' },
]

const SUPERVISOR_LAYOUT: WidgetPlacement[] = [
  { widgetId: 'kpi-strip',             visible: true, order: 0,  column: 'left' },
  { widgetId: 'focus-today',           visible: true, order: 1,  column: 'left' },
  { widgetId: 'team-pulse',            visible: true, order: 2,  column: 'left' },
  { widgetId: 'cost-intelligence',     visible: true, order: 3,  column: 'left' },
  { widgetId: 'parts-risk',            visible: true, order: 4,  column: 'left' },
  { widgetId: 'sensor-insights',       visible: true, order: 5,  column: 'right' },
  { widgetId: 'predicted-failures',    visible: true, order: 6,  column: 'right' },
  { widgetId: 'compliance-countdown',  visible: true, order: 7,  column: 'right' },
  { widgetId: 'weather-scheduling',    visible: true, order: 8,  column: 'right' },
  { widgetId: 'shift-handoff',         visible: true, order: 9,  column: 'right' },
  { widgetId: 'manage-widgets',        visible: true, order: 10, column: 'right' },
]

const MANAGER_LAYOUT: WidgetPlacement[] = [
  { widgetId: 'kpi-strip',             visible: true, order: 0,  column: 'left' },
  { widgetId: 'focus-today',           visible: true, order: 1,  column: 'left' },
  { widgetId: 'team-pulse',            visible: true, order: 2,  column: 'left' },
  { widgetId: 'cost-intelligence',     visible: true, order: 3,  column: 'left' },
  { widgetId: 'parts-risk',            visible: true, order: 4,  column: 'left' },
  { widgetId: 'sensor-insights',       visible: true, order: 5,  column: 'right' },
  { widgetId: 'predicted-failures',    visible: true, order: 6,  column: 'right' },
  { widgetId: 'compliance-countdown',  visible: true, order: 7,  column: 'right' },
  { widgetId: 'weather-scheduling',    visible: true, order: 8,  column: 'right' },
  { widgetId: 'shift-handoff',         visible: true, order: 9,  column: 'right' },
  { widgetId: 'manage-widgets',        visible: true, order: 10, column: 'right' },
]

const DEFAULT_LAYOUTS: Record<Role, WidgetPlacement[]> = {
  technician: TECHNICIAN_LAYOUT,
  supervisor: SUPERVISOR_LAYOUT,
  manager: MANAGER_LAYOUT,
}

export function getDefaultLayout(role: Role): WidgetPlacement[] {
  return DEFAULT_LAYOUTS[role].map((p) => ({ ...p }))
}
