'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'

type MainTab = 'apps' | 'messaging'

type FilterId =
  | 'all'
  | 'connected'
  | 'email'
  | 'productivity'
  | 'calendar'
  | 'business'
  | 'erp'
  | 'developer'
  | 'social'

/** Pinned Simple Icons release for consistent CDN paths (see https://simpleicons.org/). */
const SIMPLE_ICONS_PKG = 'simple-icons@11.15.0'

/** Brand hex (no #) from Simple Icons — used with mask + background for full-color marks. */
const SIMPLE_ICONS_BRAND_HEX: Record<string, string> = {
  gmail: 'EA4335',
  microsoftoutlook: '0078D4',
  googledocs: '4285F4',
  googlemeet: '00832D',
  googlesheets: '34A853',
  googledrive: '4285F4',
  hubspot: 'FF7A59',
  salesforce: '00A1E0',
  dynamics365: '002050',
  workday: '0066CC',
  x: '000000',
  notion: '000000',
  zoom: '2D8CFF',
  mondaydotcom: 'FF3D57',
  quickbooks: '2CA01C',
  github: '181717',
  instagram: 'E4405F',
  confluence: '172B4D',
  calendly: '006BFF',
  sap: '0FAAFF',
  xero: '13B5EA',
  linear: '5E6AD2',
  dropbox: '0061FF',
  netsuite: '004F9F',
  servicenow: '293E40',
  jira: '0052CC',
  slack: '4A154B',
  microsoftteams: '6264A7',
  discord: '5865F2',
  telegram: '26A5E4',
  whatsapp: '25D366',
  twilio: 'F22F46',
}

type IntegrationApp = {
  id: string
  name: string
  description: string
  /** Icon file slug under `icons/{slug}.svg` in Simple Icons. */
  slug: string
  connected: boolean
  /** Category filters (excludes `all` / `connected`). */
  tags: Exclude<FilterId, 'all' | 'connected'>[]
}

const FILTER_OPTIONS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'connected', label: 'Connected' },
  { id: 'email', label: 'Email' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'business', label: 'Business' },
  { id: 'erp', label: 'ERP & Finance' },
  { id: 'developer', label: 'Developer' },
  { id: 'social', label: 'Social' },
]

