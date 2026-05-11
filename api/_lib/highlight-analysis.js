function formatAttackType(attackType, wasProjectile) {
  const key = String(attackType || '').trim().toLowerCase()
  const label =
    key === 'attack_3' ? 'Attack 3' : key === 'attack_2' ? 'Attack 2' : 'Attack 1'

  return wasProjectile ? `${label} projectile` : label
}

function percent(value, max) {
  if (!max) {
    return 0
  }
  return Math.round((Math.max(0, value) / Math.max(1, max)) * 100)
}

function toStringArray(value, fallback = []) {
  if (!Array.isArray(value)) {
    return fallback
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 4)
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

function ruleBasedAnalysis(highlight, overrides = {}) {
  const attackLabel = formatAttackType(highlight.attackType, highlight.wasProjectile)
  const playerHpPct = percent(highlight.playerHpBefore, highlight.playerMaxHp)
  const enemyDrop = Math.max(0, highlight.enemyHpBefore - highlight.enemyHpAfter)
  const strengths = []
  const mistakes = []

  if (highlight.wasProjectile) {
    strengths.push('You used range well instead of forcing a risky close entry.')
  } else {
    strengths.push('You committed at melee range, which suits a clean punish window.')
  }

  if (highlight.wasFinisher) {
    strengths.push('You converted the opening into a finishing blow instead of letting the rival reset.')
  } else if (highlight.enemyHpAfter <= Math.max(1, Math.floor(highlight.enemyHpBefore * 0.35))) {
    strengths.push('You pushed the opponent into critical health and kept momentum on your side.')
  } else {
    strengths.push('The hit was efficient damage and kept your pressure meaningful.')
  }

  if (playerHpPct <= 35) {
    strengths.push('This happened under pressure, so the decision shows composure at low health.')
  }

  if (highlight.wasProjectile) {
    mistakes.push('Make sure the ranged hit leads into position advantage instead of a neutral reset.')
  } else {
    mistakes.push('After a strong melee hit, be careful not to swing immediately into panic retaliation.')
  }

  if (!highlight.wasFinisher) {
    mistakes.push('The next layer is planning the follow-up so the rival cannot fully recover after this moment.')
  }

  if (highlight.damage < 18) {
    mistakes.push('The contact was clean, but the damage was modest, so spacing into a heavier route may pay off.')
  }

  let title = 'Well-timed arena punish'
  if (highlight.wasFinisher) {
    title = highlight.wasProjectile ? 'Closing projectile punish' : 'Finishing strike under control'
  } else if (highlight.wasProjectile) {
    title = 'Spacing win from range'
  } else if (highlight.attackType === 'attack_3') {
    title = 'Heavy commitment paid off'
  }

  const summary = `${highlight.characterName} landed ${attackLabel} for ${highlight.damage} damage against ${highlight.enemyName}. ${
    highlight.wasFinisher
      ? 'The exchange ended the fight immediately.'
      : `The hit carved out ${enemyDrop} health and shifted the pace in your favor.`
  }`

  const coachTip = highlight.wasProjectile
    ? 'After a ranged confirm, step into the space you just earned so the next decision stays yours.'
    : highlight.wasFinisher
      ? 'Keep looking for this same punish timing, but do not rush the first swing that creates it.'
      : 'Treat this kind of opening as a two-step sequence: land the hit, then claim the next space before attacking again.'
  const timingNote = highlight.wasFinisher
    ? 'The decisive hit landed before the opponent could reset their guard.'
    : 'The hit timing was useful, but the follow-up window matters more than the first contact.'
  const spacingNote = highlight.wasProjectile
    ? 'You created value from range; keep enough distance to make the next projectile or step-in safe.'
    : 'You were close enough to confirm melee damage, so leave yourself room to recover after the swing.'
  const attackChoiceNote = highlight.attackType === 'attack_3'
    ? 'The heavy option paid off because the opening was already real.'
    : highlight.attackType === 'attack_2'
      ? 'Attack 2 was a good middle route: stronger than a poke without fully overcommitting.'
      : 'Attack 1 was safe, but look for chances to route into a stronger punish.'
  const riskNote = playerHpPct <= 35
    ? 'Low health made the exchange dangerous; one mistimed recovery could have flipped the round.'
    : 'The main risk is swinging again before confirming the opponent recovery state.'
  const nextDrill = highlight.wasProjectile
    ? 'Practice: land a ranged hit, step forward once, then wait half a beat before the next action.'
    : 'Practice: after a melee hit, backstep once and re-enter only if the opponent whiffs.'

  return {
    status: 'complete',
    title,
    summary,
    strengths: strengths.slice(0, 3),
    mistakes: mistakes.slice(0, 3),
    coachTip,
    model: overrides.model || 'rule-based',
    isVisual: Boolean(overrides.isVisual),
    providerError: overrides.providerError || '',
    timingNote,
    spacingNote,
    attackChoiceNote,
    riskNote,
    nextDrill
  }
}

function providerConfig() {
  const fallbackProvider = process.env.OPENROUTER_API_KEY
    ? 'openrouter'
    : process.env.OPENAI_API_KEY
      ? 'openai'
      : 'none'
  const provider = String(process.env.AI_COACH_PROVIDER || fallbackProvider).trim().toLowerCase()
  const apiKey = String(
    process.env.AI_COACH_API_KEY ||
      (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : '') ||
      (provider === 'openai' ? process.env.OPENAI_API_KEY : '')
  ).trim()
  if (!apiKey || provider === 'none') {
    return null
  }

  if (provider === 'openrouter') {
    const models = uniqueStrings([
      process.env.AI_COACH_MODEL,
      process.env.OPENROUTER_MODEL,
      process.env.OPENROUTER_FALLBACK_MODEL,
      process.env.OPENROUTER_SECOND_FALLBACK_MODEL,
      process.env.OPENROUTER_THIRD_FALLBACK_MODEL,
      process.env.OPENROUTER_FOURTH_FALLBACK_MODEL,
      'openai/gpt-4o-mini'
    ])

    return {
      provider,
      baseUrl: String(process.env.AI_COACH_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, ''),
      model: models[0] || 'openai/gpt-4o-mini',
      models,
      apiKey,
      siteUrl: String(process.env.OPENROUTER_SITE_URL || '').trim(),
      appTitle: String(process.env.OPENROUTER_APP_TITLE || 'Gladiators AI Coach').trim()
    }
  }

  if (provider === 'openai') {
    return {
      provider,
      baseUrl: String(process.env.AI_COACH_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
      model: String(process.env.AI_COACH_MODEL || 'gpt-4o-mini').trim(),
      models: uniqueStrings([process.env.AI_COACH_MODEL, 'gpt-4o-mini']),
      apiKey,
      siteUrl: '',
      appTitle: ''
    }
  }

  return null
}

async function fetchPrivateBlobAsDataUrl(url, contentType) {
  if (!url) {
    return ''
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN || ''}`
    }
  })

  if (!response.ok) {
    throw new Error('Could not load replay for visual analysis.')
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:${contentType || response.headers.get('content-type') || 'image/jpeg'};base64,${buffer.toString('base64')}`
}

function extractJson(text) {
  const raw = String(text || '').trim()
  if (!raw) {
    throw new Error('AI response was empty.')
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1))
    }
    throw error
  }
}

