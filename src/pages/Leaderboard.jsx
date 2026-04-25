import { motion } from 'framer-motion'
import { Crown, Search, ShieldAlert, Skull, Swords, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import LeaderboardTable from '../components/LeaderboardTable'
import { fetchJson } from '../lib/api'

const fallbackLeaderboard = [
  { rank: 1, username: 'Maximus Aurelius', score: 198450, wins: 126, matchesPlayed: 151, lastBattleAt: '2026-04-25T18:00:00Z', title: 'Champion of Gold', characterName: 'Knight' },
  { rank: 2, username: 'Spartacus Rex', score: 192130, wins: 121, matchesPlayed: 146, lastBattleAt: '2026-04-25T17:36:00Z', title: 'Breaker of Chains', characterName: 'Fantasy Warrior' },
  { rank: 3, username: 'Cassia Bloodborn', score: 187920, wins: 117, matchesPlayed: 141, lastBattleAt: '2026-04-25T17:00:00Z', title: 'Red Sand Empress', characterName: 'Huntress' },
  { rank: 4, username: 'Tiberius Vale', score: 182440, wins: 111, matchesPlayed: 136, lastBattleAt: '2026-04-25T16:00:00Z', title: 'Shield of Marble', characterName: 'Knight' },
  { rank: 5, username: 'Aurelia Vex', score: 176980, wins: 106, matchesPlayed: 130, lastBattleAt: '2026-04-25T15:00:00Z', title: 'Viper of Rome', characterName: 'Demon Slayer' }
]

const sortOptions = [
  { key: 'score', label: 'Sort by Score' },
  { key: 'wins', label: 'Sort by Wins' },
  { key: 'matchesPlayed', label: 'Sort by Matches' }
]

function formatLastBattle(value) {
  if (!value) {
    return 'No battles yet'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString()
}

function normalizeLeaderboardRows(rows) {
  return (rows || []).map((fighter, index) => ({
    rank: fighter.rank || index + 1,
    username: fighter.username || fighter.gladiator || 'Unknown Gladiator',
    characterName: fighter.characterName || 'Unknown',
    score: Number(fighter.score || 0),
    wins: Number(fighter.wins || 0),
    matchesPlayed: Number(fighter.matchesPlayed || 0),
    lastBattleAt: fighter.lastBattleAt || null,
    lastBattle: formatLastBattle(fighter.lastBattleAt),
    title: fighter.title || fighter.rankLabel || 'Arena Fighter'
  }))
}

export default function Leaderboard() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [showEliteOnly, setShowEliteOnly] = useState(false)
  const [rows, setRows] = useState(() => normalizeLeaderboardRows(fallbackLeaderboard))
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [dataSource, setDataSource] = useState('fallback')

  useEffect(() => {
    let cancelled = false

    async function loadLeaderboard() {
      setLoading(true)
      setErrorMessage('')

      try {
        const payload = await fetchJson('/api/leaderboard?limit=25')
        if (cancelled) {
          return
        }

        const normalizedRows = normalizeLeaderboardRows(payload.rows)
        setRows(normalizedRows)
        setDataSource('live')
      } catch (error) {
        if (cancelled) {
          return
        }

        setRows(normalizeLeaderboardRows(fallbackLeaderboard))
        setDataSource('fallback')
        setErrorMessage(error.message || 'Could not load the live leaderboard.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredFighters = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    let next = rows.filter((fighter) => {
      const usernameMatch = fighter.username.toLowerCase().includes(normalized)
      const characterMatch = fighter.characterName.toLowerCase().includes(normalized)
      return usernameMatch || characterMatch
    })

    if (showEliteOnly) {
      next = next.filter((fighter) => fighter.rank <= 3)
    }

    next = [...next].sort((a, b) => b[sortBy] - a[sortBy])

    return next.map((fighter, index) => ({
      ...fighter,
      displayRank: index + 1
    }))
  }, [rows, search, showEliteOnly, sortBy])

  const statCards = useMemo(() => {
    const sourceRows = rows.length > 0 ? rows : normalizeLeaderboardRows(fallbackLeaderboard)
    const highestScore = [...sourceRows].sort((a, b) => b.score - a.score)[0]
    const mostWins = [...sourceRows].sort((a, b) => b.wins - a.wins)[0]
    const totalMatches = sourceRows.reduce((sum, fighter) => sum + fighter.matchesPlayed, 0)

    return [
      {
        icon: Crown,
        label: 'Reigning Champion',
        value: highestScore?.username || 'Waiting for battles',
        subtext: highestScore ? `${highestScore.score.toLocaleString()} score` : 'No score uploaded yet'
      },
      {
        icon: Skull,
        label: 'Most Victories',
        value: mostWins ? mostWins.wins.toLocaleString() : '0',
        subtext: mostWins ? `${mostWins.username} leads the board` : 'No wins recorded yet'
      },
      {
        icon: Trophy,
        label: 'Total Matches Logged',
        value: totalMatches.toLocaleString(),
        subtext: dataSource === 'live' ? 'from the connected game backend' : 'from fallback showcase data'
      }
    ]
  }, [dataSource, rows])

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Hall Of Glory</p>
            <h1 className="mt-4 section-title">Arena Leaderboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
              Legendary names rise through the ranks below. This board now reads from the Gladiators backend,
              and falls back gracefully if the service is offline.
            </p>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-arena-gold" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search gladiator or character"
              className="w-full rounded-full border border-arena-bronzeLight/35 bg-arena-panel/85 py-3 pl-11 pr-4 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value, subtext }) => (
            <div key={label} className="panel-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">{label}</p>
                <div className="rounded-2xl border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-5 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
                {value}
              </p>
              <p className="mt-3 text-sm text-arena-sand">{subtext}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSortBy(option.key)}
              className={`ghost-button ${
                sortBy === option.key ? 'border-arena-gold/55 bg-arena-gold/12 text-arena-goldBright' : ''
              }`}
            >
              <Swords className="mr-2 h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEliteOnly((current) => !current)}
            className={`ghost-button ${
              showEliteOnly ? 'border-arena-bloodGlow/55 bg-arena-blood/12 text-[#ffd4d4]' : ''
            }`}
          >
            {showEliteOnly ? 'Showing Top 3' : 'Focus Top 3'}
          </button>
          <span className="status-pill border-arena-gold/40 bg-arena-gold/10 text-arena-goldBright">
            {loading ? 'Loading board...' : `${filteredFighters.length} visible warriors`}
          </span>
          <span
            className={`status-pill ${
              dataSource === 'live'
                ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                : 'border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4]'
            }`}
          >
            {dataSource === 'live' ? 'Live backend sync' : 'Fallback showcase data'}
          </span>
        </div>

        {errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-3xl border border-[#ffb3b3]/20 bg-[#6f1414]/20 px-5 py-4 text-sm text-[#ffd4d4]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="mt-8">
          {filteredFighters.length > 0 ? (
            <LeaderboardTable rows={filteredFighters} />
          ) : (
            <div className="panel-card p-10 text-center text-arena-sand">
              No gladiators matched that search. Try another name or clear the elite filter.
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
