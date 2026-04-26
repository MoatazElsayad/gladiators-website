import { upsertPlayerAndMatch } from './_lib/leaderboard-store.js'
import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' })
    return
  }

  const configuredApiKey = String(process.env.GAME_UPLOAD_API_KEY || '').trim()

  try {
    const body = await readJsonBody(req)
    const incomingApiKey = String(req.headers['x-gladiators-api-key'] || body?.apiKey || '').trim()

    if (configuredApiKey && incomingApiKey !== configuredApiKey) {
      sendJson(res, 401, {
        ok: false,
        message: 'Invalid game upload API key.'
      })
      return
    }

    const player = await upsertPlayerAndMatch(body)
    sendJson(res, 201, {
      ok: true,
      player
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL')
      ? 503
      : error.message?.includes('required') || error.message?.includes('JSON')
        ? 400
        : 500

    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to store game result.'
    })
  }
}
