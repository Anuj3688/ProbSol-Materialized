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
  const clientOrigin = (req.headers?.origin as string) || '*'

  // Handle CORS preflight directly to avoid 403 from upstream
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', clientOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
    res.setHeader('Access-Control-Max-Age', '86400')
    res.status(200).send(new Uint8Array(0))
    return
  }

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

  // Satisfy Spring Boot's strict allowed origins whitelist (which only permits http://localhost:5173)
  headers['origin'] = 'http://localhost:5173'

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
      if (lower.startsWith('access-control-')) continue
      res.setHeader(key, value)
    }

    res.setHeader('Access-Control-Allow-Origin', clientOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')

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