const APP_INTEGRATIONS: IntegrationApp[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and manage emails',
    slug: 'gmail',
    connected: true,
    tags: ['email'],
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Email and calendar',
    slug: 'microsoftoutlook',
    connected: true,
    tags: ['email', 'calendar'],
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    description: 'Document editing',
    slug: 'googledocs',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Video meetings',
    slug: 'googlemeet',
    connected: false,
    tags: ['calendar'],
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Spreadsheets and data',
    slug: 'googlesheets',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'File storage and sharing',
    slug: 'googledrive',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing and CRM',
    slug: 'hubspot',
    connected: false,
    tags: ['business'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM and sales',
    slug: 'salesforce',
    connected: false,
    tags: ['business'],
  },
  {
    id: 'dynamics',
    name: 'Dynamics 365',
    description: 'Microsoft ERP and CRM',
    slug: 'dynamics365',
    connected: false,
    tags: ['erp', 'business'],
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'HR and finance cloud',
    slug: 'workday',
    connected: false,
    tags: ['erp'],
  },
  {
    id: 'x-twitter',
    name: 'X / Twitter',
    description: 'Social media',
    slug: 'x',
    connected: false,
    tags: ['social'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Notes and project management',
    slug: 'notion',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing',
    slug: 'zoom',
    connected: false,
    tags: ['calendar'],
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Work management',
    slug: 'mondaydotcom',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and invoicing',
    slug: 'quickbooks',
    connected: false,
    tags: ['erp'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repos and issues',
    slug: 'github',
    connected: false,
    tags: ['developer'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Photo and video sharing',
    slug: 'instagram',
    connected: false,
    tags: ['social'],
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Team wiki and documentation',
    slug: 'confluence',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Scheduling automation',
    slug: 'calendly',
    connected: false,
    tags: ['calendar'],
  },
  {
    id: 'sap',
    name: 'SAP',
    description: 'Enterprise resource planning',
    slug: 'sap',
    connected: false,
    tags: ['erp'],
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud accounting',
    slug: 'xero',
    connected: false,
    tags: ['erp'],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issue tracking',
    slug: 'linear',
    connected: false,
    tags: ['developer', 'productivity'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud storage',
    slug: 'dropbox',
    connected: false,
    tags: ['productivity'],
  },
  {
    id: 'netsuite',
    name: 'NetSuite',
    description: 'Cloud ERP and financials',
    slug: 'netsuite',
    connected: false,
    tags: ['erp'],
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'IT service management',
    slug: 'servicenow',
    connected: false,
    tags: ['business'],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project management',
    slug: 'jira',
    connected: false,
    tags: ['developer', 'productivity'],
  },
]

type MessagingApp = { id: string; name: string; description: string; slug: string; connected: boolean }

const MESSAGING_CHANNELS: MessagingApp[] = [
  { id: 'slack', name: 'Slack', description: 'Team chat and channels', slug: 'slack', connected: false },
  { id: 'teams', name: 'Microsoft Teams', description: 'Chat and meetings', slug: 'microsoftteams', connected: false },
  { id: 'discord', name: 'Discord', description: 'Community messaging', slug: 'discord', connected: false },
  { id: 'telegram', name: 'Telegram', description: 'Secure messaging', slug: 'telegram', connected: false },
  { id: 'whatsapp', name: 'WhatsApp', description: 'Business messaging', slug: 'whatsapp', connected: false },
  { id: 'twilio-sms', name: 'SMS (Twilio)', description: 'Transactional SMS', slug: 'twilio', connected: false },
]

function matchesFilter(app: IntegrationApp, filter: FilterId): boolean {
  if (filter === 'all') return true
  if (filter === 'connected') return app.connected
  return app.tags.includes(filter)
}

function IntegrationLogo({ name, slug }: { name: string; slug: string }) {
  const [failed, setFailed] = useState(false)
  const iconSvgUrl = `https://cdn.jsdelivr.net/npm/${SIMPLE_ICONS_PKG}/icons/${slug}.svg`
  const brandHex = SIMPLE_ICONS_BRAND_HEX[slug] ?? '737373'

  if (failed) {
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-neutral-3)] text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-10)]"
        aria-hidden
      >
        {name.slice(0, 1)}
      </span>
    )
  }

  return (
    <>
      {/* Probes load; mask below does not fire onError in all engines. */}
      <img
        src={iconSvgUrl}
        alt=""
        className="sr-only"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <span
        className="block h-10 w-10 shrink-0"
        style={{
          backgroundColor: `#${brandHex}`,
          WebkitMaskImage: `url(${iconSvgUrl})`,
          maskImage: `url(${iconSvgUrl})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
        aria-hidden
      />
    </>
  )
}

function IntegrationCard({
  name,
  description,
  slug,
  connected,
}: {
  name: string
  description: string
  slug: string
  connected: boolean
}) {
  return (
    <div className="sn-staging-integration-card-enter relative flex gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-xs)] transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-sm)]">
      {connected && (
        <span
          className="absolute right-2 top-2 z-[1] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-success)] text-white shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-success)_25%,transparent)] ring-2 ring-[var(--surface-primary)]"
          title="Connected"
          aria-label="Connected"
        >
          <Check size={12} strokeWidth={2.5} className="shrink-0" aria-hidden />
        </span>
      )}
      <IntegrationLogo name={name} slug={slug} />
      <div className={`min-w-0 flex-1 text-left ${connected ? 'pr-6' : ''}`}>
        <h3 className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)]">{name}</h3>
        <p className="mt-1 text-[length:var(--font-size-sm)] leading-snug text-[var(--color-neutral-8)]">{description}</p>
      </div>
    </div>
  )
}

export function SuperNovaStagingIntegrationsContent() {
  const [mainTab, setMainTab] = useState<MainTab>('apps')
  const [filter, setFilter] = useState<FilterId>('all')

  const visibleApps = useMemo(() => APP_INTEGRATIONS.filter((app) => matchesFilter(app, filter)), [filter])

  return (
    <div className="flex w-full max-w-[var(--supernova-staging-content-max)] flex-col gap-[var(--space-xl)]">
      <p className="max-w-[var(--supernova-staging-prose-max)] text-[length:var(--font-size-body-1)] leading-6 text-[var(--color-neutral-12)]">
        Connect apps and messaging channels to extend your agent.
      </p>

      <div
        className="flex w-full rounded-[var(--radius-xl)] bg-[var(--color-neutral-3)] p-1"
        role="tablist"
        aria-label="Integration source"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'apps'}
          className={`min-h-10 flex-1 rounded-[var(--radius-lg)] px-3 py-2.5 text-[length:var(--font-size-sm)] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-7)] focus-visible:ring-offset-2 ${
            mainTab === 'apps'
              ? 'bg-[var(--surface-primary)] text-[var(--color-neutral-12)] shadow-[var(--shadow-xs)]'
              : 'text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)]'
          }`}
          onClick={() => setMainTab('apps')}
        >
          App Integrations
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === 'messaging'}
          className={`min-h-10 flex-1 rounded-[var(--radius-lg)] px-3 py-2.5 text-[length:var(--font-size-sm)] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-7)] focus-visible:ring-offset-2 ${
            mainTab === 'messaging'
              ? 'bg-[var(--surface-primary)] text-[var(--color-neutral-12)] shadow-[var(--shadow-xs)]'
              : 'text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)]'
          }`}
          onClick={() => setMainTab('messaging')}
        >
          Messaging Channels
        </button>
      </div>

      {mainTab === 'apps' && (
        <>
          <div
            className="flex flex-wrap gap-2"
            role="toolbar"
            aria-label="Filter integrations"
          >
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[length:var(--font-size-sm)] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-7)] focus-visible:ring-offset-2 ${
                    active
                      ? 'bg-[var(--color-accent-9)] text-white'
                      : 'bg-transparent text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-12)]'
                  }`}
                  onClick={() => setFilter(opt.id)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          <div className="sn-staging-integration-cards grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleApps.map((app) => (
              <IntegrationCard
                key={app.id}
                name={app.name}
                description={app.description}
                slug={app.slug}
                connected={app.connected}
              />
            ))}
          </div>
        </>
      )}

      {mainTab === 'messaging' && (
        <div className="sn-staging-integration-cards grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MESSAGING_CHANNELS.map((ch) => (
            <IntegrationCard
              key={ch.id}
              name={ch.name}
              description={ch.description}
              slug={ch.slug}
              connected={ch.connected}
            />
          ))}
        </div>
      )}

      <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
        500+ apps available via Composio. Ask your agent to search for specific tools.
      </p>
    </div>
  )
}
