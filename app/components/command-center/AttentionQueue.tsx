'use client'

import { useState } from 'react'
import { Clock, ChevronDown, Check, MessageCircle, User, Mail, Calendar, Package } from 'lucide-react'
import { IntegrationsStrip } from './IntegrationsStrip'

/* ── Types ── */

interface IntegrationRef { name: string; logo: string }
interface SuggestedBy { name: string; photo: string }

interface Suggestion {
  id: string
  icon: 'assign' | 'email' | 'schedule' | 'inventory'
  title: string
  badge?: string
  reasoning: string
  emailDraft?: { to: string; subject: string; body: string }
  acceptLabel: string
  altLabel?: string
  status: 'pending' | 'accepted' | 'rejected'
}

interface AttentionItem {
  id: string
  type: 'sla' | 'anomaly' | 'approval'
  reference: string
  title: string
  description: string
  timeLeft?: string
  suggestedBy: SuggestedBy
  source?: IntegrationRef[]
  pillLabel: string
  suggestions: Suggestion[]
  chatOpener: string
}

/* ── Data ── */

const items: AttentionItem[] = [
  {
    id: '1',
    type: 'sla',
    reference: 'WO-4521',
    title: 'HVAC unit failure — Building A',
    description: 'Cooling system down. Immediate assignment needed.',
    timeLeft: '2h left',
    suggestedBy: { name: 'Sofia', photo: 'https://i.pravatar.cc/150?u=sofia-chen-upkeep' },
    source: [
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
      { name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' },
    ],
    pillLabel: 'Sofia has suggestions',
    suggestions: [
      {
        id: 's1', icon: 'assign', title: 'Assign to John Reeves', badge: '⏱ 2h SLA',
        reasoning: '**John is available now** and **0.8 mi** from Building A. His last 3 WOs of this type were HVAC jobs — all resolved within SLA.',
        acceptLabel: 'Assign John', altLabel: 'Assign', status: 'pending',
      },
      {
        id: 's2', icon: 'email', title: 'Notify by Email',
        reasoning: "I'll send a heads-up to the Building A manager so tenants know HVAC is being addressed. Helps prevent duplicate reports.",
        emailDraft: { to: 'mgr-buildingA@company.com', subject: 'HVAC repair in progress — Building A', body: 'Hi — a technician has been assigned to the HVAC unit failure in Building A. ETA is within 2 hours. We\'ll update you once resolved.' },
        acceptLabel: 'Send email', altLabel: 'Edit', status: 'pending',
      },
    ],
    chatOpener: "I flagged WO-4521 because the SLA window is closing in 2 hours. I've identified John Reeves as the best available technician — he's nearby and has HVAC experience. Want me to assign him?",
  },
  {
    id: '2',
    type: 'anomaly',
    reference: 'Asset #1847',
    title: 'Compressor #4 vibration pattern',
    description: 'Bearing wear detected. Failure predicted in 2–3 weeks.',
    suggestedBy: { name: 'Marcus', photo: 'https://i.pravatar.cc/150?u=marcus-johnson-upkeep' },
    source: [
      { name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' },
    ],
    pillLabel: 'Marcus has suggestions',
    suggestions: [
      {
        id: 's3', icon: 'schedule', title: 'Schedule preventive maintenance',
        reasoning: "Vibration data shows **bearing degradation at 73%**. Historical pattern suggests failure within **2–3 weeks**. Scheduling a PM now avoids unplanned downtime estimated at **$4,200/day**.",
        acceptLabel: 'Schedule PM', altLabel: 'Pick date', status: 'pending',
      },
    ],
    chatOpener: "I detected an anomaly in Compressor #4's vibration signature. The bearing wear pattern matches 3 previous failures in your fleet. I'd recommend scheduling preventive maintenance within the next week.",
  },
  {
    id: '3',
    type: 'approval',
    reference: 'PO-892',
    title: 'Part reorder — $1,240',
    description: '15× filters above auto-approval threshold.',
    suggestedBy: { name: 'Elena', photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep' },
    source: [
      { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    pillLabel: 'Elena recommends approval',
    suggestions: [
      {
        id: 's4', icon: 'inventory', title: 'Approve filter reorder', badge: '$1,240',
        reasoning: "Current stock is **3 units** — below the **15-unit minimum**. Usage rate is **4/week**, so you'll run out in **5 days**. Vendor price is **8% below** market average. Recommended qty: 15.",
        acceptLabel: 'Approve reorder', altLabel: 'Adjust qty', status: 'pending',
      },
    ],
    chatOpener: "PO-892 is a reorder for 15 air filters at $1,240. Current stock will last about 5 days at your usage rate. The vendor's price is competitive — 8% below average. Want me to approve it?",
  },
  {
    id: '4',
    type: 'anomaly',
    reference: 'Line 3 — SAP',
    title: 'Material shortage predicted — Line 3',
    description: 'ERP stock forecast shows raw material depletion in ~4 days at current production rate.',
    suggestedBy: { name: 'Elena', photo: 'https://i.pravatar.cc/150?u=elena-rodriguez-upkeep' },
    source: [
      { name: 'SAP', logo: '/images/integrations/sap.svg' },
    ],
    pillLabel: 'Elena has 1 suggestion',
    suggestions: [
      {
        id: 's5', icon: 'inventory', title: 'Create emergency PO in SAP', badge: '~$3,200',
        reasoning: "Current stock of **Material M-204** will run out in **4 days** based on Line 3's production rate of **120 units/day**. Lead time from preferred vendor is **3 days** — ordering now avoids a stoppage estimated at **$8,400/day**.",
        acceptLabel: 'Create PO', altLabel: 'Review stock', status: 'pending',
      },
    ],
    chatOpener: "I detected a material shortage risk on Line 3 based on SAP inventory data. At the current production rate, M-204 stock runs out in 4 days. I can create an emergency PO now — want me to proceed?",
  },
]

const badgeConfig = {
  sla: { label: 'SLA risk', bg: 'bg-red-50 text-red-700 border-red-200', border: 'border-l-red-500' },
  anomaly: { label: 'Anomaly', bg: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-500' },
  approval: { label: 'Approval', bg: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
}

const suggestionIconConfig = {
  assign: { bg: 'bg-blue-100', color: 'text-blue-600', Icon: User, image: null },
  email: { bg: 'bg-transparent', color: '', Icon: Mail, image: '/images/integrations/gmail.svg' },
  schedule: { bg: 'bg-amber-100', color: 'text-amber-600', Icon: Calendar, image: null },
  inventory: { bg: 'bg-green-100', color: 'text-green-600', Icon: Package, image: null },
}

/* ── Component ── */

interface AttentionQueueProps {
  onOpenChat?: (mateId: string, initialMessage?: string) => void
}

export function AttentionQueue({ onOpenChat }: AttentionQueueProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion[]>>(
    Object.fromEntries(items.map(i => [i.id, i.suggestions.map(s => ({ ...s }))]))
  )

  const handleAccept = (itemId: string, sugId: string) => {
    setSuggestions(p => ({
      ...p,
      [itemId]: p[itemId].map(s => s.id === sugId ? { ...s, status: 'accepted' as const } : s),
    }))
  }

  const handleReject = (itemId: string, sugId: string) => {
    setSuggestions(p => ({
      ...p,
      [itemId]: p[itemId].map(s => s.id === sugId ? { ...s, status: 'rejected' as const } : s),
    }))
    setTimeout(() => {
      setSuggestions(p => ({
        ...p,
        [itemId]: p[itemId].filter(s => s.id !== sugId),
      }))
    }, 200)
  }

  const handleAcceptAll = (itemId: string) => {
    setSuggestions(p => ({
      ...p,
      [itemId]: p[itemId].map(s => ({ ...s, status: 'accepted' as const })),
    }))
  }

  const openChat = (item: AttentionItem) => {
    const mateId = item.suggestedBy.name.toLowerCase()
    onOpenChat?.(mateId, item.chatOpener)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[var(--color-neutral-12)]">Needs your attention</h3>
            <span className="text-[12px] font-medium text-[var(--color-neutral-8)]">{items.length} items</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const badge = badgeConfig[item.type]
            const isExpanded = expandedId === item.id
            const itemSugs = suggestions[item.id] || []
            const pendingSugs = itemSugs.filter(s => s.status === 'pending')

            return (
              <div
                key={item.id}
                className={`rounded-l-none rounded-r-[var(--radius-2xl)] border border-l-[3px] ${badge.border} bg-[var(--surface-primary)] transition-all duration-200 ${
                  isExpanded ? 'border-[var(--border-default)] ring-2 ring-[#d1d5db] shadow-[0_4px_24px_rgba(0,0,0,0.08)]' : 'border-[var(--border-default)] hover:shadow-md'
                }`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[12px] font-medium text-[var(--color-neutral-8)]">{item.reference}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.timeLeft && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <Clock size={11} />
                          {item.timeLeft}
                        </span>
                      )}
                      <ChevronDown size={14} className={`text-[var(--color-neutral-7)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <h4 className="text-[14px] font-medium text-[var(--color-neutral-12)] mb-1">{item.title}</h4>
                  <p className="text-[13px] text-[var(--color-neutral-8)] mb-3">{item.description}</p>

                  {/* Agent pill + source */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : item.id) }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent-1)] border border-[var(--color-accent-3)] text-[12px] font-medium text-[var(--color-accent-9)] hover:bg-[var(--color-accent-2)] cursor-pointer transition-colors"
                    >
                      <img src={item.suggestedBy.photo} alt={item.suggestedBy.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-9)] opacity-40" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-9)]" />
                      </span>
                      {item.suggestedBy.name} has {pendingSugs.length} suggestion{pendingSugs.length !== 1 ? 's' : ''}
                    </button>
                    {item.source && item.source.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        {item.source.map(s => (
                          <img key={s.name} src={s.logo} alt={s.name} title={s.name} className="w-4 h-4 rounded-[3px] object-cover" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded suggestions */}
                {isExpanded && (
                  <div className="bg-[#f3f4f6] border-t border-[#e5e7eb] px-4 py-3.5 space-y-2.5" style={{ animation: 'fadeInUp 0.2s ease-out forwards' }}>
                    {itemSugs.map(sug => (
                      <SuggestionCard
                        key={sug.id}
                        sug={sug}
                        onAccept={() => handleAccept(item.id, sug.id)}
                        onReject={() => handleReject(item.id, sug.id)}
                      />
                    ))}

                    {/* Accept all + Chat row */}
                    {pendingSugs.length > 1 && (
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          onClick={() => handleAcceptAll(item.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-accent-11)] text-white text-[12px] font-semibold hover:bg-[var(--color-accent-12)] cursor-pointer transition-colors"
                        >
                          <Check size={13} /> Accept all suggestions
                        </button>
                        <button
                          onClick={() => openChat(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--color-accent-3)] bg-white text-[12px] font-medium text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)] cursor-pointer transition-colors"
                        >
                          <MessageCircle size={13} /> Continue in chat
                        </button>
                      </div>
                    )}
                    {pendingSugs.length <= 1 && (
                      <div className="pt-1">
                        <button
                          onClick={() => openChat(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--color-accent-3)] bg-white text-[12px] font-medium text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)] cursor-pointer transition-colors"
                        >
                          <MessageCircle size={13} /> Continue in chat
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Integrations */}
        <IntegrationsStrip />
      </div>

    </div>
  )
}

/* ── Suggestion Card ── */

function SuggestionCard({ sug, onAccept, onReject }: {
  sug: Suggestion
  onAccept: () => void
  onReject: () => void
}) {
  const iconCfg = suggestionIconConfig[sug.icon]
  const IconComp = iconCfg.Icon

  if (sug.status === 'rejected') {
    return (
      <div className="rounded-[10px] border border-[var(--color-accent-3)] bg-white p-[11px_13px] opacity-0 scale-[0.97] transition-all duration-200" />
    )
  }

  if (sug.status === 'accepted') {
    return (
      <div className="rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] p-[11px_13px] transition-all duration-200">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-[22px] h-[22px] rounded-md shrink-0 ${iconCfg.bg}`}>
            {iconCfg.image ? <img src={iconCfg.image} alt="" className="w-[16px] h-[16px] object-contain" /> : <IconComp size={12} className={iconCfg.color} />}
          </div>
          <span className="text-[12px] font-bold text-[var(--color-neutral-12)]">{sug.title}</span>
          <span className="ml-auto text-[12px] font-semibold text-[#16a34a] flex items-center gap-1">
            <Check size={13} /> Accepted
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[10px] border border-[var(--color-accent-3)] bg-white p-[11px_13px] space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-[22px] h-[22px] rounded-md shrink-0 ${iconCfg.bg}`}>
          {iconCfg.image ? <img src={iconCfg.image} alt="" className="w-[16px] h-[16px] object-contain" /> : <IconComp size={12} className={iconCfg.color} />}
        </div>
        <span className="text-[12px] font-bold text-[var(--color-neutral-12)]">{sug.title}</span>
        {sug.badge && (
          <span className="ml-auto text-[11px] font-semibold text-[var(--color-neutral-8)] bg-[var(--color-neutral-2)] px-2 py-0.5 rounded-md">{sug.badge}</span>
        )}
      </div>

      {/* Reasoning */}
      <p
        className="text-[11px] text-[#6b7280] leading-relaxed pl-[30px]"
        dangerouslySetInnerHTML={{ __html: sug.reasoning.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-neutral-11)] font-semibold">$1</strong>') }}
      />

      {/* Email draft preview */}
      {sug.emailDraft && (
        <div className="ml-[30px] rounded-lg bg-[#f9fafb] border border-[#e5e7eb] p-2.5">
          <p className="text-[10px] font-semibold text-[var(--color-neutral-7)] uppercase tracking-wide mb-1">Draft · To: {sug.emailDraft.to}</p>
          <p className="text-[11px] font-medium text-[var(--color-neutral-12)] mb-0.5">{sug.emailDraft.subject}</p>
          <p className="text-[11px] text-[var(--color-neutral-8)] line-clamp-2">{sug.emailDraft.body}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pl-[30px]">
        <button
          onClick={onAccept}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white cursor-pointer transition-colors ${
            sug.icon === 'inventory' ? 'bg-[#16a34a] hover:bg-[#15803d]' : 'bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)]'
          }`}
        >
          {sug.acceptLabel}
        </button>
        {sug.altLabel && (
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--color-neutral-9)] border border-[var(--border-default)] bg-white hover:bg-[var(--color-neutral-2)] cursor-pointer transition-colors">
            {sug.altLabel}
          </button>
        )}
        <button
          onClick={onReject}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[var(--color-neutral-8)] border border-[var(--border-default)] bg-white hover:bg-[var(--color-neutral-2)] cursor-pointer transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

 
