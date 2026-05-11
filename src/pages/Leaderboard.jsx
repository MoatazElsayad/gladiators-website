import { motion } from 'framer-motion'
import { Crown, Search, ShieldAlert, Skull, Swords, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import LeaderboardTable from '../components/LeaderboardTable'
import { fetchJson } from '../lib/api'
import { normalizeRankName, rankBadgeSrc } from '../lib/ranks'

const fallbackLeaderboard = [
  { rank: 1, username: 'Maximus Aurelius', score: 9800, wins: 126, matchesPlayed: 151, lastBattleAt: '2026-04-25T18:00:00Z', title: 'Immortal', characterName: 'Knight' },
  { rank: 2, username: 'Spartacus Rex', score: 7200, wins: 121, matchesPlayed: 146, lastBattleAt: '2026-04-25T17:36:00Z', title: 'Legend', characterName: 'Fantasy Warrior' },
  { rank: 3, username: 'Cassia Bloodborn', score: 5100, wins: 117, matchesPlayed: 141, lastBattleAt: '2026-04-25T17:00:00Z', title: 'High Champion', characterName: 'Huntress' },
  { rank: 4, username: 'Tiberius Vale', score: 3500, wins: 111, matchesPlayed: 136, lastBattleAt: '2026-04-25T16:00:00Z', title: 'Champion', characterName: 'Knight' },
  { rank: 5, username: 'Aurelia Vex', score: 2400, wins: 106, matchesPlayed: 130, lastBattleAt: '2026-04-25T15:00:00Z', title: 'Warlord', characterName: 'Demon Slayer' }
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
  return (rows || []).map((fighter, index) => {
    const score = Number(fighter.score || 0)
    const title = normalizeRankName(fighter.title || fighter.rankLabel, score)

    return {
      rank: fighter.rank || index + 1,
      username: fighter.username || fighter.gladiator || 'Unknown Gladiator',
      characterName: fighter.characterName || 'Unknown',
      score,
      wins: Number(fighter.wins || 0),
      matchesPlayed: Number(fighter.matchesPlayed || 0),
      lastBattleAt: fighter.lastBattleAt || null,
      lastBattle: formatLastBattle(fighter.lastBattleAt),
      title,
      rankBadge: fighter.rankBadge || rankBadgeSrc(title)
    }
  })
}

function LeaderboardLadder({ fighters }) {
  if (fighters.length === 0) {
    return null
  }

  const podium = [fighters[1], fighters[0], fighters[2]].filter(Boolean)
  const ladderMeta = {
    1: {
      label: 'Champion',
      step: 'lg:order-2 lg:min-h-[23rem]',
      base: 'h-28 bg-gradient-to-t from-arena-gold/45 to-arena-gold/10 border-arena-gold/45',
      ring: 'border-arena-gold/60 bg-arena-gold/15 text-arena-goldBright'
    },
    2: {
      label: 'Second Step',
      step: 'lg:order-1 lg:min-h-[19rem] lg:mt-16',
      base: 'h-20 bg-gradient-to-t from-white/18 to-white/5 border-white/20',
      ring: 'border-white/30 bg-white/10 text-arena-parchment'
    },
    3: {
      label: 'Third Step',
      step: 'lg:order-3 lg:min-h-[17rem] lg:mt-24',
      base: 'h-16 bg-gradient-to-t from-[#CD7F32]/35 to-[#CD7F32]/10 border-[#CD7F32]/35',
      ring: 'border-[#CD7F32]/45 bg-[#CD7F32]/12 text-[#ffd7b2]'
    }
  }

  return (
    <div className="panel-card mt-8 overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Glory Ladder</p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.14em] text-arena-goldBright">
            Top Arena Steps
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-arena-sand">
          The leading fighter takes the highest step. Second and third flank the champion so the hierarchy reads at a glance.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:items-end">
        {podium.map((fighter) => {
          const rank = fighter.displayRank || fighter.rank
          const meta = ladderMeta[rank] || ladderMeta[3]

          return (
            <motion.article
              key={`${fighter.username}-podium`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: rank * 0.05 }}
              className={`flex flex-col justify-end rounded-[28px] border border-arena-bronzeLight/25 bg-arena-void/60 p-4 ${meta.step}`}
            >
              <div className="rounded-[24px] border border-arena-bronzeLight/25 bg-arena-panel/80 p-5 text-center">
                <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border text-lg font-bold ${meta.ring}`}>
                  #{rank}
                </div>
                <img
                  src={fighter.rankBadge}
                  alt={`${fighter.title} rank badge`}
                  className="mx-auto mt-4 h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(255,215,0,0.24)]"
                  loading="lazy"
                />
                <p className="mt-4 font-display text-2xl uppercase tracking-[0.14em] text-arena-goldBright">
                  {fighter.username}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-arena-sand">{meta.label}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-arena-bronzeLight/20 bg-arena-void/65 px-3 py-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-arena-sand">Score</p>
                    <p className="mt-1 font-semibold text-arena-parchment">{fighter.score.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-arena-bronzeLight/20 bg-arena-void/65 px-3 py-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-arena-sand">Wins</p>
                    <p className="mt-1 font-semibold text-arena-parchment">{fighter.wins}</p>
                  </div>
                </div>
              </div>
              <div className={`mt-4 rounded-t-[18px] border ${meta.base}`} />
            </motion.article>
          )
        })}
      </div>
    </div>
  )
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

        <LeaderboardLadder fighters={filteredFighters.slice(0, 3)} />

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
