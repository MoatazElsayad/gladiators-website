import { motion } from 'framer-motion'
import { BrainCircuit, LogOut, Shield, Target, Trophy, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchJson } from '../lib/api'
import { useAuth } from '../lib/auth'
import { normalizeRankName, rankBadgeSrc } from '../lib/ranks'

const fighterProfiles = [
  { keywords: ['demon'], file: 'Demon_Slayer.png' },
  { keywords: ['fantasy'], file: 'Fantasy_Warrior.png' },
  { keywords: ['medieval'], file: 'Medieval_Warrior.png' },
  { keywords: ['martial hero'], file: 'Martial_Hero.png' },
  { keywords: ['martial'], file: 'Martial.png' },
  { keywords: ['huntress'], file: 'Huntress.png' },
  { keywords: ['arcen'], file: 'Arcen.png' },
  { keywords: ['wizard'], file: 'Wizard.png' },
  { keywords: ['knight'], file: 'Knight.png' }
]

function profileImageForFighter(name) {
  const normalized = String(name || '').toLowerCase()
  const file = fighterProfiles.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))?.file || 'Knight.png'
  return `/fighters/${file}`
}

function modeLabel(mode) {
  if (mode === 'lan_duel') return 'LAN Battle'
  if (mode === 'save_the_king') return 'Save the Kings'
  return 'Exhibition'
}

function formatDate(value) {
  if (!value) return 'No battles yet'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString()
}

