export type StagingAgent = {
  id: string
  name: string
  subtitle: string
  initials: string
  stage: string
  status: 'active' | 'paused'
  model: string
  connectedSystems: string[]
}

export const STAGING_AGENTS: StagingAgent[] = [
  {
    id: 'demo-1',
    name: 'Demo',
    subtitle: 'Demo agent',
    initials: 'D',
    stage: 'WATCH',
    status: 'active',
    model: 'anthropic/claude-3-5-sonnet-20241022',
    connectedSystems: ['UpKeep'],
  },
  {
    id: 'facilities-ops',
    name: 'Facilities Ops',
    subtitle: 'Building systems & CMMS handoffs',
    initials: 'FO',
    stage: 'LIVE',
    status: 'active',
    model: 'anthropic/claude-3-5-sonnet-20241022',
    connectedSystems: ['UpKeep', 'BMS'],
  },
  {
    id: 'wo-triage',
    name: 'WO Triage',
    subtitle: 'Prioritizes incoming work orders',
    initials: 'WT',
    stage: 'WATCH',
    status: 'active',
    model: 'openai/gpt-4o',
    connectedSystems: ['UpKeep'],
  },
  {
    id: 'inventory-clerk',
    name: 'Inventory Clerk',
    subtitle: 'Parts lookup and reorder suggestions',
    initials: 'IC',
    stage: 'WATCH',
    status: 'paused',
    model: 'anthropic/claude-3-5-sonnet-20241022',
    connectedSystems: ['UpKeep', 'ERP'],
  },
  {
    id: 'safety-brief',
    name: 'Safety Brief',
    subtitle: 'Permit and LOTO checklist assistant',
    initials: 'SB',
    stage: 'PILOT',
    status: 'active',
    model: 'openai/gpt-4o-mini',
    connectedSystems: ['UpKeep'],
  },
]

export function getStagingAgentById(id: string): StagingAgent | undefined {
  return STAGING_AGENTS.find((a) => a.id === id)
}
