import { motion } from 'framer-motion'
import { Crown, Search, Skull, Trophy } from 'lucide-react'
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

export default function Leaderboard() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [showTop3, setShowTop3] = useState(false)

  const filteredFighters = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    let results = initialLeaderboard.filter((fighter) =>
      fighter.gladiator.toLowerCase().includes(normalized)
    )

    if (showTop3) {
      results = results.filter((fighter) => fighter.rank <= 3)
    }

    results = [...results].sort((a, b) => b[sortBy] - a[sortBy])

    return results.map((fighter, index) => ({
      ...fighter,
      displayRank: index + 1
    }))
  }, [search, showTop3, sortBy])

  const highestScore = initialLeaderboard[0]
  const mostKills = [...initialLeaderboard].sort((a, b) => b.kills - a.kills)[0]
  const totalWins = initialLeaderboard.reduce((sum, f) => sum + f.wins, 0)

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-arena-sand">Arena Rankings</p>
          <h1 className="mt-2 text-4xl font-bold uppercase text-arena-goldBright">Leaderboard</h1>
          <p className="mt-4 max-w-3xl text-sm text-arena-sand">
            See who dominates the arena. Rankings are based on score, wins, and legendary kills.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[
            { icon: Crown, label: 'Champion', value: highestScore.gladiator, subtext: `${highestScore.score.toLocaleString()} pts` },
            { icon: Skull, label: 'Most Kills', value: mostKills.kills.toLocaleString(), subtext: `by ${mostKills.gladiator}` },
            { icon: Trophy, label: 'Total Wins', value: totalWins.toLocaleString(), subtext: 'All time' }
          ].map(({ icon: Icon, label, value, subtext }) => (
            <div key={label} className="panel-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-arena-sand">{label}</p>
                <div className="rounded-lg border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-arena-goldBright">{value}</p>
              <p className="mt-1 text-xs text-arena-sand">{subtext}</p>
            </div>
          ))}
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <label className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-arena-gold" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gladiator..."
              className="w-full rounded-full border border-arena-bronzeLight/35 bg-arena-panel/85 py-3 pl-11 pr-4 text-arena-parchment outline-none transition focus:border-arena-gold/65"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSortBy('score')}
              className={`ghost-button ${sortBy === 'score' ? 'border-arena-gold/55 bg-arena-gold/12 text-arena-goldBright' : ''}`}
            >
              Score
            </button>
            <button
              type="button"
              onClick={() => setSortBy('wins')}
              className={`ghost-button ${sortBy === 'wins' ? 'border-arena-gold/55 bg-arena-gold/12 text-arena-goldBright' : ''}`}
            >
              Wins
            </button>
            <button
              type="button"
              onClick={() => setSortBy('kills')}
              className={`ghost-button ${sortBy === 'kills' ? 'border-arena-gold/55 bg-arena-gold/12 text-arena-goldBright' : ''}`}
            >
              Kills
            </button>
            <button
              type="button"
              onClick={() => setShowTop3(!showTop3)}
              className={`ghost-button ${showTop3 ? 'border-arena-bloodGlow/55 bg-arena-blood/12 text-[#ffd4d4]' : ''}`}
            >
              {showTop3 ? 'Top 3' : 'All'}
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        {filteredFighters.length > 0 ? (
          <LeaderboardTable rows={filteredFighters} />
        ) : (
          <div className="panel-card p-10 text-center text-arena-sand">
            No gladiators found. Try a different search.
          </div>
        )}
      </motion.div>
    </section>
  )
}
