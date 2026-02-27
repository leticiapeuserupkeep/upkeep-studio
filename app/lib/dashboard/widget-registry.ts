import type { WidgetConfig, WidgetId } from './widget-types'

/**
 * Static registry of every widget available in the Command Center.
 *
 * Each entry defines the widget's metadata, default placement,
 * role visibility, and whether it can be removed/dragged.
 * Component mapping happens separately in the rendering layer.
 */
export const WIDGET_REGISTRY: Record<WidgetId, WidgetConfig> = {
  'focus-today': {
    id: 'focus-today',
    title: 'Focus Today',
    description: 'AI-prioritized items requiring attention today',
    defaultSize: 'lg',
    defaultColumn: 'left',
    roles: ['technician', 'supervisor', 'manager'],
    isRemovable: false,
    isDraggable: true,
  },
  'kpi-strip': {
    id: 'kpi-strip',
    title: 'KPI Overview',
    description: 'Key performance indicators at a glance',
    defaultSize: 'full',
    defaultColumn: 'left',
    roles: ['technician', 'supervisor', 'manager'],
    isRemovable: false,
    isDraggable: true,
  },
  'team-pulse': {
    id: 'team-pulse',
    title: 'Team Pulse',
    description: 'Technician workload and activity feed',
    defaultSize: 'lg',
    defaultColumn: 'left',
    roles: ['supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'parts-risk': {
    id: 'parts-risk',
    title: 'Parts Risk Monitor',
    description: 'Predicted stockouts and inventory alerts',
    defaultSize: 'md',
    defaultColumn: 'left',
    roles: ['supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'sensor-insights': {
    id: 'sensor-insights',
    title: 'Sensor Insights',
    description: 'Real-time sensor anomalies and trends',
    defaultSize: 'md',
    defaultColumn: 'right',
    roles: ['technician', 'supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'predicted-failures': {
    id: 'predicted-failures',
    title: 'Predicted Failures',
    description: 'AI-predicted asset failure probabilities',
    defaultSize: 'md',
    defaultColumn: 'right',
    roles: ['supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'cost-intelligence': {
    id: 'cost-intelligence',
    title: 'Cost Intelligence',
    description: 'Budget utilization and overrun alerts',
    defaultSize: 'md',
    defaultColumn: 'left',
    roles: ['supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'compliance-countdown': {
    id: 'compliance-countdown',
    title: 'Compliance Countdown',
    description: 'Upcoming compliance deadlines and expirations',
    defaultSize: 'md',
    defaultColumn: 'right',
    roles: ['supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'weather-scheduling': {
    id: 'weather-scheduling',
    title: 'Weather & Scheduling',
    description: 'Weather impact on outdoor work orders',
    defaultSize: 'sm',
    defaultColumn: 'right',
    roles: ['technician', 'supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'shift-handoff': {
    id: 'shift-handoff',
    title: 'Shift Handoff',
    description: 'AI-generated shift summary for handovers',
    defaultSize: 'md',
    defaultColumn: 'right',
    roles: ['supervisor', 'manager'],
    isRemovable: true,
    isDraggable: true,
  },
  'manage-widgets': {
    id: 'manage-widgets',
    title: 'Manage Widgets',
    description: 'Add, remove, and reorder dashboard widgets',
    defaultSize: 'sm',
    defaultColumn: 'right',
    roles: ['technician', 'supervisor', 'manager'],
    isRemovable: false,
    isDraggable: true,
  },
}

export const ALL_WIDGET_IDS: WidgetId[] = Object.keys(WIDGET_REGISTRY) as WidgetId[]

/** Return only the widgets visible to a given role. */
export function getWidgetsForRole(role: string): WidgetConfig[] {
  return ALL_WIDGET_IDS
    .map((id) => WIDGET_REGISTRY[id])
    .filter((w) => w.roles.includes(role as 'technician' | 'supervisor' | 'manager'))
}
