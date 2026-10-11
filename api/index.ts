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
  send: (body: string | Buffer | unknown) => void
}

const TARGET_BACKEND = 'https://probsol-backend.onrender.com/api/v1'

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

  const requestUrl = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`)
  const proxyPath = requestUrl.searchParams.get('_proxy_path')

  let subPath: string
  if (proxyPath) {
    subPath = proxyPath.replace(/^v1\/?/, '').replace(/^\//, '')
    requestUrl.searchParams.delete('_proxy_path')
  } else {
    let p = requestUrl.pathname
    p = p.replace(/^\/api\/v1\/?/, '').replace(/^\/api\/?/, '')
    subPath = p.replace(/^\//, '')
  }

  const query = requestUrl.searchParams.toString() ? `?${requestUrl.searchParams.toString()}` : ''
  const target = `${TARGET_BACKEND}/${subPath}${query}`

  // Parse request body reliably across Vercel environments
  let bodyPayload: string | undefined = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'string') {
      bodyPayload = req.body
    } else if (Buffer.isBuffer(req.body)) {
      bodyPayload = (req.body as Buffer).toString('utf-8')
    } else if (req.body && typeof req.body === 'object') {
      bodyPayload = JSON.stringify(req.body)
    } else {
      type StreamEmitter = { on?: (event: string, cb: (c?: unknown) => void) => void }
      const emitter = req as StreamEmitter
      if (typeof emitter.on === 'function') {
        bodyPayload = await new Promise<string>((resolve) => {
          let str = ''
          emitter.on?.('data', (chunk: unknown) => {
            str += String(chunk ?? '')
          })
          emitter.on?.('end', () => resolve(str))
          emitter.on?.('error', () => resolve(''))
        })
      }
    }
  }

  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.headers || {})) {
    const lower = key.toLowerCase()
    if (!value || lower === 'host' || lower === 'content-length' || lower === 'connection') {
      continue
    }
    headers[lower] = Array.isArray(value) ? value.join(',') : String(value)
  }

  if (bodyPayload && !headers['content-type']) {
    headers['content-type'] = 'application/json'
  }

  // Satisfy Spring Boot CORS whitelist on Render
  headers['origin'] = 'http://localhost:5173'

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
    }

    if (bodyPayload !== undefined) {
      fetchOptions.body = bodyPayload
    }

    let response: Response | null = null
    let responseText = ''
    const maxAttempts = 3

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await fetch(target, fetchOptions)
        responseText = await response.text()

        const isDbLocked =
          response.status === 500 &&
          (responseText.includes('SQLITE_BUSY') || responseText.includes('locked'))
        const isColdBoot =
          (response.status === 502 || response.status === 503) && attempt < maxAttempts

        if ((isDbLocked || isColdBoot) && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 300))
          continue
        }

        break
      } catch (err) {
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 300))
          continue
        }
        throw err
      }
    }

    if (!response) {
      throw new Error('No response received from upstream backend')
    }

    // Forward Set-Cookie headers properly
    if ('getSetCookie' in response.headers && typeof response.headers.getSetCookie === 'function') {
      const cookies = response.headers.getSetCookie()
      if (cookies && cookies.length > 0) {
        res.setHeader('Set-Cookie', cookies)
      }
    }

    for (const [key, value] of response.headers.entries()) {
      const lower = key.toLowerCase()
      if (
        lower === 'transfer-encoding' ||
        lower === 'set-cookie' ||
        lower === 'content-encoding' ||
        lower === 'content-length' ||
        lower.startsWith('access-control-')
      ) {
        continue
      }
      res.setHeader(key, value)
    }

    res.setHeader('Access-Control-Allow-Origin', clientOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')

    res.status(response.status)
    try {
      const data = JSON.parse(responseText)
      res.json(data)
    } catch {
      res.send(responseText)
    }
  } catch (error) {
    res.status(502).json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
