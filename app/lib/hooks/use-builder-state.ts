'use client'

import { useReducer, useCallback } from 'react'

type AiPhase = 'waiting' | 'thinking' | 'responded'
type SaveState = 'saved' | 'saving' | 'unsaved'
type PublishStatus = 'draft' | 'publishing' | 'published' | 'dirty'
type AudienceOption = 'company' | 'private' | 'restricted'
type AgentMode = 'plan' | 'action'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface VersionEntry {
  id: string
  version: string
  timestamp: string
  description: string
  author: string
  type: 'auto' | 'manual' | 'publish'
}

export interface BuilderState {
  agentMode: AgentMode
  modeDropdownOpen: boolean
  saveState: SaveState
  savedAgo: number
  publishOpen: boolean
  settingsOpen: boolean
  settingsFromPublish: boolean
  publishAudience: AudienceOption
  publishStatus: PublishStatus
  appTitle: string
  appInstructions: string
  showPublishing: boolean
  audienceDropdownOpen: boolean
  marketplacePublish: boolean
  appDescription: string
  appCategory: string
  appTags: string[]
  settingsDirty: boolean
  settingsSaved: boolean
  thinkingStep: number
  showActivityLog: boolean
  soundEnabled: boolean
  completionSignal: boolean
  showPublishSuccess: boolean
  linkCopied: boolean
  postPublishCTAsDismissed: boolean
  showRatingPrompt: boolean
  messages: Message[]
  localPhase: AiPhase
  versions: VersionEntry[]
  selectedVersions: string[]
  restoreConfirmId: string | null
  editingVersionId: string | null
}

