import { uploadHighlightImage } from '../_lib/blob-store.js'
import { bearerTokenFromRequest, verifySessionToken } from '../_lib/auth.js'
import {
  createBattleHighlight,
  getAuthPlayerById,
  getHighlightsForPlayer
} from '../_lib/leaderboard-store.js'
import { getQueryParam, handlePreflight, sendJson } from '../_lib/http.js'
import { readMultipartBody } from '../_lib/multipart.js'

function toBoolean(value) {
  return String(value || '').trim().toLowerCase() === 'true'
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toFloat(value, fallback = 0) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function ensureAllowedImageType(fileMimeType) {
  const safeType = String(fileMimeType || '').trim().toLowerCase()
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(safeType)) {
    throw new Error('Only PNG, JPEG, or WEBP highlight images are allowed.')
  }
  return safeType
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return
  }

  if (req.method === 'GET') {
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

      const requestedUsername = String(getQueryParam(req, 'username') || player.username).trim()
      if (requestedUsername.toLowerCase() !== player.username.toLowerCase()) {
        sendJson(res, 403, {
          ok: false,
          message: 'You can only view highlights for your signed-in profile.'
        })
        return
      }

      const username = player.username
      const rows = await getHighlightsForPlayer(username, getQueryParam(req, 'limit'))
      sendJson(res, 200, {
        ok: true,
        username: String(username || '').trim(),
        rows
      })
    } catch (error) {
      const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
      sendJson(res, statusCode, {
        ok: false,
        message: error.message || 'Failed to load battle highlights.'
      })
    }
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' })
    return
  }

  const configuredApiKey = String(process.env.GAME_UPLOAD_API_KEY || '').trim()

  try {
    const incomingApiKey = String(req.headers['x-gladiators-api-key'] || '').trim()
    if (configuredApiKey && incomingApiKey !== configuredApiKey) {
      sendJson(res, 401, {
        ok: false,
        message: 'Invalid game upload API key.'
      })
      return
    }

    const { fields, fileBuffer, fileMimeType } = await readMultipartBody(req)
    const contentType = ensureAllowedImageType(fileMimeType)

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Highlight image is required.')
    }

    const username = String(fields.username || '').trim()
    if (!username) {
      throw new Error('username is required.')
    }

    const imageUrl = await uploadHighlightImage({
      username,
      attackType: fields.attackType,
      capturedAt: fields.capturedAt,
      imageBuffer: fileBuffer,
      contentType
    })

    const highlight = await createBattleHighlight({
      username,
      mode: String(fields.mode || 'save_the_king').trim() || 'save_the_king',
      characterType: String(fields.characterType || '').trim() || null,
      characterName: String(fields.characterName || '').trim() || null,
      enemyType: String(fields.enemyType || '').trim() || null,
      enemyName: String(fields.enemyName || '').trim() || null,
      victory: toBoolean(fields.victory),
      battleDurationSeconds: toFloat(fields.battleDurationSeconds, 0),
      score: Math.max(0, toInteger(fields.score, 0)),
      attackType: String(fields.attackType || 'attack_1').trim() || 'attack_1',
      damage: Math.max(0, toInteger(fields.damage, 0)),
      wasProjectile: toBoolean(fields.wasProjectile),
      wasFinisher: toBoolean(fields.wasFinisher),
      highlightScore: Math.max(0, toInteger(fields.highlightScore, 0)),
      playerHpBefore: Math.max(0, toInteger(fields.playerHpBefore, 0)),
      playerHpAfter: Math.max(0, toInteger(fields.playerHpAfter, 0)),
      playerMaxHp: Math.max(0, toInteger(fields.playerMaxHp, 0)),
      enemyHpBefore: Math.max(0, toInteger(fields.enemyHpBefore, 0)),
      enemyHpAfter: Math.max(0, toInteger(fields.enemyHpAfter, 0)),
      levelIndex: Math.max(0, toInteger(fields.levelIndex, 0)),
      levelName: String(fields.levelName || '').trim() || null,
      imageUrl,
      imageContentType: contentType,
      capturedAt: fields.capturedAt
    })

    sendJson(res, 201, {
      ok: true,
      highlight
    })
  } catch (error) {
    const statusCode = error.message?.includes('Invalid game upload API key')
      ? 401
      : error.message?.includes('required') || error.message?.includes('allowed') || error.message?.includes('size limit')
        ? 400
        : error.message?.includes('BLOB') || error.message?.includes('token') || error.message?.includes('DATABASE_URL')
          ? 503
          : 500

    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to store battle highlight.'
    })
  }
}
