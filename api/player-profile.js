import { getPlayerProfile } from './_lib/leaderboard-store.js'
import { getQueryParam, handlePreflight, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' })
    return
  }

  try {
    const profile = await getPlayerProfile(getQueryParam(req, 'username'))

    if (!profile) {
      sendJson(res, 404, {
        ok: false,
        message: 'Player not found.'
      })
      return
    }

    sendJson(res, 200, {
      ok: true,
      player: profile
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to read player profile.'
    })
  }
}