export default function Profile() {
  const { player, loading, isAuthenticated, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!player?.username) {
      return undefined
    }

    let cancelled = false

    async function loadProfile() {
      setProfileLoading(true)
      setProfileError('')
      try {
        const payload = await fetchJson(`/api/player-profile?username=${encodeURIComponent(player.username)}`)
        if (!cancelled) {
          setProfile(payload.player || null)
        }
      } catch (error) {
        if (!cancelled) {
          setProfile(null)
          setProfileError(error.message || 'Could not load the full profile.')
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [player?.username])

  const mergedPlayer = useMemo(() => ({ ...(player || {}), ...(profile || {}) }), [player, profile])

  const stats = useMemo(() => {
    const wins = Number(mergedPlayer.wins || 0)
    const losses = Number(mergedPlayer.losses || 0)
    const matches = Number(mergedPlayer.matchesPlayed || 0)
    const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0

    return {
      wins,
      losses,
      matches,
      winRate,
      totalScore: Number(mergedPlayer.totalScore || 0),
      highScore: Number(mergedPlayer.highScore || mergedPlayer.totalScore || 0),
      rankLabel: normalizeRankName(mergedPlayer.rankLabel, mergedPlayer.totalScore),
      currentFighter: mergedPlayer.favoriteCharacter || mergedPlayer.lastCharacterType || 'Knight'
    }
  }, [mergedPlayer])

  if (loading) {
    return (
      <section className="section-shell py-14 sm:py-16">
        <div className="panel-card p-10 text-center text-arena-sand">Loading profile...</div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/profile' }} />
  }

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Connected Profile</p>
            <h1 className="mt-4 section-title">{mergedPlayer.username}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
              Your website profile is tied to the same player name used by the desktop game for scores, ranks,
              highlights, and coach moments.
            </p>
          </div>

          <button type="button" onClick={logout} className="ghost-button">
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {profileError && (
          <div className="mt-6 rounded-3xl border border-arena-bloodGlow/25 bg-arena-blood/10 px-5 py-4 text-sm text-[#ffd4d4]">
            {profileError}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="panel-card overflow-hidden">
            <div className="relative min-h-[28rem] p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,215,0,0.2),transparent_26%),linear-gradient(180deg,rgba(61,40,23,0.9),rgba(26,20,15,0.95))]" />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <span className="status-pill border-arena-gold/35 bg-arena-gold/10 text-arena-goldBright">
                    {stats.rankLabel}
                  </span>
                  <span className="status-pill border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                    {profileLoading ? 'Syncing...' : 'Live Profile'}
                  </span>
                </div>

                <img
                  src={mergedPlayer.rankBadge || rankBadgeSrc(stats.rankLabel)}
                  alt={`${stats.rankLabel} rank badge`}
                  className="mx-auto mt-8 h-52 w-52 object-contain drop-shadow-[0_0_28px_rgba(255,215,0,0.28)]"
                />
                <div className="mt-8 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-arena-sand">Rank Badge</p>
                  <p className="mt-3 font-display text-4xl uppercase tracking-[0.16em] text-arena-goldBright">
                    {stats.rankLabel}
                  </p>
                  <p className="mt-3 text-sm text-arena-sand">
                    {stats.totalScore.toLocaleString()} total score
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel-card p-6">
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
                <div className="rounded-[24px] border border-arena-bronzeLight/25 bg-arena-void/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-arena-sand">Current Gladiator</p>
                  <img
                    src={profileImageForFighter(stats.currentFighter)}
                    alt={`${stats.currentFighter} profile portrait`}
                    className="mx-auto mt-5 h-44 w-44 rounded-full border-4 border-arena-gold/60 object-cover shadow-gold"
                  />
                  <p className="mt-5 text-center font-display text-3xl uppercase tracking-[0.14em] text-arena-goldBright">
                    {stats.currentFighter}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-arena-bronzeLight/25 bg-arena-panel/70 p-5">
                    <Trophy className="h-5 w-5 text-arena-goldBright" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">Matches Played</p>
                    <p className="mt-2 text-3xl font-semibold text-arena-parchment">{stats.matches}</p>
                  </div>
                  <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-5">
                    <Target className="h-5 w-5 text-emerald-200" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">Win Rate</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-100">{stats.winRate}%</p>
                  </div>
                  <div className="rounded-3xl border border-arena-gold/25 bg-arena-gold/10 p-5">
                    <Shield className="h-5 w-5 text-arena-goldBright" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">Wins / Losses</p>
                    <p className="mt-2 text-3xl font-semibold text-arena-parchment">
                      {stats.wins}<span className="text-arena-sand"> / {stats.losses}</span>
                    </p>
                  </div>
                  <div className="rounded-3xl border border-sky-300/25 bg-sky-400/10 p-5">
                    <UserRound className="h-5 w-5 text-sky-100" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">Best Score</p>
                    <p className="mt-2 text-3xl font-semibold text-sky-50">{stats.highScore.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Battle History</p>
                  <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.14em] text-arena-goldBright">
                    Recent Matches
                  </h2>
                </div>
                <Link to="/coach" className="ghost-button">
                  <BrainCircuit className="mr-2 h-3.5 w-3.5" />
                  AI Coach
                </Link>
              </div>

              <div className="mt-6 grid gap-3">
                {(mergedPlayer.recentMatches || []).slice(0, 4).map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col gap-3 rounded-3xl border border-arena-bronzeLight/25 bg-arena-void/65 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-arena-parchment">
                        {match.characterName || stats.currentFighter} vs {match.enemyName || 'Arena Rival'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-arena-sand">
                        {modeLabel(match.mode)} / {formatDate(match.playedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`status-pill ${
                          match.victory
                            ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                            : 'border-arena-bloodGlow/35 bg-arena-blood/10 text-[#ffd4d4]'
                        }`}
                      >
                        {match.victory ? 'Victory' : 'Defeat'}
                      </span>
                      <span className="text-sm font-semibold text-arena-goldBright">
                        {Number(match.score || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {(!mergedPlayer.recentMatches || mergedPlayer.recentMatches.length === 0) && (
                  <div className="rounded-3xl border border-arena-bronzeLight/25 bg-arena-void/65 p-5 text-sm text-arena-sand">
                    No matches have reached the website for this profile yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
