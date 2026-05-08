import { analyzeBattleHighlight } from '../../_lib/highlight-analysis.js'
import { bearerTokenFromRequest, verifySessionToken } from '../../_lib/auth.js'
import {
  getAuthPlayerById,
  getHighlightById,
  saveHighlightAnalysis
} from '../../_lib/leaderboard-store.js'
import { handlePreflight, sendJson } from '../../_lib/http.js'

function extractHighlightId(req) {
  const url = new URL(req.url || '/', 'http://localhost')
  const segments = url.pathname.split('/').filter(Boolean)
  return segments[segments.length - 2]
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method !== 'POST') {
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
        message: 'You can only analyze highlights for your signed-in profile.'
      })
      return
    }

    if (highlight.analysisStatus === 'complete' && highlight.analysisTitle) {
      sendJson(res, 200, {
        ok: true,
        highlight
      })
      return
    }

    const analysis = await analyzeBattleHighlight(highlight)
    const updatedHighlight = await saveHighlightAnalysis(highlight.id, analysis)

    sendJson(res, 200, {
      ok: true,
      highlight: updatedHighlight
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to analyze battle highlight.'
    })
  }
}
