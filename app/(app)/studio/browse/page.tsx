'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, ChevronDown, ArrowUpDown, X, MessageSquare, Loader, RefreshCw } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { AppCard } from '@/app/components/studio/AppCard'
import { AppDetailModal, type AppDetail } from '@/app/components/studio/AppDetailModal'
import { useDashboardContext } from '@/app/lib/dashboard/dashboard-context'
import type { Role } from '@/app/lib/models'

/* ── Search suggestions ── */
const popularSearches = [
  'safety inspection',
  'technician dashboard',
  'work order tracker',
  'parts inventory',
  'asset health',
  'preventive maintenance',
]

/* ── Categories ── */
const categories = [
  'All Categories',
  'Safety & Compliance',
  'Dashboards & Reporting',
  'Inspections & Checklists',
  'Inventory & Parts',
  'Work Order Management',
  'Technician Tools',
  'Mobile Workflows',
  'Data Quality & Auditing',
  'Trending',
  'Just Launched',
  'Community Favorites',
]

/* ── Tabs ── */
const tabs: { label: string; subtitle: string }[] = [
  { label: 'All', subtitle: '' },
  { label: 'Recommended', subtitle: '' },
  { label: 'Popular', subtitle: '' },
  { label: 'New', subtitle: '' },
]

/* ── Role labels ── */
const roleLabels: Record<Role, string> = {
  technician: 'Technicians',
  supervisor: 'Maintenance Managers',
  manager: 'Operations Leads',
}

const roleSingular: Record<Role, string> = {
  technician: 'Technician',
  supervisor: 'Maintenance Manager',
  manager: 'Operations Lead',
}

