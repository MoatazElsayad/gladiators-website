export const rankLadder = [
  { name: 'Immortal', minScore: 9000 },
  { name: 'Legend', minScore: 6500 },
  { name: 'High Champion', minScore: 4500 },
  { name: 'Champion', minScore: 3200 },
  { name: 'Warlord', minScore: 2200 },
  { name: 'Elite Knight', minScore: 1400 },
  { name: 'Knight', minScore: 800 },
  { name: 'Gladiator', minScore: 400 },
  { name: 'Squire', minScore: 150 },
  { name: 'Wanderer', minScore: 0 }
]

export function rankNameForScore(score) {
  const safeScore = Math.max(0, Number(score || 0))
  return rankLadder.find((rank) => safeScore >= rank.minScore)?.name || 'Wanderer'
}

export function normalizeRankName(rankName, score = 0) {
  const cleaned = String(rankName || '').trim()
  const knownRank = rankLadder.find((rank) => rank.name.toLowerCase() === cleaned.toLowerCase())
  return knownRank?.name || rankNameForScore(score)
}

export function rankBadgeSrc(rankName) {
  const normalized = normalizeRankName(rankName)
  return `/ranks/${normalized.replace(/\s+/g, '_')}.png`
}
