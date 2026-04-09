import { ClipboardList, AlertTriangle, Clock, CheckCircle2, Users } from 'lucide-react'
import { KPI } from '@/app/components/ui/KPI'
import { MiniBarChart } from '@/app/components/ui/MiniBarChart'
import type { DashboardKPIs } from '@/app/lib/models'

interface KPIStripProps {
  kpis: DashboardKPIs
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const MOCK_OPEN_TREND = [12, 9, 14, 11, 17, 8, 15]
const MOCK_COMPLETED_TREND = [5, 7, 4, 8, 6, 3, 9]

export function KPIStrip({ kpis }: KPIStripProps) {
  const todayIndex = new Date().getDay()
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1

  return (
    <div className="grid grid-cols-4 gap-[var(--dashboard-kpi-gap)]">
      <KPI
        label="Open Work Orders"
        value={kpis.openWOs}
        icon={<ClipboardList size={20} className="text-[var(--color-accent-9)]" />}
        accent
        chart={
          <MiniBarChart
            data={MOCK_OPEN_TREND}
            labels={WEEKDAY_LABELS}
            highlightIndex={adjustedIndex}
            highlightColor="var(--color-accent-9)"
            width={140}
            height={56}
          />
        }
      />
      <KPI
        label="Overdue"
        value={kpis.overdueWOs}
        subtitle={kpis.overdueWOs > 0 ? 'Requires attention' : 'All on track'}
        icon={<AlertTriangle size={20} className="text-[var(--color-error)]" />}
      />
      <KPI
        label="In Progress"
        value={kpis.inProgressWOs}
        icon={<Clock size={20} className="text-[var(--color-warning)]" />}
      />
      <KPI
        label="Completed Today"
        value={kpis.completedToday}
        subtitle={`${kpis.availableTechnicians} of ${kpis.totalTechnicians} techs available`}
        subtitleIcon={<Users size={11} />}
        icon={<CheckCircle2 size={20} className="text-[var(--color-success)]" />}
        chart={
          <MiniBarChart
            data={MOCK_COMPLETED_TREND}
            labels={WEEKDAY_LABELS}
            highlightIndex={adjustedIndex}
            highlightColor="var(--color-success)"
            width={140}
            height={56}
          />
        }
      />
    </div>
  )
}
