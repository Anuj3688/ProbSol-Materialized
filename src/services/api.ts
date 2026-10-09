import type {
  ApiResponse,
  BackendMode,
  CaptureDraft,
  EntryFilterParams,
  EntryStatus,
  TagSummary,
  TimelineEntry,
  User,
} from '../types'

const ACCESS_TOKEN_KEY = 'probsol_jwt_token_v1'

export function getBackendMode(): BackendMode {
  return 'api'
}

export function setBackendMode() {
  // Permanently live API mode
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

/**
 * Normalizes and resolves the API base URL.
 * Supports:
 * - VITE_API_URL (e.g. http://localhost:8080/api/v1 or https://probsol-backend.onrender.com/api/v1)
 * - VITE_API_BASE_URL (fallback)
 * - Defaults to '/api/v1' for local reverse proxy
 */
export function getApiBaseUrl(): string {
  const raw = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).trim()
  const trimmed = raw.replace(/\/+$/, '')
  if (!trimmed) {
    return '/api/v1'
  }
  if (trimmed.endsWith('/api/v1')) {
    return trimmed
  }
  if (trimmed.endsWith('/api')) {
    return `${trimmed}/v1`
  }
  return `${trimmed}/api/v1`
}

// ---------------------------------------------------------------------------
// SILENT REFRESH & INTERCEPTOR LOGIC
// ---------------------------------------------------------------------------

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

function handleAuthFailure() {
  setAccessToken(null)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('probsol:auth-expired'))
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login'
    }
  }
}

/**
 * Triggers silent token refresh using the HttpOnly probsol_rt cookie.
 * Queues concurrent refresh attempts so only one request is in-flight.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshUrl = `${getApiBaseUrl()}/auth/refresh`
      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include', // sends probsol_rt cookie
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const json: ApiResponse<{ accessToken: string }> = await response.json()
      if (json.success && json.data?.accessToken) {
        setAccessToken(json.data.accessToken)
        return json.data.accessToken
      }
      return null
    } catch {
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Unified HTTP API client meeting Spring Boot backend specifications:
 * 1. credentials: "include" on every request (for HttpOnly refresh cookies)
 * 2. Authorization: Bearer <accessToken> header injection
 * 3. 401 interception & silent token refresh retry
 * 4. Unified ApiResponse<T> error normalization
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`

  const token = getAccessToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Always send and receive cookies (probsol_rt)
    headers,
  }

  let response: Response
  try {
    response = await fetch(fullUrl, config)
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Network error occurred', {
      cause: err,
    })
  }

  // Intercept 401 Unauthorized for silent refresh
  const isAuthEndpoint =
    cleanEndpoint.includes('/auth/login') ||
    cleanEndpoint.includes('/auth/register') ||
    cleanEndpoint.includes('/auth/refresh')

  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      // Retry original request with the renewed access token
      const retryHeaders = new Headers(options.headers || {})
      retryHeaders.set('Authorization', `Bearer ${newToken}`)
      return apiClient<T>(endpoint, { ...options, headers: retryHeaders }, true)
    }

    // Refresh failed: clear token and redirect to /login
    handleAuthFailure()
    throw new Error('Session expired. Please log in again.')
  }

  let json: ApiResponse<T>
  try {
    json = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return { success: true } as ApiResponse<T>
  }

  if (!response.ok || !json.success) {
    const errorMsg = json.error || json.message || `Request failed with status ${response.status}`
    throw new Error(errorMsg)
  }

  return json
}

// ---------------------------------------------------------------------------
// AUTHENTICATION APIs
// ---------------------------------------------------------------------------

export async function loginUser(email: string, password?: string): Promise<User> {
  const json = await apiClient<{ user: User; accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: password || 'Password123!' }),
  })

  if (!json.data?.accessToken || !json.data?.user) {
    throw new Error(json.error || json.message || 'Invalid login response from server')
  }

  setAccessToken(json.data.accessToken)
  return json.data.user
}

export async function registerUser(email: string, displayName: string, password?: string): Promise<User> {
  const json = await apiClient<{ user: User; accessToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, displayName, password: password || 'Password123!' }),
  })

  if (!json.data?.accessToken || !json.data?.user) {
    throw new Error(json.error || json.message || 'Invalid registration response from server')
  }

  setAccessToken(json.data.accessToken)
  return json.data.user
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAccessToken()
  if (!token) {
    return null
  }

  try {
    const json = await apiClient<User>('/auth/me')
    return json.data || null
  } catch {
    return null
  }
}

export async function logoutUser(): Promise<void> {
  setAccessToken(null)
  try {
    await apiClient<void>('/auth/logout', { method: 'POST' })
  } catch {
    // Ignore network errors on logout
  }
}

// ---------------------------------------------------------------------------
// ENTRIES & NOTES APIs (with Search & Filtering)
// ---------------------------------------------------------------------------

export async function getEntries(params: EntryFilterParams = {}): Promise<TimelineEntry[]> {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.type && params.type !== 'all') searchParams.set('type', params.type)
  if (params.status && params.status !== 'all') searchParams.set('status', params.status)
  if (params.tag) searchParams.set('tags', params.tag)
  if (params.sortBy) searchParams.set('sort', params.sortBy)

  const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const json = await apiClient<{ items?: TimelineEntry[] } | TimelineEntry[]>(`/entries${query}`)

  if (Array.isArray(json.data)) {
    return json.data
  }
  return json.data?.items || []
}

export async function createEntry(entry: CaptureDraft): Promise<TimelineEntry> {
  const json = await apiClient<TimelineEntry>('/entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  if (!json.data) {
    throw new Error(json.error || 'Failed to save entry')
  }
  return json.data
}

export async function updateEntry(id: string, updates: Partial<CaptureDraft>): Promise<TimelineEntry> {
  const json = await apiClient<TimelineEntry>(`/entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  if (!json.data) {
    throw new Error(json.error || 'Failed to update entry')
  }
  return json.data
}

export async function updateEntryStatus(id: string, newStatus: EntryStatus): Promise<TimelineEntry> {
  const json = await apiClient<TimelineEntry>(`/entries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  })
  if (!json.data) {
    throw new Error(json.error || 'Failed to update status')
  }
  return json.data
}

export async function deleteEntry(id: string): Promise<boolean> {
  const json = await apiClient<{ message?: string }>(`/entries/${id}`, {
    method: 'DELETE',
  })
  return Boolean(json.success)
}

export async function getTags(): Promise<TagSummary[]> {
  try {
    const json = await apiClient<TagSummary[]>('/tags')
    return json.data || []
  } catch {
    return []
  }
}
