import { motion } from 'framer-motion'
import { Crown, Search, Skull, Swords, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import LeaderboardTable from '../components/LeaderboardTable'

const initialLeaderboard = [
  { rank: 1, gladiator: 'Maximus Aurelius', score: 198450, wins: 126, kills: 584, lastBattle: '18 minutes ago', title: 'Champion of Gold' },
  { rank: 2, gladiator: 'Spartacus Rex', score: 192130, wins: 121, kills: 553, lastBattle: '42 minutes ago', title: 'Breaker of Chains' },
  { rank: 3, gladiator: 'Cassia Bloodborn', score: 187920, wins: 117, kills: 540, lastBattle: '1 hour ago', title: 'Red Sand Empress' },
  { rank: 4, gladiator: 'Tiberius Vale', score: 182440, wins: 111, kills: 503, lastBattle: '2 hours ago', title: 'Shield of Marble' },
  { rank: 5, gladiator: 'Aurelia Vex', score: 176980, wins: 106, kills: 487, lastBattle: '3 hours ago', title: 'Viper of Rome' },
  { rank: 6, gladiator: 'Draven of Carthage', score: 171620, wins: 101, kills: 459, lastBattle: '5 hours ago', title: 'Ashblade' },
  { rank: 7, gladiator: 'Lucian Emberhand', score: 165830, wins: 96, kills: 432, lastBattle: 'Today at dawn', title: 'Firecaster' },
  { rank: 8, gladiator: 'Nyra the Huntress', score: 160410, wins: 92, kills: 411, lastBattle: 'Today at sunrise', title: 'Spear of Dawn' },
  { rank: 9, gladiator: 'Valerius Thorn', score: 154970, wins: 88, kills: 389, lastBattle: 'Yesterday', title: 'Arena Whisper' },
  { rank: 10, gladiator: 'Sabina Ironveil', score: 149680, wins: 84, kills: 366, lastBattle: 'Yesterday', title: 'Bronze Widow' },
  { rank: 11, gladiator: 'Ragnar Colosseum', score: 143920, wins: 80, kills: 342, lastBattle: '2 days ago', title: 'Northern Roar' },
  { rank: 12, gladiator: 'Octavia Noctis', score: 138740, wins: 76, kills: 321, lastBattle: '2 days ago', title: 'Moon Fang' },
  { rank: 13, gladiator: 'Kael Warcrest', score: 133580, wins: 73, kills: 307, lastBattle: '3 days ago', title: 'Broken Standard' },
  { rank: 14, gladiator: 'Selene Ashspear', score: 128460, wins: 69, kills: 294, lastBattle: '4 days ago', title: 'Silver Hunt' },
  { rank: 15, gladiator: 'Darius Flint', score: 123210, wins: 65, kills: 276, lastBattle: '5 days ago', title: 'Dust Reaper' }
]

const sortOptions = [
  { key: 'score', label: 'Sort by Score' },
  { key: 'wins', label: 'Sort by Wins' },
  { key: 'kills', label: 'Sort by Kills' }
]

export default function Leaderboard() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [showEliteOnly, setShowEliteOnly] = useState(false)

  const filteredFighters = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    let next = initialLeaderboard.filter((fighter) =>
      fighter.gladiator.toLowerCase().includes(normalized)
    )

    if (showEliteOnly) {
      next = next.filter((fighter) => fighter.rank <= 3)
    }

    next = [...next].sort((a, b) => b[sortBy] - a[sortBy])

    return next.map((fighter, index) => ({
      ...fighter,
      displayRank: index + 1
    }))
  }, [search, showEliteOnly, sortBy])

  const statCards = useMemo(() => {
    const highestScore = [...initialLeaderboard].sort((a, b) => b.score - a.score)[0]
    const mostKills = [...initialLeaderboard].sort((a, b) => b.kills - a.kills)[0]
    const totalWins = initialLeaderboard.reduce((sum, fighter) => sum + fighter.wins, 0)

    return [
      {
        icon: Crown,
        label: 'Reigning Champion',
        value: highestScore.gladiator,
        subtext: `${highestScore.score.toLocaleString()} score`
      },
      {
        icon: Skull,
        label: 'Highest Kill Count',
        value: mostKills.kills.toLocaleString(),
        subtext: `${mostKills.gladiator} leads the carnage`
      },
      {
        icon: Trophy,
        label: 'Total Wins Logged',
        value: totalWins.toLocaleString(),
        subtext: 'across the seeded arena board'
      }
    ]
  }, [])

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
              Legendary names rise through the ranks below. This board is powered by local demo data today
              and will be connected to the real backend later.
            </p>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-arena-gold" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search gladiator by name"
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
            {filteredFighters.length} visible warriors
          </span>
          <span className="status-pill border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4]">
            Backend sync coming soon
          </span>
        </div>

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