function sanitizeAiAnalysis(parsed, highlight, config) {
  const fallback = ruleBasedAnalysis(highlight)
  const timingNote = String(parsed.timingNote || parsed.timing_note || '').trim()
  const spacingNote = String(parsed.spacingNote || parsed.spacing_note || '').trim()
  const attackChoiceNote = String(parsed.attackChoiceNote || parsed.attack_choice_note || '').trim()
  const riskNote = String(parsed.riskNote || parsed.risk_note || '').trim()
  const nextDrill = String(parsed.nextDrill || parsed.next_drill || '').trim()

  const coachTip = String(parsed.coachTip || parsed.coach_tip || fallback.coachTip).trim()

  return {
    status: 'complete',
    title: String(parsed.title || fallback.title).trim(),
    summary: String(parsed.summary || fallback.summary).trim(),
    strengths: toStringArray(parsed.strengths, fallback.strengths),
    mistakes: toStringArray(parsed.mistakes, fallback.mistakes),
    coachTip,
    model: config.model,
    isVisual: true,
    providerError: '',
    timingNote: timingNote || fallback.timingNote,
    spacingNote: spacingNote || fallback.spacingNote,
    attackChoiceNote: attackChoiceNote || fallback.attackChoiceNote,
    riskNote: riskNote || fallback.riskNote,
    nextDrill: nextDrill || fallback.nextDrill
  }
}

