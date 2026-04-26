import { getDatabaseStats } from './_lib/leaderboard-store.js'
import { handlePreflight, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' })
    return
  }

  try {
    const database = await getDatabaseStats()
    sendJson(res, 200, {
      ok: true,
      service: 'gladiators-backend',
      database,
      uploadApiKeyEnabled: Boolean(String(process.env.GAME_UPLOAD_API_KEY || '').trim())
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to read backend health.'
    })
  }
}
