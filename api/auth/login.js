import { createSessionToken } from '../_lib/auth.js'
import { handlePreflight, readJsonBody, sendJson } from '../_lib/http.js'
import { authenticateWebsiteAccount } from '../_lib/leaderboard-store.js'

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const player = await authenticateWebsiteAccount(body)
    const token = createSessionToken(player)

    sendJson(res, 200, {
      ok: true,
      player,
      token
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL')
      ? 503
      : error.message?.includes('Invalid') || error.message?.includes('required')
        ? 401
        : 500

    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to login.'
    })
  }
}
