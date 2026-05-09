import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, Lock, Sparkles, Sword } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthenticatedImage from '../components/AuthenticatedImage'
import { fetchJson } from '../lib/api'
import { useAuth } from '../lib/auth'

function formatAttackType(attackType, wasProjectile) {
  const label =
    attackType === 'attack_3' ? 'Attack 3' : attackType === 'attack_2' ? 'Attack 2' : 'Attack 1'
  return wasProjectile ? `${label} Projectile` : label
}

function formatMoment(value) {
  if (!value) {
    return 'Unknown moment'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown moment'
  }

  return date.toLocaleString()
}

export default function AiCoach() {
  const { token, player, loading: authLoading, isAuthenticated } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (authLoading) {
      return undefined
    }

    if (!isAuthenticated || !token) {
      setRows([])
      setLoading(false)
      setErrorMessage('')
      return
    }

    let cancelled = false

    async function loadHighlights() {
      setLoading(true)
      setErrorMessage('')

      try {
        const payload = await fetchJson('/api/highlights', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!cancelled) {
          setRows(Array.isArray(payload.rows) ? payload.rows : [])
        }
      } catch (error) {
        if (!cancelled) {
          setRows([])
          setErrorMessage(error.message || 'Could not load AI coach highlights.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadHighlights()

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, token])

  const summary = useMemo(() => {
    const totalDamage = rows.reduce((sum, row) => sum + Number(row.damage || 0), 0)
    const finishers = rows.filter((row) => row.wasFinisher).length

    return {
      totalDamage,
      finishers
    }
  }, [rows])

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">AI Coach</p>
            <h1 className="mt-4 section-title">Battle Highlights</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
              Pull a player&apos;s strongest uploaded moments into one place and open each capture for a coach-style
              breakdown.
            </p>
          </div>

          {isAuthenticated && (
            <div className="status-pill border-arena-gold/35 bg-arena-gold/10 text-arena-goldBright">
              Connected as {player?.username}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="panel-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Tracked Highlights</p>
            <p className="mt-4 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
              {rows.length}
            </p>
          </div>
          <div className="panel-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Damage In View</p>
            <p className="mt-4 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
              {summary.totalDamage}
            </p>
          </div>
          <div className="panel-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Fight Closers</p>
            <p className="mt-4 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
              {summary.finishers}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-3xl border border-[#ffb3b3]/20 bg-[#6f1414]/20 px-5 py-4 text-sm text-[#ffd4d4]">
            {errorMessage}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="panel-card mt-8 p-10 text-center">
            <Lock className="mx-auto h-10 w-10 text-arena-goldBright" />
            <p className="mt-5 font-display text-2xl uppercase tracking-[0.12em] text-arena-goldBright">
              Sign In For AI Coach
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-arena-sand">
              Your battle screenshots and coach notes are tied to your Gladiators profile, so only the signed-in player
              can view them.
            </p>
            <Link to="/login" state={{ from: '/coach' }} className="blood-button mt-6 text-xs">
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="panel-card mt-8 p-10 text-center text-arena-sand">Loading coach highlights...</div>
        ) : rows.length === 0 ? (
          <div className="panel-card mt-8 p-10 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-arena-goldBright" />
            <p className="mt-5 font-display text-2xl uppercase tracking-[0.12em] text-arena-goldBright">
              No Highlights Yet
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-arena-sand">
              {player?.username} has not uploaded a coach-ready battle moment yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {rows.map((highlight) => (
              <article key={highlight.id} className="panel-card overflow-hidden">
                <div className="grid gap-0 md:grid-cols-[280px,1fr]">
                  <div className="h-full min-h-[220px] bg-arena-void/70">
                    <AuthenticatedImage
                      src={`/api/highlights/${highlight.id}/image`}
                      token={token}
                      alt={`${highlight.username} battle highlight`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="status-pill border-arena-gold/35 text-arena-goldBright">
                        {formatAttackType(highlight.attackType, highlight.wasProjectile)}
                      </span>
                      <span className="status-pill border-arena-bronzeLight/35 text-arena-sand">
                        {highlight.damage} damage
                      </span>
                      <span
                        className={`status-pill ${
                          highlight.analysisStatus === 'complete'
                            ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                            : 'border-arena-gold/30 bg-arena-gold/10 text-arena-goldBright'
                        }`}
                      >
                        {highlight.analysisStatus === 'complete' ? 'Analysis ready' : 'Analysis pending'}
                      </span>
                    </div>

                    <h2 className="mt-4 font-display text-2xl uppercase tracking-[0.12em] text-arena-goldBright">
                      {highlight.characterName} vs {highlight.enemyName}
                    </h2>
                    <p className="mt-2 text-sm text-arena-sand">
                      Captured for {highlight.username} on {formatMoment(highlight.capturedAt)}.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-arena-bronzeLight/25 bg-arena-panel/70 px-4 py-3">
                        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-arena-sand">Highlight Score</p>
                        <p className="mt-2 text-lg font-semibold text-arena-parchment">{highlight.highlightScore}</p>
                      </div>
                      <div className="rounded-3xl border border-arena-bronzeLight/25 bg-arena-panel/70 px-4 py-3">
                        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-arena-sand">Result</p>
                        <p className="mt-2 text-lg font-semibold text-arena-parchment">
                          {highlight.victory ? 'Victory moment' : 'Pressure moment'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-arena-sand">
                        {highlight.analysisTitle || 'Open the detail view to generate the coach breakdown.'}
                      </p>
                      <Link to={`/coach/${highlight.id}`} className="ghost-button">
                        <Sword className="mr-2 h-3.5 w-3.5" />
                        Open Detail
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
