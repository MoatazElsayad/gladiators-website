import { neon } from '@neondatabase/serverless'
import { hashPassword, verifyPassword } from './auth.js'

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
          current_rank_label TEXT NOT NULL DEFAULT 'Wanderer',
          rating_points INTEGER NOT NULL DEFAULT 0,
          last_character_type TEXT,
          last_match_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `

      await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS email TEXT;`
      await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS normalized_email TEXT;`
      await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS password_salt TEXT;`
      await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS password_hash TEXT;`

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

      await sql`
        CREATE TABLE IF NOT EXISTS battle_highlights (
          id SERIAL PRIMARY KEY,
          player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
          mode TEXT NOT NULL,
          character_type TEXT,
          character_name TEXT,
          enemy_type TEXT,
          enemy_name TEXT,
          victory BOOLEAN NOT NULL DEFAULT FALSE,
          battle_duration_seconds DOUBLE PRECISION,
          score INTEGER NOT NULL DEFAULT 0,
          attack_type TEXT NOT NULL,
          damage INTEGER NOT NULL DEFAULT 0,
          was_projectile BOOLEAN NOT NULL DEFAULT FALSE,
          was_finisher BOOLEAN NOT NULL DEFAULT FALSE,
          highlight_score INTEGER NOT NULL DEFAULT 0,
          player_hp_before INTEGER,
          player_hp_after INTEGER,
          player_max_hp INTEGER,
          enemy_hp_before INTEGER,
          enemy_hp_after INTEGER,
          level_index INTEGER,
          level_name TEXT,
          image_url TEXT NOT NULL,
          image_content_type TEXT,
          clip_sheet_url TEXT,
          clip_sheet_content_type TEXT,
          clip_kind TEXT,
          clip_frame_count INTEGER,
          clip_fps INTEGER,
          clip_frame_width INTEGER,
          clip_frame_height INTEGER,
          clip_duration_seconds DOUBLE PRECISION,
          analysis_status TEXT NOT NULL DEFAULT 'pending',
          analysis_title TEXT,
          analysis_summary TEXT,
          analysis_strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
          analysis_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
          analysis_coach_tip TEXT,
          analysis_model TEXT,
          analysis_is_visual BOOLEAN NOT NULL DEFAULT FALSE,
          analysis_provider_error TEXT,
          analysis_timing_note TEXT,
          analysis_spacing_note TEXT,
          analysis_attack_choice_note TEXT,
          analysis_risk_note TEXT,
          analysis_next_drill TEXT,
          captured_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `

      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_sheet_url TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_sheet_content_type TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_kind TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_frame_count INTEGER;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_fps INTEGER;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_frame_width INTEGER;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_frame_height INTEGER;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS clip_duration_seconds DOUBLE PRECISION;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_model TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_is_visual BOOLEAN NOT NULL DEFAULT FALSE;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_provider_error TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_timing_note TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_spacing_note TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_attack_choice_note TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_risk_note TEXT;`
      await sql`ALTER TABLE battle_highlights ADD COLUMN IF NOT EXISTS analysis_next_drill TEXT;`

      await sql`CREATE INDEX IF NOT EXISTS idx_matches_player_id ON matches(player_id);`
      await sql`CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);`
      await sql`CREATE INDEX IF NOT EXISTS idx_matches_mode ON matches(mode);`
      await sql`CREATE INDEX IF NOT EXISTS idx_players_rating_points ON players(rating_points DESC, total_score DESC);`
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_players_normalized_email ON players(normalized_email) WHERE normalized_email IS NOT NULL;`
      await sql`CREATE INDEX IF NOT EXISTS idx_battle_highlights_player_id ON battle_highlights(player_id);`
      await sql`CREATE INDEX IF NOT EXISTS idx_battle_highlights_captured_at ON battle_highlights(captured_at DESC, id DESC);`
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

function optionalNonNegativeInteger(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null
  }

  return Math.max(0, toInteger(value, 0))
}

function toIsoDate(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : fallback
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }
  return parsed.toISOString()
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed)
        ? parsed.map((item) => String(item || '').trim()).filter(Boolean)
        : []
    } catch (error) {
      return []
    }
  }

  return []
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
      characterName: String(player.characterName || '').trim() || null,
      totalScore: optionalNonNegativeInteger(player.totalScore),
      wins: optionalNonNegativeInteger(player.wins),
      losses: optionalNonNegativeInteger(player.losses),
      matchesPlayed: optionalNonNegativeInteger(player.matchesPlayed),
      rankLabel: String(player.rankLabel || '').trim() || null
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

function rankLabelForScore(score) {
  const safeScore = Math.max(0, toInteger(score, 0))
  if (safeScore >= 9000) return 'Immortal'
  if (safeScore >= 6500) return 'Legend'
  if (safeScore >= 4500) return 'High Champion'
  if (safeScore >= 3200) return 'Champion'
  if (safeScore >= 2200) return 'Warlord'
  if (safeScore >= 1400) return 'Elite Knight'
  if (safeScore >= 800) return 'Knight'
  if (safeScore >= 400) return 'Gladiator'
  if (safeScore >= 150) return 'Squire'
  return 'Wanderer'
}

function rankBadgeForLabel(rankLabel) {
  const safeRank = String(rankLabel || 'Wanderer').trim() || 'Wanderer'
  return `/ranks/${safeRank.replace(/\s+/g, '_')}.png`
}

function mapAuthPlayer(row) {
  if (!row) {
    return null
  }

  return {
    id: toInteger(row.id, 0),
    username: row.username,
    email: row.email || '',
    favoriteCharacter: row.favorite_character || row.last_character_type || '',
    totalScore: toInteger(row.total_score, 0),
    wins: toInteger(row.wins, 0),
    losses: toInteger(row.losses, 0),
    matchesPlayed: toInteger(row.matches_played, 0),
    rankLabel: rankLabelForScore(row.total_score),
    rankBadge: rankBadgeForLabel(rankLabelForScore(row.total_score)),
    lastBattleAt: row.last_match_at
  }
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
    rankLabel: rankLabelForScore(row.total_score),
    rankBadge: rankBadgeForLabel(rankLabelForScore(row.total_score)),
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
        ${'Wanderer'},
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

  const nextTotalScore = safe.player.totalScore ?? (toInteger(player.total_score, 0) + safe.battle.score)
  const nextStats = {
    totalScore: nextTotalScore,
    highScore: Math.max(toInteger(player.high_score, 0), safe.battle.score, nextTotalScore),
    wins: safe.player.wins ?? (toInteger(player.wins, 0) + (safe.battle.victory ? 1 : 0)),
    losses: safe.player.losses ?? (toInteger(player.losses, 0) + (safe.battle.victory ? 0 : 1)),
    matchesPlayed: safe.player.matchesPlayed ?? (toInteger(player.matches_played, 0) + 1),
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
  const rankLabel = rankLabelForScore(nextStats.totalScore)

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

export async function registerWebsiteAccount({ email, username, password }) {
  await ensureSchema()
  const sql = getSqlClient()
  const cleanEmail = String(email || '').trim()
  const cleanUsername = String(username || '').trim()
  const cleanPassword = String(password || '')
  const normalizedUsername = normalizeUsername(cleanUsername)
  const normalizedEmail = normalizeUsername(cleanEmail)

  if (!cleanEmail || !cleanUsername || !cleanPassword) {
    throw new Error('email, username, and password are required.')
  }
  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long.')
  }
  if (cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  const emailRows = await sql`
    SELECT *
    FROM players
    WHERE normalized_email = ${normalizedEmail}
    LIMIT 1;
  `
  if (emailRows[0] && normalizeUsername(emailRows[0].username) !== normalizedUsername) {
    throw new Error('That email is already registered.')
  }

  const playerRows = await sql`
    SELECT *
    FROM players
    WHERE normalized_username = ${normalizedUsername}
    LIMIT 1;
  `

  const existing = playerRows[0]
  if (existing?.password_hash && normalizeUsername(existing.email) !== normalizedEmail) {
    throw new Error('That username is already registered.')
  }

  const { salt, hash } = hashPassword(cleanPassword)
  const now = new Date().toISOString()

  if (existing) {
    const updatedRows = await sql`
      UPDATE players
      SET
        username = ${cleanUsername},
        email = ${cleanEmail},
        normalized_email = ${normalizedEmail},
        password_salt = ${salt},
        password_hash = ${hash},
        updated_at = ${now}
      WHERE id = ${existing.id}
      RETURNING *;
    `
    return mapAuthPlayer(updatedRows[0])
  }

  const insertedRows = await sql`
    INSERT INTO players (
      username,
      normalized_username,
      email,
      normalized_email,
      password_salt,
      password_hash,
      current_rank_label,
      created_at,
      updated_at
    ) VALUES (
      ${cleanUsername},
      ${normalizedUsername},
      ${cleanEmail},
      ${normalizedEmail},
      ${salt},
      ${hash},
      ${'Wanderer'},
      ${now},
      ${now}
    )
    RETURNING *;
  `

  return mapAuthPlayer(insertedRows[0])
}

export async function authenticateWebsiteAccount({ identity, password }) {
  await ensureSchema()
  const sql = getSqlClient()
  const normalizedIdentity = normalizeUsername(identity)

  if (!normalizedIdentity || !password) {
    throw new Error('Username/email and password are required.')
  }

  const rows = await sql`
    SELECT *
    FROM players
    WHERE normalized_username = ${normalizedIdentity}
       OR normalized_email = ${normalizedIdentity}
    LIMIT 1;
  `
  const player = rows[0]

  if (!player || !verifyPassword(password, player.password_salt, player.password_hash)) {
    throw new Error('Invalid username/email or password.')
  }

  return mapAuthPlayer(player)
}

export async function getAuthPlayerById(id) {
  await ensureSchema()
  const sql = getSqlClient()
  const playerId = Math.max(0, toInteger(id, 0))
  if (!playerId) {
    return null
  }

  const rows = await sql`
    SELECT *
    FROM players
    WHERE id = ${playerId}
    LIMIT 1;
  `

  return mapAuthPlayer(rows[0])
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
        title: rankLabelForScore(row.score),
        rankBadge: rankBadgeForLabel(rankLabelForScore(row.score)),
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
    title: rankLabelForScore(row.total_score),
    rankBadge: rankBadgeForLabel(rankLabelForScore(row.total_score)),
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
    rankLabel: rankLabelForScore(player.total_score),
    rankBadge: rankBadgeForLabel(rankLabelForScore(player.total_score)),
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

function mapHighlightRow(row) {
  return {
    id: toInteger(row.id, 0),
    username: row.username,
    mode: row.mode,
    characterType: row.character_type,
    characterName: row.character_name,
    enemyType: row.enemy_type,
    enemyName: row.enemy_name,
    victory: Boolean(row.victory),
    battleDurationSeconds: toFloat(row.battle_duration_seconds, 0),
    score: toInteger(row.score, 0),
    attackType: row.attack_type,
    damage: toInteger(row.damage, 0),
    wasProjectile: Boolean(row.was_projectile),
    wasFinisher: Boolean(row.was_finisher),
    highlightScore: toInteger(row.highlight_score, 0),
    playerHpBefore: toInteger(row.player_hp_before, 0),
    playerHpAfter: toInteger(row.player_hp_after, 0),
    playerMaxHp: toInteger(row.player_max_hp, 0),
    enemyHpBefore: toInteger(row.enemy_hp_before, 0),
    enemyHpAfter: toInteger(row.enemy_hp_after, 0),
    levelIndex: toInteger(row.level_index, 0),
    levelName: row.level_name,
    imageUrl: row.image_url,
    imageContentType: row.image_content_type,
    clipSheetUrl: row.clip_sheet_url || '',
    clipSheetContentType: row.clip_sheet_content_type || '',
    clipKind: row.clip_kind || '',
    clipFrameCount: toInteger(row.clip_frame_count, 0),
    clipFps: toInteger(row.clip_fps, 0),
    clipFrameWidth: toInteger(row.clip_frame_width, 0),
    clipFrameHeight: toInteger(row.clip_frame_height, 0),
    clipDurationSeconds: toFloat(row.clip_duration_seconds, 0),
    analysisStatus: row.analysis_status || 'pending',
    analysisTitle: row.analysis_title || '',
    analysisSummary: row.analysis_summary || '',
    analysisStrengths: toStringArray(row.analysis_strengths),
    analysisMistakes: toStringArray(row.analysis_mistakes),
    analysisCoachTip: row.analysis_coach_tip || '',
    analysisModel: row.analysis_model || '',
    analysisIsVisual: Boolean(row.analysis_is_visual),
    analysisProviderError: row.analysis_provider_error || '',
    analysisTimingNote: row.analysis_timing_note || '',
    analysisSpacingNote: row.analysis_spacing_note || '',
    analysisAttackChoiceNote: row.analysis_attack_choice_note || '',
    analysisRiskNote: row.analysis_risk_note || '',
    analysisNextDrill: row.analysis_next_drill || '',
    capturedAt: row.captured_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export async function createBattleHighlight(payload) {
  await ensureSchema()
  const sql = getSqlClient()
  const now = new Date().toISOString()
  const username = String(payload.username || '').trim()
  const normalizedUsername = normalizeUsername(username)

  if (!normalizedUsername) {
    throw new Error('username is required.')
  }

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
        created_at,
        updated_at
      ) VALUES (
        ${username},
        ${normalizedUsername},
        ${payload.characterName || null},
        ${payload.characterType || null},
        ${'Wanderer'},
        ${now},
        ${now}
      )
      RETURNING *;
    `

    player = insertedRows[0]
  }

  const insertedRows = await sql`
    INSERT INTO battle_highlights (
      player_id,
      match_id,
      mode,
      character_type,
      character_name,
      enemy_type,
      enemy_name,
      victory,
      battle_duration_seconds,
      score,
      attack_type,
      damage,
      was_projectile,
      was_finisher,
      highlight_score,
      player_hp_before,
      player_hp_after,
      player_max_hp,
      enemy_hp_before,
      enemy_hp_after,
      level_index,
      level_name,
      image_url,
      image_content_type,
      clip_sheet_url,
      clip_sheet_content_type,
      clip_kind,
      clip_frame_count,
      clip_fps,
      clip_frame_width,
      clip_frame_height,
      clip_duration_seconds,
      analysis_status,
      captured_at,
      created_at,
      updated_at
    ) VALUES (
      ${player.id},
      ${payload.matchId || null},
      ${payload.mode},
      ${payload.characterType || null},
      ${payload.characterName || null},
      ${payload.enemyType || null},
      ${payload.enemyName || null},
      ${Boolean(payload.victory)},
      ${toFloat(payload.battleDurationSeconds, 0)},
      ${toInteger(payload.score, 0)},
      ${payload.attackType},
      ${toInteger(payload.damage, 0)},
      ${Boolean(payload.wasProjectile)},
      ${Boolean(payload.wasFinisher)},
      ${toInteger(payload.highlightScore, 0)},
      ${optionalNonNegativeInteger(payload.playerHpBefore)},
      ${optionalNonNegativeInteger(payload.playerHpAfter)},
      ${optionalNonNegativeInteger(payload.playerMaxHp)},
      ${optionalNonNegativeInteger(payload.enemyHpBefore)},
      ${optionalNonNegativeInteger(payload.enemyHpAfter)},
      ${optionalNonNegativeInteger(payload.levelIndex)},
      ${payload.levelName || null},
      ${payload.imageUrl},
      ${payload.imageContentType || null},
      ${payload.clipSheetUrl || null},
      ${payload.clipSheetContentType || null},
      ${payload.clipKind || null},
      ${optionalNonNegativeInteger(payload.clipFrameCount)},
      ${optionalNonNegativeInteger(payload.clipFps)},
      ${optionalNonNegativeInteger(payload.clipFrameWidth)},
      ${optionalNonNegativeInteger(payload.clipFrameHeight)},
      ${toFloat(payload.clipDurationSeconds, 0) || null},
      ${payload.analysisStatus || 'pending'},
      ${toIsoDate(payload.capturedAt)},
      ${now},
      ${now}
    )
    RETURNING *;
  `

  await sql`
    UPDATE players
    SET
      username = ${username},
      favorite_character = ${payload.characterName || player.favorite_character},
      last_character_type = ${payload.characterType || player.last_character_type},
      updated_at = ${now}
    WHERE id = ${player.id};
  `

  const row = insertedRows[0]
  return {
    ...mapHighlightRow({ ...row, username }),
    playerId: toInteger(player.id, 0)
  }
}

