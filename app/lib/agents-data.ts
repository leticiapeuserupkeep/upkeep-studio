import { BarChart3, ClipboardList, Sparkles, Search, ListFilter, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ── Types ── */

export type CommunicationStyle = 'formal' | 'friendly' | 'direct' | 'detailed'
export type Proficiency = 'learning' | 'competent' | 'expert'
export type Availability = 'available' | 'busy' | 'offline'
export type AccessLevel = 'private' | 'team' | 'company'

export interface Skill {
  id: string
  name: string
  description: string
  proficiency: Proficiency
}

export interface Capability {
  id: string
  name: string
  description: string
  requiresApproval: boolean
}

export interface Teammate {
  id: string
  firstName: string
  lastName: string
  photo: string
  jobTitle: string
  personality: {
    communication: CommunicationStyle
    traits: string[]
  }
  skills: Skill[]
  capabilities: Capability[]
  permissions: {
    canView: string[]
    canEdit: string[]
    canDelete: string[]
    canApprove: string[]
  }
  access: {
    level: AccessLevel
    assignedTo: string[]
  }
  availability: Availability
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'teammate'
  content: string
  teammate?: Teammate
  timestamp: Date
  card?: ActionCard
  options?: ActionOption[]
  chips?: SuggestedChip[]
  profileCard?: Teammate
  thinking?: boolean
}

export interface ActionCard {
  title: string
  items: { label: string; severity?: 'critical' | 'warning' | 'info'; detail?: string }[]
}

export interface ActionOption {
  id: string
  label: string
  action: string
}

export interface SuggestedChip {
  label: string
  icon?: LucideIcon
  prompt: string
}

/* ── Mock Teammates ── */

const avatarBase = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`

export const TEAMMATES: Teammate[] = [
  {
    id: 'sofia',
    firstName: 'Sofia',
    lastName: 'Chen',
    photo: avatarBase('sofia-chen-upkeep'),
    jobTitle: 'Work Order Specialist',
    personality: {
      communication: 'friendly',
      traits: ['thorough', 'proactive', 'organized'],
    },
    skills: [
      { id: 'wo_analysis', name: 'Work Order Analysis', description: 'Analyze work order patterns and priorities', proficiency: 'expert' },
      { id: 'prioritization', name: 'Task Prioritization', description: 'Prioritize tasks by urgency and impact', proficiency: 'expert' },
      { id: 'reporting', name: 'Report Generation', description: 'Create detailed maintenance reports', proficiency: 'competent' },
    ],
    capabilities: [
      { id: 'analyze_wo', name: 'Analyze work orders', description: 'Review and categorize open work orders', requiresApproval: false },
      { id: 'create_reports', name: 'Create reports', description: 'Generate work order summary reports', requiresApproval: false },
      { id: 'reassign_wo', name: 'Reassign work orders', description: 'Change technician assignments', requiresApproval: true },
    ],
    permissions: {
      canView: ['work_orders', 'assets', 'technicians'],
      canEdit: ['work_orders'],
      canDelete: [],
      canApprove: [],
    },
    access: { level: 'private', assignedTo: [] },
    availability: 'available',
  },
  {
    id: 'marcus',
    firstName: 'Marcus',
    lastName: 'Johnson',
    photo: avatarBase('marcus-johnson-upkeep'),
    jobTitle: 'Maintenance Analyst',
    personality: {
      communication: 'direct',
      traits: ['analytical', 'efficient', 'detail-oriented'],
    },
    skills: [
      { id: 'pm_scheduling', name: 'PM Scheduling', description: 'Optimize preventive maintenance schedules', proficiency: 'expert' },
      { id: 'trend_analysis', name: 'Trend Analysis', description: 'Identify maintenance trends and patterns', proficiency: 'expert' },
      { id: 'cost_optimization', name: 'Cost Optimization', description: 'Reduce maintenance costs', proficiency: 'competent' },
    ],
    capabilities: [
      { id: 'optimize_schedule', name: 'Optimize PM schedules', description: 'Reorganize PM timing for efficiency', requiresApproval: false },
      { id: 'identify_trends', name: 'Identify maintenance trends', description: 'Spot recurring issues', requiresApproval: false },
      { id: 'recommend_changes', name: 'Recommend schedule changes', description: 'Suggest PM frequency adjustments', requiresApproval: true },
    ],
    permissions: {
      canView: ['preventive_maintenance', 'assets', 'work_orders', 'costs'],
      canEdit: ['preventive_maintenance'],
      canDelete: [],
      canApprove: [],
    },
    access: { level: 'private', assignedTo: [] },
    availability: 'available',
  },
  {
    id: 'elena',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    photo: avatarBase('elena-rodriguez-upkeep'),
    jobTitle: 'Request Coordinator',
    personality: {
      communication: 'friendly',
      traits: ['responsive', 'empathetic', 'organized'],
    },
    skills: [
      { id: 'request_triage', name: 'Request Triage', description: 'Sort and prioritize incoming requests', proficiency: 'expert' },
      { id: 'routing', name: 'Smart Routing', description: 'Route requests to the right team', proficiency: 'expert' },
      { id: 'communication', name: 'Stakeholder Communication', description: 'Keep stakeholders informed', proficiency: 'expert' },
    ],
    capabilities: [
      { id: 'triage_requests', name: 'Triage incoming requests', description: 'Sort requests by priority', requiresApproval: false },
      { id: 'route_requests', name: 'Route to right team', description: 'Assign to correct department', requiresApproval: false },
      { id: 'send_updates', name: 'Send status updates', description: 'Notify stakeholders', requiresApproval: true },
    ],
    permissions: {
      canView: ['requests', 'work_orders', 'technicians', 'teams'],
      canEdit: ['requests'],
      canDelete: [],
      canApprove: [],
    },
    access: { level: 'private', assignedTo: [] },
    availability: 'available',
  },
  {
    id: 'david',
    firstName: 'David',
    lastName: 'Park',
    photo: avatarBase('david-park-upkeep'),
    jobTitle: 'Inventory Specialist',
    personality: {
      communication: 'detailed',
      traits: ['meticulous', 'proactive', 'systematic'],
    },
    skills: [
      { id: 'inventory_tracking', name: 'Inventory Tracking', description: 'Monitor stock levels in real-time', proficiency: 'expert' },
      { id: 'reorder_optimization', name: 'Reorder Optimization', description: 'Optimize reorder points and quantities', proficiency: 'expert' },
      { id: 'vendor_analysis', name: 'Vendor Analysis', description: 'Compare vendor pricing and reliability', proficiency: 'competent' },
    ],
    capabilities: [
      { id: 'monitor_stock', name: 'Monitor stock levels', description: 'Track inventory quantities', requiresApproval: false },
      { id: 'flag_low_stock', name: 'Flag low inventory', description: 'Alert on low stock items', requiresApproval: false },
      { id: 'create_po', name: 'Create purchase orders', description: 'Draft POs for approval', requiresApproval: true },
    ],
    permissions: {
      canView: ['inventory', 'purchase_orders', 'vendors'],
      canEdit: ['inventory'],
      canDelete: [],
      canApprove: [],
    },
    access: { level: 'private', assignedTo: [] },
    availability: 'busy',
  },
  {
    id: 'amanda',
    firstName: 'Amanda',
    lastName: 'Foster',
    photo: avatarBase('amanda-foster-upkeep'),
    jobTitle: 'Compliance Officer',
    personality: {
      communication: 'formal',
      traits: ['precise', 'thorough', 'reliable'],
    },
    skills: [
      { id: 'inspection_review', name: 'Inspection Review', description: 'Review and validate inspection reports', proficiency: 'expert' },
      { id: 'compliance_tracking', name: 'Compliance Tracking', description: 'Track regulatory compliance status', proficiency: 'expert' },
      { id: 'documentation', name: 'Documentation', description: 'Maintain compliance documentation', proficiency: 'expert' },
    ],
    capabilities: [
      { id: 'review_inspections', name: 'Review inspection reports', description: 'Validate completed inspections', requiresApproval: false },
      { id: 'track_compliance', name: 'Track compliance status', description: 'Monitor compliance metrics', requiresApproval: false },
      { id: 'generate_audits', name: 'Generate audit reports', description: 'Create audit-ready reports', requiresApproval: false },
    ],
    permissions: {
      canView: ['inspections', 'compliance', 'assets', 'work_orders'],
      canEdit: ['inspections'],
      canDelete: [],
      canApprove: ['inspections'],
    },
    access: { level: 'private', assignedTo: [] },
    availability: 'available',
  },
]

/* ── Intent Matching ── */

const INTENT_MAPPING: Record<string, string[]> = {
  'work order': ['sofia'],
  'analyze': ['sofia', 'marcus'],
  'prioritize': ['sofia', 'elena'],
  'triage': ['elena'],
  'request': ['elena'],
  'schedule': ['marcus'],
  'maintenance': ['marcus'],
  'pm': ['marcus'],
  'inventory': ['david'],
  'stock': ['david'],
  'parts': ['david'],
  'purchase': ['david'],
  'inspection': ['amanda'],
  'compliance': ['amanda'],
  'audit': ['amanda'],
  'assign': ['sofia'],
  'technician': ['sofia'],
  'reactive': ['sofia'],
  'clean': ['sofia'],
}

export function suggestTeammate(userInput: string): Teammate {
  const input = userInput.toLowerCase()
  for (const [keyword, teammateIds] of Object.entries(INTENT_MAPPING)) {
    if (input.includes(keyword)) {
      const match = TEAMMATES.find((t) => t.id === teammateIds[0])
      if (match) return match
    }
  }
  return TEAMMATES[0]
}

/* ── Default Chips ── */

export const DEFAULT_CHIPS: SuggestedChip[] = [
  { label: "I'm overwhelmed with requests", icon: BarChart3, prompt: 'I have too many open work orders and need help analyzing and prioritizing them' },
  { label: 'I need to prioritize today', icon: ClipboardList, prompt: 'Help me figure out what to focus on today based on urgency and deadlines' },
  { label: 'My data is a mess', icon: Sparkles, prompt: 'My work order data has duplicates and inconsistencies — help me clean it up' },
]

export const BUILDER_CHIPS: SuggestedChip[] = [
  { label: 'Analyze my reactive work', icon: Search, prompt: 'I need an agent that can analyze my reactive maintenance patterns and identify trends' },
  { label: 'Triage my requests', icon: ListFilter, prompt: 'I need an agent that can classify and prioritize incoming work orders automatically' },
  { label: 'Clean up my Work Order data', icon: Wrench, prompt: 'I need an agent that can find and fix duplicates, missing fields, and inconsistencies in my work order data' },
]

/* ── Personality responses ── */

export function getTeammateGreeting(teammate: Teammate): string {
  switch (teammate.id) {
    case 'sofia':
      return `Hi Leti! I'm ${teammate.firstName}. I specialize in analyzing work orders and helping teams prioritize what matters most. I'm thorough, proactive, and love keeping things organized.`
    case 'marcus':
      return `Hey Leti. I'm ${teammate.firstName} — I focus on maintenance analytics and PM scheduling. I like keeping things efficient and data-driven. Let's optimize your operations.`
    case 'elena':
      return `Hi Leti! I'm ${teammate.firstName}. I handle request coordination and make sure nothing falls through the cracks. I'm responsive and always keeping stakeholders in the loop.`
    case 'david':
      return `Hello Leti. I'm ${teammate.firstName}. I track inventory levels, optimize reorder points, and make sure you never run out of critical parts. Every detail matters.`
    case 'amanda':
      return `Good day, Leti. I'm ${teammate.firstName}. I ensure your inspections and compliance documentation meet all regulatory requirements. Precision and thoroughness are my priorities.`
    default:
      return `Hi! I'm ${teammate.firstName}. I'm here to help with your maintenance operations.`
  }
}

