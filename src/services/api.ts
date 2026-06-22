import type { CaptureDraft, CaptureType, EntryStatus, TimelineEntry } from '../types'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.DEV ? '/api' : rawApiBaseUrl
const API_DEBUG = import.meta.env.VITE_API_DEBUG === 'true' || import.meta.env.DEV

type ApiEntry = {
  id: string
  type: string
  title: string
  description?: string
  status?: string
  tags?: string[]
  timestamp: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

type CreateEntryPayload = CaptureDraft

function debugLog(message: string, data?: unknown) {
  if (!API_DEBUG) {
    return
  }

  if (data === undefined) {
    console.log(`[api] ${message}`)
    return
  }

  if (typeof data === 'object' && data !== null) {
    console.groupCollapsed(`[api] ${message}`)
    console.log(data)
    console.groupEnd()
    return
  }

  console.log(`[api] ${message}`, data)
}

function debugError(message: string, error: unknown) {
  if (!API_DEBUG) {
    return
  }

  console.error(`[api] ${message}`, error)
}

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL environment variable.')
  }

  return String(API_BASE_URL).replace(/\/+$/, '')
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const responseText = await response.text()

  debugLog('raw response text', responseText)

  try {
    const payload = JSON.parse(responseText) as ApiResponse<T>
    debugLog('parsed response payload', payload)
    return payload
  } catch (error) {
    debugError('failed to parse JSON response', error)
    throw new Error(
      'API did not return JSON. Check the Apps Script deployment access and URL.',
    )
  }
}

function getErrorMessage<T>(response: Response, payload: ApiResponse<T>) {
  if (payload.error) {
    return payload.error
  }

  return `API returned success=${String(payload.success)} with status ${response.status}.`
}

async function request<T>(init?: RequestInit): Promise<T> {
  const url = getApiBaseUrl()
  const method = init?.method || 'GET'

  debugLog('request start', {
    url,
    method,
    body: init?.body,
  })

  const response = await fetch(url, init)

  debugLog('response received', {
    redirected: response.redirected,
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    url: response.url,
  })

  const payload = await parseJsonResponse<T>(response)

  if (!response.ok || !payload.success || payload.data === undefined) {
    const errorMessage = getErrorMessage(response, payload)
    debugError('request failed', {
      errorMessage,
      payload,
      status: response.status,
    })
    throw new Error(errorMessage)
  }

  debugLog('request success', payload.data)
  return payload.data
}

function toApiType(type: CaptureType) {
  return type === 'problem' ? 'Problem' : 'Solution'
}

function fromApiType(type: string): CaptureType {
  return type.toLowerCase() === 'solution' ? 'solution' : 'problem'
}

function normalizeStatus(status: string | undefined, type: CaptureType): EntryStatus {
  if (status === 'OPEN' || status === 'SOLVED') {
    return status
  }

  return type === 'problem' ? 'OPEN' : 'SOLVED'
}

function normalizeEntry(entry: ApiEntry): TimelineEntry {
  const type = fromApiType(entry.type)

  return {
    id: entry.id,
    type,
    status: normalizeStatus(entry.status, type),
    title: entry.title,
    description: entry.description || '',
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    createdAt: entry.timestamp,
  }
}

export async function createEntry(entry: CreateEntryPayload): Promise<TimelineEntry> {
  debugLog('createEntry called', entry)

  const createdEntry = await request<ApiEntry>({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      type: toApiType(entry.type),
      status: entry.status,
      title: entry.title,
      description: entry.description,
      tags: entry.tags,
    }),
  })

  const normalizedEntry = normalizeEntry(createdEntry)
  debugLog('createEntry normalized result', normalizedEntry)
  return normalizedEntry
}

export async function getEntries(): Promise<TimelineEntry[]> {
  debugLog('getEntries called')

  const entries = await request<ApiEntry[]>()

  const normalizedEntries = entries
    .map(normalizeEntry)
    .sort(
      (firstEntry, secondEntry) =>
        new Date(secondEntry.createdAt).getTime() - new Date(firstEntry.createdAt).getTime(),
    )

  debugLog('getEntries normalized result', normalizedEntries)
  return normalizedEntries
}

export async function updateEntryStatus(
  id: string,
  newStatus: EntryStatus,
): Promise<TimelineEntry> {
  debugLog('updateEntryStatus called', { id, newStatus })

  const updatedEntry = await request<ApiEntry>({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'updateStatus',
      id,
      status: newStatus,
    }),
  })

  const normalizedEntry = normalizeEntry(updatedEntry)
  debugLog('updateEntryStatus result', normalizedEntry)
  return normalizedEntry
}
