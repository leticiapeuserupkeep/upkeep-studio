import type { RuntimeSensor } from './models'

function woIsActive(wo: { status: string }) {
  return wo.status === 'open' || wo.status === 'in_progress' || wo.status === 'on_hold'
}

/** Sensors with at least one non-completed critical work order. */
export function countSensorsWithCriticalAlerts(sensors: RuntimeSensor[]): number {
  return sensors.filter((s) =>
    s.workOrders.some((wo) => wo.urgency === 'critical' && woIsActive(wo)),
  ).length
}

/** Sensors in warning device state or with an active high-urgency work order. */
export function countSensorsWithWarnings(sensors: RuntimeSensor[]): number {
  return sensors.filter(
    (s) =>
      s.status === 'warning' ||
      s.workOrders.some((wo) => wo.urgency === 'high' && woIsActive(wo)),
  ).length
}

export function countSensorsByStatus(
  sensors: RuntimeSensor[],
  status: RuntimeSensor['status'],
): number {
  return sensors.filter((s) => s.status === status).length
}

export function uniqueLocations(sensors: RuntimeSensor[]): string[] {
  return [...new Set(sensors.map((s) => s.locationName))].sort((a, b) => a.localeCompare(b))
}

export function uniqueAssetNames(sensors: RuntimeSensor[]): string[] {
  return [...new Set(sensors.map((s) => s.assetName))].sort((a, b) => a.localeCompare(b))
}

export function allAssetTags(sensors: RuntimeSensor[]): string[] {
  const set = new Set<string>()
  for (const s of sensors) {
    for (const t of s.assetTags ?? []) set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}
