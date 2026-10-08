import type {
  BackendMode,
  CaptureDraft,
  EntryFilterParams,
  EntryStatus,
  TagSummary,
  TimelineEntry,
  User,
} from '../types'
import { mockBackend } from './mockStorage'

const BACKEND_MODE_KEY = 'probsol_backend_mode_v1'
const ACCESS_TOKEN_KEY = 'probsol_jwt_token_v1'

export function getBackendMode(): BackendMode {
  const stored = localStorage.getItem(BACKEND_MODE_KEY)
  if (stored === 'api' || stored === 'mock') {
    return stored
  }
  // Default to mock if env variable is true or default in dev
  return import.meta.env.VITE_USE_MOCK_API === 'false' ? 'api' : 'mock'
}

export function setBackendMode(mode: BackendMode) {
  localStorage.setItem(BACKEND_MODE_KEY, mode)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

// Simulated network latency for mock mode
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// AUTHENTICATION APIs
// ---------------------------------------------------------------------------

export async function loginUser(email: string, password?: string): Promise<User> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(120)
    const user = mockBackend.login(email)
    setAccessToken(`mock_jwt_${user.id}_${Date.now()}`)
    return user
  }

  // Real API implementation (conforms to BACKEND_API_SPECIFICATION.md)
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: password || 'Password123!' }),
  })
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Login failed')
  }
  setAccessToken(json.data.accessToken)
  return json.data.user
}

export async function registerUser(email: string, displayName: string, password?: string): Promise<User> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(150)
    const user = mockBackend.register(email, displayName)
    setAccessToken(`mock_jwt_${user.id}_${Date.now()}`)
    return user
  }

  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, displayName, password: password || 'Password123!' }),
  })
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Registration failed')
  }
  setAccessToken(json.data.accessToken)
  return json.data.user
}

export async function getCurrentUser(): Promise<User | null> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    return mockBackend.getCurrentUser()
  }

  const token = getAccessToken()
  if (!token) return null

  try {
    const response = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await response.json()
    if (!response.ok || !json.success) return null
    return json.data
  } catch {
    return null
  }
}

export async function logoutUser(): Promise<void> {
  const mode = getBackendMode()
  setAccessToken(null)
  if (mode === 'api') {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    }
  }
}

// ---------------------------------------------------------------------------
// ENTRIES & NOTES APIs (with Search & Filtering)
// ---------------------------------------------------------------------------

export async function getEntries(params: EntryFilterParams = {}): Promise<TimelineEntry[]> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(80)
    return mockBackend.listEntries(params)
  }

  // Real REST API query string formatting
  const token = getAccessToken()
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.type && params.type !== 'all') searchParams.set('type', params.type)
  if (params.status && params.status !== 'all') searchParams.set('status', params.status)
  if (params.tag) searchParams.set('tags', params.tag)
  if (params.sortBy) searchParams.set('sort', params.sortBy)

  const response = await fetch(`/api/v1/entries?${searchParams.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch entries')
  }
  return json.data.items || json.data
}

export async function createEntry(entry: CaptureDraft): Promise<TimelineEntry> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(100)
    return mockBackend.createEntry(entry)
  }

  const token = getAccessToken()
  const response = await fetch('/api/v1/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(entry),
  })
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to save entry')
  }
  return json.data
}

export async function updateEntry(id: string, updates: Partial<CaptureDraft>): Promise<TimelineEntry> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(60)
    return mockBackend.updateEntry(id, updates)
  }

  const token = getAccessToken()
  const response = await fetch(`/api/v1/entries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  })
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to update entry')
  }
  return json.data
}

export async function updateEntryStatus(id: string, newStatus: EntryStatus): Promise<TimelineEntry> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(50)
    return mockBackend.updateEntryStatus(id, newStatus)
  }

  const token = getAccessToken()
  const response = await fetch(`/api/v1/entries/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status: newStatus }),
  })
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to update status')
  }
  return json.data
}

export async function deleteEntry(id: string): Promise<boolean> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    await sleep(60)
    return mockBackend.deleteEntry(id)
  }

  const token = getAccessToken()
  const response = await fetch(`/api/v1/entries/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const json = await response.json()
  return Boolean(json.success)
}

export async function getTags(): Promise<TagSummary[]> {
  const mode = getBackendMode()
  if (mode === 'mock') {
    return mockBackend.listTags()
  }

  const token = getAccessToken()
  const response = await fetch('/api/v1/tags', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const json = await response.json()
  if (!response.ok || !json.success) return []
  return json.data
}