export type BuilderAction =
  | { type: 'SET_AGENT_MODE'; value: AgentMode }
  | { type: 'SET_MODE_DROPDOWN'; open: boolean }
  | { type: 'SET_SAVE_STATE'; value: SaveState }
  | { type: 'SET_SAVED_AGO'; value: number }
  | { type: 'INCREMENT_SAVED_AGO'; by: number }
  | { type: 'SET_PUBLISH_OPEN'; open: boolean }
  | { type: 'SET_SETTINGS_OPEN'; open: boolean }
  | { type: 'SET_SETTINGS_FROM_PUBLISH'; value: boolean }
  | { type: 'SET_PUBLISH_AUDIENCE'; value: AudienceOption }
  | { type: 'SET_PUBLISH_STATUS'; value: PublishStatus }
  | { type: 'SET_APP_TITLE'; value: string }
  | { type: 'SET_APP_INSTRUCTIONS'; value: string }
  | { type: 'SET_SHOW_PUBLISHING'; value: boolean }
  | { type: 'SET_AUDIENCE_DROPDOWN'; open: boolean }
  | { type: 'SET_MARKETPLACE_PUBLISH'; value: boolean }
  | { type: 'SET_APP_DESCRIPTION'; value: string }
  | { type: 'SET_APP_CATEGORY'; value: string }
  | { type: 'SET_APP_TAGS'; value: string[] }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'REMOVE_TAG'; tag: string }
  | { type: 'SET_SETTINGS_DIRTY'; value: boolean }
  | { type: 'SET_SETTINGS_SAVED'; value: boolean }
  | { type: 'SET_THINKING_STEP'; value: number }
  | { type: 'SET_SHOW_ACTIVITY_LOG'; value: boolean }
  | { type: 'TOGGLE_ACTIVITY_LOG' }
  | { type: 'SET_SOUND_ENABLED'; value: boolean }
  | { type: 'SET_COMPLETION_SIGNAL'; value: boolean }
  | { type: 'SET_SHOW_PUBLISH_SUCCESS'; value: boolean }
  | { type: 'SET_LINK_COPIED'; value: boolean }
  | { type: 'SET_POST_PUBLISH_CTAS_DISMISSED'; value: boolean }
  | { type: 'SET_SHOW_RATING_PROMPT'; value: boolean }
  | { type: 'APPEND_MESSAGE'; message: Message }
  | { type: 'SET_LOCAL_PHASE'; value: AiPhase }
  | { type: 'CHAT_SENT' }
  | { type: 'CHAT_RESPONSE_RECEIVED'; content: string }
  | { type: 'AUTO_SAVED' }
  | { type: 'PUBLISH_STARTED' }
  | { type: 'PUBLISH_COMPLETED' }
  | { type: 'SETTINGS_SAVED' }
  | { type: 'OPEN_SETTINGS_FROM_PUBLISH' }
  | { type: 'ADD_VERSION'; entry: VersionEntry }
  | { type: 'TOGGLE_VERSION_SELECTION'; id: string }
  | { type: 'CLEAR_VERSION_SELECTION' }
  | { type: 'SET_RESTORE_CONFIRM'; id: string | null }
  | { type: 'RESTORE_VERSION'; id: string }
  | { type: 'SET_EDITING_VERSION'; id: string | null }
  | { type: 'RENAME_VERSION'; id: string; description: string }

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_AGENT_MODE':
      return { ...state, agentMode: action.value }
    case 'SET_MODE_DROPDOWN':
      return { ...state, modeDropdownOpen: action.open }
    case 'SET_SAVE_STATE':
      return { ...state, saveState: action.value }
    case 'SET_SAVED_AGO':
      return { ...state, savedAgo: action.value }
    case 'INCREMENT_SAVED_AGO':
      return { ...state, savedAgo: state.savedAgo + action.by }
    case 'SET_PUBLISH_OPEN':
      return { ...state, publishOpen: action.open }
    case 'SET_SETTINGS_OPEN':
      return { ...state, settingsOpen: action.open }
    case 'SET_SETTINGS_FROM_PUBLISH':
      return { ...state, settingsFromPublish: action.value }
    case 'SET_PUBLISH_AUDIENCE':
      return { ...state, publishAudience: action.value, settingsDirty: true }
    case 'SET_PUBLISH_STATUS':
      return { ...state, publishStatus: action.value }
    case 'SET_APP_TITLE':
      return { ...state, appTitle: action.value }
    case 'SET_APP_INSTRUCTIONS':
      return { ...state, appInstructions: action.value, settingsDirty: true }
    case 'SET_SHOW_PUBLISHING':
      return { ...state, showPublishing: action.value }
    case 'SET_AUDIENCE_DROPDOWN':
      return { ...state, audienceDropdownOpen: action.open }
    case 'SET_MARKETPLACE_PUBLISH':
      return { ...state, marketplacePublish: action.value, settingsDirty: true }
    case 'SET_APP_DESCRIPTION':
      return { ...state, appDescription: action.value, settingsDirty: true }
    case 'SET_APP_CATEGORY':
      return { ...state, appCategory: action.value, settingsDirty: true }
    case 'SET_APP_TAGS':
      return { ...state, appTags: action.value }
    case 'ADD_TAG':
      return { ...state, appTags: [...state.appTags, action.tag], settingsDirty: true }
    case 'REMOVE_TAG':
      return { ...state, appTags: state.appTags.filter(t => t !== action.tag), settingsDirty: true }
    case 'SET_SETTINGS_DIRTY':
      return { ...state, settingsDirty: action.value }
    case 'SET_SETTINGS_SAVED':
      return { ...state, settingsSaved: action.value }
    case 'SET_THINKING_STEP':
      return { ...state, thinkingStep: action.value }
    case 'SET_SHOW_ACTIVITY_LOG':
      return { ...state, showActivityLog: action.value }
    case 'TOGGLE_ACTIVITY_LOG':
      return { ...state, showActivityLog: !state.showActivityLog }
    case 'SET_SOUND_ENABLED':
      return { ...state, soundEnabled: action.value }
    case 'SET_COMPLETION_SIGNAL':
      return { ...state, completionSignal: action.value }
    case 'SET_SHOW_PUBLISH_SUCCESS':
      return { ...state, showPublishSuccess: action.value }
    case 'SET_LINK_COPIED':
      return { ...state, linkCopied: action.value }
    case 'SET_POST_PUBLISH_CTAS_DISMISSED':
      return { ...state, postPublishCTAsDismissed: action.value }
    case 'SET_SHOW_RATING_PROMPT':
      return { ...state, showRatingPrompt: action.value }
    case 'APPEND_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'SET_LOCAL_PHASE':
      return { ...state, localPhase: action.value }

    case 'CHAT_SENT':
      return {
        ...state,
        localPhase: 'thinking',
        showActivityLog: false,
        saveState: 'unsaved',
        publishStatus: state.publishStatus === 'published' ? 'dirty' : state.publishStatus,
      }

    case 'CHAT_RESPONSE_RECEIVED': {
      const nextMinor = state.versions.length > 0
        ? `v1.${state.versions.length}`
        : 'v1.0'
      const now = new Date()
      const ts = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return {
        ...state,
        messages: [...state.messages, { role: 'assistant', content: action.content }],
        localPhase: 'responded',
        saveState: 'saving',
        versions: [
          { id: nextMinor, version: nextMinor, timestamp: ts, description: 'AI chat: Applied changes', author: 'You', type: 'auto' as const },
          ...state.versions,
        ],
      }
    }

    case 'AUTO_SAVED':
      return { ...state, saveState: 'saved', savedAgo: 0 }

    case 'PUBLISH_STARTED':
      return { ...state, publishStatus: 'publishing', showPublishing: true }

    case 'PUBLISH_COMPLETED': {
      const pubVersion = `v${state.versions.length > 0 ? '2.0' : '1.0'}`
      const pubTs = new Date()
      const pubTsStr = pubTs.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + pubTs.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return {
        ...state,
        showPublishing: false,
        publishStatus: 'published',
        showPublishSuccess: true,
        versions: [
          { id: pubVersion, version: pubVersion, timestamp: pubTsStr, description: 'Published to marketplace', author: 'You', type: 'publish' as const },
          ...state.versions,
        ],
      }
    }

    case 'SETTINGS_SAVED':
      return {
        ...state,
        settingsOpen: false,
        settingsDirty: false,
        settingsFromPublish: false,
        postPublishCTAsDismissed: true,
        settingsSaved: true,
      }

    case 'OPEN_SETTINGS_FROM_PUBLISH':
      return {
        ...state,
        publishOpen: false,
        settingsOpen: true,
        settingsFromPublish: true,
      }

    case 'ADD_VERSION':
      return { ...state, versions: [action.entry, ...state.versions] }

    case 'TOGGLE_VERSION_SELECTION': {
      const sel = state.selectedVersions.includes(action.id)
        ? state.selectedVersions.filter(v => v !== action.id)
        : state.selectedVersions.length < 2
          ? [...state.selectedVersions, action.id]
          : [state.selectedVersions[1], action.id]
      return { ...state, selectedVersions: sel }
    }

    case 'CLEAR_VERSION_SELECTION':
      return { ...state, selectedVersions: [] }

    case 'SET_RESTORE_CONFIRM':
      return { ...state, restoreConfirmId: action.id }

    case 'RESTORE_VERSION':
      return { ...state, restoreConfirmId: null }

    case 'SET_EDITING_VERSION':
      return { ...state, editingVersionId: action.id }

    case 'RENAME_VERSION':
      return {
        ...state,
        editingVersionId: null,
        versions: state.versions.map(v => v.id === action.id ? { ...v, description: action.description } : v),
      }

    default:
      return state
  }
}

