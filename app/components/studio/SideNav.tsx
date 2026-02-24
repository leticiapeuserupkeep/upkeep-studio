import {
  Sparkles,
  ClipboardList,
  ShieldCheck,
  CalendarDays,
  Inbox,
  Truck,
  Map,
  ClipboardCheck,
  Fuel,
  AlertTriangle,
  Link,
  Package,
  FileText,
  Users,
  LayoutGrid,
  PlusCircle,
  Bell,
  HelpCircle,
  MessageCircle,
  Mail,
  Settings,
  ChevronUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  icon: LucideIcon
  active?: boolean
}

interface NavSection {
  title: string
  badge?: string
  collapsed?: boolean
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'CORE',
    items: [
      { label: 'Work Orders', icon: ClipboardList },
      { label: 'Preventive Maintenance', icon: ShieldCheck },
      { label: 'Scheduler', icon: CalendarDays },
      { label: 'Requests', icon: Inbox },
    ],
  },
  { title: 'DATA & ANALYTICS', collapsed: true, items: [] },
  { title: 'RESOURCES', collapsed: true, items: [] },
  {
    title: 'FLEET MAINTENANCE',
    items: [
      { label: 'Vehicles', icon: Truck },
      { label: 'Vehicle Map', icon: Map },
      { label: 'Inspections', icon: ClipboardCheck },
      { label: 'Fuel & Expenses', icon: Fuel },
      { label: 'Recalls', icon: AlertTriangle },
      { label: 'Integrations', icon: Link },
    ],
  },
  {
    title: 'PROCUREMENT',
    items: [
      { label: 'Parts & Inventory', icon: Package },
      { label: 'Purchase Orders', icon: FileText },
      { label: 'Vendors & Customers', icon: Users },
    ],
  },
  {
    title: 'STUDIO',
    badge: 'NEW',
    items: [
      { label: 'Browse apps', icon: LayoutGrid, active: true },
      { label: 'Create New App', icon: PlusCircle },
    ],
  },
]

export function SideNav() {
  return (
    <aside className="flex flex-col w-[220px] min-h-screen border-r border-[var(--color-neutral-4)] bg-[var(--color-neutral-1)]">
      {/* Logo + actions */}
      <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)]">
        <div className="flex items-center gap-[var(--space-xs)]">
          <span className="text-[var(--font-size-body-1)] font-bold text-[var(--color-accent-9)]">⚙ UpKeep</span>
        </div>
        <div className="flex items-center gap-[var(--space-xs)]">
          <Bell size={18} className="text-[var(--color-neutral-8)]" />
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent-9)] flex items-center justify-center text-white text-xs font-semibold">
            S
          </div>
        </div>
      </div>

      {/* Intelligence */}
      <div className="px-[var(--space-sm)]">
        <div className="flex items-center gap-[var(--space-xs)] px-[var(--space-xs)] py-[var(--space-xs)] text-[var(--font-size-body-2)] text-[var(--color-neutral-9)]">
          <Sparkles size={16} />
          <span>intelligence</span>
        </div>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto px-[var(--space-sm)] py-[var(--space-xs)]">
        {sections.map((section) => (
          <div key={section.title} className="mb-[var(--space-xs)]">
            <div className="flex items-center justify-between px-[var(--space-xs)] py-[var(--space-2xs)]">
              <div className="flex items-center gap-[var(--space-xs)]">
                <span className="text-[11px] font-semibold tracking-wide text-[var(--color-neutral-8)] uppercase">
                  {section.title}
                </span>
                {section.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-accent-1)] text-[var(--color-accent-9)]">
                    {section.badge}
                  </span>
                )}
              </div>
              <ChevronUp size={14} className="text-[var(--color-neutral-7)]" />
            </div>
            {!section.collapsed &&
              section.items.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-[var(--space-xs)] px-[var(--space-xs)] py-[6px] rounded-[var(--radius-md)] text-[var(--font-size-body-2)] cursor-pointer ${
                    item.active
                      ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium'
                      : 'text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
              ))}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="flex items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] border-t border-[var(--color-neutral-4)]">
        <LayoutGrid size={18} className="text-[var(--color-neutral-7)]" />
        <HelpCircle size={18} className="text-[var(--color-neutral-7)]" />
        <MessageCircle size={18} className="text-[var(--color-neutral-7)]" />
        <Mail size={18} className="text-[var(--color-neutral-7)]" />
        <Settings size={18} className="text-[var(--color-neutral-7)]" />
      </div>
    </aside>
  )
}
