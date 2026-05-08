const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const initSqlJs = require('sql.js')

const dataDirectory = path.join(__dirname, 'data')
const databasePath = path.join(dataDirectory, 'gladiators.sqlite')

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true })
}

const dbReady = initializeDatabase()

async function initializeDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
  })

  const db = fs.existsSync(databasePath)
    ? new SQL.Database(fs.readFileSync(databasePath))
    : new SQL.Database()

  db.run('PRAGMA foreign_keys = ON;')
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      best_battle_duration_seconds REAL,
      current_rank_label TEXT NOT NULL DEFAULT 'Wanderer',
      rating_points INTEGER NOT NULL DEFAULT 0,
      last_character_type TEXT,
      last_match_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      mode TEXT NOT NULL,
      character_type TEXT,
      character_name TEXT,
      enemy_type TEXT,
      enemy_name TEXT,
      opponent_username TEXT,
      victory INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      damage_dealt INTEGER NOT NULL DEFAULT 0,
      damage_taken INTEGER NOT NULL DEFAULT 0,
      player_hp_end INTEGER,
      player_max_hp INTEGER,
      battle_duration_seconds REAL,
      level_index INTEGER,
      level_name TEXT,
      campaign_complete INTEGER NOT NULL DEFAULT 0,
      build_version TEXT,
      platform TEXT,
      played_at TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'desktop_game',
      created_at TEXT NOT NULL,
      FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_matches_player_id ON matches(player_id);
    CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_matches_mode ON matches(mode);
    CREATE INDEX IF NOT EXISTS idx_players_rating_points ON players(rating_points DESC, total_score DESC);
  `)

  ensureColumn(db, 'players', 'email', 'TEXT')
  ensureColumn(db, 'players', 'normalized_email', 'TEXT')
  ensureColumn(db, 'players', 'password_salt', 'TEXT')
  ensureColumn(db, 'players', 'password_hash', 'TEXT')
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_players_normalized_email ON players(normalized_email) WHERE normalized_email IS NOT NULL;')

  persistDatabase(db)
  return db
}

function persistDatabase(db) {
  fs.writeFileSync(databasePath, Buffer.from(db.export()))
}

function ensureColumn(db, tableName, columnName, columnDefinition) {
  const columns = getAll(db, `PRAGMA table_info(${tableName})`)
  if (!columns.some((column) => column.name === columnName)) {
    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`)
  }
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

function runStatement(db, sql, params = []) {
  const stmt = db.prepare(sql)
  try {
    stmt.run(params)
  } finally {
    stmt.free()
  }
}

function getOne(db, sql, params = []) {
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    if (stmt.step()) {
      return stmt.getAsObject()
    }
    return null
  } finally {
    stmt.free()
  }
}

function getAll(db, sql, params = []) {
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    const rows = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    return rows
  } finally {
    stmt.free()
  }
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
    toInteger(stats.total_score, 0) +
      toInteger(stats.wins, 0) * 250 +
      toInteger(stats.campaign_clears, 0) * 500 +
      toInteger(stats.lan_wins, 0) * 350 -
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

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password || ''), salt, 120000, 32, 'sha256').toString('hex')
  return { salt, hash }
}

