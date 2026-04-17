export type WorkflowStatus = 'active' | 'draft' | 'paused' | 'failed'
export type TriggerType = 'manual' | 'scheduled' | 'event'
export type StepType = 'action' | 'condition' | 'branch' | 'agent'

export interface WorkflowStep {
  id: string
  label: string
  type: StepType
  description?: string
  branches?: { label: string }[]
}

export interface RunRecord {
  id: string
  startedAt: string
  duration: string | null
  status: 'completed' | 'failed' | 'running'
  triggeredBy: string
}

export interface StagingWorkflow {
  id: string
  title: string
  description: string
  status: WorkflowStatus
  triggerType: TriggerType
  automation: boolean
  steps: WorkflowStep[]
  assignedAgent: string | null
  lastRun: string | null
  lastRunStatus: 'completed' | 'failed' | 'running' | null
  lastRunDuration: string | null
  totalRuns: number
  createdBy: string
  runHistory: RunRecord[]
}

export const STAGING_WORKFLOWS: StagingWorkflow[] = [
  {
    id: '1',
    title: 'Daily WO Report',
    description:
      'Summarizes open work orders and posts to the maintenance channel each morning. Checks threshold before posting to avoid alert fatigue.',
    status: 'active',
    triggerType: 'scheduled',
    automation: true,
    steps: [
      {
        id: 's1',
        label: 'Fetch open work orders',
        type: 'action',
        description: 'Queries the work order API for all items with status = open.',
      },
      {
        id: 's2',
        label: 'Check threshold exceeded?',
        type: 'condition',
        description: 'Evaluates whether open WO count exceeds the configured alert threshold.',
        branches: [{ label: 'Yes → continue' }, { label: 'No → skip posting' }],
      },
      {
        id: 's3',
        label: 'Format summary report',
        type: 'action',
        description: 'Generates a human-readable summary grouped by priority and site.',
      },
      {
        id: 's4',
        label: 'Post to maintenance channel',
        type: 'agent',
        description: 'Agent posts the formatted report to the designated channel.',
      },
    ],
    assignedAgent: 'Demo',
    lastRun: '2 hours ago',
    lastRunStatus: 'completed',
    lastRunDuration: '242s',
    totalRuns: 47,
    createdBy: 'Demo',
    runHistory: [
      { id: 'r1', startedAt: '2 hours ago', duration: '242s', status: 'completed', triggeredBy: 'cron' },
      { id: 'r2', startedAt: 'Yesterday 6:00 AM', duration: '198s', status: 'completed', triggeredBy: 'cron' },
      { id: 'r3', startedAt: '2 days ago', duration: '317s', status: 'completed', triggeredBy: 'cron' },
      { id: 'r4', startedAt: '3 days ago', duration: '221s', status: 'completed', triggeredBy: 'cron' },
      { id: 'r5', startedAt: '4 days ago', duration: '12s', status: 'failed', triggeredBy: 'cron' },
    ],
  },
  {
    id: '2',
    title: 'Company Research & Presentation',
    description:
      'Pulls public filings and drafts a short executive brief for review. Runs manually on demand.',
    status: 'active',
    triggerType: 'manual',
    automation: false,
    steps: [
      {
        id: 's1',
        label: 'Gather public sources',
        type: 'action',
        description: 'Searches SEC filings, news, and public databases for relevant company data.',
      },
      {
        id: 's2',
        label: 'Summarize key findings',
        type: 'agent',
        description: 'Agent reads all collected documents and extracts the most relevant insights.',
      },
      {
        id: 's3',
        label: 'Format executive deck',
        type: 'action',
        description: 'Structures findings into a slide-ready format with title, summary, and key metrics.',
      },
    ],
    assignedAgent: null,
    lastRun: null,
    lastRunStatus: null,
    lastRunDuration: null,
    totalRuns: 0,
    createdBy: 'Leti Peuser',
    runHistory: [],
  },
  {
    id: '3',
    title: 'HVAC Diagnostics',
    description:
      'Reads sensor streams and flags anomalies against the facility playbook. Routes by severity level.',
    status: 'active',
    triggerType: 'event',
    automation: true,
    steps: [
      {
        id: 's1',
        label: 'Ingest telemetry stream',
        type: 'action',
        description: 'Receives live sensor data from HVAC units across all monitored facilities.',
      },
      {
        id: 's2',
        label: 'Score anomaly rules',
        type: 'condition',
        description: 'Runs each reading through the anomaly ruleset and assigns a severity score.',
        branches: [{ label: 'High severity → escalate' }, { label: 'Low severity → log only' }],
      },
      {
        id: 's3',
        label: 'Route by severity',
        type: 'branch',
        description: 'Directs the alert to the correct downstream handler based on severity score.',
        branches: [{ label: 'Critical → PagerDuty' }, { label: 'Warning → Slack' }, { label: 'Info → log' }],
      },
      {
        id: 's4',
        label: 'Notify facility owner',
        type: 'agent',
        description: 'Agent composes and sends a contextual notification with recommended next steps.',
      },
    ],
    assignedAgent: 'Demo',
    lastRun: '14 min ago',
    lastRunStatus: 'running',
    lastRunDuration: null,
    totalRuns: 23,
    createdBy: 'Demo',
    runHistory: [
      { id: 'r1', startedAt: '14 min ago', duration: null, status: 'running', triggeredBy: 'sensor event' },
      { id: 'r2', startedAt: '6 hours ago', duration: '34s', status: 'completed', triggeredBy: 'sensor event' },
      { id: 'r3', startedAt: 'Yesterday', duration: '29s', status: 'completed', triggeredBy: 'sensor event' },
    ],
  },
  {
    id: '4',
    title: 'Inventory Reorder Check',
    description:
      'Compares stock levels to min/max thresholds and opens a draft PO when reorder point is hit.',
    status: 'paused',
    triggerType: 'scheduled',
    automation: true,
    steps: [
      {
        id: 's1',
        label: 'Sync inventory snapshot',
        type: 'action',
        description: 'Pulls the current stock levels from the inventory system.',
      },
      {
        id: 's2',
        label: 'Compare to thresholds',
        type: 'condition',
        description: 'Checks each item against its configured reorder point.',
        branches: [{ label: 'Below threshold → create PO' }, { label: 'Above threshold → skip' }],
      },
      {
        id: 's3',
        label: 'Create draft purchase order',
        type: 'action',
        description: 'Generates a draft PO with suggested quantities based on historical usage.',
      },
    ],
    assignedAgent: null,
    lastRun: '3 days ago',
    lastRunStatus: 'completed',
    lastRunDuration: '88s',
    totalRuns: 31,
    createdBy: 'Leti Peuser',
    runHistory: [
      { id: 'r1', startedAt: '3 days ago', duration: '88s', status: 'completed', triggeredBy: 'cron' },
      { id: 'r2', startedAt: '6 days ago', duration: '93s', status: 'completed', triggeredBy: 'cron' },
    ],
  },
  {
    id: '5',
    title: 'Safety Briefing Digest',
    description:
      'Aggregates incidents and near-misses into a weekly digest for the EHS team.',
    status: 'active',
    triggerType: 'scheduled',
    automation: true,
    steps: [
      {
        id: 's1',
        label: 'Collect incident cases',
        type: 'action',
        description: 'Pulls all incidents and near-miss reports filed in the past 7 days.',
      },
      {
        id: 's2',
        label: 'Classify by severity',
        type: 'condition',
        description: 'Groups cases into high, medium, and low severity buckets.',
        branches: [{ label: 'High → flag in digest' }, { label: 'Low → include as summary' }],
      },
      {
        id: 's3',
        label: 'Publish weekly digest',
        type: 'agent',
        description: 'Agent compiles and distributes the EHS digest to all registered recipients.',
      },
    ],
    assignedAgent: 'Demo',
    lastRun: 'Yesterday',
    lastRunStatus: 'completed',
    lastRunDuration: '118s',
    totalRuns: 12,
    createdBy: 'Demo',
    runHistory: [
      { id: 'r1', startedAt: 'Yesterday', duration: '118s', status: 'completed', triggeredBy: 'cron' },
      { id: 'r2', startedAt: '8 days ago', duration: '104s', status: 'completed', triggeredBy: 'cron' },
    ],
  },
  {
    id: '6',
    title: 'Asset Inspection Router',
    description:
      'Routes incoming inspection requests to the right technician based on skill profile and availability.',
    status: 'draft',
    triggerType: 'event',
    automation: false,
    steps: [
      {
        id: 's1',
        label: 'Receive inspection request',
        type: 'action',
        description: 'Listens for new inspection requests submitted via the work order portal.',
      },
      {
        id: 's2',
        label: 'Match skill profile',
        type: 'condition',
        description: 'Filters available technicians by the required certification and skill tags.',
        branches: [{ label: 'Match found → check availability' }, { label: 'No match → escalate' }],
      },
      {
        id: 's3',
        label: 'Check availability',
        type: 'condition',
        description: 'Confirms the matched technician has available capacity in their schedule.',
        branches: [{ label: 'Available → assign' }, { label: 'Unavailable → find next' }],
      },
      {
        id: 's4',
        label: 'Assign and notify',
        type: 'agent',
        description: 'Agent creates the assignment and sends a notification to the technician.',
      },
    ],
    assignedAgent: null,
    lastRun: null,
    lastRunStatus: null,
    lastRunDuration: null,
    totalRuns: 0,
    createdBy: 'Leti Peuser',
    runHistory: [],
  },
  {
    id: '7',
    title: 'Escalation Monitor',
    description:
      'Watches for overdue high-priority work orders and escalates to the on-call manager.',
    status: 'failed',
    triggerType: 'event',
    automation: true,
    steps: [
      {
        id: 's1',
        label: 'Monitor WO queue',
        type: 'action',
        description: 'Continuously polls for high-priority work orders past their SLA deadline.',
      },
      {
        id: 's2',
        label: 'Check SLA threshold',
        type: 'condition',
        description: 'Determines if the overdue duration warrants immediate escalation.',
        branches: [{ label: 'Breach confirmed → escalate' }, { label: 'Within grace period → wait' }],
      },
      {
        id: 's3',
        label: 'Escalate to on-call',
        type: 'agent',
        description: 'Agent pages the on-call manager with context about the overdue item.',
      },
    ],
    assignedAgent: 'Demo',
    lastRun: '1 hour ago',
    lastRunStatus: 'failed',
    lastRunDuration: '12s',
    totalRuns: 8,
    createdBy: 'Demo',
    runHistory: [
      { id: 'r1', startedAt: '1 hour ago', duration: '12s', status: 'failed', triggeredBy: 'sensor event' },
      { id: 'r2', startedAt: 'Yesterday', duration: '41s', status: 'completed', triggeredBy: 'sensor event' },
      { id: 'r3', startedAt: '3 days ago', duration: '38s', status: 'completed', triggeredBy: 'sensor event' },
    ],
  },
]

export function getWorkflowById(id: string): StagingWorkflow | undefined {
  return STAGING_WORKFLOWS.find((w) => w.id === id)
}
