import { bearerTokenFromRequest, verifySessionToken } from '../../_lib/auth.js'
import { getAuthPlayerById, getHighlightById } from '../../_lib/leaderboard-store.js'
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
        message: 'You can only view images for your signed-in profile.'
      })
      return
    }

    const blobResponse = await fetch(highlight.imageUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN || ''}`
      }
    })

    if (!blobResponse.ok) {
      sendJson(res, blobResponse.status, {
        ok: false,
        message: 'Could not load the highlight image.'
      })
      return
    }

    const contentType = blobResponse.headers.get('content-type') || highlight.imageContentType || 'image/png'
    const imageBuffer = Buffer.from(await blobResponse.arrayBuffer())

    res.statusCode = 200
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'private, max-age=60')
    res.end(imageBuffer)
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to load highlight image.'
    })
  }
}