/* ── Apps data ── */
const apps: AppDetail[] = [
  {
    title: 'Impact Dashboard',
    description: 'Visualize the real-time impact of your maintenance operations across all sites.',
    longDescription: 'This app provides a comprehensive dashboard to track KPIs, visualize trends, and measure the impact of your maintenance strategy. See how work orders, inspections, and asset health evolve over time, and share reports with stakeholders.',
    likes: 12, downloads: 423, status: 'install',
    color: '#3E63DD', tags: ['Analytics', 'Reporting'], rating: 4.1, ratingCount: 12, size: '96.7 MB', creator: 'UpKeep Labs',
    suggestedNote: 'You have 200+ open work orders',
    lastUpdated: '2 weeks ago', verified: true, category: 'Dashboards & Reporting',
    image: '/images/apps/impact-dashboard.png',
    screenshots: ['/images/apps/impact-dashboard.png', '/images/apps/time-tracking.png', '/images/apps/workload-chart.png'],
    dataEntities: ['Work Orders', 'Assets', 'Meters', 'Inspections'],
    permissionScope: 'read-only',
    useCases: ['Track maintenance KPIs in real time', 'Generate executive reports', 'Compare performance across locations'],
    howItWorks: ['Connect to your UpKeep account', 'Select the metrics you want to track', 'View live dashboards and export reports'],
    permissions: ['Uses read access to work orders and assets', 'No data is stored outside UpKeep'],
    whatsNew: ['Added cost-per-asset breakdown', 'Improved chart rendering performance'],
    changelog: [
      { date: 'Feb 25, 2026', description: 'Added cost-per-asset breakdown and export to CSV' },
      { date: 'Feb 10, 2026', description: 'Improved chart rendering performance by 40%' },
      { date: 'Jan 28, 2026', description: 'Added multi-site comparison view' },
    ],
    reviews: [
      { author: 'Carlos M.', role: 'Maintenance Manager', rating: 4, comment: 'Great for weekly reporting. Wish it had more export options.', date: 'Mar 1, 2026' },
      { author: 'Sarah K.', role: 'Operations Lead', rating: 5, comment: 'Love the multi-site view. Exactly what we needed for our quarterly reviews.', date: 'Feb 18, 2026' },
    ],
  },
  {
    title: 'Paper Work Order Scan',
    description: 'Turn photos of paperwork into structured work orders, assets, or parts instantly.',
    longDescription: 'This app turns photos of handwritten or printed paperwork into structured records in UpKeep, so your team can spend less time on data entry and more time getting work done.',
    likes: 24, downloads: 891, status: 'installed',
    color: '#1C2024', tags: ['Maintenance', 'Productivity'], rating: 4.5, ratingCount: 24, size: '112.3 MB', creator: 'Mark Ludueña',
    lastUpdated: '1 week ago', verified: false, category: 'Mobile Workflows',
    image: '/images/apps/paper-wo-scan.png',
    screenshots: ['/images/apps/paper-wo-scan.png', '/images/apps/wo-grab.png', '/images/apps/bulk-wo-creator.png'],
    dataEntities: ['Work Orders', 'Assets', 'Parts'],
    permissionScope: 'read-write',
    useCases: ['Digitize handwritten work orders', 'Convert inspection notes into assets', 'Capture parts lists from paper forms', 'Reduce admin time and data entry errors'],
    howItWorks: ['Take a photo of the document', 'Review extracted information', 'Choose what to create (Work Order, Asset, or Part)', 'Save directly to UpKeep'],
    permissions: ['Uses camera access to capture images', 'Images are processed securely', 'No data is stored outside UpKeep'],
    whatsNew: ['Improved handwriting recognition', 'Faster extraction and preview', 'Better field mapping for work orders'],
    changelog: [
      { date: 'Mar 4, 2026', description: 'Improved handwriting recognition accuracy by 25%' },
      { date: 'Feb 20, 2026', description: 'Faster extraction and preview (under 3 seconds)' },
      { date: 'Feb 5, 2026', description: 'Better field mapping for work orders' },
    ],
    reviews: [
      { author: 'James R.', role: 'Technician', rating: 5, comment: 'Saves me 30 minutes every day. No more typing work orders at my desk.', date: 'Feb 28, 2026' },
      { author: 'Linda P.', role: 'Supervisor', rating: 4, comment: 'Works well for printed forms. Handwriting could be better for sloppy notes.', date: 'Feb 12, 2026' },
    ],
  },
  {
    title: 'Asset Health Orchestrator',
    description: 'Health score orchestration for your assets with inspection and meter data.',
    longDescription: 'A comprehensive tool for health score orchestration for your assets. View inspection results, meter readings, and predicted failures all in one place. Prioritize maintenance actions based on asset criticality and condition.',
    likes: 8, downloads: 312, status: 'update',
    color: '#7C3AED', tags: ['Predictive', 'Assets'], rating: 3.9, ratingCount: 8, size: '84.1 MB', creator: 'UpKeep Labs',
    lastUpdated: '3 weeks ago', verified: true, category: 'Inspections & Checklists',
    image: '/images/apps/asset-health.png',
    screenshots: ['/images/apps/asset-health.png', '/images/apps/asset-replacement.png', '/images/apps/hazard-escalation.png'],
    dataEntities: ['Assets', 'Meters', 'Inspections'],
    permissionScope: 'read-only',
    useCases: ['Monitor asset health scores', 'Prioritize maintenance by criticality', 'Detect degradation trends early'],
    howItWorks: ['Connects to your meter and inspection data', 'Calculates health scores automatically', 'Alerts you when action is needed'],
    permissions: ['Read access to meters, inspections, and assets', 'Health data is computed in real time'],
    whatsNew: ['New scoring algorithm with better accuracy', 'Added trend comparison charts'],
    changelog: [
      { date: 'Feb 18, 2026', description: 'New scoring algorithm with 15% better accuracy' },
      { date: 'Feb 2, 2026', description: 'Added trend comparison charts for multi-asset view' },
      { date: 'Jan 15, 2026', description: 'Fixed meter sync delay for high-frequency sensors' },
    ],
    reviews: [
      { author: 'Mike T.', role: 'Reliability Engineer', rating: 4, comment: 'The health scores are surprisingly accurate. Would love more customization.', date: 'Feb 22, 2026' },
    ],
  },
  {
    title: 'Inspection Failure Follow-Up',
    description: 'Automatically create follow-up work orders when inspections fail critical checks.',
    longDescription: 'Automatically create follow-up work orders when inspections fail. Configure thresholds, rules, and assignment logic so nothing falls through the cracks. Reduce response time from hours to seconds.',
    likes: 31, downloads: 1205, status: 'install',
    color: '#E03131', tags: ['Automation', 'Inspections'], rating: 4.6, ratingCount: 31, size: '45.2 MB', creator: 'UpKeep Labs',
    suggestedNote: '12 failed inspections last week',
    lastUpdated: '5 days ago', verified: true, category: 'Work Order Management',
    image: '/images/apps/inspection-followup.png',
    screenshots: ['/images/apps/inspection-followup.png', '/images/apps/inspection-wizard.png', '/images/apps/hazard-escalation.png'],
    dataEntities: ['Inspections', 'Work Orders', 'Assets'],
    permissionScope: 'read-write',
    useCases: ['Auto-create work orders on failed inspections', 'Route follow-ups to the right technician', 'Track resolution time for failed items'],
    howItWorks: ['Set up failure rules and thresholds', 'Connect to your inspection templates', 'Work orders are created and assigned automatically'],
    permissions: ['Read/write access to inspections and work orders', 'Notifications sent via UpKeep'],
    whatsNew: ['Multi-condition rules support', 'Priority escalation based on severity'],
    changelog: [
      { date: 'Mar 6, 2026', description: 'Multi-condition rules: combine AND/OR logic for failure triggers' },
      { date: 'Feb 28, 2026', description: 'Priority escalation based on severity level' },
      { date: 'Feb 15, 2026', description: 'Added bulk rule import from CSV' },
    ],
    reviews: [
      { author: 'Ana G.', role: 'Safety Manager', rating: 5, comment: 'This has been a game changer. Our response time went from hours to minutes.', date: 'Mar 3, 2026' },
      { author: 'Tom H.', role: 'Supervisor', rating: 4, comment: 'Easy to set up. Would love Slack notifications too.', date: 'Feb 20, 2026' },
      { author: 'Rachel W.', role: 'Technician', rating: 5, comment: 'I get my follow-up work orders instantly now. No more waiting for dispatch.', date: 'Feb 10, 2026' },
    ],
  },
  {
    title: 'Work Order Duplicate Detector',
    description: 'Identify and merge duplicate work orders to reduce redundancy and confusion.',
    longDescription: 'Identify and merge duplicate work orders to reduce redundancy and improve team efficiency. Uses smart matching to find similar titles, descriptions, and asset references across your open work orders.',
    likes: 15, downloads: 567, status: 'built',
    color: '#2F9E44', tags: ['Productivity', 'AI'], rating: 4.0, ratingCount: 15, size: '38.9 MB', creator: 'Your Team',
    buildStatus: 'published' as const,
    lastUpdated: '1 month ago', verified: false, category: 'Data Quality & Auditing',
    image: '/images/apps/wo-duplicate.png',
    screenshots: ['/images/apps/wo-duplicate.png', '/images/apps/share-print-urls.png', '/images/apps/bulk-wo-creator.png'],
    dataEntities: ['Work Orders'],
    permissionScope: 'read-write',
    useCases: ['Find duplicate work orders automatically', 'Merge similar requests', 'Reduce technician confusion'],
    howItWorks: ['Scans open work orders for similarities', 'Suggests potential duplicates', 'Merge with one click'],
    permissions: ['Read/write access to work orders', 'No external data sharing'],
    whatsNew: ['Improved matching algorithm', 'Batch merge capability'],
    changelog: [
      { date: 'Feb 11, 2026', description: 'Improved matching algorithm with 30% fewer false positives' },
      { date: 'Jan 25, 2026', description: 'Batch merge capability for bulk cleanup' },
      { date: 'Jan 10, 2026', description: 'Added similarity score display' },
    ],
    reviews: [
      { author: 'Dev Team', role: 'Internal', rating: 4, comment: 'Built this to solve our duplicate WO problem. Works great for our use case.', date: 'Feb 15, 2026' },
    ],
  },
  {
    title: 'Fleet Mileage Tracker',
    description: 'Track vehicle mileage and generate maintenance schedules based on actual usage.',
    longDescription: 'Track vehicle mileage automatically and generate maintenance schedules based on usage patterns. Integrates with telematics data to keep your fleet in top condition without manual logging.',
    likes: 19, downloads: 743, status: 'installed',
    color: '#1971C2', tags: ['Fleet', 'Tracking'], rating: 4.3, ratingCount: 19, size: '67.8 MB', creator: 'Fleet Tools Inc.',
    lastUpdated: '3 days ago', verified: false, category: 'Technician Tools',
    image: '/images/apps/fleet-mileage.png',
    screenshots: ['/images/apps/fleet-mileage.png', '/images/apps/shift-handover.png', '/images/apps/weather-monitor.png'],
    dataEntities: ['Assets', 'Meters', 'Work Orders'],
    permissionScope: 'read-write',
    useCases: ['Auto-log vehicle mileage', 'Trigger PM based on distance', 'Monitor fleet utilization'],
    howItWorks: ['Connect telematics or enter mileage manually', 'Set mileage-based triggers', 'PMs are created automatically'],
    permissions: ['Read access to vehicle assets', 'Write access to meters and work orders'],
    whatsNew: ['GPS integration support', 'Monthly mileage reports'],
    changelog: [
      { date: 'Mar 8, 2026', description: 'GPS integration for automatic mileage capture' },
      { date: 'Feb 22, 2026', description: 'Monthly mileage reports with CSV export' },
      { date: 'Feb 5, 2026', description: 'Support for electric vehicle range tracking' },
    ],
    reviews: [
      { author: 'Derek L.', role: 'Fleet Manager', rating: 5, comment: 'Finally automated our mileage tracking. The GPS integration is flawless.', date: 'Mar 9, 2026' },
      { author: 'Patricia N.', role: 'Supervisor', rating: 4, comment: 'Good for our van fleet. Would love multi-driver support.', date: 'Feb 25, 2026' },
    ],
  },
  {
    title: 'Parts Reorder Automation',
    description: 'Auto-generate purchase orders when parts stock runs low. Never run out of spares.',
    longDescription: 'Set reorder points for parts and automatically generate purchase orders when stock runs low. Never run out of critical spares again. Configure vendor preferences and approval workflows.',
    likes: 27, downloads: 982, status: 'install',
    color: '#E8890C', tags: ['Procurement', 'Automation'], rating: 4.4, ratingCount: 27, size: '52.4 MB', creator: 'UpKeep Labs',
    suggestedNote: '3 parts are below reorder level',
    lastUpdated: '1 week ago', verified: true, category: 'Inventory & Parts',
    image: '/images/apps/parts-reorder.png',
    screenshots: ['/images/apps/parts-reorder.png', '/images/apps/find-a-part.png', '/images/apps/vendor-detail.png'],
    dataEntities: ['Parts', 'Purchase Orders', 'Vendors'],
    permissionScope: 'read-write',
    useCases: ['Set minimum stock levels', 'Auto-generate purchase orders', 'Track spending by vendor'],
    howItWorks: ['Configure reorder points for each part', 'System monitors inventory levels', 'POs are generated and routed for approval'],
    permissions: ['Read/write access to parts and purchase orders', 'Vendor contact data is used for PO routing'],
    whatsNew: ['Multi-vendor comparison', 'Budget threshold alerts'],
    changelog: [
      { date: 'Mar 4, 2026', description: 'Multi-vendor comparison for best pricing' },
      { date: 'Feb 18, 2026', description: 'Budget threshold alerts before PO generation' },
      { date: 'Feb 1, 2026', description: 'Approval workflow with email notifications' },
    ],
    reviews: [
      { author: 'Robert F.', role: 'Inventory Manager', rating: 5, comment: 'We haven\'t had a stockout since installing this. Incredible.', date: 'Mar 2, 2026' },
      { author: 'Nina S.', role: 'Operations Lead', rating: 4, comment: 'Budget alerts are super helpful. Would love more granular vendor scoring.', date: 'Feb 15, 2026' },
    ],
  },
  {
    title: 'Vendor Performance Scorecard',
    description: 'Rate and track vendor performance with pricing, delivery, and quality metrics.',
    longDescription: 'Rate and track vendor performance over time. Compare pricing, delivery speed, and quality metrics. Make data-driven decisions about which vendors to keep, negotiate with, or replace.',
    likes: 11, downloads: 289, status: 'update',
    color: '#9C36B5', tags: ['Procurement', 'Analytics'], rating: 3.7, ratingCount: 11, size: '41.6 MB', creator: 'UpKeep Labs',
    lastUpdated: '2 weeks ago', verified: true, category: 'Dashboards & Reporting',
    image: '/images/apps/vendor-scorecard.png',
    screenshots: ['/images/apps/vendor-scorecard.png', '/images/apps/vendor-detail.png', '/images/apps/time-tracking.png'],
    dataEntities: ['Purchase Orders', 'Vendors'],
    permissionScope: 'read-only',
    useCases: ['Score vendors on delivery and quality', 'Compare vendor pricing trends', 'Share scorecards with procurement teams'],
    howItWorks: ['Import vendor and PO data', 'Scores are calculated automatically', 'Review and export reports'],
    permissions: ['Read access to purchase orders and vendors', 'No data leaves UpKeep'],
    whatsNew: ['New quality scoring metrics', 'PDF export for scorecards'],
    changelog: [
      { date: 'Feb 25, 2026', description: 'New quality scoring metrics based on return rates' },
      { date: 'Feb 10, 2026', description: 'PDF export for scorecards' },
      { date: 'Jan 28, 2026', description: 'Added vendor response time tracking' },
    ],
    reviews: [
      { author: 'Karen B.', role: 'Procurement Manager', rating: 4, comment: 'Useful for vendor negotiations. The data-driven approach really helps.', date: 'Feb 20, 2026' },
    ],
  },
  {
    title: 'Preventive Maintenance Planner',
    description: 'AI-powered scheduling that optimizes PM based on asset condition and usage patterns.',
    longDescription: 'AI-powered scheduling that optimizes preventive maintenance based on asset condition and usage. Reduce unnecessary PMs while ensuring critical assets are always covered. Save time and budget with smarter planning.',
    likes: 42, downloads: 1534, status: 'built',
    color: '#5C7CFA', tags: ['AI', 'Scheduling'], rating: 4.7, ratingCount: 42, size: '78.3 MB', creator: 'Your Team',
    buildStatus: 'in-review' as const,
    lastUpdated: '4 days ago', verified: false, category: 'Work Order Management',
    image: '/images/apps/pm-planner.png',
    screenshots: ['/images/apps/pm-planner.png', '/images/apps/workload-chart.png', '/images/apps/shift-handover.png'],
    dataEntities: ['Assets', 'Meters', 'Work Orders'],
    permissionScope: 'read-only',
    useCases: ['Optimize PM schedules with AI', 'Reduce over-maintenance costs', 'Ensure critical asset coverage'],
    howItWorks: ['Analyzes asset condition and history', 'Suggests optimal PM intervals', 'Adjusts schedules as conditions change'],
    permissions: ['Read access to assets, meters, and work orders', 'AI model runs within UpKeep'],
    whatsNew: ['Multi-site support', 'Improved prediction accuracy by 18%'],
    changelog: [
      { date: 'Mar 7, 2026', description: 'Multi-site support for enterprise accounts' },
      { date: 'Feb 20, 2026', description: 'Improved prediction accuracy by 18%' },
      { date: 'Feb 5, 2026', description: 'Added PM cost estimation per schedule' },
    ],
    reviews: [
      { author: 'Dev Team', role: 'Internal', rating: 5, comment: 'Our best internal app. Reduced unnecessary PMs by 22% in Q1.', date: 'Mar 5, 2026' },
      { author: 'Chris M.', role: 'Reliability Engineer', rating: 5, comment: 'The AI suggestions are spot-on. We trust it for all our critical assets now.', date: 'Feb 28, 2026' },
    ],
  },
  {
    title: 'Hazard Escalation Tracker',
    description: 'Track safety hazards with rule-based escalation, verification tasks, and status monitoring.',
    longDescription: 'Automatically match work orders to hazard rules and escalate based on severity. Track open, overdue, and resolved hazards with a filterable overview. Each record shows matched rules, priority, and verification tasks to ensure nothing gets missed.',
    likes: 34, downloads: 1102, status: 'install',
    color: '#E03131', tags: ['Safety', 'Compliance'], rating: 4.5, ratingCount: 34, size: '51.8 MB', creator: 'UpKeep Labs',
    suggestedNote: '5 overdue hazard follow-ups',
    lastUpdated: '3 days ago', verified: true, category: 'Safety & Compliance',
    image: '/images/apps/hazard-escalation.png',
    screenshots: ['/images/apps/hazard-escalation.png', '/images/apps/inspection-wizard.png', '/images/apps/inspection-followup.png'],
    dataEntities: ['Work Orders', 'Assets', 'Locations'],
    permissionScope: 'read-write',
    useCases: ['Track and escalate safety hazards automatically', 'Verify resolution with task checklists', 'Monitor overdue hazards across sites'],
    howItWorks: ['Define hazard rules with conditions', 'System matches work orders to rules', 'Escalation triggers when thresholds are met'],
    permissions: ['Read/write access to work orders and locations', 'Notifications for escalated hazards'],
    whatsNew: ['Multi-rule matching per WO', 'Verification task checklists'],
    changelog: [
      { date: 'Mar 8, 2026', description: 'Added multi-rule matching per work order' },
      { date: 'Feb 25, 2026', description: 'Verification task checklists for hazard resolution' },
      { date: 'Feb 10, 2026', description: 'Overdue hazard alerts via email' },
    ],
    reviews: [
      { author: 'Ana G.', role: 'Safety Manager', rating: 5, comment: 'Essential for our OSHA compliance. Escalation rules save us hours weekly.', date: 'Mar 5, 2026' },
    ],
  },
  {
    title: 'Shift Handover',
    description: 'Track issues, safety notes & follow-ups between shifts with structured handovers.',
    longDescription: 'Ensure nothing falls through the cracks at shift changes. Create structured handover records with safety alerts, unresolved issues, and follow-up actions. Filter by shift, plant, and status for full visibility.',
    likes: 22, downloads: 678, status: 'install',
    color: '#3A5BC7', tags: ['Operations', 'Safety'], rating: 4.2, ratingCount: 22, size: '34.5 MB', creator: 'UpKeep Labs',
    suggestedNote: 'Your team runs 3 shifts daily',
    lastUpdated: '1 week ago', verified: true, category: 'Technician Tools',
    image: '/images/apps/shift-handover.png',
    screenshots: ['/images/apps/shift-handover.png', '/images/apps/wo-grab.png', '/images/apps/workload-chart.png'],
    dataEntities: ['Work Orders', 'Locations', 'People'],
    permissionScope: 'read-write',
    useCases: ['Create shift handover records', 'Track unresolved issues across shifts', 'Log safety alerts per plant'],
    howItWorks: ['Click New Handover at shift end', 'Log issues, notes, and safety alerts', 'Next shift reviews before starting'],
    permissions: ['Read/write access to handover records', 'Read access to work orders and locations'],
    whatsNew: ['Safety alert integration', 'Unresolved issue counter'],
    changelog: [
      { date: 'Mar 4, 2026', description: 'Safety alert integration with KPI cards' },
      { date: 'Feb 18, 2026', description: 'Filter by shift type and plant' },
      { date: 'Feb 2, 2026', description: 'Initial release with handover creation' },
    ],
    reviews: [
      { author: 'Mark O.', role: 'Shift Lead', rating: 4, comment: 'Finally a proper handover tool. No more sticky notes on the desk.', date: 'Mar 2, 2026' },
    ],
  },
  {
    title: 'Inspection Wizard',
    description: 'Guided multi-step inspection flow with pass/flag/fail for each checklist item.',
    longDescription: 'Walk technicians through inspections step by step: setup, inspect, and review. Each checklist item can be marked pass, flag, or fail. The summary screen shows results at a glance with priority escalation for urgent findings.',
    likes: 38, downloads: 1340, status: 'installed',
    color: '#2F9E44', tags: ['Inspections', 'Mobile'], rating: 4.6, ratingCount: 38, size: '42.1 MB', creator: 'UpKeep Labs',
    lastUpdated: '5 days ago', verified: true, category: 'Inspections & Checklists',
    image: '/images/apps/inspection-wizard.png',
    screenshots: ['/images/apps/inspection-wizard.png', '/images/apps/inspection-followup.png', '/images/apps/hazard-escalation.png'],
    dataEntities: ['Inspections', 'Assets', 'Locations'],
    permissionScope: 'read-write',
    useCases: ['Run guided inspections on mobile', 'Mark items pass/flag/fail', 'Review and submit with summary'],
    howItWorks: ['Select checklist type and location', 'Inspect each item step by step', 'Review summary and submit'],
    permissions: ['Read/write access to inspections', 'Read access to assets and locations'],
    whatsNew: ['Priority escalation on fail items', 'Notes field per inspection'],
    changelog: [
      { date: 'Mar 6, 2026', description: 'Priority escalation for failed items' },
      { date: 'Feb 20, 2026', description: 'Added notes field per inspection record' },
      { date: 'Feb 5, 2026', description: 'Multi-step wizard with progress indicator' },
    ],
    reviews: [
      { author: 'James R.', role: 'Technician', rating: 5, comment: 'The step-by-step flow makes inspections so much faster on mobile.', date: 'Mar 3, 2026' },
      { author: 'Linda P.', role: 'Supervisor', rating: 4, comment: 'Great summary view. Wish I could add photos to each item.', date: 'Feb 22, 2026' },
    ],
  },
  {
    title: 'Bulk Work Order Creator',
    description: 'Create work orders for multiple assets at once with shared details and filters.',
    longDescription: 'Fill in work order details once, then select multiple assets to create individual WOs for each. Filter assets by location, search by name, and review results before submitting. Perfect for quarterly inspections and PM rollouts.',
    likes: 29, downloads: 945, status: 'install',
    color: '#3E63DD', tags: ['Productivity', 'Work Orders'], rating: 4.3, ratingCount: 29, size: '28.7 MB', creator: 'UpKeep Labs',
    suggestedNote: 'Quarterly PM rollout coming up',
    lastUpdated: '4 days ago', verified: true, category: 'Work Order Management',
    image: '/images/apps/bulk-wo-creator.png',
    screenshots: ['/images/apps/bulk-wo-creator.png', '/images/apps/share-print-urls.png', '/images/apps/wo-grab.png'],
    dataEntities: ['Work Orders', 'Assets', 'Locations'],
    permissionScope: 'read-write',
    useCases: ['Create WOs for multiple assets at once', 'Run quarterly PM across all equipment', 'Batch-assign inspections by location'],
    howItWorks: ['Enter shared WO details (title, description, priority)', 'Select assets from filtered list', 'Review and create all WOs in one click'],
    permissions: ['Read/write access to work orders', 'Read access to assets and locations'],
    whatsNew: ['Location-based asset filtering', 'Results summary after creation'],
    changelog: [
      { date: 'Mar 7, 2026', description: 'Location-based asset filtering in step 2' },
      { date: 'Feb 22, 2026', description: 'Results summary with creation status per asset' },
      { date: 'Feb 8, 2026', description: 'Initial release with two-step wizard' },
    ],
    reviews: [
      { author: 'Carlos M.', role: 'Maintenance Manager', rating: 5, comment: 'Used to take 2 hours to create quarterly PMs. Now takes 5 minutes.', date: 'Mar 4, 2026' },
    ],
  },
  {
    title: 'Warranty Tracker',
    description: 'Track warranty status for every asset and create service WOs before expiration.',
    longDescription: 'See warranty status at a glance for all your assets: active, expired, or no warranty. View serial numbers, models, and expiration dates. Create warranty service work orders directly from each asset card before coverage runs out.',
    likes: 16, downloads: 521, status: 'install',
    color: '#E8890C', tags: ['Assets', 'Procurement'], rating: 4.1, ratingCount: 16, size: '31.2 MB', creator: 'UpKeep Labs',
    suggestedNote: '8 assets with expiring warranties',
    lastUpdated: '1 week ago', verified: true, category: 'Inventory & Parts',
    image: '/images/apps/warranty-tracker.png',
    screenshots: ['/images/apps/warranty-tracker.png', '/images/apps/asset-replacement.png', '/images/apps/location-reference.png'],
    dataEntities: ['Assets', 'Work Orders', 'Vendors'],
    permissionScope: 'read-write',
    useCases: ['Track warranty expiration dates', 'Create service WOs before warranty ends', 'View warranty status across all assets'],
    howItWorks: ['Import asset warranty data', 'Dashboard shows status per asset', 'One-click WO creation for expiring warranties'],
    permissions: ['Read access to assets and vendors', 'Write access to work orders'],
    whatsNew: ['Expired warranty alerts', 'Bulk warranty import from CSV'],
    changelog: [
      { date: 'Mar 4, 2026', description: 'Expired warranty alerts via email' },
      { date: 'Feb 18, 2026', description: 'Bulk warranty import from CSV' },
      { date: 'Feb 3, 2026', description: 'One-click WO creation from asset card' },
    ],
    reviews: [
      { author: 'Nina S.', role: 'Operations Lead', rating: 4, comment: 'Saved us thousands by catching warranties before they expired.', date: 'Feb 28, 2026' },
    ],
  },
  {
    title: 'Unit Converter',
    description: 'Quick unit conversions for pressure, torque, weight, and more — built for technicians.',
    longDescription: 'A simple, fast utility for converting between common maintenance units: PSI to bar, ft-lb to N-m, lb to kg, and more. Keeps a history of recent conversions for quick reference. Perfect for field technicians working with international specs.',
    likes: 45, downloads: 1820, status: 'installed',
    color: '#3A5BC7', tags: ['Utility', 'Technician'], rating: 4.8, ratingCount: 45, size: '8.2 MB', creator: 'UpKeep Labs',
    lastUpdated: '2 weeks ago', verified: true, category: 'Technician Tools',
    image: '/images/apps/unit-converter.png',
    screenshots: ['/images/apps/unit-converter.png', '/images/apps/find-a-part.png', '/images/apps/weather-monitor.png'],
    dataEntities: [],
    permissionScope: 'read-only',
    useCases: ['Convert pressure, torque, weight, and temperature', 'Reference recent conversions', 'Work with international equipment specs'],
    howItWorks: ['Select units (from → to)', 'Enter value', 'Get instant result with history'],
    permissions: ['No data access required', 'Runs entirely on-device'],
    whatsNew: ['Added temperature conversions', 'Recent conversion history'],
    changelog: [
      { date: 'Feb 25, 2026', description: 'Added temperature conversions (°F ↔ °C)' },
      { date: 'Feb 10, 2026', description: 'Recent conversion history with clear button' },
      { date: 'Jan 28, 2026', description: 'Initial release with pressure, torque, weight' },
    ],
    reviews: [
      { author: 'James R.', role: 'Technician', rating: 5, comment: 'Use this daily. So much faster than Googling conversions.', date: 'Mar 1, 2026' },
      { author: 'Derek L.', role: 'Fleet Manager', rating: 5, comment: 'Simple and effective. The recent history is a great touch.', date: 'Feb 20, 2026' },
    ],
  },
]

