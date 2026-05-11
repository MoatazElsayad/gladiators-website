import { getDatabaseStats } from './_lib/leaderboard-store.js'
import { handlePreflight, sendJson } from './_lib/http.js'

function aiCoachStatus() {
  const fallbackProvider = process.env.OPENROUTER_API_KEY
    ? 'openrouter'
    : process.env.OPENAI_API_KEY
      ? 'openai'
      : 'none'
  const provider = String(process.env.AI_COACH_PROVIDER || fallbackProvider).trim().toLowerCase() || 'none'
  const apiKey = String(
    process.env.AI_COACH_API_KEY ||
      (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : '') ||
      (provider === 'openai' ? process.env.OPENAI_API_KEY : '')
  ).trim()
  const model = String(
    process.env.AI_COACH_MODEL ||
      (provider === 'openrouter' ? process.env.OPENROUTER_MODEL : '') ||
      (provider === 'openai' ? 'gpt-4o-mini' : '')
  ).trim()

  return {
    provider,
    configured: Boolean(apiKey),
    model: model || null
  }
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
    const database = await getDatabaseStats()
    sendJson(res, 200, {
      ok: true,
      service: 'gladiators-backend',
      database,
      uploadApiKeyEnabled: Boolean(String(process.env.GAME_UPLOAD_API_KEY || '').trim()),
      aiCoach: aiCoachStatus()
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to read backend health.'
    })
  }
}
