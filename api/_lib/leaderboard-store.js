import { neon } from '@neondatabase/serverless'

function getDatabaseUrl() {
  return String(process.env.DATABASE_URL || '').trim()
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured. Connect a Neon Postgres database in Vercel before using the live leaderboard API.'
    )
  }

  return neon(databaseUrl)
}

let schemaReadyPromise = null

async function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSqlClient()

      await sql`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          normalized_username TEXT NOT NULL UNIQUE,
          avatar_path TEXT,
          favorite_character TEXT,
          total_score INTEGER NOT NULL DEFAULT 0,
          high_score INTEGER NOT NULL DEFAULT 0,
          wins INTEGER NOT NULL DEFAULT 0,
          losses INTEGER NOT NULL DEFAULT 0,
          matches_played INTEGER NOT NULL DEFAULT 0,
          campaign_clears INTEGER NOT NULL DEFAULT 0,
          lan_wins INTEGER NOT NULL DEFAULT 0,
          lan_losses INTEGER NOT NULL DEFAULT 0,
          damage_dealt_total INTEGER NOT NULL DEFAULT 0,
          damage_taken_total INTEGER NOT NULL DEFAULT 0,
          best_battle_duration_seconds DOUBLE PRECISION,
          current_rank_label TEXT NOT NULL DEFAULT 'Rookie',
          rating_points INTEGER NOT NULL DEFAULT 0,
          last_character_type TEXT,
          last_match_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS matches (
          id SERIAL PRIMARY KEY,
          player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          mode TEXT NOT NULL,
          character_type TEXT,
          character_name TEXT,
          enemy_type TEXT,
          enemy_name TEXT,
          opponent_username TEXT,
          victory BOOLEAN NOT NULL DEFAULT FALSE,
          score INTEGER NOT NULL DEFAULT 0,
          damage_dealt INTEGER NOT NULL DEFAULT 0,
          damage_taken INTEGER NOT NULL DEFAULT 0,
          player_hp_end INTEGER,
          player_max_hp INTEGER,
          battle_duration_seconds DOUBLE PRECISION,
          level_index INTEGER,
          level_name TEXT,
          campaign_complete BOOLEAN NOT NULL DEFAULT FALSE,
          build_version TEXT,
          platform TEXT,
          played_at TIMESTAMPTZ NOT NULL,
          source TEXT NOT NULL DEFAULT 'desktop_game',
          created_at TIMESTAMPTZ NOT NULL
        );
      `

      await sql`CREATE INDEX IF NOT EXISTS idx_matches_player_id ON matches(player_id);`
      await sql`CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);`
      await sql`CREATE INDEX IF NOT EXISTS idx_matches_mode ON matches(mode);`
      await sql`CREATE INDEX IF NOT EXISTS idx_players_rating_points ON players(rating_points DESC, total_score DESC);`
    })().catch((error) => {
      schemaReadyPromise = null
      throw error
    })
  }

  await schemaReadyPromise
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase()
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toFloat(value, fallback = 0) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toIsoDate(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : fallback
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }
  return parsed.toISOString()
}

function sanitizeBattlePayload(payload) {
  const body = payload || {}
  const player = body.player || {}
  const battle = body.battle || {}
  const client = body.client || {}

  const username = String(player.username || '').trim()
  if (!username) {
    throw new Error('player.username is required.')
  }

  return {
    player: {
      username,
      characterType: String(player.characterType || '').trim() || null,
      characterName: String(player.characterName || '').trim() || null
    },
    battle: {
      mode: String(battle.mode || 'save_the_king').trim() || 'save_the_king',
      levelIndex: toInteger(battle.levelIndex, 0),
      levelName: String(battle.levelName || '').trim() || null,
      enemyType: String(battle.enemyType || '').trim() || null,
      enemyName: String(battle.enemyName || '').trim() || null,
      opponentUsername: String(battle.opponentUsername || '').trim() || null,
      victory: Boolean(battle.victory),
      score: Math.max(0, toInteger(battle.score, 0)),
      damageDealt: Math.max(0, toInteger(battle.damageDealt, 0)),
      damageTaken: Math.max(0, toInteger(battle.damageTaken, 0)),
      playerHpEnd: toInteger(battle.playerHpEnd, 0),
      playerMaxHp: toInteger(battle.playerMaxHp, 0),
      battleDurationSeconds: Math.max(0, toFloat(battle.battleDurationSeconds, 0)),
      campaignComplete: Boolean(battle.campaignComplete),
      playedAt: toIsoDate(battle.playedAt)
    },
    client: {
      gameVersion: String(client.gameVersion || '').trim() || null,
      platform: String(client.platform || '').trim() || null
    }
  }
}

