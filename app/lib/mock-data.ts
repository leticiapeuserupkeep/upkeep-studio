import type {
  WorkOrder, Asset, Part, Technician, ActivityEvent, StudioApp,
  BudgetLine, ComplianceItem, WeatherDay, SensorReading, ShiftHandoff,
  Site,
} from './models'

export const workOrders: WorkOrder[] = [
  { id: 'WO-2041', title: 'HVAC compressor failure — Building A', assetName: 'HVAC Unit #12', siteName: 'Main Campus', status: 'open', urgency: 'critical', dueDate: '2026-02-24', priorityScore: 97, priorityReason: 'Overdue + critical asset + tenant complaint', category: 'work_order' },
  { id: 'WO-2038', title: 'Conveyor belt misalignment — Line 3', assetName: 'Conveyor #3', siteName: 'Plant North', status: 'in_progress', urgency: 'high', dueDate: '2026-02-25', assigneeId: 'tech-1', priorityScore: 88, priorityReason: 'Production line impact + recurring issue', category: 'work_order' },
  { id: 'WO-2035', title: 'Elevator annual inspection overdue', assetName: 'Elevator #2', siteName: 'Main Campus', status: 'open', urgency: 'critical', dueDate: '2026-02-22', priorityScore: 95, priorityReason: 'Compliance deadline passed + safety risk', category: 'compliance' },
  { id: 'WO-2044', title: 'Pump vibration anomaly detected', assetName: 'Pump P-401', siteName: 'Plant South', status: 'open', urgency: 'high', dueDate: '2026-02-26', priorityScore: 82, priorityReason: 'Sensor anomaly + bearing failure pattern match', category: 'anomaly' },
  { id: 'WO-2039', title: 'Generator oil change PM due', assetName: 'Generator #1', siteName: 'Warehouse East', status: 'open', urgency: 'medium', dueDate: '2026-02-28', priorityScore: 65, priorityReason: 'Scheduled PM within window', category: 'work_order' },
  { id: 'WO-2042', title: 'Fire suppression system test', assetName: 'Sprinkler Zone B', siteName: 'Main Campus', status: 'open', urgency: 'high', dueDate: '2026-02-26', priorityScore: 85, priorityReason: 'Regulatory deadline approaching', category: 'compliance' },
  { id: 'WO-2046', title: 'Cooling tower fan bearing replacement', assetName: 'Cooling Tower #2', siteName: 'Plant North', status: 'open', urgency: 'medium', dueDate: '2026-03-01', priorityScore: 58, priorityReason: 'Predictive maintenance based on vibration trend', category: 'asset_risk' },
  { id: 'WO-2048', title: 'Roof leak repair — Section D', assetName: 'Building D Roof', siteName: 'Warehouse East', status: 'on_hold', urgency: 'low', dueDate: '2026-03-05', priorityScore: 35, priorityReason: 'Weather dependent — rain forecasted', category: 'work_order' },
]

export const assets: Asset[] = [
  { id: 'A-101', name: 'HVAC Unit #12', siteName: 'Main Campus', category: 'HVAC', healthScore: 23, failureProbability: 0.87, failureDrivers: ['3 breakdowns in 90 days', 'Compressor age > 15 years', 'Abnormal power draw'], recommendedAction: 'Schedule replacement evaluation', lastInspection: '2026-01-15' },
  { id: 'A-205', name: 'Pump P-401', siteName: 'Plant South', category: 'Pumps', healthScore: 45, failureProbability: 0.62, failureDrivers: ['Vibration trend increasing', 'Bearing wear pattern', 'Similar pump failed last month'], recommendedAction: 'Order replacement bearings, schedule PM', lastInspection: '2026-02-10' },
  { id: 'A-302', name: 'Conveyor #3', siteName: 'Plant North', category: 'Production', healthScore: 58, failureProbability: 0.41, failureDrivers: ['Belt tension declining', 'Motor current fluctuation'], recommendedAction: 'Adjust tension, monitor motor', lastInspection: '2026-02-18' },
  { id: 'A-410', name: 'Cooling Tower #2', siteName: 'Plant North', category: 'HVAC', healthScore: 52, failureProbability: 0.38, failureDrivers: ['Fan vibration increase', 'Chemical treatment overdue'], recommendedAction: 'Schedule bearing replacement', lastInspection: '2026-02-05' },
]

