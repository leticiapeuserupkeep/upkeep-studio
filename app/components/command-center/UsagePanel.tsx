'use client'

import { Zap } from 'lucide-react'

const dailyActivity = [
  28, 31, 35, 29, 42, 38, 44, 41, 36, 48,
  39, 45, 50, 43, 47, 52, 46, 55, 49, 53,
  58, 51, 56, 60, 54, 62, 57, 64, 59, 68,
]

const maxActivity = Math.max(...dailyActivity)

const taskTypes = [
  { label: 'Search & retrieval', color: 'bg-[var(--color-accent-9)]', value: 482 },
  { label: 'Task execution', color: 'bg-[var(--color-accent-7)]', value: 314 },
  { label: 'Analysis & reporting', color: 'bg-[var(--color-accent-5)]', value: 247 },
  { label: 'Notifications & follow-ups', color: 'bg-[var(--color-accent-4)]', value: 241 },
]

const maxTask = Math.max(...taskTypes.map(t => t.value))

const agentActivity = [
  { name: 'Sofia', photo: 'https://i.pravatar.cc/150?u=sofia-chen-upkeep', pct: 40 },
  { name: 'Elena', photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep', pct: 30 },
  { name: 'Marcus', photo: 'https://i.pravatar.cc/150?u=marcus-johnson-upkeep', pct: 20 },
  { name: 'Other', photo: '', pct: 10 },
]

export function UsageThisMonthCard() {
  return (
    <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-accent-1)]">
          <Zap size={15} className="text-[var(--color-accent-9)]" />
        </div>
        <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">AI activity this month</h3>
      </div>

      <div className="flex items-center gap-6 mt-3 mb-4">
        <div>
          <p className="text-[11px] font-medium text-[var(--color-neutral-7)] uppercase tracking-wider">Actions processed</p>
          <p className="text-[20px] font-semibold text-[var(--color-neutral-12)]">1,284</p>
        </div>
        <div className="w-px h-8 bg-[var(--border-default)]" />
        <div>
          <p className="text-[11px] font-medium text-[var(--color-neutral-7)] uppercase tracking-wider">Estimated cost</p>
          <p className="text-[20px] font-semibold text-[var(--color-neutral-12)]">$847</p>
        </div>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neutral-7)] mb-2">
        Daily activity (30 days)
      </p>

      <div className="flex items-end gap-[3px] h-[80px]">
        {dailyActivity.map((val, i) => {
          const isToday = i === dailyActivity.length - 1
          const height = (val / maxActivity) * 100
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-colors ${isToday ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-4)] hover:bg-[var(--color-neutral-5)]'}`}
              style={{ height: `${height}%` }}
              title={`Day ${i + 1}: ${val} actions`}
            />
          )
        })}
      </div>
    </div>
  )
}

export function CostByActionCard() {
  return (
    <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
      <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)] mb-4">Activity by task type</h3>

      <div className="flex flex-col gap-4">
        {taskTypes.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--color-neutral-11)]">{item.label}</span>
              <span className="text-[13px] font-semibold text-[var(--color-neutral-12)]">{item.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--color-neutral-3)]">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-300`}
                style={{ width: `${(item.value / maxTask) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TokensByAgentCard() {
  return (
    <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">Agent workload</h3>
        <span className="text-[20px] font-semibold text-[var(--color-neutral-12)]">1,284</span>
      </div>

      <div className="flex flex-col gap-3.5">
        {agentActivity.map((agent) => (
          <div key={agent.name} className="flex items-center gap-3">
            {agent.photo ? (
              <img src={agent.photo} alt={agent.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-[var(--color-neutral-7)]">…</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-[var(--color-neutral-11)]">{agent.name}</span>
                <span className="text-[12px] text-[var(--color-neutral-8)]">{agent.pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--color-neutral-3)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent-9)] transition-all duration-300"
                  style={{ width: `${agent.pct}%`, opacity: agent.photo ? 1 : 0.5 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
