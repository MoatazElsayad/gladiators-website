import { getDatabaseStats } from './_lib/leaderboard-store.js'
import { getQueryParam, handlePreflight, sendJson } from './_lib/http.js'

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

async function checkAiCoachConnection() {
  const status = aiCoachStatus()
  if (!status.configured || status.provider === 'none') {
    return {
      ...status,
      ok: false,
      message: 'AI coach provider is not configured.'
    }
  }

  const apiKey = String(
    process.env.AI_COACH_API_KEY ||
      (status.provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : '') ||
      (status.provider === 'openai' ? process.env.OPENAI_API_KEY : '')
  ).trim()
  const baseUrl = String(
    process.env.AI_COACH_BASE_URL ||
      (status.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1')
  ).replace(/\/+$/, '')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(status.provider === 'openrouter' && process.env.OPENROUTER_SITE_URL
          ? { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL }
          : {}),
        ...(status.provider === 'openrouter'
          ? { 'X-Title': process.env.OPENROUTER_APP_TITLE || 'Gladiators AI Coach' }
          : {})
      },
      body: JSON.stringify({
        model: status.model,
        max_tokens: 40,
        messages: [
          {
            role: 'user',
            content: 'Reply with JSON only: {"ok":true,"service":"ai-coach"}'
          }
        ]
      })
    })
    const raw = await response.text()
    let parsed = null
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      parsed = null
    }

    return {
      ...status,
      ok: response.ok,
      statusCode: response.status,
      message: parsed?.error?.message || parsed?.choices?.[0]?.message?.content || raw.slice(0, 300)
    }
  } catch (error) {
    return {
      ...status,
      ok: false,
      statusCode: 0,
      message: error?.name === 'AbortError' ? 'AI coach provider health check timed out.' : error.message
    }
  } finally {
    clearTimeout(timeout)
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
    const aiCoach = getQueryParam(req, 'checkAi') === '1' ? await checkAiCoachConnection() : aiCoachStatus()
    sendJson(res, 200, {
      ok: true,
      service: 'gladiators-backend',
      database,
      uploadApiKeyEnabled: Boolean(String(process.env.GAME_UPLOAD_API_KEY || '').trim()),
      aiCoach
    })
  } catch (error) {
    const statusCode = error.message?.includes('DATABASE_URL') ? 503 : 500
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Failed to read backend health.'
    })
  }
}
