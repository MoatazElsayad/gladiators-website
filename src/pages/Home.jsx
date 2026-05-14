import { motion } from 'framer-motion'
import {
  ArrowRight,
  Crown,
  Download,
  Flame,
  MonitorDown,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJson } from '../lib/api'
import GladiatorCarousel from '../components/GladiatorCarousel'
import GameModesShowcase from '../components/GameModesShowcase'

const featureCards = [
  {
    icon: Swords,
    title: 'Precision Combat',
    text: 'Built around responsive duels, timed attacks, range checks, and high-pressure arena pacing.'
  },
  {
    icon: Trophy,
    title: 'Connected Profiles',
    text: 'Desktop battles feed the same web profile, rank badge, win rate, leaderboard position, and AI Coach history.'
  },
  {
    icon: Shield,
    title: 'Hero Roster',
    text: 'Knight, Demon Slayer, Huntress, Wizard, and more classes step into the same blood-lit world.'
  }
]

const battlePillars = [
  {
    icon: Crown,
    title: 'Ranked Identity',
    text: 'Every player carries a rank, current gladiator, recent match record, and unlock-ready profile presence.'
  },
  {
    icon: Flame,
    title: 'AI Coach Moments',
    text: 'The strongest attack can become a replay highlight with visual coaching and quick improvement notes.'
  },
  {
    icon: Sparkles,
    title: 'Arena Ladder',
    text: 'The leaderboard now reads like a competitive ladder, not just a table of names and numbers.'
  }
]

const fallbackMatches = [
  {
    id: 'demo-1',
    username: 'Maximus Aurelius',
    mode: 'save_the_king',
    characterName: 'Knight',
    enemyName: 'Fire Wizard',
    victory: true,
    score: 1840
  },
  {
    id: 'demo-2',
    username: 'Cassia Bloodborn',
    mode: 'lan_duel',
    characterName: 'Huntress',
    enemyName: 'Linked Rival',
    victory: false,
    score: 920
  },
  {
    id: 'demo-3',
    username: 'Spartacus Rex',
    mode: 'save_the_king',
    characterName: 'Fantasy Warrior',
    enemyName: 'Nightweaver',
    victory: true,
    score: 2120
  }
]