export async function getHighlightsForPlayer(username, limit = 8) {
  await ensureSchema()
  const sql = getSqlClient()
  const normalized = normalizeUsername(username)

  if (!normalized) {
    return []
  }

  const rows = await sql`
    SELECT
      h.*,
      p.username
    FROM battle_highlights h
    JOIN players p ON p.id = h.player_id
    WHERE p.normalized_username = ${normalized}
      AND h.victory = TRUE
    ORDER BY h.captured_at DESC, h.id DESC
    LIMIT ${Math.min(Math.max(toInteger(limit, 8), 1), 8)};
  `

  return rows.map((row) => mapHighlightRow(row))
}

export async function pruneHighlightsForPlayer(playerId, keepCount = 8) {
  await ensureSchema()
  const sql = getSqlClient()
  const safePlayerId = Math.max(0, toInteger(playerId, 0))
  const safeKeepCount = Math.min(Math.max(toInteger(keepCount, 8), 1), 8)

  if (!safePlayerId) {
    return { deletedCount: 0, assetUrls: [] }
  }

  const deletedRows = await sql`
    WITH old_highlights AS (
      SELECT id
      FROM battle_highlights
      WHERE player_id = ${safePlayerId}
      ORDER BY captured_at DESC, id DESC
      OFFSET ${safeKeepCount}
    )
    DELETE FROM battle_highlights h
    USING old_highlights o
    WHERE h.id = o.id
    RETURNING h.image_url, h.clip_sheet_url;
  `

  return {
    deletedCount: deletedRows.length,
    assetUrls: deletedRows
      .flatMap((row) => [row.image_url, row.clip_sheet_url])
      .filter(Boolean)
  }
}

