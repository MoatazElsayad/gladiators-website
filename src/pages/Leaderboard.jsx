import { motion } from 'framer-motion'
import { Crown, Search, ShieldAlert, ShieldCheck, Skull, Sparkles, Swords, Trophy } from 'lucide-react'
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

const fallbackNormalizedRows = normalizeLeaderboardRows(fallbackLeaderboard)

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
  const logoPath = `${import.meta.env.BASE_URL}brand/logo.png`
  const shieldPath = `${import.meta.env.BASE_URL}brand/shield.png`

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

  const hasLiveRows = dataSource === 'live' && rows.length > 0
  const isLiveEmpty = dataSource === 'live' && rows.length === 0

  const statCards = useMemo(() => {
    const sourceRows = rows.length > 0
      ? rows
      : dataSource === 'fallback'
        ? fallbackNormalizedRows
        : []
    const highestScore = [...sourceRows].sort((a, b) => b.score - a.score)[0]
    const mostWins = [...sourceRows].sort((a, b) => b.wins - a.wins)[0]
    const totalMatches = sourceRows.reduce((sum, fighter) => sum + fighter.matchesPlayed, 0)

    return [
      {
        icon: Crown,
        label: 'Reigning Champion',
        value: highestScore?.username || 'Waiting for battles',
        subtext: highestScore ? `${highestScore.score.toLocaleString()} score` : 'No live score uploaded yet'
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

  const podiumFighters = useMemo(() => {
    const sourceRows = filteredFighters.length > 0 ? filteredFighters : rows
    return sourceRows.slice(0, 3)
  }, [filteredFighters, rows])

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel-card relative overflow-hidden p-7 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.14),transparent_32%),linear-gradient(135deg,rgba(92,64,51,0.2),transparent_50%)]" />
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-arena-gold/25 bg-arena-gold/10 shadow-gold">
                <img src={shieldPath} alt="Gladiators shield icon" className="h-14 w-14 object-contain" />
              </div>
              <div className="min-w-0">
                <img src={logoPath} alt="Gladiators logo" className="h-12 w-auto sm:h-14" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-arena-sand">Hall of Glory</p>
                <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.16em] text-arena-goldBright sm:text-4xl">
                  Arena Leaderboard
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
                  Clear, live, and built around the real game. This board tracks uploaded battle results,
                  highlights the strongest gladiators, and keeps the arena history easy to scan.
                </p>
              </div>
            </div>
          </div>

          <div className="panel-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Find a Warrior</p>
            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-arena-gold" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gladiator or character"
                className="w-full rounded-full border border-arena-bronzeLight/35 bg-arena-panel/85 py-3 pl-11 pr-4 text-arena-parchment outline-none transition focus:border-arena-gold/65"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
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
            <p className="mt-5 text-sm leading-7 text-arena-sand">
              Use the controls below to focus on the strongest three warriors or reorder the table by score,
              victories, or match count.
            </p>
          </div>
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

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-arena-sand">Champion Watch</p>
                <p className="mt-1 text-lg font-semibold text-arena-parchment">
                  {podiumFighters[0]?.username || 'No champion recorded yet'}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-arena-sand">
              {podiumFighters[0]
                ? `${podiumFighters[0].username} is currently leading with ${podiumFighters[0].score.toLocaleString()} score and ${podiumFighters[0].wins} wins.`
                : 'The production board is ready. As soon as the game uploads real battles, the top champion will appear here.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {podiumFighters.map((fighter, index) => (
              <div key={fighter.username} className="panel-card flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-arena-gold/35 bg-arena-gold/10 text-sm font-semibold text-arena-goldBright">
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-arena-parchment">{fighter.username}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-arena-sand">
                    {fighter.characterName} • {fighter.score.toLocaleString()} score
                  </p>
                </div>
              </div>
            ))}
            {podiumFighters.length === 0 && (
              <div className="panel-card flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-arena-bronzeLight/35 bg-arena-panel/80 text-arena-sand">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm leading-7 text-arena-sand">The podium will fill automatically once live battles are uploaded.</p>
              </div>
            )}
          </div>
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
            <div className="panel-card p-10">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-arena-gold/25 bg-arena-gold/10 shadow-gold">
                  <img src={shieldPath} alt="Gladiators shield icon" className="h-14 w-14 object-contain" />
                </div>
                <p className="mt-6 font-display text-2xl uppercase tracking-[0.14em] text-arena-goldBright">
                  {isLiveEmpty ? 'No Live Arena Records Yet' : 'No Matching Gladiators'}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-arena-sand">
                  {isLiveEmpty
                    ? 'The leaderboard connection is working, but no battle results have been uploaded yet. Finish one battle in the game and sync it to the website to populate this board.'
                    : 'No gladiators matched that search. Try another name, clear the search box, or turn off the top-three focus filter.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
