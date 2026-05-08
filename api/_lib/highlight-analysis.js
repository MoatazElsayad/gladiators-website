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

export async function analyzeBattleHighlight(highlight) {
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

  return {
    status: 'complete',
    title,
    summary,
    strengths: strengths.slice(0, 3),
    mistakes: mistakes.slice(0, 3),
    coachTip
  }
}
