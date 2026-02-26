import type { WorkOrder, SensorReading, Part, Asset, BudgetLine, FocusItem } from './models'

export function prioritizeFocusToday(workOrders: WorkOrder[]): FocusItem[] {
  return [...workOrders]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((wo) => ({
      id: wo.id,
      type: wo.category,
      title: wo.title,
      description: `${wo.assetName} — ${wo.siteName}`,
      urgency: wo.urgency,
      priorityScore: wo.priorityScore,
      priorityReason: wo.priorityReason,
      cta: {
        label: wo.category === 'anomaly' ? 'Inspect Asset' : wo.category === 'compliance' ? 'Schedule Now' : 'View WO',
        href: `#${wo.id}`,
      },
    }))
}

export function detectAnomalies(
  readings: SensorReading[]
): Array<SensorReading & { severity: 'warning' | 'critical' }> {
  return readings
    .filter((r) => r.anomaly)
    .map((r) => {
      const deviation = r.currentValue > r.baseline.max
        ? ((r.currentValue - r.baseline.max) / r.baseline.max) * 100
        : ((r.baseline.min - r.currentValue) / r.baseline.min) * 100

      return {
        ...r,
        severity: deviation > 30 ? 'critical' as const : 'warning' as const,
      }
    })
    .sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1
      if (b.severity === 'critical' && a.severity !== 'critical') return 1
      return 0
    })
}

export function predictStockout(parts: Part[]): Array<Part & { daysUntilStockout: number; urgencyLabel: string }> {
  const today = new Date('2026-02-24')
  return parts
    .map((p) => {
      const stockoutDate = new Date(p.predictedStockout)
      const daysUntilStockout = Math.ceil((stockoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      let urgencyLabel = 'On track'
      if (daysUntilStockout <= 7) urgencyLabel = 'Order now'
      else if (daysUntilStockout <= 14) urgencyLabel = 'Order soon'
      return { ...p, daysUntilStockout, urgencyLabel }
    })
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
}

export function predictFailures(
  assets: Asset[]
): Array<Asset & { riskLabel: string }> {
  return assets
    .filter((a) => a.failureProbability > 0.3)
    .sort((a, b) => b.failureProbability - a.failureProbability)
    .map((a) => ({
      ...a,
      riskLabel:
        a.failureProbability > 0.7 ? 'Very likely' :
        a.failureProbability > 0.5 ? 'Likely' : 'Possible',
    }))
}

export function costOverrunInsights(
  lines: BudgetLine[]
): Array<BudgetLine & { percentUsed: number; overrun: boolean }> {
  return lines
    .map((l) => ({
      ...l,
      percentUsed: Math.round((l.spent / l.budget) * 100),
      overrun: l.spent / l.budget > 0.85,
    }))
    .sort((a, b) => b.percentUsed - a.percentUsed)
}
