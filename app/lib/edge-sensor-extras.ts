import type { RuntimeSensor, TelemetryReading, TelemetryReadingVariant } from './models'

export type EdgeSensorExtra = Pick<
  RuntimeSensor,
  'telemetryReadings' | 'signalStrength' | 'batteryPercent' | 'assetTags'
>

/** Dense demo set for scroll / snap UX (42 points = 7 snap pages at 6 per page). */
function airCompExtendedReadings(): TelemetryReading[] {
  const base: TelemetryReading[] = [
    { id: 'a', label: 'Current L1', value: '148 A', variant: 'success' },
    { id: 'b', label: 'Current L2', value: '151 A', variant: 'success' },
    { id: 'c', label: 'Voltage', value: '480 V', variant: 'success' },
    { id: 'd', label: 'Power factor', value: '0.94', variant: 'warning' },
    { id: 'e', label: 'Tank pressure', value: '112 PSI', variant: 'warning' },
    { id: 'f', label: 'Discharge temp', value: '198 °F', variant: 'success' },
    { id: 'g', label: 'Motor RPM', value: '1,785', variant: 'success' },
    { id: 'h', label: 'Vibration RMS', value: '2.1 mm/s', variant: 'warning' },
  ]
  const labels = [
    'THD L1', 'THD L2', 'THD L3', 'kW demand', 'kVAR', 'Phase °',
    'Inlet °F', 'Oil life', 'Starts / day', 'Run hrs', 'Peak A', 'Min V',
    'Seq. current', 'Ground mA', 'Bearing °F', 'Coupling °F', 'Frame V', 'Line freq',
    'Pulse count', 'Energy kWh', 'CO₂ est.', 'Leak rate', 'Filter ΔP', 'Aftercooler °F',
    'Dryer dew', 'Drain cycles', 'Bypass %', 'Unload %', 'Modulation', 'Alarm code',
    'Comm latency', 'Packet loss', 'Firmware', 'Calib. due', 'Last sync', 'Trend peak',
  ] as const
  const variants: TelemetryReadingVariant[] = ['success', 'warning', 'danger']
  const extra: TelemetryReading[] = labels.map((label, i) => ({
    id: `x-${i}`,
    label: `${label}:`,
    value:
      i % 5 === 0
        ? `${(2.1 + i * 0.17).toFixed(2)} mm/s`
        : i % 5 === 1
          ? `${(48 + i).toFixed(1)} Hz`
          : i % 5 === 2
            ? `${120 + i * 3} A`
            : `${(0.82 + (i % 7) * 0.02).toFixed(2)} PF`,
    variant: variants[i % 3],
  }))
  return [...base, ...extra]
}

/** Vibration-heavy demo: 18 readings (3 two-row pages). */
function vibrationExtendedReadings(): TelemetryReading[] {
  const base: TelemetryReading[] = [
    { id: 'a', label: 'Frequency Y', value: '76 Hz', variant: 'warning' },
    { id: 'b', label: 'Velocity Y', value: '25 mm/s', variant: 'warning' },
    { id: 'c', label: 'Velocity X', value: '25 mm/s', variant: 'success' },
    { id: 'd', label: 'Humidity', value: '34%', variant: 'success' },
    { id: 'e', label: 'Acceleration', value: '23 mm/s²', variant: 'warning' },
    { id: 'f', label: 'Frequency X', value: '58 Hz', variant: 'warning' },
    { id: 'g', label: 'Temperature', value: '142 °F', variant: 'danger' },
  ]
  const extra: TelemetryReading[] = [
    { id: 'v8', label: 'Crest factor', value: '4.2', variant: 'warning' },
    { id: 'v9', label: 'Kurtosis', value: '3.1', variant: 'success' },
    { id: 'v10', label: 'Envelope peak', value: '12.4 gE', variant: 'warning' },
    { id: 'v11', label: 'Order track 1×', value: '0.8 mm/s', variant: 'success' },
    { id: 'v12', label: 'Order track 2×', value: '1.9 mm/s', variant: 'success' },
    { id: 'v13', label: 'Bearing BPFO', value: '—', variant: 'danger' },
    { id: 'v14', label: 'BPFI', value: '2.2 mm/s', variant: 'warning' },
    { id: 'v15', label: 'BSF', value: '0.9 mm/s', variant: 'success' },
    { id: 'v16', label: 'FTF', value: '1.1 mm/s', variant: 'success' },
    { id: 'v17', label: 'ISO zone', value: 'B', variant: 'warning' },
  ]
  return [...base, ...extra]
}

