import { deleteHighlightAssets, uploadHighlightClipSheet, uploadHighlightImage } from '../_lib/blob-store.js'
import { bearerTokenFromRequest, verifySessionToken } from '../_lib/auth.js'
import {
  createBattleHighlight,
  getAuthPlayerById,
  getHighlightsForPlayer,
  pruneHighlightsForPlayer
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

function ensureAllowedClipType(fileMimeType) {
  const safeType = String(fileMimeType || '').trim().toLowerCase()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(safeType)) {
    throw new Error('Only JPEG, PNG, or WEBP highlight clips are allowed.')
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

    const { fields, files, fileBuffer, fileMimeType } = await readMultipartBody(req, {
      maxFileSize: 4 * 1024 * 1024
    })
    const imageFile = files?.image || { buffer: fileBuffer, mimeType: fileMimeType }
    const clipFile = files?.clipSheet || null

    const username = String(fields.username || '').trim()
    if (!username) {
      throw new Error('username is required.')
    }

    const victory = toBoolean(fields.victory)
    if (!victory) {
      sendJson(res, 202, {
        ok: true,
        skipped: true,
        message: 'Loss highlights are ignored by AI Coach.'
      })
      return
    }

    const contentType = ensureAllowedImageType(imageFile?.mimeType)

    if (!imageFile?.buffer || imageFile.buffer.length === 0) {
      throw new Error('Highlight image is required.')
    }

    const imageUrl = await uploadHighlightImage({
      username,
      attackType: fields.attackType,
      capturedAt: fields.capturedAt,
      imageBuffer: imageFile.buffer,
      contentType
    })

    let clipSheetUrl = null
    let clipSheetContentType = null
    if (clipFile?.buffer?.length) {
      clipSheetContentType = ensureAllowedClipType(clipFile.mimeType)
      clipSheetUrl = await uploadHighlightClipSheet({
        username,
        attackType: fields.attackType,
        capturedAt: fields.capturedAt,
        clipBuffer: clipFile.buffer,
        contentType: clipSheetContentType
      })
    }

    const highlight = await createBattleHighlight({
      username,
      mode: String(fields.mode || 'save_the_king').trim() || 'save_the_king',
      characterType: String(fields.characterType || '').trim() || null,
      characterName: String(fields.characterName || '').trim() || null,
      enemyType: String(fields.enemyType || '').trim() || null,
      enemyName: String(fields.enemyName || '').trim() || null,
      victory,
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
      clipSheetUrl,
      clipSheetContentType,
      clipKind: String(fields.clipKind || '').trim() || null,
      clipFrameCount: Math.max(0, toInteger(fields.clipFrameCount, 0)),
      clipFps: Math.max(0, toInteger(fields.clipFps, 0)),
      clipFrameWidth: Math.max(0, toInteger(fields.clipFrameWidth, 0)),
      clipFrameHeight: Math.max(0, toInteger(fields.clipFrameHeight, 0)),
      clipDurationSeconds: Math.max(0, toFloat(fields.clipDurationSeconds, 0)),
      capturedAt: fields.capturedAt
    })

    const pruning = await pruneHighlightsForPlayer(highlight.playerId, 8)
    await deleteHighlightAssets(pruning.assetUrls)

    sendJson(res, 201, {
      ok: true,
      highlight,
      retainedHighlightLimit: 8,
      prunedHighlightCount: pruning.deletedCount
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