export const parts: Part[] = [
  { id: 'P-001', name: 'HVAC Compressor Coil', onHand: 2, minRequired: 3, consumptionRate: 1.2, predictedStockout: '2026-03-08', riskLevel: 'high', vendors: [{ name: 'CoolParts Inc', lastPrice: 1240, lastDate: '2026-01-20' }, { name: 'HVAC Direct', lastPrice: 1310, lastDate: '2026-02-01' }] },
  { id: 'P-002', name: 'Bearing Kit SKF-6205', onHand: 8, minRequired: 10, consumptionRate: 2.5, predictedStockout: '2026-03-02', riskLevel: 'critical', vendors: [{ name: 'BearingWorld', lastPrice: 45, lastDate: '2026-02-10' }, { name: 'Industrial Supply Co', lastPrice: 52, lastDate: '2026-01-28' }] },
  { id: 'P-003', name: 'Conveyor Belt Section 12ft', onHand: 4, minRequired: 2, consumptionRate: 0.3, predictedStockout: '2026-05-15', riskLevel: 'low', vendors: [{ name: 'BeltMaster', lastPrice: 890, lastDate: '2026-01-05' }] },
  { id: 'P-004', name: 'Air Filter 20x25x4 MERV-13', onHand: 12, minRequired: 15, consumptionRate: 4, predictedStockout: '2026-03-05', riskLevel: 'medium', vendors: [{ name: 'FilterPro', lastPrice: 28, lastDate: '2026-02-12' }, { name: 'CleanAir Supply', lastPrice: 31, lastDate: '2026-01-30' }, { name: 'HVAC Direct', lastPrice: 26, lastDate: '2026-02-08' }] },
  { id: 'P-005', name: 'Hydraulic Seal Kit', onHand: 6, minRequired: 5, consumptionRate: 0.8, predictedStockout: '2026-04-20', riskLevel: 'low', vendors: [{ name: 'HydraSupply', lastPrice: 120, lastDate: '2026-02-05' }] },
]

export const technicians: Technician[] = [
  { id: 'tech-1', name: 'Marcus Johnson', status: 'busy', activeWOs: 3, completedToday: 2, distanceToNextWO: 0.3, siteId: 'main-campus' },
  { id: 'tech-2', name: 'Sarah Chen', status: 'available', activeWOs: 1, completedToday: 4, distanceToNextWO: 1.2, siteId: 'main-campus' },
  { id: 'tech-3', name: 'James Rodriguez', status: 'overloaded', activeWOs: 6, completedToday: 1, distanceToNextWO: 2.5, siteId: 'plant-north' },
  { id: 'tech-4', name: 'Aisha Patel', status: 'busy', activeWOs: 2, completedToday: 3, distanceToNextWO: 0.8, siteId: 'plant-south' },
  { id: 'tech-5', name: 'David Kim', status: 'available', activeWOs: 0, completedToday: 5, distanceToNextWO: 1.5, siteId: 'warehouse-east' },
  { id: 'tech-6', name: 'Elena Vasquez', status: 'off_shift', activeWOs: 0, completedToday: 3, distanceToNextWO: 0, siteId: 'main-campus' },
]

