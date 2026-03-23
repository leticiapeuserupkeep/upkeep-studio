'use client'

import { useReducer, useCallback } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

type ScheduleMode = 'every_day' | 'weekdays' | 'custom'
type ThresholdUnit = 'amps' | 'milliamps' | 'watts' | 'kilowatts' | 'volts'
type ConfigTab = 'general' | 'meter' | 'hours'

interface DaySchedule {
  day: string
  enabled: boolean
  from: string
  to: string
}

interface MeterConfigState {
  activeTab: ConfigTab
  enableSync: boolean
  meterName: string
  threshold: number
  thresholdUnit: ThresholdUnit
  autoUpdate: boolean
  scheduleMode: ScheduleMode
  globalFrom: string
  globalTo: string
  customDays: DaySchedule[]
  showResetConfirm: boolean
}

type MeterConfigAction =
  | { type: 'SET_TAB'; tab: ConfigTab }
  | { type: 'SET_ENABLE_SYNC'; value: boolean }
  | { type: 'SET_METER_NAME'; value: string }
  | { type: 'SET_THRESHOLD'; value: number }
  | { type: 'SET_THRESHOLD_UNIT'; value: ThresholdUnit }
  | { type: 'SET_AUTO_UPDATE'; value: boolean }
  | { type: 'SET_SCHEDULE_MODE'; value: ScheduleMode }
  | { type: 'SET_GLOBAL_FROM'; value: string }
  | { type: 'SET_GLOBAL_TO'; value: string }
  | { type: 'UPDATE_CUSTOM_DAY'; index: number; field: 'enabled' | 'from' | 'to'; value: boolean | string }
  | { type: 'SET_SHOW_RESET_CONFIRM'; value: boolean }
  | { type: 'DELETE_METER' }
  | { type: 'RESET'; defaults: Pick<MeterConfigState, 'meterName' | 'enableSync' | 'threshold'> }

function reducer(state: MeterConfigState, action: MeterConfigAction): MeterConfigState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }
    case 'SET_ENABLE_SYNC':
      return { ...state, enableSync: action.value }
    case 'SET_METER_NAME':
      return { ...state, meterName: action.value }
    case 'SET_THRESHOLD':
      return { ...state, threshold: action.value }
    case 'SET_THRESHOLD_UNIT':
      return { ...state, thresholdUnit: action.value }
    case 'SET_AUTO_UPDATE':
      return { ...state, autoUpdate: action.value }
    case 'SET_SCHEDULE_MODE':
      return { ...state, scheduleMode: action.value }
    case 'SET_GLOBAL_FROM':
      return { ...state, globalFrom: action.value }
    case 'SET_GLOBAL_TO':
      return { ...state, globalTo: action.value }
    case 'UPDATE_CUSTOM_DAY':
      return {
        ...state,
        customDays: state.customDays.map((d, i) =>
          i === action.index ? { ...d, [action.field]: action.value } : d
        ),
      }
    case 'SET_SHOW_RESET_CONFIRM':
      return { ...state, showResetConfirm: action.value }
    case 'DELETE_METER':
      return { ...state, meterName: '', enableSync: false }
    case 'RESET':
      return {
        ...state,
        ...action.defaults,
        threshold: 0,
        thresholdUnit: 'amps',
        autoUpdate: false,
        scheduleMode: 'every_day',
        globalFrom: '12:00 AM',
        globalTo: '11:59 PM',
        customDays: DAYS.map((day) => ({ day, enabled: true, from: '12:00 AM', to: '11:59 PM' })),
        showResetConfirm: false,
      }
  }
}

function createInitialState(options: {
  syncEnabled: boolean
  meterName: string
  runtimeThreshold: number
}): MeterConfigState {
  return {
    activeTab: 'general',
    enableSync: options.syncEnabled,
    meterName: options.meterName,
    threshold: options.runtimeThreshold,
    thresholdUnit: 'amps',
    autoUpdate: false,
    scheduleMode: 'every_day',
    globalFrom: '12:00 AM',
    globalTo: '11:59 PM',
    customDays: DAYS.map((day) => ({ day, enabled: true, from: '12:00 AM', to: '11:59 PM' })),
    showResetConfirm: false,
  }
}

export function useMeterConfigForm(options: {
  syncEnabled: boolean
  meterName: string
  runtimeThreshold: number
}) {
  const [state, dispatch] = useReducer(reducer, options, createInitialState)

  const resetToDefaults = useCallback(() => {
    dispatch({
      type: 'RESET',
      defaults: {
        meterName: options.meterName,
        enableSync: options.syncEnabled,
        threshold: options.runtimeThreshold,
      },
    })
  }, [options.meterName, options.syncEnabled, options.runtimeThreshold])

  return { state, dispatch, resetToDefaults } as const
}

export type { MeterConfigState, MeterConfigAction, ConfigTab, ThresholdUnit, ScheduleMode, DaySchedule }