function calculateRatingPoints(stats) {
  return Math.max(
    0,
    toInteger(stats.totalScore, 0) +
      toInteger(stats.wins, 0) * 250 +
      toInteger(stats.campaignClears, 0) * 500 +
      toInteger(stats.lanWins, 0) * 350 -
      toInteger(stats.losses, 0) * 50
  )
}

function rankLabelForPoints(points) {
  if (points >= 25000) return 'Champion of Gold'
  if (points >= 14000) return 'Arena Elite'
  if (points >= 7000) return 'Battle Master'
  if (points >= 2500) return 'Rising Contender'
  return 'Rookie'
}

function mapPlayerSummary(row) {
  return {
    username: row.username,
    totalScore: toInteger(row.total_score, 0),
    highScore: toInteger(row.high_score, 0),
    wins: toInteger(row.wins, 0),
    losses: toInteger(row.losses, 0),
    matchesPlayed: toInteger(row.matches_played, 0),
    campaignClears: toInteger(row.campaign_clears, 0),
    lanWins: toInteger(row.lan_wins, 0),
    lanLosses: toInteger(row.lan_losses, 0),
    rankingPoints: toInteger(row.rating_points, 0),
    rankLabel: row.current_rank_label,
    lastBattleAt: row.last_match_at
  }
}

export async function getDatabaseStats() {
  await ensureSchema()
  const sql = getSqlClient()

  const playerRows = await sql`SELECT COUNT(*)::int AS count FROM players;`
  const matchRows = await sql`SELECT COUNT(*)::int AS count FROM matches;`

  return {
    provider: 'neon-postgres',
    databaseConfigured: true,
    playerCount: toInteger(playerRows[0]?.count, 0),
    matchCount: toInteger(matchRows[0]?.count, 0)
  }
}

