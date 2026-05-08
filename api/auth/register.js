import { createSessionToken } from '../_lib/auth.js'
import { handlePreflight, readJsonBody, sendJson } from '../_lib/http.js'
import { registerWebsiteAccount } from '../_lib/leaderboard-store.js'

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
    const player = await registerWebsiteAccount(body)
    const token = createSessionToken(player)

    sendJson(res, 201, {
      ok: true,
      player,
      token
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL')
      ? 503
      : error.message?.includes('required') ||
          error.message?.includes('registered') ||
          error.message?.includes('characters') ||
          error.message?.includes('Password')
        ? 400
        : 500

    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to register account.'
    })
  }
}