function verifyPassword(password, salt, expectedHash) {
  if (!salt || !expectedHash) {
    return false
  }
  const { hash } = hashPassword(password, salt)
  const left = Buffer.from(hash, 'hex')
  const right = Buffer.from(String(expectedHash), 'hex')
  return left.length === right.length && crypto.timingSafeEqual(left, right)
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

async function upsertPlayerAndMatch(payload) {
  const db = await dbReady
  const safe = sanitizeBattlePayload(payload)
  const now = new Date().toISOString()
  const normalizedUsername = normalizeUsername(safe.player.username)

  db.run('BEGIN')

  try {
    let player = getOne(db, 'SELECT * FROM players WHERE normalized_username = ?', [normalizedUsername])

    if (!player) {
      runStatement(
        db,
        `
          INSERT INTO players (
            username,
            normalized_username,
            favorite_character,
            last_character_type,
            current_rank_label,
            last_match_at,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          safe.player.username,
          normalizedUsername,
          safe.player.characterName,
          safe.player.characterType,
          'Wanderer',
          safe.battle.playedAt,
          now,
          now
        ]
      )

      const inserted = getOne(db, 'SELECT last_insert_rowid() AS id')
      player = getOne(db, 'SELECT * FROM players WHERE id = ?', [inserted.id])
    }

    runStatement(
      db,
      `
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        player.id,
        safe.battle.mode,
        safe.player.characterType,
        safe.player.characterName,
        safe.battle.enemyType,
        safe.battle.enemyName,
        safe.battle.opponentUsername,
        safe.battle.victory ? 1 : 0,
        safe.battle.score,
        safe.battle.damageDealt,
        safe.battle.damageTaken,
        safe.battle.playerHpEnd,
        safe.battle.playerMaxHp,
        safe.battle.battleDurationSeconds,
        safe.battle.levelIndex,
        safe.battle.levelName,
        safe.battle.campaignComplete ? 1 : 0,
        safe.client.gameVersion,
        safe.client.platform,
        safe.battle.playedAt,
        'desktop_game',
        now
      ]
    )

    const nextTotalScore = safe.player.totalScore ?? (toInteger(player.total_score, 0) + safe.battle.score)
    const nextStats = {
      total_score: nextTotalScore,
      high_score: Math.max(toInteger(player.high_score, 0), safe.battle.score, nextTotalScore),
      wins: safe.player.wins ?? (toInteger(player.wins, 0) + (safe.battle.victory ? 1 : 0)),
      losses: safe.player.losses ?? (toInteger(player.losses, 0) + (safe.battle.victory ? 0 : 1)),
      matches_played: safe.player.matchesPlayed ?? (toInteger(player.matches_played, 0) + 1),
      campaign_clears: toInteger(player.campaign_clears, 0) + (safe.battle.campaignComplete ? 1 : 0),
      lan_wins:
        toInteger(player.lan_wins, 0) +
        (safe.battle.mode === 'lan_duel' && safe.battle.victory ? 1 : 0),
      lan_losses:
        toInteger(player.lan_losses, 0) +
        (safe.battle.mode === 'lan_duel' && !safe.battle.victory ? 1 : 0),
      damage_dealt_total: toInteger(player.damage_dealt_total, 0) + safe.battle.damageDealt,
      damage_taken_total: toInteger(player.damage_taken_total, 0) + safe.battle.damageTaken,
      best_battle_duration_seconds:
        toFloat(player.best_battle_duration_seconds, 0) === 0
          ? safe.battle.battleDurationSeconds
          : Math.min(toFloat(player.best_battle_duration_seconds, 0), safe.battle.battleDurationSeconds)
    }

    const ratingPoints = calculateRatingPoints(nextStats)
    const rankLabel = rankLabelForScore(nextStats.total_score)

    runStatement(
      db,
      `
        UPDATE players
        SET
          username = ?,
          favorite_character = COALESCE(?, favorite_character),
          total_score = ?,
          high_score = ?,
          wins = ?,
          losses = ?,
          matches_played = ?,
          campaign_clears = ?,
          lan_wins = ?,
          lan_losses = ?,
          damage_dealt_total = ?,
          damage_taken_total = ?,
          best_battle_duration_seconds = ?,
          current_rank_label = ?,
          rating_points = ?,
          last_character_type = COALESCE(?, last_character_type),
          last_match_at = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [
        safe.player.username,
        safe.player.characterName,
        nextStats.total_score,
        nextStats.high_score,
        nextStats.wins,
        nextStats.losses,
        nextStats.matches_played,
        nextStats.campaign_clears,
        nextStats.lan_wins,
        nextStats.lan_losses,
        nextStats.damage_dealt_total,
        nextStats.damage_taken_total,
        nextStats.best_battle_duration_seconds,
        rankLabel,
        ratingPoints,
        safe.player.characterType,
        safe.battle.playedAt,
        now,
        player.id
      ]
    )

    const updatedPlayer = getOne(db, 'SELECT * FROM players WHERE id = ?', [player.id])
    db.run('COMMIT')
    persistDatabase(db)

    return {
      username: updatedPlayer.username,
      totalScore: updatedPlayer.total_score,
      highScore: updatedPlayer.high_score,
      wins: updatedPlayer.wins,
      losses: updatedPlayer.losses,
      matchesPlayed: updatedPlayer.matches_played,
      campaignClears: updatedPlayer.campaign_clears,
      lanWins: updatedPlayer.lan_wins,
      lanLosses: updatedPlayer.lan_losses,
      rankingPoints: updatedPlayer.rating_points,
      rankLabel: updatedPlayer.current_rank_label,
      rankBadge: rankBadgeForLabel(rankLabelForScore(updatedPlayer.total_score)),
      lastBattleAt: updatedPlayer.last_match_at
    }
  } catch (error) {
    try {
      db.run('ROLLBACK')
    } catch (_) {
      // Rollback is best effort; the original database error is more useful.
    }
    throw error
  }
}

async function getLeaderboard(options = {}) {
  const db = await dbReady
  const limit = Math.min(Math.max(toInteger(options.limit, 25), 1), 100)
  const mode = String(options.mode || 'global').trim()
  const range = String(options.range || 'all').trim().toLowerCase()

  if (range === 'week' || range === '7d') {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const params = [weekStart]
    let query = `
      SELECT
        p.username,
        COALESCE(MAX(m.character_name), p.favorite_character, p.last_character_type, 'Unknown') AS character_name,
        SUM(m.score) AS score,
        SUM(CASE WHEN m.victory = 1 THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN m.victory = 0 THEN 1 ELSE 0 END) AS losses,
        COUNT(*) AS matches_played,
        MAX(m.played_at) AS last_battle_at,
        SUM(CASE WHEN m.campaign_complete = 1 THEN 1 ELSE 0 END) AS campaign_clears,
        SUM(CASE WHEN m.mode = 'lan_duel' AND m.victory = 1 THEN 1 ELSE 0 END) AS lan_wins
      FROM matches m
      JOIN players p ON p.id = m.player_id
      WHERE m.played_at >= ?
    `

    if (mode !== 'global') {
      query += ' AND m.mode = ?'
      params.push(mode)
    }

    query += `
      GROUP BY p.id
      ORDER BY
        (
          SUM(m.score)
          + SUM(CASE WHEN m.victory = 1 THEN 250 ELSE -50 END)
          + SUM(CASE WHEN m.campaign_complete = 1 THEN 500 ELSE 0 END)
          + SUM(CASE WHEN m.mode = 'lan_duel' AND m.victory = 1 THEN 350 ELSE 0 END)
        ) DESC,
        SUM(m.score) DESC,
        MAX(m.played_at) DESC
      LIMIT ?
    `

    params.push(limit)

    const rows = getAll(db, query, params)
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

  const rows = getAll(
    db,
    `
      SELECT *
      FROM players
      ORDER BY rating_points DESC, total_score DESC, wins DESC, last_match_at DESC
      LIMIT ?
    `,
    [limit]
  )

  return rows.map((row, index) => ({
    rank: index + 1,
    username: row.username,
    characterName: row.favorite_character || row.last_character_type || 'Unknown',
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

async function getRecentMatches(limit = 20) {
  const db = await dbReady
  return getAll(
    db,
    `
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
      LIMIT ?
    `,
    [Math.min(Math.max(toInteger(limit, 20), 1), 100)]
  ).map((row) => ({
    id: toInteger(row.id, 0),
    username: row.username,
    mode: row.mode,
    characterType: row.character_type,
    characterName: row.character_name,
    enemyType: row.enemy_type,
    enemyName: row.enemy_name,
    opponentUsername: row.opponent_username,
    victory: Boolean(toInteger(row.victory, 0)),
    score: toInteger(row.score, 0),
    damageDealt: toInteger(row.damage_dealt, 0),
    damageTaken: toInteger(row.damage_taken, 0),
    playerHpEnd: toInteger(row.player_hp_end, 0),
    playerMaxHp: toInteger(row.player_max_hp, 0),
    battleDurationSeconds: toFloat(row.battle_duration_seconds, 0),
    levelIndex: toInteger(row.level_index, 0),
    levelName: row.level_name,
    campaignComplete: Boolean(toInteger(row.campaign_complete, 0)),
    playedAt: row.played_at
  }))
}

async function getPlayerProfile(username) {
  const db = await dbReady
  const normalized = normalizeUsername(username)
  if (!normalized) {
    return null
  }

  const player = getOne(db, 'SELECT * FROM players WHERE normalized_username = ?', [normalized])
  if (!player) {
    return null
  }

  const recentMatches = getAll(
    db,
    `
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
      WHERE player_id = ?
      ORDER BY played_at DESC, id DESC
      LIMIT 10
    `,
    [player.id]
  ).map((row) => ({
    id: toInteger(row.id, 0),
    mode: row.mode,
    characterType: row.character_type,
    characterName: row.character_name,
    enemyType: row.enemy_type,
    enemyName: row.enemy_name,
    opponentUsername: row.opponent_username,
    victory: Boolean(toInteger(row.victory, 0)),
    score: toInteger(row.score, 0),
    damageDealt: toInteger(row.damage_dealt, 0),
    damageTaken: toInteger(row.damage_taken, 0),
    battleDurationSeconds: toFloat(row.battle_duration_seconds, 0),
    levelIndex: toInteger(row.level_index, 0),
    levelName: row.level_name,
    campaignComplete: Boolean(toInteger(row.campaign_complete, 0)),
    playedAt: row.played_at
  }))

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
    recentMatches
  }
}

async function getDatabaseStats() {
  const db = await dbReady
  const playerCount = getOne(db, 'SELECT COUNT(*) AS count FROM players').count
  const matchCount = getOne(db, 'SELECT COUNT(*) AS count FROM matches').count

  return {
    databasePath,
    playerCount: toInteger(playerCount, 0),
    matchCount: toInteger(matchCount, 0)
  }
}

async function registerWebsiteAccount({ email, username, password }) {
  const db = await dbReady
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

  const emailPlayer = getOne(db, 'SELECT * FROM players WHERE normalized_email = ? LIMIT 1', [normalizedEmail])
  if (emailPlayer && normalizeUsername(emailPlayer.username) !== normalizedUsername) {
    throw new Error('That email is already registered.')
  }

  const existing = getOne(db, 'SELECT * FROM players WHERE normalized_username = ? LIMIT 1', [normalizedUsername])
  if (existing && existing.password_hash && normalizeUsername(existing.email) !== normalizedEmail) {
    throw new Error('That username is already registered.')
  }

  const { salt, hash } = hashPassword(cleanPassword)
  const now = new Date().toISOString()

  if (existing) {
    runStatement(
      db,
      `
        UPDATE players
        SET username = ?,
            email = ?,
            normalized_email = ?,
            password_salt = ?,
            password_hash = ?,
            updated_at = ?
        WHERE id = ?
      `,
      [cleanUsername, cleanEmail, normalizedEmail, salt, hash, now, existing.id]
    )
    persistDatabase(db)
    return mapAuthPlayer(getOne(db, 'SELECT * FROM players WHERE id = ? LIMIT 1', [existing.id]))
  }

  runStatement(
    db,
    `
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [cleanUsername, normalizedUsername, cleanEmail, normalizedEmail, salt, hash, 'Wanderer', now, now]
  )
  persistDatabase(db)
  return mapAuthPlayer(getOne(db, 'SELECT * FROM players WHERE normalized_username = ? LIMIT 1', [normalizedUsername]))
}

async function authenticateWebsiteAccount({ identity, password }) {
  const db = await dbReady
  const normalizedIdentity = normalizeUsername(identity)

  if (!normalizedIdentity || !password) {
    throw new Error('Username/email and password are required.')
  }

  const player = getOne(
    db,
    'SELECT * FROM players WHERE normalized_username = ? OR normalized_email = ? LIMIT 1',
    [normalizedIdentity, normalizedIdentity]
  )

  if (!player || !verifyPassword(password, player.password_salt, player.password_hash)) {
    throw new Error('Invalid username/email or password.')
  }

  return mapAuthPlayer(player)
}

async function getAuthPlayerById(id) {
  const db = await dbReady
  const playerId = Math.max(0, toInteger(id, 0))
  if (!playerId) {
    return null
  }

  return mapAuthPlayer(getOne(db, 'SELECT * FROM players WHERE id = ? LIMIT 1', [playerId]))
}

module.exports = {
  databasePath,
  authenticateWebsiteAccount,
  getDatabaseStats,
  getAuthPlayerById,
  getLeaderboard,
  getPlayerProfile,
  getRecentMatches,
  registerWebsiteAccount,
  upsertPlayerAndMatch
}
