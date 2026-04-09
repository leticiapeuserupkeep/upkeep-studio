import type { RuntimeSensor } from './models'

export type EdgeSensorExtra = Pick<
  RuntimeSensor,
  'telemetryReadings' | 'signalStrength' | 'batteryPercent' | 'assetTags'
>

export const edgeSensorExtras: Record<string, EdgeSensorExtra> = {
  'RS-001': {
    signalStrength: 100,
    batteryPercent: null,
    assetTags: ['Production', 'Compressed air'],
    telemetryReadings: [
      { id: 'a', label: 'Current L1', value: '148 A', variant: 'success' },
      { id: 'b', label: 'Current L2', value: '151 A', variant: 'success' },
      { id: 'c', label: 'Voltage', value: '480 V', variant: 'success' },
      { id: 'd', label: 'Power factor', value: '0.94', variant: 'warning' },
      { id: 'e', label: 'Tank pressure', value: '112 PSI', variant: 'warning' },
      { id: 'f', label: 'Discharge temp', value: '198 °F', variant: 'success' },
      { id: 'g', label: 'Motor RPM', value: '1,785', variant: 'success' },
      { id: 'h', label: 'Vibration RMS', value: '2.1 mm/s', variant: 'warning' },
    ],
  },
  'RS-002': {
    signalStrength: 98,
    batteryPercent: null,
    assetTags: ['Climate', 'Warehouse'],
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
    assetTags: ['Line 3', 'Material handling'],
    telemetryReadings: [
      { id: 'a', label: 'Motor current', value: '42 A', variant: 'success' },
      { id: 'b', label: 'Belt speed', value: '1.2 m/s', variant: 'success' },
      { id: 'c', label: 'Torque', value: '88 N·m', variant: 'warning' },
      { id: 'd', label: 'Bearing temp', value: '165 °F', variant: 'warning' },
      { id: 'e', label: 'Load', value: '78%', variant: 'success' },
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
    telemetryReadings: [
      { id: 'a', label: 'Frequency Y', value: '76 Hz', variant: 'warning' },
      { id: 'b', label: 'Velocity Y', value: '25 mm/s', variant: 'warning' },
      { id: 'c', label: 'Velocity X', value: '25 mm/s', variant: 'success' },
      { id: 'd', label: 'Humidity', value: '34%', variant: 'success' },
      { id: 'e', label: 'Acceleration', value: '23 mm/s²', variant: 'warning' },
      { id: 'f', label: 'Frequency X', value: '58 Hz', variant: 'warning' },
      { id: 'g', label: 'Temperature', value: '142 °F', variant: 'danger' },
    ],
  },
}

export function mergeEdgeSensorExtras(sensor: RuntimeSensor): RuntimeSensor {
  const extra = edgeSensorExtras[sensor.id]
  if (!extra) return sensor
  return { ...sensor, ...extra }
}
