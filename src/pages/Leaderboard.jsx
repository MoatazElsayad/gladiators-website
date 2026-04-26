import { motion } from 'framer-motion'
import { Crown, Search, Zap, Swords, ShieldAlert, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import LeaderboardTable from '../components/LeaderboardTable'

const fallbackLeaderboard = [
  { rank: 1, gladiator: 'MOA_taz', score: 1890, wins: 6, kills: 584, lastBattle: '18 minutes ago', title: 'Arcen', class: 'Warrior' },
  { rank: 2, gladiator: 'Spartacus Rex', score: 1821, wins: 5, kills: 553, lastBattle: '42 minutes ago', title: 'Breaker of Chains', class: 'Fighter' },
  { rank: 3, gladiator: 'Cassia Bloodborn', score: 1779, wins: 5, kills: 540, lastBattle: '1 hour ago', title: 'Red Sand Empress', class: 'Rogue' },
  { rank: 4, gladiator: 'Tiberius Vale', score: 1824, wins: 4, kills: 503, lastBattle: '2 hours ago', title: 'Shield of Marble', class: 'Knight' },
  { rank: 5, gladiator: 'Aurelia Vex', score: 1770, wins: 4, kills: 487, lastBattle: '3 hours ago', title: 'Viper of Rome', class: 'Assassin' },
  { rank: 6, gladiator: 'Draven of Carthage', score: 1716, wins: 3, kills: 459, lastBattle: '5 hours ago', title: 'Ashblade', class: 'Pyromancer' },
  { rank: 7, gladiator: 'Lucian Emberhand', score: 1658, wins: 3, kills: 432, lastBattle: 'Today at dawn', title: 'Firecaster', class: 'Wizard' },
  { rank: 8, gladiator: 'Nyra the Huntress', score: 1604, wins: 2, kills: 411, lastBattle: 'Today at sunrise', title: 'Spear of Dawn', class: 'Ranger' },
  { rank: 9, gladiator: 'Valerius Thorn', score: 1550, wins: 2, kills: 389, lastBattle: 'Yesterday', title: 'Arena Whisper', class: 'Monk' },
  { rank: 10, gladiator: 'Sabina Ironveil', score: 1497, wins: 2, kills: 366, lastBattle: 'Yesterday', title: 'Bronze Widow', class: 'Paladin' },
  { rank: 11, gladiator: 'Ragnar Colosseum', score: 1439, wins: 1, kills: 342, lastBattle: '2 days ago', title: 'Northern Roar', class: 'Barbarian' },
  { rank: 12, gladiator: 'Octavia Noctis', score: 1387, wins: 1, kills: 321, lastBattle: '2 days ago', title: 'Moon Fang', class: 'Shadowblade' },
  { rank: 13, gladiator: 'Kael Warcrest', score: 1336, wins: 1, kills: 307, lastBattle: '3 days ago', title: 'Broken Standard', class: 'Warlord' },
  { rank: 14, gladiator: 'Selene Ashspear', score: 1285, wins: 1, kills: 294, lastBattle: '4 days ago', title: 'Silver Hunt', class: 'Huntress' },
  { rank: 15, gladiator: 'Darius Flint', score: 1232, wins: 0, kills: 276, lastBattle: '5 days ago', title: 'Dust Reaper', class: 'Gunner' }
]

export default function Leaderboard() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [showTop3, setShowTop3] = useState(false)

  const filteredFighters = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    let results = fallbackLeaderboard.filter((fighter) =>
      fighter.gladiator.toLowerCase().includes(normalized) ||
      fighter.class.toLowerCase().includes(normalized)
    )

    if (showTop3) {
      results = results.filter((fighter) => fighter.rank <= 3)
    }

    results = [...results].sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'wins') return b.wins - a.wins
      if (sortBy === 'kills') return b.kills - a.kills
      return 0
    })

    return results.map((fighter, index) => ({
      ...fighter,
      displayRank: index + 1
    }))
  }, [search, showTop3, sortBy])

  const champion = fallbackLeaderboard[0]
  const mostVictories = [...fallbackLeaderboard].sort((a, b) => b.wins - a.wins)[0]
  const totalMatches = fallbackLeaderboard.reduce((sum, f) => sum + f.wins, 0)

  return (
    <section className="section-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header Section - Left & Right Layout */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* Left: Title & Description */}
          <div className="panel-card p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-full border-2 border-arena-gold/40 bg-arena-gold/10 p-4 flex-shrink-0">
                <Crown className="h-8 w-8 text-arena-goldBright" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-arena-sand">Hall of Glory</p>
                <h1 className="mt-2 text-4xl font-bold uppercase text-arena-goldBright">Arena Leaderboard</h1>
                <p className="mt-4 text-sm leading-6 text-arena-sand">
                  Clear, live, and built around the real game. This board tracks uploaded battle results, highlights the strongest gladiators, and keeps the arena history easy to scan.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Search & Filters */}
          <div className="panel-card p-8">
            <p className="text-xs uppercase tracking-widest text-arena-sand mb-4">Find a Warrior</p>

            <label className="relative block mb-6">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-arena-gold" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gladiator or character"
                className="w-full rounded-lg border border-arena-bronzeLight/35 bg-arena-stone/40 py-3 pl-11 pr-4 text-arena-parchment placeholder-arena-sand/60 outline-none transition focus:border-arena-gold/65"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowTop3(!showTop3)}
                className={`px-4 py-2 rounded text-xs uppercase font-semibold tracking-wider transition border ${
                  showTop3
                    ? 'border-arena-gold/60 bg-arena-gold/15 text-arena-goldBright'
                    : 'border-arena-bronzeLight/35 bg-arena-stone/40 text-arena-parchment hover:border-arena-gold/45'
                }`}
              >
                {showTop3 ? '✓ 1 Visible Warriors' : '1 Visible Warriors'}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded text-xs uppercase font-semibold tracking-wider border border-arena-bronzeLight/35 bg-arena-stone/40 text-arena-parchment hover:border-arena-gold/45 transition"
              >
                Live Backend Sync
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {[
            { icon: Crown, label: 'Reigning Champion', value: champion.gladiator, subtext: `${champion.score} score` },
            { icon: Zap, label: 'Most Victories', value: mostVictories.wins, subtext: `${mostVictories.gladiator} leads the board` },
            { icon: Swords, label: 'Total Matches Logged', value: totalMatches, subtext: 'from the connected game backend' }
          ].map(({ icon: Icon, label, value, subtext }) => (
            <div key={label} className="panel-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full border border-arena-gold/40 bg-arena-gold/10 p-3">
                  <Icon className="h-5 w-5 text-arena-goldBright" />
                </div>
                <p className="text-xs uppercase tracking-wider text-arena-sand">{label}</p>
              </div>
              <p className="text-3xl font-bold text-arena-goldBright">{value}</p>
              <p className="mt-2 text-xs text-arena-sand">{subtext}</p>
            </div>
          ))}
        </div>

        {/* Champion Watch & Top Player */}
        <div className="grid gap-6 lg:grid-cols-2 mb-12">
          {/* Champion Watch */}
          <div className="panel-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full border border-arena-gold/40 bg-arena-gold/10 p-3">
                <Crown className="h-5 w-5 text-arena-goldBright" />
              </div>
              <p className="text-xs uppercase tracking-wider text-arena-sand">Champion Watch</p>
            </div>
            <h3 className="text-2xl font-bold text-arena-parchment">{champion.gladiator}</h3>
            <p className="mt-3 text-sm text-arena-sand">
              {champion.gladiator} is currently leading with {champion.score} score and {champion.wins} wins.
            </p>
          </div>

          {/* Top Player Spotlight */}
          <div className="gold-frame p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full border-2 border-arena-gold/40 bg-arena-gold/15 h-16 w-16 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-arena-goldBright">#{champion.rank}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-arena-sand mb-1">{champion.class}</p>
                <h3 className="text-2xl font-bold text-arena-goldBright">{champion.gladiator}</h3>
                <p className="mt-2 text-sm text-arena-sand">{champion.score} score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="mb-12">
          {filteredFighters.length > 0 ? (
            <LeaderboardTable rows={filteredFighters} />
          ) : (
            <div className="panel-card p-10 text-center text-arena-sand">
              No gladiators match your search. Try a different name or character class.
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => setSortBy('score')}
            className={`px-6 py-3 rounded text-xs uppercase font-bold tracking-wider transition border flex items-center gap-2 ${
              sortBy === 'score'
                ? 'border-arena-gold/60 bg-arena-gold/15 text-arena-goldBright'
                : 'border-arena-bronzeLight/35 bg-arena-stone/40 text-arena-parchment hover:border-arena-gold/45'
            }`}
          >
            <Swords className="h-4 w-4" />
            Sort by Score
          </button>
          <button
            type="button"
            onClick={() => setSortBy('wins')}
            className={`px-6 py-3 rounded text-xs uppercase font-bold tracking-wider transition border flex items-center gap-2 ${
              sortBy === 'wins'
                ? 'border-arena-gold/60 bg-arena-gold/15 text-arena-goldBright'
                : 'border-arena-bronzeLight/35 bg-arena-stone/40 text-arena-parchment hover:border-arena-gold/45'
            }`}
          >
            <Zap className="h-4 w-4" />
            Sort by Wins
          </button>
          <button
            type="button"
            onClick={() => setSortBy('kills')}
            className={`px-6 py-3 rounded text-xs uppercase font-bold tracking-wider transition border flex items-center gap-2 ${
              sortBy === 'kills'
                ? 'border-arena-gold/60 bg-arena-gold/15 text-arena-goldBright'
                : 'border-arena-bronzeLight/35 bg-arena-stone/40 text-arena-parchment hover:border-arena-gold/45'
            }`}
          >
            <Crown className="h-4 w-4" />
            Sort by Matches
          </button>
        </div>
      </motion.div>
    </section>
  )
}