function formatRelativeBattleTime(value) {
  if (!value) {
    return 'Recently'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function normalizeMatchRows(rows) {
  return (rows || []).map((row, index) => ({
    id: row.id || `fallback-${index}`,
    username: row.username || 'Unknown Gladiator',
    mode: row.mode || 'save_the_king',
    characterName: row.characterName || row.characterType || 'Unknown',
    enemyName: row.enemyName || row.opponentUsername || 'Unknown foe',
    victory: Boolean(row.victory),
    score: Number(row.score || 0),
    playedAtLabel: formatRelativeBattleTime(row.playedAt)
  }))
}

export default function Home() {
  const [recentMatches, setRecentMatches] = useState(() => normalizeMatchRows(fallbackMatches))
  const [recentMatchesSource, setRecentMatchesSource] = useState('fallback')
  const [recentMatchesError, setRecentMatchesError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadRecentMatches() {
      try {
        const payload = await fetchJson('/api/matches/recent?limit=4')
        if (cancelled) {
          return
        }

        const normalized = normalizeMatchRows(payload.rows)
        setRecentMatches(normalized.length > 0 ? normalized : normalizeMatchRows(fallbackMatches))
        setRecentMatchesSource(normalized.length > 0 ? 'live' : 'fallback')
      } catch (error) {
        if (cancelled) {
          return
        }

        setRecentMatches(normalizeMatchRows(fallbackMatches))
        setRecentMatchesSource('fallback')
        setRecentMatchesError(error.message || 'Could not load recent battles.')
      }
    }

    loadRecentMatches()

    return () => {
      cancelled = true
    }
  }, [])

  const heroStats = useMemo(() => [
    { label: 'Heroes Available', value: '9' },
    { label: 'Arena Mood', value: 'Ancient / Brutal' },
    { label: 'Backend Sync', value: recentMatchesSource === 'live' ? 'Connected' : 'Fallback' }
  ], [recentMatchesSource])

  return (
    <div className="pb-8">
      <section id="hero" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,160,23,0.22),transparent_26%),radial-gradient(circle_at_80%_14%,rgba(188,26,26,0.18),transparent_22%),linear-gradient(180deg,rgba(26,20,15,0.2),rgba(26,20,15,0.88))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-arena-void to-transparent" />

        <div className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10"
          >
            <p className="mb-4 inline-flex items-center rounded-full border border-arena-gold/30 bg-arena-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-arena-goldBright">
              Battle Arena Official Site
            </p>
            <p className="text-sm uppercase tracking-[0.34em] text-arena-sand">Welcome to the colosseum</p>
            <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.2em] text-arena-goldBright sm:text-6xl xl:text-7xl">
              Gladiators
            </h1>
            <p className="mt-4 max-w-2xl text-lg uppercase tracking-[0.18em] text-arena-parchmentSoft sm:text-xl">
              Fight, rank up, and study your best moments
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-arena-sand sm:text-lg">
              A fast-paced 2D pixel-art fighting game built with C++ and Qt 6. Your desktop battles now
              power a live web profile, arena ladder, replay highlights, and AI Coach feedback.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="/api/download/windows" className="blood-button text-xs">
                <Download className="mr-2 h-4 w-4" />
                Download Windows Build
              </a>
              <Link to="/leaderboard" className="stone-button text-xs">
                View Arena Ladder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 rounded-[28px] border border-arena-bronzeLight/30 bg-black/20 p-5 backdrop-blur-sm sm:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-arena-sand">Arena Oath</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-arena-parchment">
                Every uploaded fight becomes part of a public ladder and a private player story: rank,
                current fighter, recent battles, highlight replays, and coach notes.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                  className="rounded-[24px] border border-arena-bronzeLight/30 bg-arena-panel/70 p-5 shadow-gold"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">{stat.label}</p>
                  <p className="mt-3 text-xl font-semibold text-arena-goldBright">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10 panel-card overflow-hidden p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,160,23,0.22),transparent_30%),linear-gradient(150deg,rgba(104,13,13,0.35),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-2xl border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                  <MonitorDown className="h-6 w-6" />
                </div>
                <span className="status-pill border-emerald-400/35 bg-emerald-400/10 text-emerald-200">
                  Windows
                </span>
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">
                Playable Build
              </p>
              <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-arena-goldBright sm:text-5xl">
                Install Gladiators
              </h2>
              <p className="mt-5 text-sm leading-7 text-arena-sand">
                Download the Windows installer, launch the arena locally, and keep your profile connected
                to the website leaderboard and AI Coach.
              </p>

              <a href="/api/download/windows" className="blood-button mt-8 w-full justify-center text-xs">
                <Download className="mr-2 h-4 w-4" />
                Download Installer
              </a>

              <div className="mt-6 grid gap-3 text-xs uppercase tracking-[0.16em] text-arena-sand sm:grid-cols-2">
                <div className="rounded-2xl border border-arena-bronzeLight/25 bg-black/20 p-4">
                  <p>Package</p>
                  <p className="mt-2 text-base font-semibold normal-case tracking-normal text-arena-parchment">
                    Setup.exe
                  </p>
                </div>
                <div className="rounded-2xl border border-arena-bronzeLight/25 bg-black/20 p-4">
                  <p>Size</p>
                  <p className="mt-2 text-base font-semibold normal-case tracking-normal text-arena-parchment">
                    ~190 MB
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs leading-6 text-arena-sand">
                Windows may show a security warning for unsigned student builds. Choose to keep/run it only
                if you downloaded it from this official site.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="section-shell mt-12">
        <GladiatorCarousel />
      </section>

      <section className="section-shell mt-12">
        <GameModesShowcase />
      </section>

      <section className="section-shell mt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {battlePillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="panel-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold uppercase tracking-[0.14em] text-arena-parchment">{title}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-arena-sand">{text}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="section-shell mt-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="panel-card p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Live Arena Feed</p>
              <h2 className="mt-4 section-title">Recent Battles</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
                This section reads the latest uploaded match results from the desktop game backend.
              </p>
            </div>
            <div className={`status-pill ${recentMatchesSource === 'live'
              ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
              : 'border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4]'}`}>
              {recentMatchesSource === 'live' ? 'Live recent matches' : 'Fallback recent matches'}
            </div>
          </div>

          {recentMatchesError && (
            <div className="mt-6 flex items-start gap-3 rounded-3xl border border-[#ffb3b3]/20 bg-[#6f1414]/20 px-5 py-4 text-sm text-[#ffd4d4]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{recentMatchesError}</p>
            </div>
          )}

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {recentMatches.map((match) => (
              <div key={match.id} className="rounded-[24px] border border-arena-bronzeLight/25 bg-arena-void/65 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-arena-parchment">{match.username}</p>
                  <span className={`status-pill ${match.victory
                    ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                    : 'border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4]'}`}>
                    {match.victory ? 'Victory' : 'Defeat'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-arena-sand">
                  {match.characterName} entered {match.mode === 'lan_duel' ? 'Arena Link' : 'Save the King'} against{' '}
                  <span className="text-arena-parchment">{match.enemyName}</span>.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-arena-sand">
                  <span>Score {match.score.toLocaleString()}</span>
                  <span>/</span>
                  <span>{match.playedAtLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
