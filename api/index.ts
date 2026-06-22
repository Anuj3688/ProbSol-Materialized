const API_BASE_URL = process.env.VITE_API_BASE_URL

export default async function handler(req: any, res: any) {
  if (!API_BASE_URL) {
    res.status(500).json({
      success: false,
      error: 'Missing VITE_API_BASE_URL environment variable in production.',
    })
    return
  }

  const targetUrl = API_BASE_URL.replace(/\/+$|(?<=https?:\/\/[^\/]+)$/, '')
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`)
  const forwardPath = requestUrl.pathname.replace(/^\/api/, '') || ''
  const target = `${targetUrl}${forwardPath ? (forwardPath.startsWith('/') ? '' : '/') + forwardPath : ''}${requestUrl.search}`

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
      fetchOptions.body = req.body && typeof req.body === 'object' ? JSON.stringify(req.body) : req.body
    }

    const response = await fetch(target, fetchOptions)

    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === 'transfer-encoding') continue
      res.setHeader(key, value)
    }

    res.status(response.status)
    const body = await response.arrayBuffer()
    res.send(Buffer.from(body))
  } catch (error) {
    res.status(502).json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
