'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import {
  SlidersHorizontal, Eye, EyeOff, RotateCcw, Calendar,
  ChevronLeft, ChevronRight, Clock, Settings, AlertTriangle,
  Check, Flag, ChevronDown, X, Info, Zap, Save, RefreshCw,
  Loader2, Grid, List, Layers, Pencil, Trash2, Plus, MoreHorizontal,
} from 'lucide-react'

/* ═══════════════ TYPES ═══════════════ */

type ViewMode = 'Day' | 'Week' | 'Month'
type Priority = 'High' | 'Medium' | 'Low'
type WOStatus = 'Open' | 'In Progress'

interface WOCard {
  id: string; number: string; title: string; status: WOStatus
  location: string; asset: string; category: string; categoryColor: string
  dueDate: string; estimatedHours: number; priority: Priority; description: string
}

interface ScheduleBlock {
  id: string; woNumber: string; title: string; dueDate: string
  date: string; startHour: number; durationHours: number
  color: 'teal' | 'pink' | 'amber'; saved: boolean
  sourceWoId?: string; priority?: Priority; status?: string
  category?: string; location?: string
}

interface TeamMemberData {
  id: string; name: string; role: string; avatar: string
  location: string; team: string; blocks: ScheduleBlock[]
}

interface ShiftTemplate {
  id: string; name: string; color: string
  startTime: string; endTime: string; spansMidnight: boolean
  activeDays: string[]; breakMinutes: number; notes: string
  active: boolean; templateId: string
}

interface ScheduleTemplateMeta {
  id: string; name: string; active: boolean
}

interface ShiftAssignment {
  id: string; technicianId: string; shiftTemplateId: string; date: string
}

type DragPayload =
  | { type: 'unscheduled'; woId: string }
  | { type: 'scheduled'; blockId: string; memberId: string }

/* ═══════════════ CONSTANTS ═══════════════ */

const TODAY = new Date(2026, 3, 1)
const CURRENT_HOUR = 9.75
const MEMBER_COL_WIDTH = 240
const HOUR_WIDTH = 160
const colorCycle: ScheduleBlock['color'][] = ['teal', 'pink', 'amber']

const blockColors = {
  teal: { cardBg: '#F0FDFA', cardBorder: '#5EEAD4', bar: '#0D9488', icon: '#0D9488' },
  pink: { cardBg: '#FFF7F7', cardBorder: '#EB8E90', bar: '#E5484D', icon: '#E5484D' },
  amber: { cardBg: '#FFFBEB', cardBorder: '#FCD34D', bar: '#F59E0B', icon: '#F59E0B' },
}

const CARD_SHADOW = '0px 1px 3px rgba(0,0,0,0.05), 0px 2px 1px -1px rgba(0,0,0,0.05), 0px 1px 4px rgba(0,0,45,0.09), 0px 0px 0px 0.5px rgba(0,0,0,0.05)'

const SHIFT_COLORS = ['#3b82f6', '#16a34a', '#f59e0b', '#7c3aed', '#ec4899', '#0ea5e9', '#ef4444', '#14b8a6']

const SHIFT_CARD_BG: Record<string, string> = {
  '#3b82f6': '#E6EDFE', '#16a34a': '#E9F9EE', '#f59e0b': '#FFF4D5', '#7c3aed': '#F0EAFF',
  '#ec4899': '#FFF1F3', '#0ea5e9': '#E6F6FE', '#ef4444': '#FFECEC', '#14b8a6': '#E6FAF5',
}
const SHIFT_CARD_BORDER: Record<string, string> = {
  '#3b82f6': '#3A5BC7', '#16a34a': '#5BB98B', '#f59e0b': '#EC9455', '#7c3aed': '#7C3AED',
  '#ec4899': '#EB8E90', '#0ea5e9': '#38A3C9', '#ef4444': '#E5484D', '#14b8a6': '#2BA89A',
}


function shiftDurationHours(t: ShiftTemplate): number {
  const [sh, sm] = t.startTime.split(':').map(Number)
  const [eh, em] = t.endTime.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60
  return (mins - t.breakMinutes) / 60
}

function shiftTimeLabel(t: ShiftTemplate): string {
  const fmt = (s: string) => { const [h, m] = s.split(':').map(Number); const hr = h > 12 ? h - 12 : h === 0 ? 12 : h; return `${hr}${m ? ':' + String(m).padStart(2, '0') : ''}${h >= 12 ? 'PM' : 'AM'}` }
  return `${fmt(t.startTime)}–${fmt(t.endTime)}`
}

function shiftStartHour(t: ShiftTemplate): number { const [h, m] = t.startTime.split(':').map(Number); return h + m / 60 }
function shiftEndHour(t: ShiftTemplate): number { const [h, m] = t.endTime.split(':').map(Number); return h + m / 60 }

const catStyles: Record<string, { bg: string; text: string; border: string }> = {
  'Inspection': { bg: 'bg-[#f0fdf4]', text: 'text-[#15803d]', border: 'border-[#bbf7d0]' },
  'Safety': { bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]', border: 'border-[#fde68a]' },
  'Electrical': { bg: 'bg-[#fff7ed]', text: 'text-[#9a3412]', border: 'border-[#fed7aa]' },
  'HVAC': { bg: 'bg-[#f5f3ff]', text: 'text-[#6d28d9]', border: 'border-[#ddd6fe]' },
  'Plumbing & Irrigation': { bg: 'bg-[#ecfeff]', text: 'text-[#155e75]', border: 'border-[#a5f3fc]' },
  'Mechanical': { bg: 'bg-[#f0fdfa]', text: 'text-[#115e59]', border: 'border-[#99f6e4]' },
  'Roofing': { bg: 'bg-[#fef2f2]', text: 'text-[#991b1b]', border: 'border-[#fecaca]' },
  'Security & Alarms': { bg: 'bg-[#eff6ff]', text: 'text-[#1e40af]', border: 'border-[#bfdbfe]' },
}
const defaultCatStyle = { bg: 'bg-[#f9fafb]', text: 'text-[#374151]', border: 'border-[#e5e7eb]' }

/* ═══════════════ MOCK DATA ═══════════════ */

const woTitles = [
  'Security System Installation', 'Roof Leak Inspection', 'HVAC Maintenance Check',
  'Plumbing Repair Request', 'Electrical Panel Upgrade', 'Fire Alarm Testing',
  'Conveyor Belt Repair', 'Air Compressor Service', 'Generator Backup Test',
  'Water Heater Replacement', 'Door Lock Maintenance', 'Sprinkler System Check',
  'Elevator Inspection', 'Parking Lot Lights', 'Window Seal Repair',
  'Floor Drain Cleaning', 'Emergency Exit Signs', 'Ventilation Fan Repair',
  'Boiler Inspection', 'Paint Touch-Up Work',
]
const woCats = [
  { name: 'Inspection', color: 'text-[#2191FB]' }, { name: 'Safety', color: 'text-[#E5484D]' },
  { name: 'Electrical', color: 'text-[#F59E0B]' }, { name: 'HVAC', color: 'text-[#8B5CF6]' },
  { name: 'Plumbing & Irrigation', color: 'text-[#0EA5E9]' }, { name: 'Mechanical', color: 'text-[#0D9488]' },
  { name: 'Roofing', color: 'text-[#E5484D]' }, { name: 'Security & Alarms', color: 'text-[#2191FB]' },
]
const woLocs = ['Production Line Main', 'Retail Store C', 'Distribution Center B', 'Warehouse A', 'Office Building', 'Plant Floor 2', 'Maintenance Shop', 'Facility B', 'Building C', 'North Wing']
const priorities: Priority[] = ['High', 'Medium', 'Low']

const allWorkOrders: WOCard[] = Array.from({ length: 132 }, (_, i) => {
  const cat = woCats[i % woCats.length]
  return {
    id: `wo-${String(i + 1).padStart(3, '0')}`, number: `#${String(i + 1).padStart(3, '0')}`,
    title: woTitles[i % woTitles.length], status: (i % 3 === 0 ? 'In Progress' : 'Open') as WOStatus,
    location: woLocs[i % woLocs.length], asset: `ASSET-${String(i + 1).padStart(3, '0')}`,
    category: cat.name, categoryColor: cat.color,
    dueDate: `${Math.floor(i / 30) + 9}/${(i % 28) + 1}`,
    estimatedHours: [1, 1.5, 2, 2.5, 3][i % 5], priority: priorities[i % 3],
    description: `Work order for ${woTitles[i % woTitles.length].toLowerCase()} at ${woLocs[i % woLocs.length]}.`,
  }
})

function dk(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const initialMembers: TeamMemberData[] = [
  { id: 'tm-1', name: 'Ron Walters', role: 'Technician', avatar: 'RW', location: 'Warehouse A', team: 'The A-Team',
    blocks: [
      { id: 'b1', woNumber: '#047', title: 'Inspect Backup Generator', dueDate: '4/1', date: dk(new Date(2026, 3, 1)), startHour: 9, durationHours: 2, color: 'teal', saved: true, category: 'Inspection', location: 'Warehouse A', priority: 'High', status: 'In Progress' },
      { id: 'b2', woNumber: '#033', title: 'Test Forklift Engine', dueDate: '4/3', date: dk(new Date(2026, 3, 3)), startHour: 13, durationHours: 1, color: 'amber', saved: true, category: 'Mechanical', location: 'Plant Floor 2', priority: 'Medium', status: 'Open' },
    ] },
  { id: 'tm-2', name: 'Sean Brooks', role: 'Technician', avatar: 'SB', location: 'Office Building', team: 'The A-Team',
    blocks: [
      { id: 'b3', woNumber: '#047', title: 'Inspect Backup Generator', dueDate: '4/1', date: dk(new Date(2026, 3, 1)), startHour: 10, durationHours: 2, color: 'teal', saved: true, category: 'Inspection', location: 'Office Building', priority: 'High', status: 'Open' },
    ] },
  { id: 'tm-3', name: 'Alan Sanders', role: 'Technician', avatar: 'AS', location: 'Plant Floor 2', team: 'The A-Team',
    blocks: [
      { id: 'b4', woNumber: '#047', title: 'Inspect Backup Generator', dueDate: '4/2', date: dk(new Date(2026, 3, 2)), startHour: 9, durationHours: 2, color: 'teal', saved: true, category: 'Inspection', location: 'Plant Floor 2', priority: 'High', status: 'In Progress' },
      { id: 'b5', woNumber: '#033', title: 'Test Forklift Engine', dueDate: '4/3', date: dk(new Date(2026, 3, 3)), startHour: 14, durationHours: 1.5, color: 'amber', saved: true, category: 'Mechanical', location: 'Plant Floor 2', priority: 'Low', status: 'Open' },
    ] },
  { id: 'tm-4', name: 'Chris Bennett', role: 'Technician', avatar: 'CB', location: 'Facility B', team: 'The A-Team', blocks: [] },
  { id: 'tm-5', name: 'Eric Gomez', role: 'Technician', avatar: 'EG', location: 'Distribution Center B', team: 'Beta Squad',
    blocks: [
      { id: 'b6', woNumber: '#050', title: 'Faulty Cable', dueDate: '3/30', date: dk(new Date(2026, 2, 30)), startHour: 9, durationHours: 1.5, color: 'pink', saved: true, category: 'Electrical', location: 'Distribution Center B', priority: 'High', status: 'Open' },
    ] },
  { id: 'tm-6', name: 'Alex Chen', role: 'Technician', avatar: 'AC', location: 'North Wing', team: 'Beta Squad',
    blocks: [
      { id: 'b7', woNumber: '#050', title: 'Faulty Cable', dueDate: '3/31', date: dk(new Date(2026, 2, 31)), startHour: 10, durationHours: 1, color: 'pink', saved: true, category: 'Electrical', location: 'North Wing', priority: 'Medium', status: 'Open' },
      { id: 'b8', woNumber: '#041', title: 'Adjust Gate Door Panels', dueDate: '4/4', date: dk(new Date(2026, 3, 4)), startHour: 11, durationHours: 2, color: 'amber', saved: true, category: 'Mechanical', location: 'North Wing', priority: 'Low', status: 'In Progress' },
    ] },
  { id: 'tm-7', name: 'Marcus Reed', role: 'Technician', avatar: 'MR', location: 'Maintenance Shop', team: 'Beta Squad', blocks: [] },
  { id: 'tm-8', name: 'Tim Sine', role: 'Technician', avatar: 'TS', location: 'Building C', team: 'Beta Squad', blocks: [] },
]

/* ═══════════════ DATE HELPERS ═══════════════ */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getWeekDays(date: Date): Date[] {
  const d = new Date(date); d.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => { const r = new Date(d); r.setDate(r.getDate() + i); return r })
}

function getMonthGrid(date: Date): Date[][] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const cur = new Date(first); cur.setDate(1 - first.getDay())
  return Array.from({ length: 6 }, () =>
    Array.from({ length: 7 }, () => { const r = new Date(cur); cur.setDate(cur.getDate() + 1); return r })
  )
}

function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

function fmtHour(h: number) { const hr = h > 12 ? h - 12 : h === 0 ? 12 : h; return `${hr}:00 ${h >= 12 ? 'PM' : 'AM'}` }

function fmtHourShort(h: number) {
  const mins = Math.round(h * 60); const hr24 = Math.floor(mins / 60); const m = mins % 60
  const hr = hr24 > 12 ? hr24 - 12 : hr24 === 0 ? 12 : hr24
  return `${hr}:${String(m).padStart(2, '0')} ${hr24 >= 12 ? 'PM' : 'AM'}`
}