async function visualProviderAnalysis(highlight, config, model) {
  const dataUrl = await fetchPrivateBlobAsDataUrl(
    highlight.clipSheetUrl || highlight.imageUrl,
    highlight.clipSheetContentType || highlight.imageContentType || 'image/jpeg'
  )

  const metadata = {
    characterName: highlight.characterName,
    enemyName: highlight.enemyName,
    mode: highlight.mode,
    attackType: highlight.attackType,
    damage: highlight.damage,
    wasProjectile: highlight.wasProjectile,
    wasFinisher: highlight.wasFinisher,
    playerHpBefore: highlight.playerHpBefore,
    playerHpAfter: highlight.playerHpAfter,
    playerMaxHp: highlight.playerMaxHp,
    enemyHpBefore: highlight.enemyHpBefore,
    enemyHpAfter: highlight.enemyHpAfter,
    clipKind: highlight.clipKind,
    clipFrameCount: highlight.clipFrameCount,
    clipFps: highlight.clipFps
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.provider === 'openrouter' && config.siteUrl ? { 'HTTP-Referer': config.siteUrl } : {}),
      ...(config.provider === 'openrouter' && config.appTitle ? { 'X-Title': config.appTitle } : {})
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 700,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise fighting-game coach for a 2D gladiator game. Return only valid JSON with keys: title, summary, strengths, mistakes, coachTip, timingNote, spacingNote, attackChoiceNote, riskNote, nextDrill. strengths and mistakes must be arrays of short strings. timingNote, spacingNote, attackChoiceNote, riskNote, nextDrill must each be one short actionable sentence.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this 4-second sprite-sheet replay. It is ordered left-to-right, top-to-bottom at ${highlight.clipFps || 10} FPS. Use the metadata and visible spacing/timing. Metadata: ${JSON.stringify(metadata)}`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ]
    })
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    let errorText = ''
    try {
      errorText = await response.text()
    } catch (error) {
      errorText = ''
    }
    throw new Error(`AI coach provider failed for ${model} with status ${response.status}. ${errorText}`.trim())
  }

  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content
  return sanitizeAiAnalysis(extractJson(content), highlight, { ...config, model })
}

export async function analyzeBattleHighlight(highlight) {
  const config = providerConfig()
  if (!config || !highlight.clipSheetUrl) {
    return ruleBasedAnalysis(highlight)
  }

  const errors = []
  for (const model of config.models || [config.model]) {
    try {
      return await visualProviderAnalysis(highlight, config, model)
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? `AI coach provider timed out for ${model}.`
        : error?.message || `AI coach provider failed for ${model}.`
      errors.push(message)
      console.error('AI coach provider failed', {
        model,
        highlightId: highlight.id,
        message
      })
    }
  }

  const providerError = errors.join(' | ').slice(0, 900)
  try {
    return ruleBasedAnalysis(highlight, {
      model: `${config.model}:fallback`,
      isVisual: false,
      providerError
    })
  } catch (error) {
    return ruleBasedAnalysis(highlight)
  }
}
