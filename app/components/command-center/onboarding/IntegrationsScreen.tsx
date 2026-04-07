'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { ProgressDots } from './ProgressDots'
import type { IntegrationStatus } from '@/app/lib/hooks/use-onboarding-state'

/* ── Integration config ── */

interface IntegrationConfig {
  id: string
  name: string
  description: string
  logo: string
  recommended: boolean
  usedBy: string[]
}

const integrations: IntegrationConfig[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notifications, alerts, and work order updates',
    logo: '/images/integrations/slack.svg',
    recommended: true,
    usedBy: ['Sofia', 'Marcus'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync schedules, PM dates, and technician availability',
    logo: '/images/integrations/google-calendar.svg',
    recommended: true,
    usedBy: ['Sofia'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Import requests, send reports, and vendor comms',
    logo: '/images/integrations/gmail.svg',
    recommended: true,
    usedBy: ['Marcus', 'Elena'],
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Team notifications and work order collaboration',
    logo: '/images/integrations/teams.svg',
    recommended: false,
    usedBy: ['Sofia', 'Marcus'],
  },
  {
    id: 'sap',
    name: 'SAP (ERP)',
    description: 'Sync work orders, inventory, and procurement data',
    logo: '/images/integrations/sap.svg',
    recommended: false,
    usedBy: ['Sofia', 'Elena'],
  },
  {
    id: 'oracle',
    name: 'Oracle',
    description: 'Connect assets, maintenance records, and vendor data',
    logo: '/images/integrations/oracle.svg',
    recommended: false,
    usedBy: ['Elena', 'Marcus'],
  },
]

/* ── Props ── */

interface IntegrationsScreenProps {
  integrationState: Record<string, IntegrationStatus>
  onToggle: (id: string) => void
  onComplete: () => void
}

/* ── Component ── */

export function IntegrationsScreen({ integrationState, onToggle, onComplete }: IntegrationsScreenProps) {
  const [connecting, setConnecting] = useState<string | null>(null)

  const connectedCount = Object.values(integrationState).filter(i => i.connected).length
  const recommended = integrations.filter(i => i.recommended)
  const others = integrations.filter(i => !i.recommended)

  function handleConnect(id: string) {
    if (integrationState[id]?.connected) {
      onToggle(id)
      return
    }
    setConnecting(id)
    setTimeout(() => {
      onToggle(id)
      setConnecting(null)
    }, 800)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--surface-canvas)]">
      <div className="w-full max-w-[560px]">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-2 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
        >
          <h2 className="text-[20px] font-semibold text-[var(--color-neutral-12)]">
            Connect your tools
          </h2>
          <span className="text-[13px] font-medium text-[var(--color-neutral-8)] bg-[var(--color-neutral-2)] px-2.5 py-1 rounded-full">
            3 / 6
          </span>
        </div>

        <p
          className="text-[14px] text-[var(--color-neutral-8)] mb-6 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.1s forwards' }}
        >
          Your Agents work better with the tools you already use.
        </p>

        {/* Recommended */}
        <div
          className="mb-4 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.15s forwards' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-7)] mb-2 px-1">
            Recommended
          </p>
          <div className="flex flex-col gap-2">
            {recommended.map((integ) => (
              <IntegrationRow
                key={integ.id}
                config={integ}
                isConnected={integrationState[integ.id]?.connected ?? false}
                isConnecting={connecting === integ.id}
                onConnect={() => handleConnect(integ.id)}
              />
            ))}
          </div>
        </div>

        {/* Others */}
        <div
          className="mb-6 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.2s forwards' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-7)] mb-2 px-1">
            More integrations
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {others.map((integ) => (
              <IntegrationCard
                key={integ.id}
                config={integ}
                isConnected={integrationState[integ.id]?.connected ?? false}
                isConnecting={connecting === integ.id}
                onConnect={() => handleConnect(integ.id)}
              />
            ))}
          </div>
        </div>

        {/* Continue */}
        <div
          className="flex items-center justify-between mb-8 opacity-0"
          style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.25s forwards' }}
        >
          <span className="text-[13px] text-[var(--color-neutral-8)]">
            {connectedCount > 0 ? `${connectedCount} connected` : 'You can always add more later'}
          </span>
          <Button variant="primary" size="md" onClick={onComplete} className="gap-1.5">
            Continue <span className="text-white/80">→</span>
          </Button>
        </div>

        {/* Dots */}
        <div className="flex justify-center">
          <ProgressDots currentPhase="integrations" />
        </div>
      </div>
    </div>
  )
}

/* ── Integration Row (horizontal – recommended) ── */

function IntegrationRow({
  config, isConnected, isConnecting, onConnect,
}: {
  config: IntegrationConfig
  isConnected: boolean
  isConnecting: boolean
  onConnect: () => void
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface-primary)] p-3.5 transition-all duration-200 ${
        isConnected
          ? 'border-[var(--color-success)] shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
          : 'border-[var(--border-default)] hover:border-[var(--color-neutral-5)]'
      }`}
    >
      <img
        src={config.logo}
        alt={config.name}
        className="w-9 h-9 rounded-[var(--radius-md)] object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-[var(--color-neutral-12)]">{config.name}</span>
          {config.recommended && !isConnected && (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-accent-9)] bg-[var(--color-accent-1)] px-1.5 py-0.5 rounded">
              Recommended
            </span>
          )}
        </div>
        <p className="text-[12px] text-[var(--color-neutral-8)] mt-0.5">{config.description}</p>
      </div>

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[12px] font-semibold cursor-pointer transition-all duration-200 shrink-0 ${
          isConnected
            ? 'bg-[var(--color-success)] text-white hover:bg-emerald-600'
            : isConnecting
              ? 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-7)]'
              : 'border border-[var(--border-default)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
        }`}
      >
        {isConnected ? (
          <>
            <Check size={12} strokeWidth={3} />
            Connected
          </>
        ) : isConnecting ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-[var(--color-neutral-5)] border-t-[var(--color-accent-9)] animate-spin" />
            Connecting…
          </>
        ) : (
          'Connect'
        )}
      </button>
    </div>
  )
}

/* ── Integration Card (vertical – more integrations) ── */

function IntegrationCard({
  config, isConnected, isConnecting, onConnect,
}: {
  config: IntegrationConfig
  isConnected: boolean
  isConnecting: boolean
  onConnect: () => void
}) {
  return (
    <div
      className={`flex flex-col items-start gap-2.5 rounded-[var(--radius-lg)] border bg-[var(--surface-primary)] p-4 transition-all duration-200 ${
        isConnected
          ? 'border-[var(--color-success)] shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
          : 'border-[var(--border-default)] hover:border-[var(--color-neutral-5)]'
      }`}
    >
      <img
        src={config.logo}
        alt={config.name}
        className="w-10 h-10 rounded-[var(--radius-md)] object-cover"
      />
      <span className="text-[13px] font-medium text-[var(--color-neutral-12)]">{config.name}</span>

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer transition-all duration-200 ${
          isConnected
            ? 'text-[var(--color-success)]'
            : isConnecting
              ? 'text-[var(--color-neutral-7)]'
              : 'text-[var(--color-accent-9)] hover:text-[var(--color-accent-11)]'
        }`}
      >
        {isConnected ? (
          <>
            <Check size={12} strokeWidth={3} />
            Connected
          </>
        ) : isConnecting ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-[var(--color-neutral-5)] border-t-[var(--color-accent-9)] animate-spin" />
            Connecting…
          </>
        ) : (
          'Connect'
        )}
      </button>
    </div>
  )
}
