'use client'

import { DollarSign } from 'lucide-react'

const dailyTokens = [
  28000, 31000, 35000, 29000, 42000, 38000, 44000, 41000, 36000, 48000,
  39000, 45000, 50000, 43000, 47000, 52000, 46000, 55000, 49000, 53000,
  58000, 51000, 56000, 60000, 54000, 62000, 57000, 64000, 59000, 68000,
]

const maxTokens = Math.max(...dailyTokens)

const costByAction = [
  { label: 'Searches', color: 'bg-[var(--color-accent-9)]', value: 340 },
  { label: 'Work order creation', color: 'bg-[var(--color-accent-7)]', value: 220 },
  { label: 'Analysis / reports', color: 'bg-[var(--color-accent-5)]', value: 170 },
  { label: 'Notifications', color: 'bg-[var(--color-accent-4)]', value: 117 },
]

const maxCost = Math.max(...costByAction.map(c => c.value))

const tokensByAgent = [
  { name: 'Sofia', photo: 'https://i.pravatar.cc/150?u=sofia-chen-upkeep', tokens: 512000, pct: 40 },
  { name: 'Elena', photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep', tokens: 385000, pct: 30 },
  { name: 'Marcus', photo: 'https://i.pravatar.cc/150?u=marcus-johnson-upkeep', tokens: 257000, pct: 20 },
  { name: 'Other', photo: '', tokens: 130000, pct: 10 },
]

export function UsagePanel() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">AI Usage & Cost</h3>
      <div className="grid grid-cols-3 gap-4">
      {/* Usage This Month */}
      <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-accent-1)]">
            <DollarSign size={15} className="text-[var(--color-accent-9)]" />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">Usage This Month</h3>
        </div>

        <div className="flex items-center gap-6 mt-3 mb-4">
          <div>
            <p className="text-[11px] font-medium text-[var(--color-neutral-7)] uppercase tracking-wider">Total tokens</p>
            <p className="text-[20px] font-semibold text-[var(--color-neutral-12)]">1,284,000</p>
          </div>
          <div className="w-px h-8 bg-[var(--border-default)]" />
          <div>
            <p className="text-[11px] font-medium text-[var(--color-neutral-7)] uppercase tracking-wider">Total cost</p>
            <p className="text-[20px] font-semibold text-[var(--color-neutral-12)]">$847</p>
          </div>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neutral-7)] mb-2">
          Daily token usage (30 days)
        </p>

        <div className="flex items-end gap-[3px] h-[80px]">
          {dailyTokens.map((val, i) => {
            const isToday = i === dailyTokens.length - 1
            const height = (val / maxTokens) * 100
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-colors ${isToday ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-4)] hover:bg-[var(--color-neutral-5)]'}`}
                style={{ height: `${height}%` }}
                title={`Day ${i + 1}: ${val.toLocaleString()} tokens`}
              />
            )
          })}
        </div>
      </div>

      {/* Cost by Action Type */}
      <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
        <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)] mb-4">Cost by Action Type</h3>

        <div className="flex flex-col gap-4">
          {costByAction.map((item) => (
            <div key={item.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--color-neutral-11)]">{item.label}</span>
                <span className="text-[13px] font-semibold text-[var(--color-neutral-12)]">${item.value}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--color-neutral-3)]">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-300`}
                  style={{ width: `${(item.value / maxCost) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tokens by Agent */}
      <div className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-[var(--color-neutral-12)]">Total Tokens</h3>
          <span className="text-[20px] font-semibold text-[var(--color-neutral-12)]">1,284k</span>
        </div>

        <div className="flex flex-col gap-3.5">
          {tokensByAgent.map((agent) => (
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
                  <span className="text-[12px] text-[var(--color-neutral-8)]">{(agent.tokens / 1000).toFixed(0)}k · {agent.pct}%</span>
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
    </div>
    </div>
  )
}
