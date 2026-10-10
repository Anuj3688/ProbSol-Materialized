import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../api/index'

describe('Vercel Reverse Proxy (api/index.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('handles OPTIONS preflight requests immediately with 200 OK and CORS headers', async () => {
    const headers: Record<string, string | string[]> = {}
    let statusCode = 0
    let sentBody: unknown = null

    const req = {
      method: 'OPTIONS',
      headers: {
        origin: 'https://prob-sol-materialized.vercel.app',
      },
    }

    const res = {
      status(code: number) {
        statusCode = code
        return this
      },
      setHeader(name: string, value: string | string[]) {
        headers[name.toLowerCase()] = value
      },
      json() {},
      send(body: unknown) {
        sentBody = body
      },
    }

    await handler(req, res)

    expect(statusCode).toBe(200)
    expect(sentBody).toBeDefined()
    expect(headers['access-control-allow-origin']).toBe(
      'https://prob-sol-materialized.vercel.app',
    )
    expect(headers['access-control-allow-credentials']).toBe('true')
    expect(headers['access-control-allow-methods']).toContain('OPTIONS')
  })

  it('routes _proxy_path accurately to target backend and strips content-encoding', async () => {
    let capturedTargetUrl = ''
    let capturedHeaders: Record<string, string> | undefined

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
      capturedTargetUrl = url
      capturedHeaders = options.headers as Record<string, string>
      return new Response(
        JSON.stringify({
          success: true,
          data: { user: { email: 'anuj@probsol.dev' }, accessToken: 'token-abc' },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'content-encoding': 'gzip', // Mock upstream Cloudflare gzip header
            'content-length': '99',
          },
        },
      )
    })

    const responseHeaders: Record<string, string | string[]> = {}
    let statusCode = 0
    let jsonBody: unknown = null

    const req = {
      method: 'POST',
      url: '/api?_proxy_path=v1/auth/login',
      headers: {
        origin: 'https://prob-sol-materialized.vercel.app',
        'content-type': 'application/json',
      },
      body: {
        email: 'anuj@probsol.dev',
        password: 'Password123!',
      },
    }

    const res = {
      status(code: number) {
        statusCode = code
        return this
      },
      setHeader(name: string, value: string | string[]) {
        responseHeaders[name.toLowerCase()] = value
      },
      json(body: unknown) {
        jsonBody = body
      },
      send() {},
    }

    await handler(req, res)

    expect(statusCode).toBe(200)
    // Upstream URL correctly targeted
    expect(capturedTargetUrl).toBe(
      'https://probsol-backend.onrender.com/api/v1/auth/login',
    )
    // Origin overwritten to satisfy Render's Spring Boot whitelist
    expect(capturedHeaders?.['origin']).toBe('http://localhost:5173')
    // Upstream gzip header stripped so client receives valid uncompressed JSON
    expect(responseHeaders['content-encoding']).toBeUndefined()
    expect(responseHeaders['content-length']).toBeUndefined()
    // JSON response body delivered cleanly
    expect(jsonBody).toEqual({
      success: true,
      data: { user: { email: 'anuj@probsol.dev' }, accessToken: 'token-abc' },
    })
  })
})
