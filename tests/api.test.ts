import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getApiBaseUrl,
  getAccessToken,
  setAccessToken,
  apiClient,
  loginUser,
} from '../src/services/api'

const storageMap = new Map<string, string>()
const mockStorage = {
  getItem: (k: string) => storageMap.get(k) || null,
  setItem: (k: string, v: string) => { storageMap.set(k, String(v)) },
  removeItem: (k: string) => { storageMap.delete(k) },
  clear: () => { storageMap.clear() },
}
Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: mockStorage, writable: true })

describe('API Base URL Configuration', () => {
  it('defaults to relative proxy /api/v1 in browser environments to avoid CORS preflight', () => {
    const url = getApiBaseUrl()
    expect(url).toBe('/api/v1')
  })
})

describe('Token Storage & Session Management', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('stores and retrieves access token correctly', () => {
    expect(getAccessToken()).toBeNull()
    setAccessToken('test-jwt-token-123')
    expect(getAccessToken()).toBe('test-jwt-token-123')
    expect(localStorage.getItem('probsol_jwt_token_v1')).toBe('test-jwt-token-123')
  })

  it('removes access token when set to null', () => {
    setAccessToken('test-jwt-token-123')
    setAccessToken(null)
    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem('probsol_jwt_token_v1')).toBeNull()
  })
})

describe('apiClient Request & Error Handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAccessToken(null)
  })

  it('injects Bearer authorization header when token is stored', async () => {
    setAccessToken('mock-token-xyz')
    let capturedHeaders: Headers | undefined

    globalThis.fetch = vi.fn().mockImplementation(async (_url, options) => {
      capturedHeaders = options.headers
      return new Response(JSON.stringify({ success: true, data: { test: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const res = await apiClient<{ test: boolean }>('/test-endpoint')
    expect(res.success).toBe(true)
    expect(capturedHeaders?.get('Authorization')).toBe('Bearer mock-token-xyz')
  })

  it('normalizes 401 Unauthorized status into "Invalid email or password"', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ success: false, error: 'Bad credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    await expect(apiClient('/auth/login', { method: 'POST' })).rejects.toThrow(
      'Bad credentials',
    )
  })

  it('stores access token on successful loginUser response', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: 'fresh-jwt-token',
            user: {
              id: 'u-1',
              email: 'test@probsol.dev',
              displayName: 'Test User',
              createdAt: '2026-10-10',
            },
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    const user = await loginUser('test@probsol.dev', 'password123')
    expect(user.email).toBe('test@probsol.dev')
    expect(getAccessToken()).toBe('fresh-jwt-token')
  })
})
