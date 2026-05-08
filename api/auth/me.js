import { bearerTokenFromRequest, verifySessionToken } from '../_lib/auth.js'
import { handlePreflight, sendJson } from '../_lib/http.js'
import { getAuthPlayerById } from '../_lib/leaderboard-store.js'

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

    sendJson(res, 200, {
      ok: true,
      player
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to read account.'
    })
  }
}