export const edgeSensorExtras: Record<string, EdgeSensorExtra> = {
  'RS-001': {
    signalStrength: 100,
    batteryPercent: null,
    assetTags: ['Production', 'Compressed air'],
    telemetryReadings: airCompExtendedReadings(),
  },
  'RS-002': {
    signalStrength: 98,
    batteryPercent: null,
    assetTags: ['Climate', 'Production'],
    telemetryReadings: [
      { id: 'a', label: 'Humidity', value: '52%', variant: 'success' },
      { id: 'b', label: 'Supply temp', value: '44 °F', variant: 'success' },
      { id: 'c', label: 'Return temp', value: '58 °F', variant: 'warning' },
      { id: 'd', label: 'Compressor A', value: '62 A', variant: 'warning' },
      { id: 'e', label: 'Suction pressure', value: '68 PSI', variant: 'success' },
      { id: 'f', label: 'Head pressure', value: '218 PSI', variant: 'success' },
    ],
  },
  'RS-003': {
    signalStrength: 94,
    batteryPercent: null,
    assetTags: ['Climate', 'Production'],
    telemetryReadings: [
      { id: 'a', label: 'Supply air', value: '52 °F', variant: 'success' },
      { id: 'b', label: 'Return air', value: '72 °F', variant: 'success' },
      { id: 'c', label: 'SAT setpoint', value: '55 °F', variant: 'success' },
      { id: 'd', label: 'Fan VFD', value: '42 Hz', variant: 'warning' },
      { id: 'e', label: 'Filter ΔP', value: '0.8 in', variant: 'warning' },
    ],
  },
  'RS-004': {
    signalStrength: 91,
    batteryPercent: 100,
    assetTags: ['Mechanical', 'Cooling tower'],
    telemetryReadings: [
      { id: 'a', label: 'Water out', value: '94 °F', variant: 'danger' },
      { id: 'b', label: 'Water in', value: '78 °F', variant: 'warning' },
      { id: 'c', label: 'Fan VFD', value: '87 Hz', variant: 'warning' },
      { id: 'd', label: 'Flow rate', value: '420 GPM', variant: 'success' },
      { id: 'e', label: 'Fan current', value: '38 A', variant: 'warning' },
    ],
  },
  'RS-005': {
    signalStrength: 100,
    batteryPercent: 100,
    assetTags: ['Standby', 'Utility'],
    telemetryReadings: [
      { id: 'a', label: 'Output V', value: '480 V', variant: 'success' },
      { id: 'b', label: 'Frequency', value: '60.0 Hz', variant: 'success' },
      { id: 'c', label: 'Oil pressure', value: '48 PSI', variant: 'success' },
      { id: 'd', label: 'Coolant temp', value: '182 °F', variant: 'warning' },
      { id: 'e', label: 'Battery V', value: '12.6 V', variant: 'success' },
    ],
  },
  'RS-006': {
    signalStrength: 0,
    batteryPercent: 0,
    assetTags: ['Basement', 'Steam'],
    telemetryReadings: [
      { id: 'a', label: 'Steam pressure', value: '—', variant: 'danger' },
      { id: 'b', label: 'Water level', value: '—', variant: 'danger' },
      { id: 'c', label: 'Stack temp', value: '—', variant: 'danger' },
      { id: 'd', label: 'Gas valve', value: 'Unknown', variant: 'danger' },
    ],
  },
  'RS-007': {
    signalStrength: 99,
    batteryPercent: null,
    assetTags: ['Rooftop', 'Critical load'],
    telemetryReadings: [
      { id: 'a', label: 'Chilled water out', value: '42 °F', variant: 'success' },
      { id: 'b', label: 'Chilled water in', value: '54 °F', variant: 'success' },
      { id: 'c', label: 'Refrigerant suction', value: '68 PSI', variant: 'success' },
      { id: 'd', label: 'Compressor kW', value: '312 kW', variant: 'success' },
      { id: 'e', label: 'Outdoor air', value: '38 °F', variant: 'success' },
    ],
  },
  'RS-008': {
    signalStrength: 97,
    batteryPercent: null,
    assetTags: ['Plant floor', 'Vibration program'],
    telemetryReadings: vibrationExtendedReadings(),
  },
}

export function mergeEdgeSensorExtras(sensor: RuntimeSensor): RuntimeSensor {
  const extra = edgeSensorExtras[sensor.id]
  if (!extra) return sensor
  return { ...sensor, ...extra }
}