export async function upsertPlayerAndMatch(payload) {
  await ensureSchema()
  const sql = getSqlClient()
  const safe = sanitizeBattlePayload(payload)
  const now = new Date().toISOString()
  const normalizedUsername = normalizeUsername(safe.player.username)

  let playerRows = await sql`
    SELECT *
    FROM players
    WHERE normalized_username = ${normalizedUsername}
    LIMIT 1;
  `

  let player = playerRows[0]

  if (!player) {
    const insertedRows = await sql`
      INSERT INTO players (
        username,
        normalized_username,
        favorite_character,
        last_character_type,
        current_rank_label,
        last_match_at,
        created_at,
        updated_at
      ) VALUES (
        ${safe.player.username},
        ${normalizedUsername},
        ${safe.player.characterName},
        ${safe.player.characterType},
        ${'Rookie'},
        ${safe.battle.playedAt},
        ${now},
        ${now}
      )
      RETURNING *;
    `

    player = insertedRows[0]
  }

  await sql`
    INSERT INTO matches (
      player_id,
      mode,
      character_type,
      character_name,
      enemy_type,
      enemy_name,
      opponent_username,
      victory,
      score,
      damage_dealt,
      damage_taken,
      player_hp_end,
      player_max_hp,
      battle_duration_seconds,
      level_index,
      level_name,
      campaign_complete,
      build_version,
      platform,
      played_at,
      source,
      created_at
    ) VALUES (
      ${player.id},
      ${safe.battle.mode},
      ${safe.player.characterType},
      ${safe.player.characterName},
      ${safe.battle.enemyType},
      ${safe.battle.enemyName},
      ${safe.battle.opponentUsername},
      ${safe.battle.victory},
      ${safe.battle.score},
      ${safe.battle.damageDealt},
      ${safe.battle.damageTaken},
      ${safe.battle.playerHpEnd},
      ${safe.battle.playerMaxHp},
      ${safe.battle.battleDurationSeconds},
      ${safe.battle.levelIndex},
      ${safe.battle.levelName},
      ${safe.battle.campaignComplete},
      ${safe.client.gameVersion},
      ${safe.client.platform},
      ${safe.battle.playedAt},
      ${'desktop_game'},
      ${now}
    );
  `

  const nextStats = {
    totalScore: toInteger(player.total_score, 0) + safe.battle.score,
    highScore: Math.max(toInteger(player.high_score, 0), safe.battle.score),
    wins: toInteger(player.wins, 0) + (safe.battle.victory ? 1 : 0),
    losses: toInteger(player.losses, 0) + (safe.battle.victory ? 0 : 1),
    matchesPlayed: toInteger(player.matches_played, 0) + 1,
    campaignClears: toInteger(player.campaign_clears, 0) + (safe.battle.campaignComplete ? 1 : 0),
    lanWins: toInteger(player.lan_wins, 0) + (safe.battle.mode === 'lan_duel' && safe.battle.victory ? 1 : 0),
    lanLosses: toInteger(player.lan_losses, 0) + (safe.battle.mode === 'lan_duel' && !safe.battle.victory ? 1 : 0),
    damageDealtTotal: toInteger(player.damage_dealt_total, 0) + safe.battle.damageDealt,
    damageTakenTotal: toInteger(player.damage_taken_total, 0) + safe.battle.damageTaken,
    bestBattleDurationSeconds:
      toFloat(player.best_battle_duration_seconds, 0) === 0
        ? safe.battle.battleDurationSeconds
        : Math.min(toFloat(player.best_battle_duration_seconds, 0), safe.battle.battleDurationSeconds)
  }

  const ratingPoints = calculateRatingPoints(nextStats)
  const rankLabel = rankLabelForPoints(ratingPoints)

  const updatedRows = await sql`
    UPDATE players
    SET
      username = ${safe.player.username},
      favorite_character = ${safe.player.characterName || player.favorite_character},
      total_score = ${nextStats.totalScore},
      high_score = ${nextStats.highScore},
      wins = ${nextStats.wins},
      losses = ${nextStats.losses},
      matches_played = ${nextStats.matchesPlayed},
      campaign_clears = ${nextStats.campaignClears},
      lan_wins = ${nextStats.lanWins},
      lan_losses = ${nextStats.lanLosses},
      damage_dealt_total = ${nextStats.damageDealtTotal},
      damage_taken_total = ${nextStats.damageTakenTotal},
      best_battle_duration_seconds = ${nextStats.bestBattleDurationSeconds},
      current_rank_label = ${rankLabel},
      rating_points = ${ratingPoints},
      last_character_type = ${safe.player.characterType || player.last_character_type},
      last_match_at = ${safe.battle.playedAt},
      updated_at = ${now}
    WHERE id = ${player.id}
    RETURNING *;
  `

  return mapPlayerSummary(updatedRows[0])
}

