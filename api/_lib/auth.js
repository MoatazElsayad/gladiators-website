import crypto from 'node:crypto'

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14

function secret() {
  return String(process.env.AUTH_SESSION_SECRET || process.env.GAME_UPLOAD_API_KEY || 'gladiators_local_auth_secret').trim()
}

function base64Url(input) {
  return Buffer.from(input).toString('base64url')
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url')
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const cleanPassword = String(password || '')
  const hash = crypto.pbkdf2Sync(cleanPassword, salt, 120000, 32, 'sha256').toString('hex')
  return { salt, hash }
}

export function verifyPassword(password, salt, expectedHash) {
  if (!salt || !expectedHash) {
    return false
  }

  const { hash } = hashPassword(password, salt)
  const left = Buffer.from(hash, 'hex')
  const right = Buffer.from(String(expectedHash), 'hex')
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function createSessionToken(player) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: player.id,
    username: player.username,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  }
  const body = base64Url(JSON.stringify(payload))
  return `${body}.${sign(body)}`
}

export function verifySessionToken(token) {
  const [body, signature] = String(token || '').split('.')
  if (!body || !signature || sign(body) !== signature) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload?.sub || !payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch (error) {
    return null
  }
}

export function bearerTokenFromRequest(req) {
  const header = String(req.headers.authorization || '').trim()
  if (!header.toLowerCase().startsWith('bearer ')) {
    return ''
  }
  return header.slice(7).trim()
}
