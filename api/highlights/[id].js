import { bearerTokenFromRequest, verifySessionToken } from '../_lib/auth.js'
import { getAuthPlayerById, getHighlightById } from '../_lib/leaderboard-store.js'
import { handlePreflight, sendJson } from '../_lib/http.js'

function extractHighlightId(req) {
  const url = new URL(req.url || '/', 'http://localhost')
  const segments = url.pathname.split('/').filter(Boolean)
  return segments[segments.length - 1]
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' })
    return
  }

  try {
    const session = verifySessionToken(bearerTokenFromRequest(req))
    if (!session) {
      sendJson(res, 401, {
        ok: false,
        message: 'Login required.'
      })
      return
    }

    const player = await getAuthPlayerById(session.sub)
    if (!player) {
      sendJson(res, 401, {
        ok: false,
        message: 'Login required.'
      })
      return
    }

    const highlight = await getHighlightById(extractHighlightId(req))
    if (!highlight) {
      sendJson(res, 404, {
        ok: false,
        message: 'Highlight not found.'
      })
      return
    }
    if (highlight.username.toLowerCase() !== player.username.toLowerCase()) {
      sendJson(res, 403, {
        ok: false,
        message: 'You can only view highlights for your signed-in profile.'
      })
      return
    }

    sendJson(res, 200, {
      ok: true,
      highlight
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to load battle highlight.'
    })
  }
}