export async function getLeaderboard(options = {}) {
  await ensureSchema()
  const sql = getSqlClient()
  const limit = Math.min(Math.max(toInteger(options.limit, 25), 1), 100)
  const mode = String(options.mode || 'global').trim()
  const range = String(options.range || 'all').trim().toLowerCase()

  if (range === 'week' || range === '7d') {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const rows =
      mode === 'global'
        ? await sql`
            SELECT
              p.username,
              COALESCE(MAX(m.character_name), p.favorite_character, p.last_character_type, 'Unknown') AS character_name,
              SUM(m.score)::int AS score,
              SUM(CASE WHEN m.victory THEN 1 ELSE 0 END)::int AS wins,
              SUM(CASE WHEN m.victory THEN 0 ELSE 1 END)::int AS losses,
              COUNT(*)::int AS matches_played,
              MAX(m.played_at) AS last_battle_at,
              SUM(CASE WHEN m.campaign_complete THEN 1 ELSE 0 END)::int AS campaign_clears,
              SUM(CASE WHEN m.mode = 'lan_duel' AND m.victory THEN 1 ELSE 0 END)::int AS lan_wins
            FROM matches m
            JOIN players p ON p.id = m.player_id
            WHERE m.played_at >= ${weekStart}
            GROUP BY p.id
            ORDER BY
              (
                SUM(m.score)
                + SUM(CASE WHEN m.victory THEN 250 ELSE -50 END)
                + SUM(CASE WHEN m.campaign_complete THEN 500 ELSE 0 END)
                + SUM(CASE WHEN m.mode = 'lan_duel' AND m.victory THEN 350 ELSE 0 END)
              ) DESC,
              SUM(m.score) DESC,
              MAX(m.played_at) DESC
            LIMIT ${limit};
          `
        : await sql`
            SELECT
              p.username,
              COALESCE(MAX(m.character_name), p.favorite_character, p.last_character_type, 'Unknown') AS character_name,
              SUM(m.score)::int AS score,
              SUM(CASE WHEN m.victory THEN 1 ELSE 0 END)::int AS wins,
              SUM(CASE WHEN m.victory THEN 0 ELSE 1 END)::int AS losses,
              COUNT(*)::int AS matches_played,
              MAX(m.played_at) AS last_battle_at,
              SUM(CASE WHEN m.campaign_complete THEN 1 ELSE 0 END)::int AS campaign_clears,
              SUM(CASE WHEN m.mode = 'lan_duel' AND m.victory THEN 1 ELSE 0 END)::int AS lan_wins
            FROM matches m
            JOIN players p ON p.id = m.player_id
            WHERE m.played_at >= ${weekStart} AND m.mode = ${mode}
            GROUP BY p.id
            ORDER BY
              (
                SUM(m.score)
                + SUM(CASE WHEN m.victory THEN 250 ELSE -50 END)
                + SUM(CASE WHEN m.campaign_complete THEN 500 ELSE 0 END)
                + SUM(CASE WHEN m.mode = 'lan_duel' AND m.victory THEN 350 ELSE 0 END)
              ) DESC,
              SUM(m.score) DESC,
              MAX(m.played_at) DESC
            LIMIT ${limit};
          `

    return rows.map((row, index) => {
      const rankingPoints =
        toInteger(row.score, 0) +
        toInteger(row.wins, 0) * 250 +
        toInteger(row.campaign_clears, 0) * 500 +
        toInteger(row.lan_wins, 0) * 350 -
        toInteger(row.losses, 0) * 50

      return {
        rank: index + 1,
        username: row.username,
        characterName: row.character_name,
        score: toInteger(row.score, 0),
        rankingPoints,
        wins: toInteger(row.wins, 0),
        losses: toInteger(row.losses, 0),
        matchesPlayed: toInteger(row.matches_played, 0),
        title: rankLabelForPoints(rankingPoints),
        lastBattleAt: row.last_battle_at
      }
    })
  }

  const rows = await sql`
    SELECT
      username,
      COALESCE(favorite_character, last_character_type, 'Unknown') AS character_name,
      total_score,
      rating_points,
      wins,
      losses,
      matches_played,
      current_rank_label,
      last_match_at
    FROM players
    ORDER BY rating_points DESC, total_score DESC, wins DESC, last_match_at DESC NULLS LAST
    LIMIT ${limit};
  `

  return rows.map((row, index) => ({
    rank: index + 1,
    username: row.username,
    characterName: row.character_name,
    score: toInteger(row.total_score, 0),
    rankingPoints: toInteger(row.rating_points, 0),
    wins: toInteger(row.wins, 0),
    losses: toInteger(row.losses, 0),
    matchesPlayed: toInteger(row.matches_played, 0),
    title: row.current_rank_label,
    lastBattleAt: row.last_match_at
  }))
}