export const activityFeed: ActivityEvent[] = [
  { id: 'evt-1', technicianName: 'Sarah Chen', action: 'completed', target: 'WO-2033 Boiler valve replacement', timestamp: '12 min ago' },
  { id: 'evt-2', technicianName: 'Marcus Johnson', action: 'added note to', target: 'WO-2038 Conveyor belt misalignment', timestamp: '25 min ago' },
  { id: 'evt-3', technicianName: 'Aisha Patel', action: 'used 2x Bearing Kit on', target: 'WO-2040 Pump shaft repair', timestamp: '43 min ago' },
  { id: 'evt-4', technicianName: 'David Kim', action: 'flagged anomaly on', target: 'Sensor CH-4 Temperature spike', timestamp: '1h ago' },
  { id: 'evt-5', technicianName: 'James Rodriguez', action: 'completed', target: 'WO-2036 Electrical panel inspection', timestamp: '1h 20min ago' },
  { id: 'evt-6', technicianName: 'Sarah Chen', action: 'completed', target: 'WO-2034 Fire extinguisher check', timestamp: '2h ago' },
]

export const studioApps: StudioApp[] = [
  { id: 'app-1', name: 'Impact Dashboard', category: 'Analytics', description: 'Health score orchestration for your assets', installed: true, recommended: false, lastUsed: '2h ago' },
  { id: 'app-2', name: 'Paper WO Scanner', category: 'Productivity', description: 'Digitize paper work orders with AI', installed: true, recommended: false, lastUsed: '1d ago' },
  { id: 'app-3', name: 'Predictive Alerts', category: 'Intelligence', description: 'ML-based failure prediction engine', installed: false, recommended: true },
  { id: 'app-4', name: 'Vendor Scorecard', category: 'Procurement', description: 'Track and compare vendor performance', installed: false, recommended: true },
  { id: 'app-5', name: 'Shift Planner Pro', category: 'Scheduling', description: 'AI-optimized shift scheduling', installed: false, recommended: true },
]

export const budgetLines: BudgetLine[] = [
  { id: 'BL-1', category: 'HVAC', siteName: 'Main Campus', budget: 85000, spent: 72400, alertReason: 'Emergency repairs drove 18% overspend in compressor parts' },
  { id: 'BL-2', category: 'Production', siteName: 'Plant North', budget: 120000, spent: 78000 },
  { id: 'BL-3', category: 'Electrical', siteName: 'Main Campus', budget: 45000, spent: 41200, alertReason: 'Overtime hours from after-hours call-outs' },
  { id: 'BL-4', category: 'Plumbing', siteName: 'Warehouse East', budget: 30000, spent: 12000 },
  { id: 'BL-5', category: 'General', siteName: 'Plant South', budget: 60000, spent: 52800, alertReason: 'Parts cost spike — bearing supplier price increase' },
]

export const complianceItems: ComplianceItem[] = [
  { id: 'CI-1', title: 'Elevator #2 Annual Inspection', assetName: 'Elevator #2', dueDate: '2026-02-22', daysLeft: -2, urgency: 'critical', type: 'inspection' },
  { id: 'CI-2', title: 'Fire Suppression System Test', assetName: 'Sprinkler Zone B', dueDate: '2026-02-26', daysLeft: 2, urgency: 'high', type: 'inspection' },
  { id: 'CI-3', title: 'Boiler Certification Renewal', assetName: 'Boiler #3', dueDate: '2026-03-05', daysLeft: 9, urgency: 'medium', type: 'certification' },
  { id: 'CI-4', title: 'Generator PM Schedule', assetName: 'Generator #1', dueDate: '2026-02-28', daysLeft: 4, urgency: 'medium', type: 'pm' },
  { id: 'CI-5', title: 'Crane Load Test', assetName: 'Overhead Crane #1', dueDate: '2026-03-15', daysLeft: 19, urgency: 'low', type: 'certification' },
]

