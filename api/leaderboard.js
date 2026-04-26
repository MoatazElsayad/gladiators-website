import { getLeaderboard } from './_lib/leaderboard-store.js'
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
    const rows = await getLeaderboard({
      limit: getQueryParam(req, 'limit'),
      mode: getQueryParam(req, 'mode'),
      range: getQueryParam(req, 'range')
    })

    sendJson(res, 200, {
      ok: true,
      rows
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to read leaderboard.'
    })
  }
}