export async function getRecentMatches(limit = 20) {
  await ensureSchema()
  const sql = getSqlClient()
  const rows = await sql`
    SELECT
      m.id,
      p.username,
      m.mode,
      m.character_type,
      m.character_name,
      m.enemy_type,
      m.enemy_name,
      m.opponent_username,
      m.victory,
      m.score,
      m.damage_dealt,
      m.damage_taken,
      m.player_hp_end,
      m.player_max_hp,
      m.battle_duration_seconds,
      m.level_index,
      m.level_name,
      m.campaign_complete,
      m.played_at
    FROM matches m
    JOIN players p ON p.id = m.player_id
    ORDER BY m.played_at DESC, m.id DESC
    LIMIT ${Math.min(Math.max(toInteger(limit, 20), 1), 100)};
  `

  return rows.map((row) => ({
    id: toInteger(row.id, 0),
    username: row.username,
    mode: row.mode,
    characterType: row.character_type,
    characterName: row.character_name,
    enemyType: row.enemy_type,
    enemyName: row.enemy_name,
    opponentUsername: row.opponent_username,
    victory: Boolean(row.victory),
    score: toInteger(row.score, 0),
    damageDealt: toInteger(row.damage_dealt, 0),
    damageTaken: toInteger(row.damage_taken, 0),
    playerHpEnd: toInteger(row.player_hp_end, 0),
    playerMaxHp: toInteger(row.player_max_hp, 0),
    battleDurationSeconds: toFloat(row.battle_duration_seconds, 0),
    levelIndex: toInteger(row.level_index, 0),
    levelName: row.level_name,
    campaignComplete: Boolean(row.campaign_complete),
    playedAt: row.played_at
  }))
}

export async function getPlayerProfile(username) {
  await ensureSchema()
  const sql = getSqlClient()
  const normalized = normalizeUsername(username)
  if (!normalized) {
    return null
  }

  const playerRows = await sql`
    SELECT *
    FROM players
    WHERE normalized_username = ${normalized}
    LIMIT 1;
  `

  const player = playerRows[0]
  if (!player) {
    return null
  }

  const recentRows = await sql`
    SELECT
      id,
      mode,
      character_type,
      character_name,
      enemy_type,
      enemy_name,
      opponent_username,
      victory,
      score,
      damage_dealt,
      damage_taken,
      battle_duration_seconds,
      level_index,
      level_name,
      campaign_complete,
      played_at
    FROM matches
    WHERE player_id = ${player.id}
    ORDER BY played_at DESC, id DESC
    LIMIT 10;
  `

  return {
    username: player.username,
    favoriteCharacter: player.favorite_character || player.last_character_type,
    totalScore: toInteger(player.total_score, 0),
    highScore: toInteger(player.high_score, 0),
    wins: toInteger(player.wins, 0),
    losses: toInteger(player.losses, 0),
    matchesPlayed: toInteger(player.matches_played, 0),
    campaignClears: toInteger(player.campaign_clears, 0),
    lanWins: toInteger(player.lan_wins, 0),
    lanLosses: toInteger(player.lan_losses, 0),
    damageDealtTotal: toInteger(player.damage_dealt_total, 0),
    damageTakenTotal: toInteger(player.damage_taken_total, 0),
    bestBattleDurationSeconds: toFloat(player.best_battle_duration_seconds, 0),
    rankingPoints: toInteger(player.rating_points, 0),
    rankLabel: player.current_rank_label,
    lastBattleAt: player.last_match_at,
    recentMatches: recentRows.map((row) => ({
      id: toInteger(row.id, 0),
      mode: row.mode,
      characterType: row.character_type,
      characterName: row.character_name,
      enemyType: row.enemy_type,
      enemyName: row.enemy_name,
      opponentUsername: row.opponent_username,
      victory: Boolean(row.victory),
      score: toInteger(row.score, 0),
      damageDealt: toInteger(row.damage_dealt, 0),
      damageTaken: toInteger(row.damage_taken, 0),
      battleDurationSeconds: toFloat(row.battle_duration_seconds, 0),
      levelIndex: toInteger(row.level_index, 0),
      levelName: row.level_name,
      campaignComplete: Boolean(row.campaign_complete),
      playedAt: row.played_at
    }))
  }
}
