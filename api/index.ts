/// <reference types="node" />

interface ProxyRequest {
  url?: string
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
}

interface ProxyResponse {
  status: (code: number) => ProxyResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string | string[]) => void
  send: (body: Uint8Array) => void
}

const API_BASE_URL =
  process.env.VITE_API_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://probsol-backend.onrender.com/api/v1'

export default async function handler(req: ProxyRequest, res: ProxyResponse) {
  const targetUrl = API_BASE_URL.replace(/\/+$/, '')
  const requestUrl = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`)
  let pathname = requestUrl.pathname
  if (targetUrl.endsWith('/api/v1')) {
    pathname = pathname.replace(/^\/api\/v1/, '') || ''
  } else if (targetUrl.endsWith('/api')) {
    pathname = pathname.replace(/^\/api/, '') || ''
  }
  const target = `${targetUrl}${pathname.startsWith('/') ? '' : (pathname ? '/' : '')}${pathname}${requestUrl.search}`

  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value || key.toLowerCase() === 'host') {
      continue
    }
    headers[key] = Array.isArray(value) ? value.join(',') : String(value)
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body && typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body || '')
    }

    const response = await fetch(target, fetchOptions)

    // Forward Set-Cookie headers properly
    if ('getSetCookie' in response.headers && typeof response.headers.getSetCookie === 'function') {
      const cookies = response.headers.getSetCookie()
      if (cookies && cookies.length > 0) {
        res.setHeader('Set-Cookie', cookies)
      }
    }

    for (const [key, value] of response.headers.entries()) {
      const lower = key.toLowerCase()
      if (lower === 'transfer-encoding' || lower === 'set-cookie') continue
      res.setHeader(key, value)
    }

    res.status(response.status)
    const body = await response.arrayBuffer()
    const bytes = new Uint8Array(body)
    res.send(bytes)
  } catch (error) {
    res.status(502).json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