export const weatherForecast: WeatherDay[] = [
  { date: '2026-02-24', condition: 'cloudy', tempHigh: 58, tempLow: 42, windMph: 12, affectedAssets: [] },
  { date: '2026-02-25', condition: 'rain', tempHigh: 52, tempLow: 39, windMph: 18, affectedAssets: ['Building D Roof', 'Cooling Tower #2'], rescheduleReason: 'Heavy rain expected — outdoor work unsafe' },
  { date: '2026-02-26', condition: 'storm', tempHigh: 48, tempLow: 35, windMph: 35, affectedAssets: ['Building D Roof', 'Cooling Tower #2', 'Solar Array'], rescheduleReason: 'Storm warning — all outdoor and elevated work suspended' },
  { date: '2026-02-27', condition: 'cloudy', tempHigh: 55, tempLow: 40, windMph: 10, affectedAssets: [] },
  { date: '2026-02-28', condition: 'sunny', tempHigh: 62, tempLow: 44, windMph: 5, affectedAssets: [] },
]

export const sensorReadings: SensorReading[] = [
  { assetId: 'A-205', assetName: 'Pump P-401', metric: 'Vibration', currentValue: 12.4, baseline: { min: 2, max: 8 }, unit: 'mm/s', history: [3.1, 3.4, 4.2, 5.1, 6.8, 7.2, 8.1, 9.5, 10.8, 12.4], anomaly: true, interpretation: 'Vibration 55% above baseline max. Trend accelerating — consistent with bearing degradation pattern.' },
  { assetId: 'A-101', assetName: 'HVAC Unit #12', metric: 'Power Draw', currentValue: 42, baseline: { min: 28, max: 35 }, unit: 'kW', history: [30, 31, 32, 33, 35, 36, 38, 39, 41, 42], anomaly: true, interpretation: 'Power consumption 20% above normal range. Compressor working harder — likely refrigerant leak or coil blockage.' },
  { assetId: 'A-302', assetName: 'Conveyor #3', metric: 'Motor Temp', currentValue: 78, baseline: { min: 55, max: 85 }, unit: '°C', history: [62, 64, 68, 71, 73, 75, 76, 77, 78, 78], anomaly: false, interpretation: 'Temperature within range but trending upward. Monitor closely.' },
  { assetId: 'A-410', assetName: 'Cooling Tower #2', metric: 'Flow Rate', currentValue: 145, baseline: { min: 160, max: 200 }, unit: 'GPM', history: [195, 190, 185, 178, 170, 165, 158, 152, 148, 145], anomaly: true, interpretation: 'Flow rate 9% below minimum baseline. Declining trend suggests scaling or blockage in distribution nozzles.' },
]

export const shiftHandoff: ShiftHandoff = {
  generatedAt: '2026-02-24T14:00:00Z',
  completed: [
    'WO-2033 Boiler valve replacement (Sarah Chen)',
    'WO-2036 Electrical panel inspection (James Rodriguez)',
    'WO-2034 Fire extinguisher check (Sarah Chen)',
    'WO-2037 Parking lot light repair (David Kim)',
  ],
  escalated: [
    'WO-2041 HVAC compressor failure — requires specialist and part not in stock',
  ],
  unfinished: [
    'WO-2038 Conveyor belt misalignment — belt tension adjusted, awaiting monitoring period',
    'WO-2044 Pump vibration anomaly — bearing kit ordered, scheduled for tomorrow AM',
  ],
  notes: [
    'Elevator #2 inspection is 2 days overdue — inspector availability confirmed for Feb 26',
    'Storm warning Feb 26 — all outdoor WOs should be rescheduled',
    'James Rodriguez is overloaded — redistribute 2 WOs to Sarah or David',
  ],
}

export const siteObjects: Site[] = [
  { id: 'main-campus',    name: 'Main Campus',    region: 'East' },
  { id: 'plant-north',    name: 'Plant North',    region: 'East' },
  { id: 'plant-south',    name: 'Plant South',    region: 'West' },
  { id: 'warehouse-east', name: 'Warehouse East', region: 'East' },
]

export const sites = ['All Sites', ...siteObjects.map((s) => s.name)]
