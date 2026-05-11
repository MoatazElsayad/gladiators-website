export function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gladiators-Api-Key, Authorization')
}

export function sendJson(res, statusCode, payload) {
  applyCors(res)
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    applyCors(res)
    res.statusCode = 204
    res.end()
    return true
  }

  return false
}

export function getQueryParam(req, key) {
  const url = new URL(req.url || '/', 'http://localhost')
  return url.searchParams.get(key)
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  if (typeof req.body === 'string') {
    const rawBody = req.body.trim()
    if (!rawBody) {
      return {}
    }

    try {
      return JSON.parse(rawBody)
    } catch (error) {
      throw new Error('Request body must be valid JSON.')
    }
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error('Request body must be valid JSON.')
  }
}