export function getTeammateWelcomeActions(teammate: Teammate): ActionOption[] {
  switch (teammate.id) {
    case 'sofia':
      return [
        { id: '1', label: 'What are my most urgent work orders?', action: 'show_urgent_wo' },
        { id: '2', label: 'Show me trends from last week', action: 'show_trends' },
        { id: '3', label: 'Help me reassign overdue items', action: 'reassign_overdue' },
      ]
    case 'marcus':
      return [
        { id: '1', label: 'Show me PM schedule conflicts', action: 'show_pm_conflicts' },
        { id: '2', label: 'Analyze maintenance costs this quarter', action: 'analyze_costs' },
        { id: '3', label: 'Optimize my PM frequency', action: 'optimize_pm' },
      ]
    case 'elena':
      return [
        { id: '1', label: 'Show me pending requests', action: 'show_requests' },
        { id: '2', label: 'Triage today\'s incoming requests', action: 'triage_today' },
        { id: '3', label: 'Update stakeholders on critical items', action: 'update_stakeholders' },
      ]
    case 'david':
      return [
        { id: '1', label: 'What parts are running low?', action: 'check_stock' },
        { id: '2', label: 'Review pending purchase orders', action: 'review_pos' },
        { id: '3', label: 'Compare vendor pricing', action: 'compare_vendors' },
      ]
    case 'amanda':
      return [
        { id: '1', label: 'Review this week\'s inspections', action: 'review_inspections' },
        { id: '2', label: 'Check compliance status', action: 'check_compliance' },
        { id: '3', label: 'Generate an audit report', action: 'generate_audit' },
      ]
    default:
      return []
  }
}
