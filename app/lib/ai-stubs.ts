import type {
  WorkOrder, SensorReading, Part, Asset, BudgetLine,
  FocusItem, AnomalyResult, StockoutResult, FailureResult, CostResult,
} from './models'

const REFERENCE_DATE = new Date('2026-02-24')

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

export function detectAnomalies(readings: SensorReading[]): AnomalyResult[] {
  return readings
    .filter((r) => r.anomaly)
    .map((r) => {
      const aboveMax = r.currentValue > r.baseline.max
      const deviationPercent = aboveMax
        ? Math.round(((r.currentValue - r.baseline.max) / r.baseline.max) * 100)
        : Math.round(((r.baseline.min - r.currentValue) / r.baseline.min) * 100)

      const severity = deviationPercent > 30 ? 'critical' as const : 'warning' as const
      const direction = aboveMax ? 'above maximum' : 'below minimum'

      const explanation =
        `${r.metric} on ${r.assetName} is ${deviationPercent}% ${direction} baseline. ` +
        `Current value: ${r.currentValue}${r.unit} (expected ${r.baseline.min}–${r.baseline.max}${r.unit}). ` +
        `${r.interpretation}`

      return { ...r, severity, deviationPercent, explanation }
    })
    .sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1
      if (b.severity === 'critical' && a.severity !== 'critical') return 1
      return b.deviationPercent - a.deviationPercent
    })
}

export function predictStockout(parts: Part[]): StockoutResult[] {
  return parts
    .map((p) => {
      const stockoutDate = new Date(p.predictedStockout)
      const daysUntilStockout = Math.ceil((stockoutDate.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24))

      let urgencyLabel = 'On track'
      if (daysUntilStockout <= 7) urgencyLabel = 'Order now'
      else if (daysUntilStockout <= 14) urgencyLabel = 'Order soon'

      const deficit = p.minRequired - p.onHand
      const deficitNote = deficit > 0
        ? `Currently ${deficit} unit${deficit > 1 ? 's' : ''} below minimum stock.`
        : 'Stock above minimum threshold.'

      const explanation =
        `${p.name}: estimated stockout in ${daysUntilStockout} days ` +
        `at current consumption rate of ${p.consumptionRate}/day. ` +
        `${deficitNote} ` +
        `Best vendor price: $${Math.min(...p.vendors.map((v) => v.lastPrice))} (${p.vendors[0]?.name ?? 'N/A'}).`

      return { ...p, daysUntilStockout, urgencyLabel, explanation }
    })
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
}

export function predictFailures(assets: Asset[]): FailureResult[] {
  return assets
    .filter((a) => a.failureProbability > 0.3)
    .sort((a, b) => b.failureProbability - a.failureProbability)
    .map((a) => {
      const riskLabel =
        a.failureProbability > 0.7 ? 'Very likely' :
        a.failureProbability > 0.5 ? 'Likely' : 'Possible'

      const pct = Math.round(a.failureProbability * 100)
      const driverList = a.failureDrivers.slice(0, 2).join('; ')

      const explanation =
        `${a.name} has a ${pct}% failure probability (health score: ${a.healthScore}/100). ` +
        `Key drivers: ${driverList}. ` +
        `Recommended: ${a.recommendedAction}.`

      return { ...a, riskLabel, explanation }
    })
}

export function costOverrunInsights(lines: BudgetLine[]): CostResult[] {
  return lines
    .map((l) => {
      const percentUsed = Math.round((l.spent / l.budget) * 100)
      const overrun = percentUsed > 85
      const remaining = l.budget - l.spent

      let explanation: string
      if (overrun && l.alertReason) {
        explanation =
          `${l.category} at ${l.siteName} has consumed ${percentUsed}% of budget ` +
          `($${l.spent.toLocaleString()} of $${l.budget.toLocaleString()}). ` +
          `Root cause: ${l.alertReason}. ` +
          `Only $${remaining.toLocaleString()} remaining.`
      } else if (overrun) {
        explanation =
          `${l.category} at ${l.siteName} is at ${percentUsed}% budget utilization. ` +
          `$${remaining.toLocaleString()} remaining — review spending before next cycle.`
      } else {
        explanation =
          `${l.category} at ${l.siteName} is on track at ${percentUsed}% utilization ` +
          `with $${remaining.toLocaleString()} remaining.`
      }

      return { ...l, percentUsed, overrun, explanation }
    })
    .sort((a, b) => b.percentUsed - a.percentUsed)
}