function fmtDateLabel(date: Date, mode: ViewMode) {
  if (mode === 'Day') return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  if (mode === 'Week') {
    const days = getWeekDays(date); const s = days[0]; const e = days[6]
    return s.getMonth() === e.getMonth()
      ? `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`
      : `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  }
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

function calcWL(blocks: ScheduleBlock[], dh: number, wdc: number) {
  const total = blocks.reduce((s, b) => s + b.durationHours, 0)
  return wdc * dh > 0 ? Math.round((total / (wdc * dh)) * 100) : 0
}

/* ═══════════════ AVATAR ═══════════════ */

const avColors = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#E5484D', '#8B5CF6', '#EC4899', '#14B8A6']
function TeamAvatar({ initials, name }: { initials: string; name: string }) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avColors.length
  return (
    <span className="relative inline-flex items-center justify-center shrink-0 rounded-full text-white text-[10px] font-semibold" style={{ width: 28, height: 28, backgroundColor: avColors[idx], boxShadow: '0px 1.17px 4.67px rgba(0,0,0,0.08)' }} title={name}>
      {initials}
      <span className="absolute right-0 bottom-0 w-[7px] h-[7px] rounded-full bg-[#30A46C]" />
    </span>
  )
}

/* ═══════════════ COMPACT BTN STYLE ═══════════════ */

const btnCls = 'inline-flex items-center gap-1.5 px-[10px] py-1 rounded-[6px] border border-[#e5e7eb] text-[12px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer'
const iconBtnCls = 'inline-flex items-center justify-center w-7 h-7 rounded-[6px] border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer'
const iconBtnLgCls = 'inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer'
const selectCls = 'w-full px-3 py-2 rounded-lg border border-[#e5e7eb] text-[13px] text-[#374151] bg-white'

/* ═══════════════ MAIN PAGE ═══════════════ */

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date(TODAY))
  const [viewMode, setViewMode] = useState<ViewMode>('Week')
  const [unscheduled, setUnscheduled] = useState<WOCard[]>(allWorkOrders)
  const [members, setMembers] = useState<TeamMemberData[]>(initialMembers)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [rowCount, setRowCount] = useState(1)
  const [rowDDOpen, setRowDDOpen] = useState(false)
  const [sectionHidden, setSectionHidden] = useState(false)
  const [cardView, setCardView] = useState<'grid' | 'list'>('grid')
  const [cardCompact, setCardCompact] = useState(false)

  const [woSort, setWoSort] = useState('Work Order #')
  const [woCatF, setWoCatF] = useState('')
  const [woStatF, setWoStatF] = useState('')
  const [woPrioF, setWoPrioF] = useState('')

  const [teamSort, setTeamSort] = useState('First Name')
  const [teamLocF, setTeamLocF] = useState('')
  const [teamTeamF, setTeamTeamF] = useState('The A-Team')
  const [selectedMember, setSelectedMember] = useState('')

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsDirty, setSettingsDirty] = useState(false)
  const [visibleUnits, setVisibleUnits] = useState('24 hours')
  const [timeGran, setTimeGran] = useState('hours')
  const [dailyHours, setDailyHours] = useState<number | ''>(8)
  const [startTime, setStartTime] = useState(8)
  const [endTime, setEndTime] = useState(17)
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({ Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false })

  const [viewDDOpen, setViewDDOpen] = useState(false)
  const [hiddenTechs, setHiddenTechs] = useState<Set<string>>(new Set())
  const [detailBlock, setDetailBlock] = useState<{ block: ScheduleBlock; member: TeamMemberData } | null>(null)
  const [smartOpen, setSmartOpen] = useState(false)
  const [overdueOpen, setOverdueOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)

  const [templatesList, setTemplatesList] = useState<ScheduleTemplateMeta[]>([
    { id: 'tpl-default', name: 'Default', active: true },
    { id: 'tpl-weekend', name: 'Weekend', active: true },
  ])
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)

  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([
    { id: 'shift_morning', name: 'Morning', color: '#3b82f6', startTime: '06:00', endTime: '10:00', spansMidnight: false, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], breakMinutes: 0, notes: '', active: true, templateId: 'tpl-default' },
    { id: 'shift_midday', name: 'Midday', color: '#16a34a', startTime: '10:00', endTime: '14:00', spansMidnight: false, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], breakMinutes: 0, notes: '', active: true, templateId: 'tpl-default' },
    { id: 'shift_afternoon', name: 'Afternoon', color: '#f59e0b', startTime: '14:00', endTime: '18:00', spansMidnight: false, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], breakMinutes: 0, notes: '', active: true, templateId: 'tpl-default' },
    { id: 'shift_evening', name: 'Evening', color: '#7c3aed', startTime: '18:00', endTime: '22:00', spansMidnight: false, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], breakMinutes: 0, notes: '', active: true, templateId: 'tpl-default' },
    { id: 'shift_sat_day', name: 'Day Shift', color: '#ec4899', startTime: '08:00', endTime: '16:00', spansMidnight: false, activeDays: ['Sat', 'Sun'], breakMinutes: 30, notes: '', active: true, templateId: 'tpl-weekend' },
    { id: 'shift_sat_eve', name: 'Evening', color: '#14b8a6', startTime: '16:00', endTime: '22:00', spansMidnight: false, activeDays: ['Sat', 'Sun'], breakMinutes: 0, notes: '', active: true, templateId: 'tpl-weekend' },
  ])
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>(() => {
    const week = getWeekDays(TODAY)
    const out: ShiftAssignment[] = []
    const weekdayMap: Record<string, string> = { 'tm-1': 'shift_morning', 'tm-2': 'shift_morning', 'tm-3': 'shift_midday', 'tm-5': 'shift_afternoon', 'tm-6': 'shift_evening' }
    Object.entries(weekdayMap).forEach(([tid, sid]) => {
      week.forEach(d => {
        const dn = DAY_NAMES[d.getDay()]
        if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dn)) {
          out.push({ id: `a-${tid}-${dk(d)}`, technicianId: tid, shiftTemplateId: sid, date: dk(d) })
        }
      })
    })
    const weekendMap: Record<string, string> = { 'tm-1': 'shift_sat_day', 'tm-4': 'shift_sat_eve' }
    Object.entries(weekendMap).forEach(([tid, sid]) => {
      week.forEach(d => {
        const dn = DAY_NAMES[d.getDay()]
        if (['Sat', 'Sun'].includes(dn)) {
          out.push({ id: `a-wk-${tid}-${dk(d)}`, technicianId: tid, shiftTemplateId: sid, date: dk(d) })
        }
      })
    })
    return out
  })
  const [settingsTab, setSettingsTab] = useState<'display' | 'shifts'>('display')
  const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(null)
  const [addingShift, setAddingShift] = useState(false)
  const [selectedGapRange, setSelectedGapRange] = useState<{ startMin: number; endMin: number } | null>(null)
  const [newShiftDraft, setNewShiftDraft] = useState<ShiftTemplate>({ id: '', name: '', color: '#3b82f6', startTime: '08:00', endTime: '17:00', spansMidnight: false, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], breakMinutes: 30, notes: '', active: true, templateId: '' })
  const [lastAddedShiftId, setLastAddedShiftId] = useState<string | null>(null)
  const [shiftCardMenuOpen, setShiftCardMenuOpen] = useState<string | null>(null)
  const [templateMenuOpen, setTemplateMenuOpen] = useState<string | null>(null)
  const [templateFormOpen, setTemplateFormOpen] = useState(false)
  const [highlightedTemplateId, setHighlightedTemplateId] = useState<string | null>(null)
  const [isNewTemplate, setIsNewTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [scheduleActive, setScheduleActive] = useState(true)
  const [assignDropOpen, setAssignDropOpen] = useState(false)
  const [timePickerOpen, setTimePickerOpen] = useState<'start' | 'end' | null>(null)
  const timeListRef = useRef<HTMLDivElement>(null)
  const [shiftPopover, setShiftPopover] = useState<{ memberId: string; date: string; clientX: number; clientY: number } | null>(null)
  const [oooConfirm, setOooConfirm] = useState<{ targetId: string; targetDate: string; hour: number; shiftName: string; shiftTime: string; payload: DragPayload } | null>(null)

  const [bulkMembers, setBulkMembers] = useState<string[]>([])
  const [bulkShiftId, setBulkShiftId] = useState('')
  const [bulkFrom, setBulkFrom] = useState('')
  const [bulkTo, setBulkTo] = useState('')
  const [bulkDays, setBulkDays] = useState<Record<string, boolean>>({ Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false })

  const [headerPortal, setHeaderPortal] = useState<HTMLElement | null>(null)
  const [afterTitlePortal, setAfterTitlePortal] = useState<HTMLElement | null>(null)

  const dragRef = useRef<DragPayload | null>(null)
  const [dragOverMember, setDragOverMember] = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)
  const [dragOverPanel, setDragOverPanel] = useState(false)
  const [flashCell, setFlashCell] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const timelineRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const resizeRef = useRef<{ blockId: string; memberId: string; startX: number; startDur: number } | null>(null)
  const shiftFormRef = useRef<HTMLDivElement>(null)

  /* ── Computed ── */

  const workDayCount = useMemo(() => Object.values(workDays).filter(Boolean).length, [workDays])
  const hours = useMemo(() => {
    let lo = startTime, hi = endTime
    if (viewMode === 'Day') {
      const dayStr = dk(currentDate)
      for (const m of members) {
        const s = shiftAssignments.find(a => a.technicianId === m.id && a.date === dayStr)
        if (!s) continue
        const t = shiftTemplates.find(st => st.id === s.shiftTemplateId)
        if (!t) continue
        const sh = shiftStartHour(t), eh = shiftEndHour(t)
        if (t.spansMidnight) { lo = 0; hi = 24 }
        else { lo = Math.min(lo, Math.floor(sh)); hi = Math.max(hi, Math.ceil(eh)) }
      }
    }
    const h: number[] = []; for (let i = lo; i < hi; i++) h.push(i); return h
  }, [startTime, endTime, viewMode, currentDate, members, shiftAssignments, shiftTemplates])
  const gridStart = hours.length > 0 ? hours[0] : startTime
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate])
  const todayStr = dk(TODAY)

  const getShiftForMemberDay = useCallback((memberId: string, dateStr: string): ShiftTemplate | undefined => {
    const a = shiftAssignments.find(sa => sa.technicianId === memberId && sa.date === dateStr)
    return a ? shiftTemplates.find(st => st.id === a.shiftTemplateId) : undefined
  }, [shiftAssignments, shiftTemplates])

  const openShiftTemplateInSettings = useCallback((shift: ShiftTemplate) => {
    const tpl = templatesList.find(t => t.id === shift.templateId)
    setSettingsTab('shifts')
    if (!tpl) {
      setSettingsOpen(true)
      return
    }
    setIsNewTemplate(false)
    setEditingTemplateId(tpl.id)
    setTemplateName(tpl.name)
    setScheduleActive(tpl.active)
    setTemplateFormOpen(true)
    setEditingShift({ ...shift })
    setAddingShift(false)
    setSettingsOpen(true)
  }, [templatesList])

  const hasActiveShifts = useMemo(() => {
    const wdDates = new Set(weekDays.map(dk))
    return shiftAssignments.some(a => wdDates.has(a.date))
  }, [shiftAssignments, weekDays])

  const filteredWO = useMemo(() => {
    let r = [...unscheduled]
    if (woCatF) r = r.filter(w => w.category === woCatF)
    if (woStatF) r = r.filter(w => w.status === woStatF)
    if (woPrioF) r = r.filter(w => w.priority === woPrioF)
    r.sort((a, b) => {
      if (woSort === 'Due Date') return a.dueDate.localeCompare(b.dueDate)
      if (woSort === 'Priority') return priorities.indexOf(a.priority) - priorities.indexOf(b.priority)
      if (woSort === 'Title') return a.title.localeCompare(b.title)
      return a.number.localeCompare(b.number)
    })
    return r
  }, [unscheduled, woCatF, woStatF, woPrioF, woSort])

  const woFilterCount = [woCatF, woStatF, woPrioF].filter(Boolean).length
  const cardsPerPage = rowCount * 6
  const totalPages = Math.max(1, Math.ceil(filteredWO.length / cardsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const pageCards = filteredWO.slice((safePage - 1) * cardsPerPage, safePage * cardsPerPage)

  const filteredMembers = useMemo(() => {
    let r = [...members]
    if (teamLocF) r = r.filter(m => m.location === teamLocF)
    if (teamTeamF) r = r.filter(m => m.team === teamTeamF)
    r.sort((a, b) => teamSort === 'Last Name'
      ? (a.name.split(' ').pop() || '').localeCompare(b.name.split(' ').pop() || '')
      : a.name.localeCompare(b.name))
    return r
  }, [members, teamLocF, teamTeamF, teamSort])

  const visibleMembers = filteredMembers.filter(m => !hiddenTechs.has(m.id))
  const teamFilterCount = [teamLocF, teamTeamF].filter(Boolean).length

  const overdueBlocks = useMemo(() => {
    const items: { block: ScheduleBlock; memberName: string }[] = []
    members.forEach(m => m.blocks.forEach(b => { if (b.date < todayStr) items.push({ block: b, memberName: m.name }) }))
    return items
  }, [members, todayStr])

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setRowDDOpen(false); setViewDDOpen(false); setStartDateOpen(false) } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    setHeaderPortal(document.getElementById('scheduler-header-actions'))
    setAfterTitlePortal(document.getElementById('scheduler-after-title'))
  }, [])

  useEffect(() => {
    if ((addingShift || editingShift) && shiftFormRef.current) {
      shiftFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [addingShift, editingShift])

  useEffect(() => {
    if (timePickerOpen && timeListRef.current) {
      const el = timeListRef.current.querySelector('[data-selected="true"]') as HTMLElement
      if (el) el.scrollIntoView({ block: 'center' })
    }
  }, [timePickerOpen])

  /* ── Navigation ── */
  function navDate(dir: 1 | -1) {
    setCurrentDate(p => {
      const d = new Date(p)
      if (viewMode === 'Day') d.setDate(d.getDate() + dir)
      else if (viewMode === 'Week') d.setDate(d.getDate() + dir * 7)
      else d.setMonth(d.getMonth() + dir)
      return d
    })
  }

  /* ── Drag ── */
  const onCardDrag = useCallback((e: React.DragEvent, wo: WOCard) => {
    dragRef.current = { type: 'unscheduled', woId: wo.id }
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', wo.id); setDraggingId(wo.id)
  }, [])

  const onBlockDrag = useCallback((e: React.DragEvent, block: ScheduleBlock, mid: string) => {
    dragRef.current = { type: 'scheduled', blockId: block.id, memberId: mid }
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', block.id); setDraggingId(block.id)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string, targetDate: string, dropHour?: number) => {
    e.preventDefault(); setDragOverMember(null); setDragOverCell(null)
    const p = dragRef.current; if (!p) return
    const hour = dropHour ?? 9
    if (p.type === 'unscheduled') {
      const wo = unscheduled.find(w => w.id === p.woId); if (!wo) return
      const nb: ScheduleBlock = {
        id: `sched-${Date.now()}`, woNumber: wo.number, title: wo.title, dueDate: wo.dueDate,
        date: targetDate, startHour: hour, durationHours: wo.estimatedHours,
        color: colorCycle[Math.floor(Math.random() * colorCycle.length)],
        saved: false, sourceWoId: wo.id, priority: wo.priority, status: wo.status, category: wo.category, location: wo.location,
      }
      setUnscheduled(prev => prev.filter(w => w.id !== wo.id))
      setMembers(prev => prev.map(m => m.id === targetId ? { ...m, blocks: [...m.blocks, nb] } : m))
      setHasUnsaved(true); flash(`${targetId}:${targetDate}`)
    }
    if (p.type === 'scheduled') {
      const { blockId, memberId: srcId } = p
      setMembers(prev => {
        let moved: ScheduleBlock | undefined
        const next = prev.map(m => {
          if (m.id === srcId) { const b = m.blocks.find(x => x.id === blockId); if (b) moved = { ...b, date: targetDate, startHour: hour, saved: false }; return { ...m, blocks: m.blocks.filter(x => x.id !== blockId) } }
          return m
        })
        return moved ? next.map(m => m.id === targetId ? { ...m, blocks: [...m.blocks, moved!] } : m) : prev
      })
      setHasUnsaved(true); flash(`${targetId}:${targetDate}`)
    }
    dragRef.current = null; setDraggingId(null)
  }, [unscheduled])

  const onTimelineDrop = useCallback((e: React.DragEvent, mid: string) => {
    e.preventDefault(); setDragOverMember(null); setDragOverCell(null)
    const el = timelineRefs.current.get(mid); if (!el) return
    const p = dragRef.current; if (!p) return
    const x = e.clientX - el.getBoundingClientRect().left
    const dropHour = gridStart + Math.round((x / HOUR_WIDTH) * 4) / 4
    const dayStr = dk(currentDate)
    const shift = getShiftForMemberDay(mid, dayStr)
    if (shift) {
      const sS = shiftStartHour(shift), sE = shiftEndHour(shift)
      if (dropHour < sS || dropHour >= sE) {
        setOooConfirm({ targetId: mid, targetDate: dayStr, hour: dropHour, shiftName: shift.name, shiftTime: `${shift.startTime}–${shift.endTime}`, payload: { ...p } })
        dragRef.current = null; setDraggingId(null)
        return
      }
    }
    handleDrop(e, mid, dayStr, dropHour)
  }, [handleDrop, currentDate, gridStart, getShiftForMemberDay])

  const confirmOooDrop = useCallback(() => {
    if (!oooConfirm) return
    const { targetId, targetDate, hour, payload } = oooConfirm
    if (payload.type === 'unscheduled') {
      const wo = unscheduled.find(w => w.id === payload.woId); if (!wo) { setOooConfirm(null); return }
      const nb: ScheduleBlock = {
        id: `sched-${Date.now()}`, woNumber: wo.number, title: wo.title, dueDate: wo.dueDate,
        date: targetDate, startHour: hour, durationHours: wo.estimatedHours,
        color: colorCycle[Math.floor(Math.random() * colorCycle.length)],
        saved: false, sourceWoId: wo.id, priority: wo.priority, status: wo.status, category: wo.category, location: wo.location,
      }
      setUnscheduled(prev => prev.filter(w => w.id !== wo.id))
      setMembers(prev => prev.map(m => m.id === targetId ? { ...m, blocks: [...m.blocks, nb] } : m))
      setHasUnsaved(true); flash(`${targetId}:${targetDate}`)
    }
    if (payload.type === 'scheduled') {
      const { blockId, memberId: srcId } = payload
      setMembers(prev => {
        let moved: ScheduleBlock | undefined
        const next = prev.map(m => {
          if (m.id === srcId) { const b = m.blocks.find(x => x.id === blockId); if (b) moved = { ...b, date: targetDate, startHour: hour, saved: false }; return { ...m, blocks: m.blocks.filter(x => x.id !== blockId) } }
          return m
        })
        return moved ? next.map(m => m.id === targetId ? { ...m, blocks: [...m.blocks, moved!] } : m) : prev
      })
      setHasUnsaved(true); flash(`${targetId}:${targetDate}`)
    }
    setOooConfirm(null)
  }, [oooConfirm, unscheduled])

  const onPanelDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOverPanel(false)
    const p = dragRef.current; if (!p || p.type !== 'scheduled') return
    setMembers(prev => {
      let removed: ScheduleBlock | undefined
      const next = prev.map(m => { if (m.id === p.memberId) { removed = m.blocks.find(b => b.id === p.blockId); return { ...m, blocks: m.blocks.filter(b => b.id !== p.blockId) } } return m })
      if (removed?.sourceWoId) { const orig = allWorkOrders.find(w => w.id === removed!.sourceWoId); if (orig && !unscheduled.find(w => w.id === orig.id)) setUnscheduled(prev => [...prev, orig]) }
      return next
    })
    dragRef.current = null; setDraggingId(null); setHasUnsaved(true)
  }, [unscheduled])

  function flash(k: string) { setFlashCell(k); setTimeout(() => setFlashCell(null), 400) }
  function onDragEnd() { setDraggingId(null); setDragOverMember(null); setDragOverCell(null); setDragOverPanel(false); dragRef.current = null }

  /* ── Actions ── */
  function handleSave() {
    if (!hasUnsaved || saving) return; setSaving(true)
    setMembers(p => p.map(m => ({ ...m, blocks: m.blocks.map(b => ({ ...b, saved: true })) })))
    setTimeout(() => { setSaving(false); setHasUnsaved(false) }, 800)
  }

  function runSmart() {
    const toSched = unscheduled.slice(0, Math.min(8, unscheduled.length)); if (!toSched.length) { setSmartOpen(false); return }
    const avail = visibleMembers.filter(m => m.blocks.length < 4); if (!avail.length) { setSmartOpen(false); return }
    const wdDates = weekDays.map(dk)
    const newBlocks: { mid: string; block: ScheduleBlock }[] = []
    toSched.forEach((wo, i) => {
      const mem = avail[i % avail.length]; const day = wdDates[Math.min(i, wdDates.length - 1)]
      const existing = mem.blocks.filter(b => b.date === day).length
      newBlocks.push({ mid: mem.id, block: {
        id: `smart-${Date.now()}-${i}`, woNumber: wo.number, title: wo.title, dueDate: wo.dueDate,
        date: day, startHour: 9 + existing * 2, durationHours: wo.estimatedHours,
        color: colorCycle[i % colorCycle.length], saved: false, sourceWoId: wo.id,
        priority: wo.priority, status: wo.status, category: wo.category, location: wo.location,
      }})
    })
    setUnscheduled(p => p.filter(wo => !toSched.find(s => s.id === wo.id)))
    setMembers(p => p.map(m => { const adds = newBlocks.filter(nb => nb.mid === m.id).map(nb => nb.block); return adds.length ? { ...m, blocks: [...m.blocks, ...adds] } : m }))
    setHasUnsaved(true); setSmartOpen(false)
  }

  function handleRefresh() { setRefreshing(true); setTimeout(() => setRefreshing(false), 1500) }

  function onResizeStart(e: React.MouseEvent, block: ScheduleBlock, mid: string) {
    e.stopPropagation(); e.preventDefault()
    resizeRef.current = { blockId: block.id, memberId: mid, startX: e.clientX, startDur: block.durationHours }
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const nd = Math.max(0.25, resizeRef.current.startDur + Math.round(((ev.clientX - resizeRef.current.startX) / HOUR_WIDTH) * 4) / 4)
      setMembers(p => p.map(m => m.id !== resizeRef.current!.memberId ? m : { ...m, blocks: m.blocks.map(b => b.id === resizeRef.current!.blockId ? { ...b, durationHours: nd, saved: false } : b) }))
      setHasUnsaved(true)
    }
    const onUp = () => { resizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  function toggleTech(id: string) { setHiddenTechs(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s }) }

  /* ═══════ MEMBER INFO CELL (shared between views) ═══════ */
  function MemberCell({ member }: { member: TeamMemberData }) {
    const memberShiftHours = useMemo(() => {
      let total = 0; let days = 0
      weekDays.forEach(d => {
        const s = getShiftForMemberDay(member.id, dk(d))
        if (s) { total += shiftDurationHours(s); days++ }
      })
      return total > 0 ? { capacity: total, days } : null
    }, [member.id, weekDays, getShiftForMemberDay])
    const wl = memberShiftHours
      ? calcWL(member.blocks, memberShiftHours.capacity / memberShiftHours.days, memberShiftHours.days)
      : calcWL(member.blocks, dailyHours || 8, workDayCount)
    const ringPct = Math.min(wl, 100)
    const circumference = 2 * Math.PI * 5.5
    const strokeDash = (ringPct / 100) * circumference
    const ringColor = wl > 80 ? '#E5484D' : '#30A46C'
    return (
      <div className="shrink-0 flex flex-col justify-between p-3 gap-3 border-r border-[#E0E1E6] h-full" style={{ width: MEMBER_COL_WIDTH, background: '#FCFCFD' }}>
        <div className="flex items-center gap-3" style={{ height: 34, padding: '2px 0' }}>
          <TeamAvatar initials={member.avatar} name={member.name} />
          <div className="min-w-0 flex-1 flex flex-col gap-[2px]">
            <p className="text-[12px] font-semibold text-[#1C2024] truncate" style={{ lineHeight: '15px' }}>{member.name}</p>
            <p className="text-[11px] font-normal text-[#8B8D98]" style={{ lineHeight: '13px' }}>{member.role}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-normal text-[#8B8D98]" style={{ lineHeight: '13px' }}>{wl}%</span>
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
              <circle cx="8" cy="8" r="5.5" fill="none" stroke="#E0E1E6" strokeWidth="3" />
              <circle cx="8" cy="8" r="5.5" fill="none" stroke={ringColor} strokeWidth="3"
                strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
                transform="rotate(-90 8 8)" className="transition-all duration-300" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════ SCHEDULED BLOCK (day view) ═══════ */
  function DayBlock({ block, member }: { block: ScheduleBlock; member: TeamMemberData }) {
    const c = blockColors[block.color]; const left = (block.startHour - gridStart) * HOUR_WIDTH; const width = block.durationHours * HOUR_WIDTH
    return (
      <div draggable onDragStart={e => onBlockDrag(e, block, member.id)} onDragEnd={onDragEnd} onClick={() => setDetailBlock({ block, member })}
        className={`absolute top-[6px] flex flex-row items-stretch gap-2 p-2 rounded-[4px] overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-150 z-[4] ${draggingId === block.id ? 'opacity-40 scale-95' : ''}`}
        style={{ left, width, background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: CARD_SHADOW }}>
        {/* Color bar */}
        <div className="w-1 shrink-0 rounded-[4px]" style={{ background: c.bar }} />
        {/* Text content */}
        <div className="flex flex-col items-start gap-[2px] min-w-0 flex-1">
          <div className="flex flex-row items-start gap-1 w-full">
            <p className="text-[14px] font-semibold text-[#1C2024] truncate leading-[20px] flex-1 min-w-0">{block.woNumber}: {block.title}</p>
            {!block.saved ? (
              <span className="inline-flex items-center shrink-0 px-[5px] py-[1px] rounded text-[9px] font-medium bg-[#fef9c3] text-[#854d0e] border border-[#fde68a] leading-tight whitespace-nowrap">Not Saved</span>
            ) : (
              <RefreshCw size={12} className="shrink-0 mt-[4px]" style={{ color: c.icon }} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-normal text-[#60646C] leading-[16px] tracking-[0.25px]">Due {block.dueDate}</span>
            <span className="text-[12px] font-normal text-[#60646C] leading-[16px] tracking-[0.25px]">{block.durationHours}h</span>
          </div>
        </div>
        {/* Resize handle */}
        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/5" onMouseDown={e => onResizeStart(e, block, member.id)} />
      </div>
    )
  }

  /* ═══════ WEEK BLOCK (compact card) ═══════ */
  function WeekBlock({ block, member }: { block: ScheduleBlock; member: TeamMemberData }) {
    const c = blockColors[block.color]
    return (
      <div draggable onDragStart={e => onBlockDrag(e, block, member.id)} onDragEnd={onDragEnd} onClick={() => setDetailBlock({ block, member })}
        className={`flex flex-row items-stretch gap-1.5 p-1.5 rounded-[4px] cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${draggingId === block.id ? 'opacity-40 scale-95' : ''}`}
        style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: CARD_SHADOW }}>
        <div className="w-[3px] shrink-0 rounded-[3px]" style={{ background: c.bar }} />
        <div className="flex flex-col gap-[1px] min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <p className="text-[11px] font-semibold text-[#1C2024] truncate leading-[16px] flex-1 min-w-0">{block.woNumber}: {block.title}</p>
            {!block.saved && (
              <span className="inline-flex items-center shrink-0 px-[3px] py-0 rounded text-[8px] font-medium bg-[#fef9c3] text-[#854d0e] border border-[#fde68a] leading-tight whitespace-nowrap">Not Saved</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#60646C] leading-[14px] tracking-[0.25px]">Due {block.dueDate}</span>
            <span className="text-[10px] text-[#60646C] leading-[14px] tracking-[0.25px]">{block.durationHours}h</span>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════ RENDER ═══════════════ */

  return (
    <div className="flex flex-col flex-1 w-full">
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-[var(--space-2xl)] py-[var(--space-xl)] space-y-6">

          {/* ══════ UNSCHEDULED PANEL ══════ */}
          {!sectionHidden ? (
            <section className="opacity-0" style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
              onDragOver={e => { e.preventDefault(); setDragOverPanel(true) }} onDragEnter={e => { e.preventDefault(); setDragOverPanel(true) }}
              onDragLeave={() => setDragOverPanel(false)} onDrop={onPanelDrop}>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 shrink-0">
                  <h2 className="text-[15px] font-semibold text-[#111827] whitespace-nowrap">Unscheduled Work Orders</h2>
                  <span className="inline-flex items-center justify-center h-5 min-w-[22px] px-1.5 rounded-full bg-[#f3f4f6] text-[11px] font-semibold text-[#374151]">{filteredWO.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Filter & Sort */}
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button className={`relative ${btnCls}`}>
                        <SlidersHorizontal size={14} className="text-[#6b7280]" /> Filter &amp; Sort
                        {woFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#3b82f6] text-white text-[9px] font-bold">{woFilterCount}</span>}
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content className="z-[var(--z-modal)] w-[300px] rounded-xl border border-[#e5e7eb] bg-white shadow-[var(--shadow-xl)] p-4 space-y-3" sideOffset={4} align="start">
                        <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Sort By</p>
                        {['Work Order #', 'Due Date', 'Priority', 'Title'].map(o => (
                          <label key={o} className="flex items-center gap-2 py-0.5 cursor-pointer"><input type="radio" name="woS" checked={woSort === o} onChange={() => setWoSort(o)} className="accent-[#3b82f6]" /><span className="text-[13px] text-[#374151]">{o}</span></label>
                        ))}
                        <div className="h-px bg-[#f3f4f6]" />
                        <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Filters</p>
                        <div><label className="text-[12px] font-medium text-[#374151] mb-1 block">Category</label><select value={woCatF} onChange={e => setWoCatF(e.target.value)} className={selectCls}><option value="">All</option>{woCats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                        <div><label className="text-[12px] font-medium text-[#374151] mb-1 block">Status</label><select value={woStatF} onChange={e => setWoStatF(e.target.value)} className={selectCls}><option value="">All</option><option value="Open">Open</option><option value="In Progress">In Progress</option></select></div>
                        <div><label className="text-[12px] font-medium text-[#374151] mb-1 block">Priority</label><select value={woPrioF} onChange={e => setWoPrioF(e.target.value)} className={selectCls}><option value="">All</option>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div className="h-px bg-[#f3f4f6]" />
                        <div className="flex items-center justify-between">
                          <button onClick={() => { setWoCatF(''); setWoStatF(''); setWoPrioF(''); setWoSort('Work Order #') }} className="text-[12px] text-[#6b7280] hover:text-[#374151] cursor-pointer">Reset</button>
                          <Popover.Close asChild><button className="px-4 py-1.5 rounded-lg bg-[#3b82f6] text-white text-[12px] font-medium hover:bg-[#2563eb] cursor-pointer">Apply</button></Popover.Close>
                        </div>
                        <Popover.Arrow className="fill-white" />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>

                  <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className={`${btnCls} disabled:opacity-40`}><RotateCcw size={14} className="text-[#6b7280]" /> Back to First</button>

                  <div className="flex items-center gap-0.5">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} className={`${iconBtnCls} disabled:opacity-40`}><ChevronLeft size={14} className="text-[#6b7280]" /></button>
                    <span className="px-2 text-[12px] font-medium text-[#374151] whitespace-nowrap">Page {safePage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className={`${iconBtnCls} disabled:opacity-40`}><ChevronRight size={14} className="text-[#6b7280]" /></button>
                  </div>

                  <button onClick={() => setCardCompact(p => !p)} className={iconBtnCls} aria-label="Toggle compact">{cardCompact ? <EyeOff size={14} className="text-[#6b7280]" /> : <Eye size={14} className="text-[#6b7280]" />}</button>
                  <button onClick={() => setCardView(p => p === 'grid' ? 'list' : 'grid')} className={iconBtnCls} aria-label="Toggle view">{cardView === 'grid' ? <List size={14} className="text-[#6b7280]" /> : <Grid size={14} className="text-[#6b7280]" />}</button>
                  <button onClick={() => setSectionHidden(true)} className={btnCls}><EyeOff size={14} className="text-[#6b7280]" /> Hide Section</button>

                  <div className="relative">
                    <button onClick={() => setRowDDOpen(p => !p)} className={btnCls}><span className="w-3.5 h-3.5 border border-[#d1d5db] rounded-sm" /> {rowCount} row{rowCount !== 1 ? 's' : ''} <ChevronDown size={12} className={`text-[#6b7280] transition-transform duration-150 ${rowDDOpen ? 'rotate-180' : ''}`} /></button>
                    {rowDDOpen && (<>
                      <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setRowDDOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-[120px] rounded-lg border border-[#e5e7eb] bg-white shadow-[var(--shadow-lg)] z-[var(--z-modal)] py-1">
                        {[1, 2, 3].map(n => (<button key={n} onClick={() => { setRowCount(n); setRowDDOpen(false) }} className={`flex items-center gap-2 w-full px-3 py-2 text-left text-[13px] cursor-pointer transition-colors ${rowCount === n ? 'font-medium text-[#111827]' : 'text-[#374151] hover:bg-[#f9fafb]'}`}><span className="w-4 shrink-0 text-[#374151]">{rowCount === n && <Check size={14} />}</span>{n} row{n !== 1 ? 's' : ''}</button>))}
                      </div>
                    </>)}
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className={`pb-1 rounded-lg transition-all duration-200 ${dragOverPanel && dragRef.current?.type === 'scheduled' ? 'outline-2 outline-dashed outline-[var(--color-accent-9)] bg-[var(--color-accent-1)] outline-offset-4' : ''}`}>
                {pageCards.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-[13px] text-[#6b7280]">{filteredWO.length === 0 ? 'All work orders have been scheduled' : 'No work orders match filters'}</div>
                ) : cardView === 'list' ? (
                  <div className="space-y-1.5">
                    {pageCards.map(wo => { const cs = catStyles[wo.category] || defaultCatStyle; return (
                      <div key={wo.id} draggable onDragStart={e => onCardDrag(e, wo)} onDragEnd={onDragEnd} className={`flex items-center gap-3 py-2 px-3.5 rounded-lg border border-[#e5e7eb] bg-white cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${draggingId === wo.id ? 'opacity-40 scale-95' : 'hover:shadow-md'}`}>
                        <span className="text-[12px] font-semibold text-[#6b7280] w-10">{wo.number}</span>
                        <p className="text-[13px] font-semibold text-[#111827] flex-1 truncate">{wo.title}</p>
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-medium ${cs.bg} ${cs.text} border ${cs.border}`}>{wo.category}</span>
                        <span className="inline-flex items-center gap-1 text-[12px] text-[#ef4444] font-medium"><Flag size={11} className="fill-current" />Due {wo.dueDate}</span>
                        <span className="text-[12px] text-[#6b7280]">{wo.estimatedHours}h</span>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="grid gap-x-[11px] gap-y-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 230px))', maxHeight: rowCount * 115, overflow: 'hidden' }}>
                    {pageCards.map(wo => { const cs = catStyles[wo.category] || defaultCatStyle; return (
                      <div key={wo.id} draggable onDragStart={e => onCardDrag(e, wo)} onDragEnd={onDragEnd} className={`flex flex-col gap-2 py-3 px-3.5 rounded-lg border border-[#e5e7eb] bg-white cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${draggingId === wo.id ? 'opacity-40 scale-95' : 'hover:shadow-md'}`}>
                        <h4 className="text-[13px] font-semibold text-[#111827] leading-[1.3] line-clamp-2">{wo.number}: {wo.title}</h4>
                        {!cardCompact && (<>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-medium bg-[#f9fafb] text-[#374151] border border-[#e5e7eb]">{wo.status}</span>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <span className="inline-flex items-center gap-1 text-[12px] text-[#ef4444] font-medium"><Flag size={11} className="fill-current" />Due {wo.dueDate}</span>
                            <span className="inline-flex items-center gap-1 text-[12px] text-[#6b7280]"><Clock size={11} />{wo.estimatedHours}h</span>
                          </div>
                        </>)}
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <button onClick={() => setSectionHidden(false)} className={btnCls}><Eye size={14} className="text-[#6b7280]" /> Show Unscheduled Work Orders ({filteredWO.length})</button>
          )}

          {/* ══════ TEAM SCHEDULE ══════ */}
          <section className="opacity-0" style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.15s forwards' }}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-[#111827] whitespace-nowrap">Team Schedule</h2>
            </div>

            {/* Sub-header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className={`relative ${btnCls}`}>
                      <SlidersHorizontal size={14} className="text-[#6b7280]" /> Filter &amp; Sort
                      {teamFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#3b82f6] text-white text-[9px] font-bold">{teamFilterCount}</span>}
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content className="z-[var(--z-modal)] w-[300px] rounded-xl border border-[#e5e7eb] bg-white shadow-[var(--shadow-xl)] p-4 space-y-3" sideOffset={4} align="start">
                      <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Sort By</p>
                      {['First Name', 'Last Name'].map(o => (<label key={o} className="flex items-center gap-2 py-0.5 cursor-pointer"><input type="radio" name="tS" checked={teamSort === o} onChange={() => setTeamSort(o)} className="accent-[#3b82f6]" /><span className="text-[13px] text-[#374151]">{o}</span></label>))}
                      <div className="h-px bg-[#f3f4f6]" />
                      <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Filters</p>
                      <div><label className="text-[12px] font-medium text-[#374151] mb-1 block">Location</label><select value={teamLocF} onChange={e => setTeamLocF(e.target.value)} className={selectCls}><option value="">All Locations</option>{[...new Set(members.map(m => m.location))].map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                      <div><label className="text-[12px] font-medium text-[#374151] mb-1 block">Team</label><div className="flex items-center gap-1"><select value={teamTeamF} onChange={e => setTeamTeamF(e.target.value)} className={`flex-1 ${selectCls}`}><option value="">All Teams</option>{[...new Set(members.map(m => m.team))].map(t => <option key={t} value={t}>{t}</option>)}</select>{teamTeamF && <button onClick={() => setTeamTeamF('')} className="p-1 rounded hover:bg-[#f3f4f6] cursor-pointer"><X size={14} className="text-[#6b7280]" /></button>}</div></div>
                      <div className="h-px bg-[#f3f4f6]" />
                      <div className="flex items-center justify-between">
                        <button onClick={() => { setTeamLocF(''); setTeamTeamF(''); setTeamSort('First Name') }} className="text-[12px] text-[#6b7280] hover:text-[#374151] cursor-pointer">Reset</button>
                        <Popover.Close asChild><button className="px-4 py-1.5 rounded-lg bg-[#3b82f6] text-white text-[12px] font-medium hover:bg-[#2563eb] cursor-pointer">Apply</button></Popover.Close>
                      </div>
                      <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>

                <button onClick={() => setCurrentDate(new Date(TODAY))} className={btnCls}>Today</button>
                <div className="flex items-center gap-1">
                  <button onClick={() => navDate(-1)} className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-[#f9fafb] transition-colors cursor-pointer"><ChevronLeft size={14} className="text-[#6b7280]" /></button>
                  <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium text-[#374151] whitespace-nowrap"><Calendar size={14} className="text-[#6b7280]" /> {fmtDateLabel(currentDate, viewMode)}</span>
                  <button onClick={() => navDate(1)} className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-[#f9fafb] transition-colors cursor-pointer"><ChevronRight size={14} className="text-[#6b7280]" /></button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {viewMode === 'Month' && (
                  <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} className={`${btnCls} appearance-none pr-6`}>
                    <option value="">All Team Members</option>
                    {filteredMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                )}
                <Popover.Root open={overdueOpen} onOpenChange={setOverdueOpen}>
                  <Popover.Trigger asChild>
                    <span className="relative"><button className={iconBtnLgCls} aria-label="Overdue Alerts"><AlertTriangle size={14} className="text-[#6b7280]" /></button>
                      {overdueBlocks.length > 0 && <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#3b82f6] text-white text-[10px] font-bold leading-none">{overdueBlocks.length}</span>}
                    </span>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content className="z-[var(--z-modal)] w-[340px] max-h-[400px] overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-[var(--shadow-xl)] p-4" sideOffset={4} align="end">
                      <p className="text-[14px] font-semibold text-[#111827] mb-3">Overdue Work Orders ({overdueBlocks.length})</p>
                      {overdueBlocks.length === 0 ? <p className="text-[13px] text-[#6b7280]">No overdue items</p> : (
                        <div className="space-y-2">{overdueBlocks.map(({ block, memberName }) => (
                          <div key={block.id} className="flex items-center gap-2 p-2 rounded-lg border border-[#fecaca] bg-[#fef2f2]">
                            <Flag size={12} className="text-[#ef4444] shrink-0" />
                            <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-[#111827] truncate">{block.woNumber}: {block.title}</p><p className="text-[11px] text-[#6b7280]">Due {block.dueDate} · {memberName}</p></div>
                          </div>
                        ))}</div>
                      )}
                      <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>

                {/* Shifts button hidden */}
                <button onClick={() => { setSettingsTab('display'); setSettingsOpen(true) }} className={iconBtnLgCls} aria-label="Settings"><Settings size={14} className="text-[#6b7280]" /></button>

                <div className="relative">
                  <button onClick={() => setViewDDOpen(p => !p)} className={btnCls}><Calendar size={14} className="text-[#6b7280]" /> {viewMode} <ChevronDown size={12} className={`text-[#6b7280] transition-transform duration-150 ${viewDDOpen ? 'rotate-180' : ''}`} /></button>
                  {viewDDOpen && (<>
                    <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setViewDDOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-[140px] rounded-lg border border-[#e5e7eb] bg-white shadow-[var(--shadow-lg)] z-[var(--z-modal)] py-1">
                      {(['Day', 'Week', 'Month'] as const).map(m => (<button key={m} onClick={() => { setViewMode(m); setViewDDOpen(false) }} className={`flex items-center gap-2 w-full px-3 py-2 text-left text-[13px] cursor-pointer transition-colors ${viewMode === m ? 'font-medium text-[#111827]' : 'text-[#374151] hover:bg-[#f9fafb]'}`}><span className="w-4 shrink-0 text-[#374151]">{viewMode === m && <Check size={14} />}</span>{m}</button>))}
                    </div>
                  </>)}
                </div>
              </div>
            </div>

            {/* ══════ DAY VIEW ══════ */}
            {viewMode === 'Day' && (() => {
              const isToday = sameDay(currentDate, TODAY)
              const nowLeft = (CURRENT_HOUR - gridStart) * HOUR_WIDTH
              const totalW = MEMBER_COL_WIDTH + hours.length * HOUR_WIDTH
              return (
                <div className="rounded-lg border border-[#e5e7eb] bg-white overflow-x-auto">
                  <div style={{ minWidth: totalW }} className="relative">
                    {/* Header row */}
                    <div className="flex border-b border-[#e5e7eb] relative" style={{ height: 40 }}>
                      <div className="sticky left-0 z-[16] shrink-0 flex items-center px-4 border-r border-[#e5e7eb] bg-[#f9fafb]" style={{ width: MEMBER_COL_WIDTH }}>
                        <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-[0.05em]">Team Members</span>
                      </div>
                      <div className="flex bg-[#f9fafb] relative">
                        {hours.map(h => (
                          <div key={h} className="shrink-0 flex items-center justify-center text-[12px] font-medium border-r border-[#f3f4f6] text-[#374151]" style={{ width: HOUR_WIDTH }}>{fmtHour(h)}</div>
                        ))}
                        {isToday && nowLeft > 0 && nowLeft < hours.length * HOUR_WIDTH && (
                          <div className="absolute top-0 bottom-0 z-[3] pointer-events-none" style={{ left: nowLeft }}>
                            <div className="w-3 h-3 rounded-full bg-[#3E63DD] -translate-x-[5px] translate-y-[14px]" style={{ boxShadow: '0 0 0 2px rgba(62,99,221,0.25)' }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rows container with global overlays */}
                    <div className="relative">
                      {/* Elapsed (past → now): blue wash + current-time stick */}
                      {isToday && nowLeft > 0 && nowLeft < hours.length * HOUR_WIDTH && (
                        <>
                          <div
                            className="absolute top-0 pointer-events-none z-[5]"
                            style={{
                              left: MEMBER_COL_WIDTH,
                              width: nowLeft,
                              height: visibleMembers.length * 85,
                              background: 'linear-gradient(270deg, rgba(62, 99, 221, 0.04) 0%, rgba(62, 99, 221, 0.1) 100%)',
                            }}
                          />
                          <div className="absolute top-0 bottom-0 pointer-events-none z-[9]" style={{ left: MEMBER_COL_WIDTH + nowLeft }}>
                            <div className="w-[2px] h-full bg-[#3E63DD]" />
                          </div>
                        </>
                      )}

                      {visibleMembers.map(member => {
                        const dayStr = dk(currentDate); const dayBlocks = member.blocks.filter(b => b.date === dayStr)
                        const isFlash = flashCell === `${member.id}:${dayStr}`; const isOver = dragOverMember === member.id
                        const memberShift = getShiftForMemberDay(member.id, dayStr)
                        const sStart = memberShift ? shiftStartHour(memberShift) : null
                        const sEnd = memberShift ? shiftEndHour(memberShift) : null
                        const shiftLeft = sStart !== null ? (sStart - gridStart) * HOUR_WIDTH : 0
                        const shiftW = sStart !== null && sEnd !== null ? (sEnd - sStart) * HOUR_WIDTH : 0
                        const offShiftBg = '#f0f0f2'
                        return (
                          <div key={member.id} className={`flex border-b border-[#f3f4f6] last:border-b-0 transition-colors duration-150 ${isFlash ? 'bg-[#DCFCE7]' : ''}`} style={{ height: 85 }}>
                              <div className="sticky left-0 z-[15] shrink-0 bg-[#FCFCFD]"><MemberCell member={member} /></div>
                              <div ref={el => { if (el) timelineRefs.current.set(member.id, el) }}
                                className="relative transition-all duration-150"
                                style={{ width: hours.length * HOUR_WIDTH, height: 85 }}
                                onDrop={e => onTimelineDrop(e, member.id)}>
                                {/* Hour cells with off-shift striping + per-cell drag target */}
                                {hours.map(h => {
                                  const outOfShift = memberShift != null && (sStart === null || sEnd === null || h < sStart || h >= sEnd)
                                  const isPastHour = sameDay(currentDate, TODAY) && h < Math.floor(CURRENT_HOUR)
                                  const hourKey = `day:${member.id}:${h}`
                                  const isHourOver = dragOverCell === hourKey
                                  return (
                                    <div key={h} className={`absolute top-0 bottom-0 border-r border-[#f3f4f6] transition-colors duration-100`}
                                      style={{ left: (h - gridStart) * HOUR_WIDTH, width: HOUR_WIDTH, ...(isHourOver ? { backgroundColor: '#dbeafe', outline: '2px dashed #93c5fd', outlineOffset: '-2px', borderRadius: 3 } : outOfShift ? { backgroundColor: offShiftBg } : { backgroundColor: '#fff' }) }}
                                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCell(hourKey) }}
                                      onDragEnter={e => { e.preventDefault(); setDragOverCell(hourKey) }}
                                      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCell(null) }}>
                                    </div>
                                  )
                                })}
                                {/* Shift tag positioned over exact shift hours */}
                                {memberShift && sStart !== null && sEnd !== null && (
                                  <button type="button" onClick={e => { e.stopPropagation(); setShiftPopover({ memberId: member.id, date: dayStr, clientX: e.clientX, clientY: e.clientY }) }}
                                    className="absolute z-[3] flex items-center gap-2 px-2 rounded-[3px] cursor-pointer transition-all duration-150 hover:brightness-90"
                                    style={{ left: shiftLeft, width: shiftW, top: 4, height: 20, background: `${memberShift.color}25`, borderLeft: `3px solid ${memberShift.color}` }}>
                                    <span className="text-[10px] font-semibold truncate" style={{ color: memberShift.color }}>{memberShift.name}</span>
                                    <span className="text-[10px] text-[#6b7280] shrink-0">{memberShift.startTime}–{memberShift.endTime}</span>
                                  </button>
                                )}
                                {!memberShift && (
                                  <button onClick={() => { setSettingsTab('shifts'); setSettingsOpen(true) }}
                                    className="absolute z-[3] flex items-center justify-start px-3 rounded-[3px] cursor-pointer transition-colors duration-150 bg-[#f5f5f7] hover:bg-[#ededf0]"
                                    style={{ left: 0, top: 4, height: 20, width: '100%' }}>
                                    <span className="text-[11px] text-[#3b3b3b] transition-colors">Assign shift</span>
                                  </button>
                                )}
                                {dayBlocks.map(block => <DayBlock key={block.id} block={block} member={member} />)}
                              </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ══════ WEEK VIEW ══════ */}
            {viewMode === 'Week' && (() => {
              const todayIdx = weekDays.findIndex(d => sameDay(d, TODAY))
              const DAY_COL_COUNT = 7
              const hasAnyShifts = shiftTemplates.length > 0
              return (
                <div className="rounded-lg border border-[#e5e7eb] bg-white overflow-hidden relative">
                  {/* Global today line spanning header + all rows */}
                  {todayIdx >= 0 && (
                    <div className="absolute top-0 bottom-0 pointer-events-none z-[6]"
                      style={{ left: `calc(${MEMBER_COL_WIDTH}px + ${(todayIdx + 0.5) / DAY_COL_COUNT} * (100% - ${MEMBER_COL_WIDTH}px))` }}>
                      <div className="w-[2px] h-full bg-[#2563eb]" style={{ boxShadow: '0 0 4px rgba(37,99,235,0.2)' }} />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex border-b border-[#e5e7eb]" style={{ height: 40 }}>
                    <div className="shrink-0 flex items-center px-4 border-r border-[#e5e7eb] bg-[#f9fafb]" style={{ width: MEMBER_COL_WIDTH }}>
                      <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-[0.05em]">Team Members</span>
                    </div>
                    {weekDays.map(day => {
                      const isPastDay = day < TODAY && !sameDay(day, TODAY)
                      return (
                        <div key={dk(day)} className={`flex-1 min-w-0 flex items-center justify-center text-[12px] font-medium border-r border-[#f3f4f6] last:border-r-0 relative ${sameDay(day, TODAY) ? 'text-[#2563eb] font-bold' : isPastDay ? 'text-[#9ca3af]' : 'text-[#374151]'}`}>
                          {DAY_NAMES[day.getDay()]} {day.getDate()}
                        </div>
                      )
                    })}
                  </div>

                  {/* Rows */}
                  {visibleMembers.map(member => (
                    <div key={member.id} className="flex border-b border-[#f3f4f6] last:border-b-0" style={{ minHeight: 85 }}>
                      <div className="shrink-0 border-r border-[#e5e7eb]" style={{ width: MEMBER_COL_WIDTH }}><MemberCell member={member} /></div>
                      {weekDays.map(day => {
                        const dayStr = dk(day)
                        const dayBlocks = member.blocks.filter(b => b.date === dayStr)
                        const cellKey = `${member.id}:${dayStr}`
                        const isCellOver = dragOverCell === cellKey
                        const isCellFlash = flashCell === cellKey
                        const dayShift = getShiftForMemberDay(member.id, dayStr)
                        const dayName = DAY_NAMES[day.getDay()]
                        const isOffDay = dayShift && !dayShift.activeDays.includes(dayName)
                        const isPast = day < TODAY && !sameDay(day, TODAY)
                        return (
                          <div key={dayStr}
                            className={`flex-1 min-w-0 relative p-1 border-r border-[#f3f4f6] last:border-r-0 transition-colors duration-150 group/cell`}
                            style={{ backgroundColor: isCellFlash ? '#DCFCE7' : isCellOver ? '#eff6ff' : isOffDay ? '#eef0f3' : day.getDay() === 0 ? '#f9fafb' : '#ffffff', ...(isCellOver ? { outline: '2px dashed #93c5fd', outlineOffset: '-2px' } : {}) }}
                            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCell(cellKey) }}
                            onDragEnter={e => { e.preventDefault(); setDragOverCell(cellKey) }}
                            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCell(null) }}
                            onDrop={e => handleDrop(e, member.id, dayStr)}>
                            {/* Shift band */}
                            {dayShift && (
                              <button type="button" onClick={e => { e.stopPropagation(); setShiftPopover({ memberId: member.id, date: dayStr, clientX: e.clientX, clientY: e.clientY }) }}
                                className="w-full rounded-[3px] px-1.5 py-[2px] mb-1 text-left cursor-pointer transition-opacity hover:opacity-80 z-[3] relative"
                                style={{ background: `${dayShift.color}20`, borderLeft: `3px solid ${dayShift.color}` }}>
                                <span className="text-[10px] font-semibold truncate block" style={{ color: dayShift.color }}>{dayShift.name.split(' ')[0]} · {shiftTimeLabel(dayShift)}</span>
                              </button>
                            )}
                            {!dayShift && hasAnyShifts && (
                              <button type="button" onClick={e => { e.stopPropagation(); setShiftPopover({ memberId: member.id, date: dayStr, clientX: e.clientX, clientY: e.clientY }) }}
                                className="w-full rounded-[3px] px-1.5 py-[2px] mb-1 text-left cursor-pointer opacity-0 group-hover/cell:opacity-100 hover:bg-[#f3f4f6] transition-all z-[3] relative border border-dashed border-transparent hover:border-[#d1d5db]">
                                <span className="text-[11px] text-[rgb(120,120,120)]">+ shift</span>
                              </button>
                            )}
                            <div className="relative z-[2] space-y-1">{dayBlocks.map(block => <WeekBlock key={block.id} block={block} member={member} />)}</div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* ══════ MONTH VIEW ══════ */}
            {viewMode === 'Month' && (() => {
              const mBlocks = selectedMember
                ? members.find(m => m.id === selectedMember)?.blocks || []
                : members.flatMap(m => m.blocks)
              return (
                <div className="rounded-lg border border-[#e5e7eb] bg-white overflow-hidden">
                  <div className="flex border-b border-[#e5e7eb] bg-[#f9fafb]" style={{ height: 40 }}>
                    {DAY_NAMES.map(d => <div key={d} className="flex-1 flex items-center justify-center text-[12px] font-semibold text-[#6b7280] uppercase tracking-[0.05em]">{d}</div>)}
                  </div>
                  {monthGrid.map((week, wi) => (
                    <div key={wi} className="flex border-b border-[#f3f4f6] last:border-b-0">
                      {week.map(day => {
                        const dayStr = dk(day); const isCur = day.getMonth() === currentDate.getMonth()
                        const dayB = mBlocks.filter(b => b.date === dayStr)
                        const cellKey = `month:${dayStr}`; const isCellOver = dragOverCell === cellKey
                        return (
                          <div key={dayStr} className={`flex-1 min-h-[100px] p-1.5 border-r border-[#f3f4f6] last:border-r-0 transition-colors ${isCellOver ? 'bg-[#eff6ff]' : !isCur ? 'bg-[#f9fafb]' : 'bg-white'}`}
                            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCell(cellKey) }}
                            onDragEnter={e => { e.preventDefault(); setDragOverCell(cellKey) }}
                            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCell(null) }}
                            onDrop={e => { const mid = selectedMember || visibleMembers[0]?.id; if (mid) handleDrop(e, mid, dayStr) }}>
                            <span className={`text-[12px] font-medium ${sameDay(day, TODAY) ? 'text-[#2563eb] font-bold' : isCur ? 'text-[#374151]' : 'text-[#d1d5db]'}`}>{day.getDate()}</span>
                            {/* Shift chips */}
                            {(() => {
                              const dayShifts = members.map(m => {
                                const s = getShiftForMemberDay(m.id, dayStr)
                                return s ? { name: m.name, shift: s } : null
                              }).filter(Boolean) as { name: string; shift: ShiftTemplate }[]
                              if (!dayShifts.length) return null
                              const show = dayShifts.slice(0, 2)
                              const rest = dayShifts.length - 2
                              return (
                                <div className="mt-0.5 space-y-px">
                                  {show.map((ds, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ds.shift.color }} />
                                      <span className="text-[8px] text-[#6b7280] truncate">{ds.name.split(' ').map(w => w[0]).join('.')} — {ds.shift.name.split(' ')[0]}</span>
                                    </div>
                                  ))}
                                  {rest > 0 && <span className="text-[8px] text-[#3b82f6] pl-2.5 cursor-pointer hover:underline">+{rest} more</span>}
                                </div>
                              )
                            })()}
                            <div className="mt-1 space-y-0.5">
                              {dayB.slice(0, 3).map(block => {
                                const c = blockColors[block.color]
                                return (
                                  <div key={block.id} onClick={() => { const mem = members.find(m => m.blocks.some(b => b.id === block.id)); if (mem) setDetailBlock({ block, member: mem }) }}
                                    className="flex items-center gap-1 rounded-[3px] px-1 py-0.5 cursor-pointer hover:shadow-sm transition-shadow"
                                    style={{ background: c.cardBg, borderLeft: `2px solid ${c.bar}` }}>
                                    <p className="text-[9px] text-[#1C2024] truncate font-medium">{fmtHourShort(block.startHour)} {block.woNumber}: {block.title}</p>
                                  </div>
                                )
                              })}
                              {dayB.length > 3 && <p className="text-[9px] text-[#6b7280] font-medium pl-1">+{dayB.length - 3} more</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )
            })()}
          </section>
        </div>
      </main>

      {/* ══════ SETTINGS MODAL (TABBED) ══════ */}
      <Dialog.Root open={settingsOpen} onOpenChange={o => { setSettingsOpen(o); if (!o) { setEditingShift(null); setAddingShift(false); setTemplateFormOpen(false); setIsNewTemplate(false); setEditingTemplateId(null) } else { setSettingsDirty(false) } }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2 w-full max-w-[720px] h-[85vh] rounded-xl bg-white shadow-[var(--shadow-xl)] focus:outline-none flex flex-col overflow-hidden">
            {(() => {
              const isFormOpen = templateFormOpen
              const isShiftEditing = addingShift || !!editingShift
              const closeForm = () => {
                setEditingShift(null); setAddingShift(false); setAssignDropOpen(false); setTimePickerOpen(null)
                setTemplateFormOpen(false)
              }
              return (<>
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div className="relative overflow-hidden h-[27px] flex-1">
                <div className={`flex items-center gap-2 absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFormOpen ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                  <Dialog.Title className="text-[18px] font-bold text-[#111827]">Schedule Settings</Dialog.Title>
                </div>
                <div className={`flex items-center gap-2 absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFormOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                  <button onClick={closeForm} className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-[#f3f4f6] transition-colors cursor-pointer" aria-label="Back">
                    <ChevronLeft size={20} className="text-[#374151]" />
                  </button>
                  <Dialog.Title className="text-[18px] font-bold text-[#111827]">{isNewTemplate ? 'New Template' : `Edit ${templateName || 'Template'}`}</Dialog.Title>
                </div>
              </div>
              <Dialog.Close asChild><button className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-[#f3f4f6] transition-colors cursor-pointer" aria-label="Close"><X size={18} className="text-[#6b7280]" /></button></Dialog.Close>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden relative">
              <div className={`absolute inset-0 overflow-y-auto px-6 py-5 space-y-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFormOpen ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>

              {/* ═══ MAIN VIEW ═══ */}
              {(<>
                {/* Chart View Settings — single row */}
                <div className="rounded-xl bg-[#f9fafb] p-6">
                  <p className="text-[13px] font-semibold text-[#111827] mb-3">General Hours Settings</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-[#374151] mb-1">Visible Units</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Eye size={14} className="text-[#6b7280]" /></div>
                        <select value={visibleUnits} onChange={e => { setVisibleUnits(e.target.value); setSettingsDirty(true) }} className="w-full appearance-none pl-9 pr-8 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] text-[#374151] outline-none cursor-pointer hover:border-[#d1d5db] transition-colors">
                          <option value="4 hours">4 hours</option><option value="8 hours">8 hours</option><option value="12 hours">12 hours</option><option value="24 hours">24 hours</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#374151] mb-1">Time Granularity</label>
                      <div className="relative">
                        <select value={timeGran} onChange={e => { setTimeGran(e.target.value); setSettingsDirty(true) }} className="w-full appearance-none px-3 pr-8 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] text-[#374151] outline-none cursor-pointer hover:border-[#d1d5db] transition-colors">
                          <option value="15min">15 min (:15)</option><option value="30min">30 min (:30)</option><option value="hours">Hours (:00)</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">Shifts Templates</p>
                  <p className="text-[12px] text-[#6b7280] mt-1">Define reusable shift types. Assign them to technicians on the calendar.</p>
                </div>

                {/* Shift Template Cards */}
                <div className="space-y-3">
                  {templatesList.map(tpl => {
                    const tplShifts = shiftTemplates.filter(s => s.templateId === tpl.id)
                    const tplShiftIds = new Set(tplShifts.map(s => s.id))
                    const assignedIds = [...new Set(shiftAssignments.filter(a => tplShiftIds.has(a.shiftTemplateId)).map(a => a.technicianId))]
                    const assignedMembers = assignedIds.map(id => members.find(m => m.id === id)).filter(Boolean) as TeamMemberData[]
                    const activeDaysSet = new Set(tplShifts.flatMap(s => s.activeDays))
                    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].filter(d => activeDaysSet.has(d))
                    return (
                      <div key={tpl.id} className={`rounded-xl border bg-white transition-all duration-500 ${highlightedTemplateId === tpl.id ? 'border-[#3b82f6] ring-2 ring-[#3b82f6]/20 bg-[#f0f6ff]' : tpl.active ? 'border-[#e5e7eb]' : 'border-[#f3f4f6] opacity-60'}`}>
                        <div className="flex items-center gap-3 px-5 pt-4">
                          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setIsNewTemplate(false); setEditingTemplateId(tpl.id); setTemplateName(tpl.name); setScheduleActive(tpl.active); setTemplateFormOpen(true); setEditingShift(null); setAddingShift(false) }}>
                            <p className="text-[15px] font-semibold text-[#111827] hover:text-[#3b82f6] transition-colors">{tpl.name || 'Untitled Template'}</p>
                          </div>
                          <button onClick={() => { setTemplatesList(p => p.map(t => t.id === tpl.id ? { ...t, active: !t.active } : t)); setSettingsDirty(true) }}
                            className={`relative shrink-0 w-[36px] h-[20px] rounded-full transition-colors duration-200 cursor-pointer ${tpl.active ? 'bg-[#3b82f6]' : 'bg-[#d1d5db]'}`}
                            aria-label={tpl.active ? 'Disable schedule' : 'Enable schedule'}>
                            <span className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${tpl.active ? 'translate-x-[16px]' : ''}`} />
                          </button>
                          <div className="relative shrink-0">
                            <button onClick={() => setTemplateMenuOpen(p => p === tpl.id ? null : tpl.id)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-[#f3f4f6] transition-colors cursor-pointer" aria-label="Template options">
                              <MoreHorizontal size={16} className="text-[#6b7280]" />
                            </button>
                            {templateMenuOpen === tpl.id && (<>
                              <div className="fixed inset-0 z-[5]" onClick={() => setTemplateMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 z-10 w-[160px] rounded-lg border border-[#e5e7eb] bg-white shadow-lg py-1">
                                <button onClick={() => { setTemplateMenuOpen(null); setIsNewTemplate(false); setEditingTemplateId(tpl.id); setTemplateName(tpl.name); setScheduleActive(tpl.active); setTemplateFormOpen(true); setEditingShift(null); setAddingShift(false) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer text-left">
                                  <Pencil size={14} className="text-[#6b7280]" /> Edit template
                                </button>
                                <button onClick={() => { setTemplateMenuOpen(null); setShiftTemplates(p => p.filter(s => s.templateId !== tpl.id)); setShiftAssignments(p => p.filter(a => !tplShiftIds.has(a.shiftTemplateId))); setTemplatesList(p => p.filter(t => t.id !== tpl.id)); setSettingsDirty(true) }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#ef4444] hover:bg-[#fef2f2] transition-colors cursor-pointer text-left">
                                  <Trash2 size={14} className="text-[#ef4444]" /> Delete template
                                </button>
                              </div>
                            </>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 pb-3">
                          <div className="flex items-center gap-1.5 shrink-0">
                            {dayLabels.length > 0 ? dayLabels.map(d => (
                              <span key={d} className="text-[12px] text-[#9ca3af]">{d}</span>
                            )) : <span className="text-[12px] text-[#9ca3af]">No days</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {assignedMembers.length === 0 ? (
                              <span className="text-[12px] text-[#9ca3af]">No members assigned</span>
                            ) : (() => {
                              const show = assignedMembers.slice(0, 3)
                              const more = assignedMembers.length - 3
                              return (
                                <div className="flex items-center">
                                  {show.map((m, i) => {
                                    const idx = m.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avColors.length
                                    return <span key={m.id} className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-white text-[8px] font-semibold border-2 border-white shrink-0" style={{ backgroundColor: avColors[idx], marginLeft: i > 0 ? -6 : 0, zIndex: 10 - i }}>{m.avatar}</span>
                                  })}
                                  {more > 0 && <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#f3f4f6] text-[8px] font-semibold text-[#374151] border-2 border-white shrink-0" style={{ marginLeft: -6, zIndex: 6 }}>+{more}</span>}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                        <div className="px-5 pb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {tplShifts.map(st => (
                            <button key={st.id}
                              onClick={() => { setEditingTemplateId(tpl.id); setTemplateName(tpl.name); setScheduleActive(tpl.active); setTemplateFormOpen(true); setEditingShift({ ...st }); setAddingShift(false); setIsNewTemplate(false) }}
                              className={`flex items-center gap-2 text-[12px] cursor-pointer transition-colors ${st.active ? 'text-[#374151] hover:text-[#111827]' : 'text-[#9ca3af]'}`}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                              <span>{st.name || 'Unnamed'}</span>
                              <span className="text-[#9ca3af]">{shiftTimeLabel(st)}</span>
                            </button>
                          ))}
                          {tplShifts.length < 6 && (
                            <button onClick={() => { setEditingTemplateId(tpl.id); setTemplateName(tpl.name); setScheduleActive(tpl.active); setTemplateFormOpen(true); setNewShiftDraft({ id: '', name: '', color: '#3b82f6', startTime: '08:00', endTime: '17:00', spansMidnight: false, activeDays: [], breakMinutes: 0, notes: '', active: true, templateId: tpl.id }); setAddingShift(true); setEditingShift(null); setIsNewTemplate(false) }}
                              className="text-[12px] text-[#3b82f6] underline cursor-pointer transition-colors hover:text-[#2563eb]">
                              Add shift
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add new template card */}
                  <button onClick={() => {
                    const newId = `tpl-${Date.now()}`
                    setIsNewTemplate(true)
                    setEditingTemplateId(newId)
                    setTemplateName('')
                    setDailyHours(8)
                    setWorkDays({ Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false })
                    setEditingShift(null)
                    setAddingShift(false)
                    setTemplateFormOpen(true)
                    setSettingsDirty(false)
                  }}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-[#d1d5db] bg-[#fafafa] hover:border-[#3b82f6] hover:bg-[#f0f7ff] cursor-pointer transition-all duration-200 group">
                    <Plus size={16} className="text-[#9ca3af] group-hover:text-[#3b82f6] transition-colors" />
                    <span className="text-[13px] font-medium text-[#6b7280] group-hover:text-[#3b82f6] transition-colors">Add Template</span>
                  </button>
                </div>
              </>)}
              </div>

              {/* ═══ FORM VIEW (slides in) ═══ */}
              <div className={`absolute inset-0 overflow-y-auto px-6 py-5 space-y-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFormOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
              {isFormOpen && (() => {
                const currentTemplateShifts = shiftTemplates.filter(s => s.templateId === editingTemplateId)
                return (<>
                <style>{`
                  @keyframes shiftCardIn {
                    0% { transform: scale(0.7) translateY(12px); opacity: 0; }
                    60% { transform: scale(1.03) translateY(-2px); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                  }
                `}</style>

                {/* ── Template config ── */}
                <div className="space-y-5">
                    <div>
                      <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Template Name</label>
                      <input autoFocus type="text" value={templateName} placeholder="e.g. Holidays Schedule" onChange={e => { setTemplateName(e.target.value); setSettingsDirty(true) }} className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[14px] text-[#111827] outline-none hover:border-[#d1d5db] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors" />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[#374151] mb-2.5">Work Days</label>
                      <div className="flex items-center gap-5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <label key={day} className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input type="checkbox" checked={workDays[day]} onChange={() => { setWorkDays(p => ({ ...p, [day]: !p[day] })); setSettingsDirty(true) }} className="w-[18px] h-[18px] rounded accent-[#3b82f6] cursor-pointer" />
                            <span className="text-[13px] font-medium text-[#374151]">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                </div>

                {/* ── Timeline Visualizer (always visible in template form) ── */}
                {Number(dailyHours) > 0 && Object.values(workDays).some(Boolean) && (() => {
                  const toMin = (t: string) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1])
                  const fmtM = (m: number) => `${String(Math.floor((m % 1440) / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
                  const fmtLabel = (m: number) => {
                    const h = Math.floor((m % 1440) / 60)
                    const mm = m % 60
                    const ampm = h < 12 || h === 24 ? 'AM' : 'PM'
                    const h12 = h === 0 || h === 24 ? 12 : h > 12 ? h - 12 : h
                    return `${h12}:${String(mm).padStart(2, '0')}${ampm}`
                  }

                  const baseStartMin = 0
                  const baseEndMin = 1440

                  const overflowShifts: ShiftTemplate[] = []

                  const rangeStartMin = 0
                  const rangeEndMin = 1440

                  const totalMin = rangeEndMin - rangeStartMin
                  const sorted = [...currentTemplateShifts].sort((a, b) => toMin(a.startTime) - toMin(b.startTime))

                  const intervalMin = Math.max(60, Math.round(totalMin / 6 / 60) * 60)
                  const tlBounds: number[] = []
                  for (let b = rangeStartMin; b <= rangeEndMin; b += intervalMin) tlBounds.push(b)
                  if (tlBounds[tlBounds.length - 1] < rangeEndMin) tlBounds.push(rangeEndMin)

                  type Seg = { type: 'gap' | 'shift'; flex: number; startMin: number; endMin: number; shift?: ShiftTemplate }
                  const segments: Seg[] = []
                  const addGaps = (from: number, to: number) => {
                    if (to <= from) return
                    const pts = [from, ...tlBounds.filter(b => b > from && b < to), to]
                    for (let i = 0; i < pts.length - 1; i++) segments.push({ type: 'gap', flex: pts[i + 1] - pts[i], startMin: pts[i], endMin: pts[i + 1] })
                  }
                  let cursor = rangeStartMin
                  for (const st of sorted) {
                    const sMin = toMin(st.startTime)
                    const eMin = toMin(st.endTime)
                    const dur = st.spansMidnight && eMin <= sMin ? 1440 - sMin + eMin : eMin - sMin
                    const clampedStart = Math.max(sMin, rangeStartMin)
                    const clampedEnd = Math.min(sMin + dur, rangeEndMin)
                    if (clampedStart > cursor) addGaps(cursor, clampedStart)
                    segments.push({ type: 'shift', flex: Math.max(clampedEnd - clampedStart, 60), startMin: clampedStart, endMin: clampedEnd, shift: st })
                    cursor = Math.max(cursor, clampedEnd)
                  }
                  if (cursor < rangeEndMin) addGaps(cursor, rangeEndMin)

                  const labels = tlBounds.map(m => fmtLabel(m))

                  const gapBg = '#f5f5f7'
                  return (
                    <>
                    {overflowShifts.length > 0 && (
                      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FFF8ED] border border-[#FDE68A]">
                        <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[13px] font-semibold text-[#92400E]">
                            {overflowShifts.length === 1 ? '1 shift extends' : `${overflowShifts.length} shifts extend`} beyond the {dailyHours || 8}-hour window ({fmtLabel(baseStartMin)}–{fmtLabel(baseEndMin)})
                          </p>
                          <p className="text-[12px] text-[#B45309] mt-0.5">
                            Review {overflowShifts.map(s => `"${s.name}"`).join(', ')} or increase daily hours to cover them.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-start p-0 gap-2 border-none rounded-[20px] bg-white">
                      <p className="text-[13px] font-semibold text-[#111827]">Add Shifts</p>
                      <div className="flex flex-row items-stretch w-full gap-[6px]" style={{ height: 140 }}>
                        {segments.map((seg, i) => {
                          if (seg.type === 'gap') {
                            const canAdd = currentTemplateShifts.length < 6 && !isShiftEditing
                            const isSelected = addingShift && selectedGapRange && seg.startMin >= selectedGapRange.startMin && seg.endMin <= selectedGapRange.endMin
                            return (
                              <div key={`g${i}`} className={`relative rounded-[14px] group/slot transition-all duration-300 ${isSelected ? 'ring-2 ring-[#3b82f6] ring-offset-2' : ''}`} style={{ flex: seg.flex, background: isSelected ? '#eff6ff' : gapBg }}>
                                {canAdd && (
                                  <button onClick={() => { setSelectedGapRange({ startMin: seg.startMin, endMin: seg.endMin }); setNewShiftDraft({ id: '', name: '', color: '#3b82f6', startTime: fmtM(seg.startMin), endTime: fmtM(seg.endMin), spansMidnight: false, activeDays: [], breakMinutes: 0, notes: '', active: true, templateId: editingTemplateId || '' }); setAddingShift(true); setEditingShift(null) }}
                                    className={`absolute inset-0 flex items-center justify-center rounded-[14px] transition-all duration-200 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/slot:opacity-100'}`}>
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white" style={{ boxShadow: '-5px 6px 24px rgba(0,0,0,0.08)' }}>
                                      <Plus size={18} className="text-[#1C2024]" strokeWidth={1.5} />
                                    </span>
                                  </button>
                                )}
                              </div>
                            )
                          }
                          const st = seg.shift!
                          const cardBg = SHIFT_CARD_BG[st.color] || '#f3f4f6'
                          const cardBorder = SHIFT_CARD_BORDER[st.color] || st.color
                          const assigned = members.filter(m => shiftAssignments.some(a => a.shiftTemplateId === st.id && a.technicianId === m.id))
                          const showAvatars = assigned.slice(0, 3)
                          const moreCount = assigned.length - 3
                          const isNew = st.id === lastAddedShiftId
                          const isActive = editingShift?.id === st.id
                          return (
                            <button key={st.id} onClick={() => { setEditingShift({ ...st }); setAddingShift(false); setSelectedGapRange(null) }}
                              className={`flex flex-col justify-center items-start px-4 rounded-[16px] cursor-pointer transition-all duration-300 overflow-hidden text-left min-w-0 hover:shadow-lg ${isActive ? 'ring-2 ring-[#3b82f6] ring-offset-2 shadow-lg' : ''}`}
                              style={{
                                flex: seg.flex, height: '100%',
                                background: cardBg, borderLeft: `4px solid ${cardBorder}`,
                                ...(isNew ? { animation: 'shiftCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' } : {})
                              }}>
                              <p className="text-[13px] font-semibold text-[#111827] truncate w-full text-left" style={{ lineHeight: '17px' }}>{st.name}</p>
                              <p className="text-[10px] font-normal text-[#111827] truncate w-full text-left" style={{ lineHeight: '17px' }}>{shiftTimeLabel(st)}</p>
                              {assigned.length > 0 ? (
                                <div className="flex items-center pt-3">
                                  {showAvatars.map(m => {
                                    const idxC = m.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avColors.length
                                    return <span key={m.id} className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[8px] font-semibold -ml-[5px] first:ml-0" style={{ backgroundColor: avColors[idxC], boxShadow: '-3px 2px 10px rgba(0,0,0,0.15)' }}>{m.avatar}</span>
                                  })}
                                  {moreCount > 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-[8px] font-semibold text-[#111827] -ml-[5px]" style={{ boxShadow: '-3px 2px 10px rgba(0,0,0,0.15)' }}>+{moreCount}</span>}
                                </div>
                              ) : (
                                <p className="text-[12px] font-semibold text-[#111827] underline pt-3 text-left">+ Assign</p>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center w-full">
                        {labels.map((t, i) => (
                          <span key={i} className="text-[10px] font-semibold text-[#B9BBC6]" style={{ lineHeight: '17px' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    </>
                  )
                })()}


                {/* Shift form fields (only when editing/adding a shift) */}
                {isShiftEditing && (() => {
                  const isEdit = !!editingShift
                  const s = isEdit ? editingShift! : newShiftDraft
                  const update = (patch: Partial<ShiftTemplate>) => {
                    if (isEdit) setEditingShift(p => p ? { ...p, ...patch } : p)
                    else setNewShiftDraft(p => ({ ...p, ...patch }))
                  }
                  const save = () => {
                    const startH = parseInt(s.startTime.split(':')[0]) * 60 + parseInt(s.startTime.split(':')[1])
                    const endH = parseInt(s.endTime.split(':')[0]) * 60 + parseInt(s.endTime.split(':')[1])
                    const overnight = endH <= startH
                    if (isEdit && editingShift) {
                      setShiftTemplates(p => p.map(t => t.id === editingShift.id ? { ...editingShift, spansMidnight: overnight } : t))
                      setEditingShift(null)
                      setSettingsDirty(true)
                    } else {
                      const ns: ShiftTemplate = { ...newShiftDraft, id: `shift_${Date.now()}`, spansMidnight: overnight, templateId: editingTemplateId || '' }
                      setShiftTemplates(p => [...p, ns])
                      setLastAddedShiftId(ns.id)
                      setTimeout(() => setLastAddedShiftId(null), 600)
                      setShiftAssignments(p => p.map(a => a.shiftTemplateId === '__new_shift_draft__' ? { ...a, shiftTemplateId: ns.id } : a))
                      setNewShiftDraft({ id: '', name: '', color: '#3b82f6', startTime: '08:00', endTime: '17:00', spansMidnight: false, activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], breakMinutes: 0, notes: '', active: true, templateId: '' })
                      setAddingShift(false)
                      setSelectedGapRange(null)
                      setSettingsDirty(true)
                    }
                  }
                  const hasDays = s.activeDays.length > 0
                  const usedDays = currentTemplateShifts.filter(t => !isEdit || t.id !== s.id).reduce<Set<string>>((acc, t) => { t.activeDays.forEach(d => { if (acc.has(d)) return; acc.add(d) }); return acc }, new Set())
                  return (
                    <div ref={shiftFormRef} className="space-y-4 border border-[#e5e7eb] rounded-xl p-4">
                      {true && (
                        <div className="space-y-3 animate-[shiftCardIn_0.3s_ease-out_forwards]">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[12px] font-medium text-[#374151] mb-1 block">Shift Name</label>
                              <input autoFocus maxLength={30} value={s.name} onChange={e => update({ name: e.target.value })} className={`${selectCls} text-[13px]`} placeholder="e.g. Morning Shift" />
                            </div>
                            <div>
                              <label className="text-[12px] font-medium text-[#374151] mb-1 block">Color</label>
                              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                                {SHIFT_COLORS.map(c => (
                                  <button key={c} onClick={() => update({ color: c })} className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${s.color === c ? 'ring-2 ring-offset-1 ring-[#3b82f6] scale-110' : 'hover:scale-110'}`} style={{ background: c }} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {(() => {
                            const fmt12 = (v: string) => {
                              const [hh, mm] = v.split(':').map(Number)
                              const ampm = hh < 12 ? 'AM' : 'PM'
                              const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
                              return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`
                            }
                            const durLabel = (startV: string, endV: string) => {
                              const [sh, sm] = startV.split(':').map(Number)
                              const [eh, em] = endV.split(':').map(Number)
                              let diff = (eh * 60 + em) - (sh * 60 + sm)
                              if (diff <= 0) diff += 1440
                              const hrs = Math.floor(diff / 60)
                              const mins = diff % 60
                              if (hrs === 0) return `(${mins} mins)`
                              if (mins === 0) return hrs === 1 ? '(1 hr)' : `(${hrs} hrs)`
                              return `(${hrs} hr ${mins} min)`
                            }
                            const slots = Array.from({ length: 48 }, (_, i) => {
                              const h = Math.floor(i / 2); const m = (i % 2) * 30
                              return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                            })
                            const renderPicker = (field: 'start' | 'end', label: string, value: string, onChange: (v: string) => void) => {
                              const isOpen = timePickerOpen === field
                              return (
                                <div className="relative">
                                  <label className="text-[12px] font-medium text-[#374151] mb-1 block">{label}</label>
                                  <button type="button" onClick={() => setTimePickerOpen(isOpen ? null : field)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[13px] text-left transition-colors cursor-pointer bg-white ${isOpen ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]' : 'border-[#e5e7eb] hover:border-[#d1d5db]'}`}>
                                    <span className="text-[#111827]">{fmt12(value)}</span>
                                    <ChevronDown size={14} className={`text-[#6b7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isOpen && (<>
                                    <div className="fixed inset-0 z-[5]" onClick={() => setTimePickerOpen(null)} />
                                    <div ref={timeListRef} className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-[#e5e7eb] bg-white shadow-lg max-h-[200px] overflow-y-auto py-1">
                                      {slots.map(slot => {
                                        const selected = slot === value
                                        const showDur = field === 'end'
                                        return (
                                          <button key={slot} data-time={slot} data-selected={selected || undefined} onClick={() => { onChange(slot); setTimePickerOpen(null) }}
                                            className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${selected ? 'bg-[#eff6ff] text-[#2563eb] font-medium' : 'text-[#374151] hover:bg-[#f9fafb]'}`}>
                                            {fmt12(slot)}{showDur ? ` ${durLabel(s.startTime, slot)}` : ''}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </>)}
                                </div>
                              )
                            }
                            return (
                              <div className="grid grid-cols-2 gap-3">
                                {renderPicker('start', 'Start Time', s.startTime, v => update({ startTime: v }))}
                                {renderPicker('end', 'End Time', s.endTime, v => update({ endTime: v }))}
                              </div>
                            )
                          })()}
                          <div className="relative">
                            <label className="text-[12px] font-medium text-[#374151] mb-1 block">Assign to Team Members</label>
                            {(() => {
                              const shiftId = isEdit ? s.id : `__new_shift_draft__`
                              const assignedMembers = members.filter(m => shiftAssignments.some(a => a.shiftTemplateId === shiftId && a.technicianId === m.id))
                              const summary = assignedMembers.length === 0 ? 'Select members…' : assignedMembers.length <= 3 ? assignedMembers.map(m => m.name.split(' ')[0]).join(', ') : `${assignedMembers.slice(0, 2).map(m => m.name.split(' ')[0]).join(', ')} +${assignedMembers.length - 2}`
                              return (<>
                                <button onClick={() => setAssignDropOpen(p => !p)}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[13px] text-left transition-colors border-[#e5e7eb] bg-white hover:border-[#d1d5db] cursor-pointer ${assignDropOpen ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]' : ''}`}>
                                  <span className={assignedMembers.length > 0 ? 'text-[#111827]' : 'text-[#9ca3af]'}>{summary}</span>
                                  <ChevronDown size={14} className={`text-[#6b7280] transition-transform ${assignDropOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {assignDropOpen && (<>
                                  <div className="fixed inset-0 z-[5]" onClick={() => setAssignDropOpen(false)} />
                                  <div className="absolute left-0 right-0 bottom-full mb-1 z-10 rounded-lg border border-[#e5e7eb] bg-white shadow-lg max-h-[180px] overflow-y-auto py-1">
                                    {members.map(m => {
                                      const isAssigned = shiftAssignments.some(a => a.shiftTemplateId === shiftId && a.technicianId === m.id)
                                      const idxC = m.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avColors.length
                                      return (
                                        <button key={m.id} onClick={() => {
                                          const week = getWeekDays(currentDate)
                                          if (isAssigned) {
                                            setShiftAssignments(p => p.filter(a => !(a.shiftTemplateId === shiftId && a.technicianId === m.id)))
                                          } else {
                                            const days = s.activeDays.length > 0 ? s.activeDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                                            const newA: ShiftAssignment[] = week.filter(d => days.includes(DAY_NAMES[d.getDay()])).map(d => ({ id: `a-${m.id}-${dk(d)}`, technicianId: m.id, shiftTemplateId: shiftId, date: dk(d) }))
                                            setShiftAssignments(p => {
                                              const keys = new Set(newA.map(a => `${a.technicianId}:${a.date}`))
                                              return [...p.filter(a => !keys.has(`${a.technicianId}:${a.date}`)), ...newA]
                                            })
                                          }
                                          setSettingsDirty(true)
                                        }}
                                          className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-[#f9fafb] transition-colors cursor-pointer">
                                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded border text-white shrink-0 transition-colors ${isAssigned ? 'bg-[#3b82f6] border-[#3b82f6]' : 'border-[#d1d5db] bg-white'}`}>
                                            {isAssigned && <Check size={10} strokeWidth={2.5} />}
                                          </span>
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[8px] font-semibold shrink-0" style={{ backgroundColor: avColors[idxC] }}>{m.avatar}</span>
                                          <span className="text-[13px] text-[#111827] flex-1 truncate">{m.name}</span>
                                          <span className="text-[11px] text-[#9ca3af]">{m.role}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </>)}
                              </>)
                            })()}
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            {isEdit ? (
                              <button onClick={() => { setShiftTemplates(p => p.filter(t => t.id !== s.id)); setSettingsDirty(true); setEditingShift(null); setAddingShift(false) }}
                                className="px-4 py-1.5 rounded-lg border border-[#fecaca] text-[12px] font-medium text-[#ef4444] hover:bg-[#fef2f2] cursor-pointer transition-colors">Delete</button>
                            ) : <div />}
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingShift(null); setAddingShift(false); setSelectedGapRange(null) }}
                                className="px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] cursor-pointer transition-colors">Cancel</button>
                              <button onClick={save} disabled={!s.name.trim()} className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-semibold hover:bg-[#2563eb] disabled:opacity-40 cursor-pointer transition-colors">{isEdit ? 'Update' : 'Add Shift'}</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

              </>)
              })()}
              </div>
            </div>
            {isFormOpen ? (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e7eb]">
                <button onClick={closeForm} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer">
                  <ChevronLeft size={14} className="text-[#374151]" />
                  Back
                </button>
                <button onClick={() => {
                  if (isNewTemplate && editingTemplateId && templateName.trim()) {
                    setTemplatesList(p => [...p, { id: editingTemplateId, name: templateName.trim(), active: scheduleActive }])
                  } else if (editingTemplateId) {
                    setTemplatesList(p => p.map(t => t.id === editingTemplateId ? { ...t, name: templateName.trim() || t.name, active: scheduleActive } : t))
                  }
                  setHighlightedTemplateId(editingTemplateId)
                  setTimeout(() => setHighlightedTemplateId(null), 2000)
                  setSettingsDirty(false); closeForm()
                }} disabled={!settingsDirty || isShiftEditing}
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${settingsDirty && !isShiftEditing ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] cursor-pointer' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>Save Template</button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e7eb]">
                <Dialog.Close asChild>
                  <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer">Cancel</button>
                </Dialog.Close>
                <button onClick={() => { setSettingsDirty(false); setSettingsOpen(false) }} disabled={!settingsDirty}
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${settingsDirty ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] cursor-pointer' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>Save</button>
              </div>
            )}
            </>)
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ══════ DETAIL MODAL ══════ */}
      <Dialog.Root open={!!detailBlock} onOpenChange={o => { if (!o) setDetailBlock(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] rounded-xl bg-white shadow-[var(--shadow-xl)] focus:outline-none flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <Dialog.Title className="text-[18px] font-bold text-[#111827]">Work Order Details</Dialog.Title>
              <Dialog.Close asChild><button className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-[#f3f4f6] transition-colors cursor-pointer" aria-label="Close"><X size={18} className="text-[#6b7280]" /></button></Dialog.Close>
            </div>
            <div className="h-px bg-[#e5e7eb]" />
            {detailBlock && (
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#111827]">{detailBlock.block.woNumber}</span>
                  {!detailBlock.block.saved && <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#fef9c3] text-[#854d0e] border border-[#fde68a]">Not Saved</span>}
                </div>
                <h3 className="text-[16px] font-semibold text-[#111827]">{detailBlock.block.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {([['Assignee', detailBlock.member.name], ['Due Date', detailBlock.block.dueDate], ['Duration', `${detailBlock.block.durationHours}h`], ['Start Time', fmtHourShort(detailBlock.block.startHour)], ['Date', detailBlock.block.date], ['Status', detailBlock.block.status || 'Open'], ['Category', detailBlock.block.category || '—'], ['Priority', detailBlock.block.priority || '—'], ['Location', detailBlock.block.location || detailBlock.member.location]] as const).map(([l, v]) => (
                    <div key={l}><p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">{l}</p><p className="text-[13px] text-[#111827] font-medium mt-0.5">{v}</p></div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#e5e7eb]">
              <Dialog.Close asChild><button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] cursor-pointer">Close</button></Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ══════ SMART SCHEDULE MODAL ══════ */}
      <Dialog.Root open={smartOpen} onOpenChange={setSmartOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] rounded-xl bg-white shadow-[var(--shadow-xl)] focus:outline-none flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <Dialog.Title className="text-[18px] font-bold text-[#111827]">Smart Schedule</Dialog.Title>
              <Dialog.Close asChild><button className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-[#f3f4f6] transition-colors cursor-pointer" aria-label="Close"><X size={18} className="text-[#6b7280]" /></button></Dialog.Close>
            </div>
            <div className="h-px bg-[#e5e7eb]" />
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#f5f3ff] border border-[#ddd6fe]">
                <Zap size={24} className="text-[#7c3aed] shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">AI-Powered Scheduling</p>
                  <p className="text-[13px] text-[#6b7280] mt-1">Smart Schedule will automatically assign unscheduled work orders to available technicians based on skills, location, and workload.</p>
                </div>
              </div>
              <p className="text-[13px] text-[#374151]"><strong>{Math.min(8, unscheduled.length)}</strong> work orders will be assigned to <strong>{visibleMembers.filter(m => m.blocks.length < 4).length}</strong> available technicians.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e7eb]">
              <Dialog.Close asChild><button className="px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] cursor-pointer">Cancel</button></Dialog.Close>
              <button onClick={runSmart} className="px-5 py-2 rounded-lg bg-[var(--color-accent-9)] text-white text-[length:var(--font-size-sm)] font-semibold hover:bg-[var(--color-accent-10)] cursor-pointer">Run Smart Schedule</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ══════ OFF-SHIFT DROP CONFIRMATION ══════ */}
      <Dialog.Root open={!!oooConfirm} onOpenChange={o => { if (!o) setOooConfirm(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] rounded-xl bg-white shadow-[var(--shadow-xl)] focus:outline-none overflow-hidden">
            <div className="px-5 pt-5 pb-3 text-center">
              <Dialog.Title className="text-[15px] font-semibold text-[#111827]">Schedule outside shift hours</Dialog.Title>
              <p className="text-[13px] text-[#6b7280] mt-2 leading-[1.5]">
                This technician&apos;s shift is <span className="font-semibold text-[#374151]">{oooConfirm?.shiftName}</span> ({oooConfirm?.shiftTime}).
                You&apos;re scheduling at <span className="font-semibold text-[#374151]">{oooConfirm ? fmtHour(Math.floor(oooConfirm.hour)) : ''}</span>, which falls outside their working hours.
              </p>
              <div className="flex justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                  <AlertTriangle size={20} className="text-[#F59E0B]" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-[#f3f4f6] mt-2">
              <button onClick={() => setOooConfirm(null)} className="px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer">Cancel</button>
              <button onClick={confirmOooDrop} className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-semibold hover:bg-[#2563eb] transition-colors cursor-pointer">Schedule anyway</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ══════ SHIFT ASSIGNMENT POPOVER ══════ */}
      {shiftPopover && (() => {
        const panelW = Math.min(280, window.innerWidth - 24)
        const pad = 12
        const offset = 8
        const maxPopoverH = Math.min(480, window.innerHeight - pad * 2)
        const left = Math.min(Math.max(pad, shiftPopover.clientX + offset), window.innerWidth - panelW - pad)
        const top = Math.min(Math.max(pad, shiftPopover.clientY + offset), window.innerHeight - maxPopoverH - pad)
        return (<>
          <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setShiftPopover(null)} />
          <div className="fixed z-[var(--z-modal)] w-[min(280px,calc(100vw-24px))] max-h-[min(480px,calc(100vh-24px))] overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-[var(--shadow-xl)] py-0"
            style={{ top, left }}>
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">Shifts</p>
            <button type="button" onClick={() => {
              setShiftAssignments(p => p.filter(a => !(a.technicianId === shiftPopover.memberId && a.date === shiftPopover.date)))
              setShiftPopover(null)
            }} className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-[12px] text-[#374151] hover:bg-[#f9fafb] cursor-pointer">
              <span className="w-3 h-3 rounded-full border-2 border-[#d1d5db] shrink-0" />
              No shift
            </button>
            {shiftTemplates.length === 0 ? (
              <div className="px-3 py-2 pb-3">
                <p className="text-[11px] text-[#6b7280] mb-2">No shift templates yet.</p>
                <button type="button" onClick={() => { setShiftPopover(null); setSettingsTab('shifts'); setSettingsOpen(true) }}
                  className="text-[12px] text-[#3b82f6] font-medium hover:underline cursor-pointer">+ Create a shift template</button>
              </div>
            ) : (<>
              {shiftTemplates.map(st => {
                const isActive = shiftAssignments.some(a => a.technicianId === shiftPopover.memberId && a.date === shiftPopover.date && a.shiftTemplateId === st.id)
                return (
                  <button key={st.id} type="button" onClick={() => {
                    setShiftAssignments(p => {
                      const filtered = p.filter(a => !(a.technicianId === shiftPopover.memberId && a.date === shiftPopover.date))
                      return [...filtered, { id: `a-${shiftPopover.memberId}-${shiftPopover.date}`, technicianId: shiftPopover.memberId, shiftTemplateId: st.id, date: shiftPopover.date }]
                    })
                    setShiftPopover(null)
                  }} className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-[12px] cursor-pointer transition-colors ${isActive ? 'bg-[#eff6ff] font-medium text-[#111827]' : 'text-[#374151] hover:bg-[#f9fafb]'}`}>
                    {isActive ? <Check size={14} className="text-[#3b82f6] shrink-0" /> : <span className="w-3.5 shrink-0" />}
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: st.color }} />
                    <span className="truncate flex-1">{st.name}</span>
                    <span className="text-[10px] text-[#6b7280] shrink-0">{shiftTimeLabel(st)}</span>
                  </button>
                )
              })}
              <div className="border-t border-[#f3f4f6] mt-1 px-3 py-2">
                <button type="button" onClick={() => {
                  const assigned = getShiftForMemberDay(shiftPopover.memberId, shiftPopover.date)
                  setShiftPopover(null)
                  if (assigned) openShiftTemplateInSettings(assigned)
                  else { setSettingsTab('shifts'); setSettingsOpen(true) }
                }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[12px] font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-colors cursor-pointer">
                  Manage shifts
                </button>
              </div>
            </>)}
          </div>
        </>)
      })()}

      {/* ══════ HEADER PORTALS ══════ */}

      {afterTitlePortal && createPortal(
        <div className="relative ml-2">
          <button onClick={() => setStartDateOpen(p => !p)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] cursor-pointer hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)]">
            <Calendar size={14} className="text-[var(--color-neutral-7)]" />
            Start Date
            <ChevronDown size={12} className={`text-[var(--color-neutral-7)] transition-transform duration-150 ${startDateOpen ? 'rotate-180' : ''}`} />
          </button>
          {startDateOpen && (<>
            <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setStartDateOpen(false)} />
            <div className="absolute left-0 top-full mt-1 w-[220px] rounded-lg border border-[#e5e7eb] bg-white shadow-[var(--shadow-lg)] z-[var(--z-modal)] p-3">
              <label className="block text-[12px] font-medium text-[#6b7280] mb-1.5">Jump to date</label>
              <input type="date" value={dk(currentDate)}
                onChange={e => { if (e.target.value) { const [y, m, d] = e.target.value.split('-').map(Number); setCurrentDate(new Date(y, m - 1, d)); setStartDateOpen(false) } }}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] text-[#374151] outline-none cursor-pointer hover:border-[#d1d5db] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors" />
            </div>
          </>)}
        </div>,
        afterTitlePortal
      )}

      {headerPortal && createPortal(
        <>
          <button onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer"
            aria-label="Refresh">
            <RefreshCw size={16} className={`text-[var(--color-neutral-7)] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleSave} disabled={!hasUnsaved || saving}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-lg)] text-[13px] font-semibold transition-all cursor-pointer ${hasUnsaved ? 'bg-[#16a34a] text-white hover:bg-[#15803d] shadow-sm' : 'bg-[#16a34a] text-white opacity-80 cursor-not-allowed'}`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
          <button onClick={() => setSmartOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-white text-[length:var(--font-size-sm)] font-semibold hover:bg-[var(--color-accent-10)] transition-colors cursor-pointer">
            <Zap size={14} /> Smart Schedule
          </button>
        </>,
        headerPortal
      )}
    </div>
  )
}