export function useBuilderState(submittedPrompt: string, aiPhase: AiPhase) {
  const initialState: BuilderState = {
    agentMode: 'plan',
    modeDropdownOpen: false,
    saveState: 'saved',
    savedAgo: 0,
    publishOpen: false,
    settingsOpen: false,
    settingsFromPublish: false,
    publishAudience: 'company',
    publishStatus: 'draft',
    appTitle: 'Data Overview Dashboard',
    appInstructions: '',
    showPublishing: false,
    audienceDropdownOpen: false,
    marketplacePublish: false,
    appDescription: '',
    appCategory: 'Operations',
    appTags: ['dashboard', 'alerts', 'monitoring'],
    settingsDirty: false,
    settingsSaved: false,
    thinkingStep: -1,
    showActivityLog: true,
    soundEnabled: true,
    completionSignal: false,
    showPublishSuccess: false,
    linkCopied: false,
    postPublishCTAsDismissed: false,
    showRatingPrompt: false,
    messages: [{ role: 'user', content: submittedPrompt }],
    localPhase: aiPhase === 'waiting' ? 'waiting' : aiPhase,
    versions: [
      { id: 'v1.2', version: 'v1.2', timestamp: 'Mar 19, 2026 at 2:34 PM', description: 'Added status availability section', author: 'You', type: 'auto' },
      { id: 'v1.1', version: 'v1.1', timestamp: 'Mar 19, 2026 at 2:20 PM', description: 'Restructured dashboard layout', author: 'You', type: 'auto' },
      { id: 'v1.0', version: 'v1.0', timestamp: 'Mar 19, 2026 at 2:05 PM', description: 'Initial app generation', author: 'You', type: 'manual' },
    ],
    selectedVersions: [],
    restoreConfirmId: null,
    editingVersionId: null,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const closeSettings = useCallback(() => {
    dispatch({ type: 'SET_SETTINGS_OPEN', open: false })
    dispatch({ type: 'SET_SETTINGS_FROM_PUBLISH', value: false })
  }, [])

  return { state, dispatch, closeSettings } as const
}