/* ── Role-based recommendations ── */
const roleRecommendations: Record<Role, string[]> = {
  technician: ['Paper Work Order Scan', 'Inspection Wizard', 'Unit Converter', 'Shift Handover'],
  supervisor: ['Impact Dashboard', 'Hazard Escalation Tracker', 'Bulk Work Order Creator', 'Inspection Failure Follow-Up'],
  manager: ['Vendor Performance Scorecard', 'Parts Reorder Automation', 'Preventive Maintenance Planner', 'Warranty Tracker'],
}

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-[#E0E1E6] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-[var(--space-md)] pt-[var(--space-md)] pb-[var(--space-xs)]">
        <div className="flex items-center gap-[var(--space-xs)]">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-5 w-5 rounded-full" />
      </div>
      <div className="px-[var(--space-md)]">
        <div className="skeleton h-[180px] rounded-[var(--radius-lg)]" />
      </div>
      <div className="flex flex-col px-[var(--space-md)] py-[var(--space-md)] gap-[var(--space-sm)]">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-9 w-full mt-[var(--space-xs)] rounded-full" />
      </div>
    </div>
  )
}

export default function BrowseAppsPage() {
  const { role } = useDashboardContext()
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AppDetail | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleTabChange = useCallback((label: string) => {
    if (label === activeTab) return
    setActiveTab(label)
    setLoading(true)
  }, [activeTab])

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [loading])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const recommendedTitles = roleRecommendations[role] || []
  const recommendedApps = apps.filter((a) => recommendedTitles.includes(a.title))
  const uninstalledPopularCount = apps.filter((a) => a.status === 'install' && recommendedTitles.includes(a.title)).length

  const filteredSuggestions = searchQuery.length > 0
    ? popularSearches.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : popularSearches

  const activeTabData = tabs.find((t) => t.label === activeTab)

  return (
    <main className="flex-1 relative">
      {/* Role recommendation banner */}
      {!bannerDismissed && uninstalledPopularCount > 0 && (
        <div className="absolute top-[278px] left-[1px] right-8 z-20 flex justify-center bg-transparent w-full">
          <div className="flex items-center justify-between w-full max-w-[900px] px-[var(--space-xl)] py-1.5 bg-[#CFCCFF] rounded-[20px] shadow-[-16px_16px_44px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-2">
              <span className="text-[length:var(--font-size-body-2)] font-medium">
                You have <strong className="text-[color:var(--color-accent-9)]">{uninstalledPopularCount}</strong> uninstalled app{uninstalledPopularCount > 1 ? 's' : ''} popular with {roleLabels[role]}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setBannerDismissed(true) }}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-[color:var(--color-accent-3)] cursor-pointer transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <div
        className="relative flex flex-col justify-center items-center overflow-hidden"
        style={{ background: '#F2F6FF', height: 332, gap: 32, isolation: 'isolate' }}
      >
        {/* Decorative blur ellipses */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 349, height: 332, left: 1, top: -27,
            background: 'linear-gradient(144.85deg, rgba(255,168,235,0.23) 24.86%, rgba(176,57,255,0.23) 47.92%, rgba(0,47,255,0.23) 72.03%)',
            filter: 'blur(167px)', transform: 'rotate(57.04deg)', zIndex: 0,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1245, height: 785, left: 537, top: 117,
            background: 'linear-gradient(144.85deg, rgba(255,216,246,0.11) 22.39%, rgba(187,0,255,0.11) 47.58%, rgba(0,47,255,0.11) 72.03%)',
            filter: 'blur(167px)', zIndex: 1,
          }}
        />

        {/* Heading */}
        <div className="relative flex flex-col items-center text-center gap-2" style={{ zIndex: 2 }}>
          <h1 className="font-extrabold text-[#1C2024]" style={{ fontSize: 40, lineHeight: '52px' }}>
            Turn Ideas into Apps in Minutes
          </h1>
          <p className="font-semibold text-[#1C2024]" style={{ fontSize: 16, lineHeight: '24px' }}>
            Describe what you need in plain language →{' '}
            <span>Studio does the rest</span>
          </p>
        </div>

        {/* 3-step process */}
        <div className="relative flex items-center justify-center gap-[15px]" style={{ zIndex: 3 }}>
          {[
            { icon: <MessageSquare size={18} color="#3A5BC7" strokeWidth={1.2} />, label: 'Prompting', hasArrow: true },
            { icon: <Loader size={18} color="#3A5BC7" strokeWidth={1.2} />, label: 'Building', hasArrow: true },
            { icon: <RefreshCw size={18} color="#3A5BC7" strokeWidth={1.2} />, label: 'Reiterating', hasArrow: false },
          ].map((step) => (
            <div key={step.label} className="relative" style={{ width: 178, height: 64 }}>
              <div className="absolute bg-white rounded-[20px]" style={{ width: 161, height: 64, left: 0, top: 0, border: '1px solid #ABBDF9' }} />
              {step.hasArrow && (
                <>
                  <div className="absolute bg-white" style={{ width: 16, height: 16, left: 150, top: 23.5, border: '1px solid #ABBDF9', transform: 'rotate(45deg)' }} />
                  <div className="absolute bg-white" style={{ width: 12, height: 28, left: 146, top: 18, zIndex: 1, borderRadius: 2 }} />
                </>
              )}
              <div className="absolute flex items-center justify-center rounded-[16px]" style={{ width: 46, height: 46, background: '#F0F4FF', left: 14, top: 9, zIndex: 2 }}>
                {step.icon}
              </div>
              <span className="absolute text-black" style={{ fontSize: 12, lineHeight: '16px', left: 70, top: 24, zIndex: 2 }}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="sticky top-[53px] z-10 flex items-center gap-[var(--space-md)] px-[var(--space-2xl)] py-[var(--space-md)] border-b border-[#E0E1E6] bg-white">
        {/* Search with autocomplete */}
        <div ref={searchRef} className="relative flex-1 max-w-[480px]">
          <div className="flex items-center gap-[var(--space-xs)] px-3 py-2 border border-[#E0E1E6] rounded-[var(--radius-lg)] bg-white">
            <Search size={16} className="text-[color:var(--color-neutral-8)]" />
            <input
              type="text"
              placeholder="Search by name, use case, or category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="flex-1 text-[length:var(--font-size-body-2)] outline-none bg-transparent placeholder:text-[color:var(--color-neutral-7)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="cursor-pointer">
                <X size={14} className="text-[var(--color-neutral-7)]" />
              </button>
            )}
          </div>
          {/* Autocomplete dropdown */}
          {searchFocused && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E1E6] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-20 overflow-hidden dropdown-animate">
              <div className="px-3 py-2 text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-7)] uppercase tracking-wide">
                {searchQuery ? 'Suggestions' : 'Popular searches'}
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setSearchQuery(suggestion); setSearchFocused(false) }}
                  className="flex items-center gap-[var(--space-sm)] w-full px-3 py-2 text-left text-[length:var(--font-size-body-2)] text-[#1C2024] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
                >
                  <Search size={13} className="text-[var(--color-neutral-7)]" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <button
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="flex items-center gap-1 px-3 py-2 border border-[#E0E1E6] rounded-[var(--radius-lg)] text-[length:var(--font-size-body-2)] text-[#1C2024] bg-white cursor-pointer hover:bg-[var(--color-neutral-3)] transition-colors"
          >
            {selectedCategory} <ChevronDown size={14} />
          </button>
          {categoryOpen && (
            <>
              <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setCategoryOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-[220px] bg-white border border-[#E0E1E6] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[var(--z-modal)] py-1 dropdown-animate max-h-[320px] overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCategoryOpen(false) }}
                    className={`flex items-center w-full px-3 py-2 text-left text-[length:var(--font-size-body-2)] cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium'
                        : 'text-[#1C2024] hover:bg-[var(--color-neutral-3)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />
        <span className="text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)]">Created By: All</span>
        <ChevronDown size={14} className="text-[color:var(--color-neutral-8)]" />
        <span className="text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)]">Sort By: Top Installed</span>
        <ArrowUpDown size={14} className="text-[color:var(--color-neutral-8)]" />
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-[var(--space-xs)] px-[var(--space-2xl)] pt-[var(--space-2xl)] pb-[var(--space-md)]">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.label)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.label
                ? 'bg-[color:var(--color-accent-9)] text-white'
                : 'bg-white border border-[#E0E1E6] text-[#1C2024] hover:bg-[#F0F0F3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="px-[var(--space-2xl)] pt-[var(--space-md)] pb-[var(--space-sm)]">
        {loading ? (
          <>
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-72 mt-2" />
          </>
        ) : (
          <div key={activeTab} className="fade-animate">
            <h2 className="text-[20px] font-bold text-[#1C2024]">{activeTab}</h2>
            <p className="text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)] mt-1">
              {activeTabData?.subtitle || 'Browse the full app library'}
            </p>
          </div>
        )}
      </div>

      {/* App grid */}
      <div className="grid grid-cols-3 gap-[var(--space-xl)] px-[var(--space-2xl)] pb-[var(--space-2xl)]">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : apps.map((app, i) => (
              <div
                key={`${activeTab}-${app.title}`}
                className="card-animate"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <AppCard {...app} onClick={() => { setSelectedApp(app); setModalOpen(true) }} />
              </div>
            ))
        }
      </div>

      {/* Bottom CTA */}
      <div className="mx-[var(--space-2xl)] mb-[var(--space-2xl)] rounded-[var(--radius-xl)] px-[var(--space-2xl)] py-[var(--space-3xl)] text-center"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F7EF5 50%, #7C3AED 100%)' }}
      >
        <h2 className="text-[length:var(--font-size-title-2)] font-bold text-white">
          Ready to build your own app?
        </h2>
        <p className="text-[length:var(--font-size-body-1)] text-white/80 mt-[var(--space-xs)]">
          Describe what you need in plain language. Build in minutes.
        </p>
        <div className="mt-[var(--space-lg)]">
          <Button variant="secondary" size="lg" className="bg-white text-[#1C2024] border-none hover:bg-white/90">
            Create Your Own App
          </Button>
        </div>
      </div>

      <AppDetailModal
        app={selectedApp}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </main>
  )
}