export async function getHighlightById(id) {
  await ensureSchema()
  const sql = getSqlClient()
  const highlightId = Math.max(0, toInteger(id, 0))
  if (!highlightId) {
    return null
  }

  const rows = await sql`
    SELECT
      h.*,
      p.username
    FROM battle_highlights h
    JOIN players p ON p.id = h.player_id
    WHERE h.id = ${highlightId}
      AND h.victory = TRUE
    LIMIT 1;
  `

  return rows[0] ? mapHighlightRow(rows[0]) : null
}

export async function saveHighlightAnalysis(id, analysis) {
  await ensureSchema()
  const sql = getSqlClient()
  const highlightId = Math.max(0, toInteger(id, 0))
  if (!highlightId) {
    throw new Error('Highlight id is required.')
  }

  const updatedRows = await sql`
    UPDATE battle_highlights
    SET
      analysis_status = ${analysis?.status || 'complete'},
      analysis_title = ${analysis?.title || null},
      analysis_summary = ${analysis?.summary || null},
      analysis_strengths = ${JSON.stringify(toStringArray(analysis?.strengths))}::jsonb,
      analysis_mistakes = ${JSON.stringify(toStringArray(analysis?.mistakes))}::jsonb,
      analysis_coach_tip = ${analysis?.coachTip || null},
      analysis_model = ${analysis?.model || null},
      analysis_is_visual = ${Boolean(analysis?.isVisual)},
      analysis_provider_error = ${analysis?.providerError || null},
      analysis_timing_note = ${analysis?.timingNote || null},
      analysis_spacing_note = ${analysis?.spacingNote || null},
      analysis_attack_choice_note = ${analysis?.attackChoiceNote || null},
      analysis_risk_note = ${analysis?.riskNote || null},
      analysis_next_drill = ${analysis?.nextDrill || null},
      updated_at = ${new Date().toISOString()}
    WHERE id = ${highlightId}
    RETURNING *;
  `

  if (!updatedRows[0]) {
    return null
  }

  const rows = await sql`
    SELECT
      h.*,
      p.username
    FROM battle_highlights h
    JOIN players p ON p.id = h.player_id
    WHERE h.id = ${highlightId}
    LIMIT 1;
  `

  return rows[0] ? mapHighlightRow(rows[0]) : null
}
