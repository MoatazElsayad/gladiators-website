import { motion } from 'framer-motion'
import { ArrowLeft, BrainCircuit, RefreshCw, ShieldAlert, Sparkles, Swords } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HighlightClipPlayer from '../components/HighlightClipPlayer'
import { fetchJson } from '../lib/api'
import { useAuth } from '../lib/auth'

function formatAttackType(attackType, wasProjectile) {
  const label =
    attackType === 'attack_3' ? 'Attack 3' : attackType === 'attack_2' ? 'Attack 2' : 'Attack 1'
  return wasProjectile ? `${label} Projectile` : label
}

function hpLabel(current, max) {
  if (!max) {
    return `${current}`
  }
  return `${current}/${max}`
}

export default function HighlightDetail() {
  const { highlightId } = useParams()
  const { token, loading: authLoading, isAuthenticated } = useAuth()
  const [highlight, setHighlight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (authLoading) {
      return undefined
    }

    if (!isAuthenticated || !token) {
      setLoading(false)
      setHighlight(null)
      setErrorMessage('Login required.')
      return undefined
    }

    let cancelled = false

    async function loadHighlight() {
      setLoading(true)
      setErrorMessage('')

      try {
        const payload = await fetchJson(`/api/highlights/${highlightId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!cancelled) {
          setHighlight(payload.highlight || null)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || 'Could not load the highlight.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadHighlight()

    return () => {
      cancelled = true
    }
  }, [authLoading, highlightId, isAuthenticated, token])

  useEffect(() => {
    if (!highlight || highlight.analysisStatus !== 'pending' || analyzing) {
      return
    }

    let cancelled = false

    async function triggerAnalysis() {
      setAnalyzing(true)
      try {
        const payload = await fetchJson(`/api/highlights/${highlight.id}/analyze`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({})
        })
        if (!cancelled && payload.highlight) {
          setHighlight(payload.highlight)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || 'Analysis failed.')
        }
      } finally {
        if (!cancelled) {
          setAnalyzing(false)
        }
      }
    }

    triggerAnalysis()

    return () => {
      cancelled = true
    }
  }, [analyzing, highlight, token])

  const stats = useMemo(() => {
    if (!highlight) {
      return []
    }

    return [
      { label: 'Attack', value: formatAttackType(highlight.attackType, highlight.wasProjectile) },
      { label: 'Damage', value: `${highlight.damage}` },
      { label: 'Player HP', value: hpLabel(highlight.playerHpBefore, highlight.playerMaxHp) },
      { label: 'Enemy HP After', value: `${highlight.enemyHpAfter}` }
    ]
  }, [highlight])

  const coachCards = useMemo(() => {
    if (!highlight) {
      return []
    }

    return [
      {
        label: 'Timing',
        value: highlight.analysisTimingNote,
        tone: 'border-sky-300/25 bg-sky-400/10 text-sky-100'
      },
      {
        label: 'Spacing',
        value: highlight.analysisSpacingNote,
        tone: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
      },
      {
        label: 'Attack Choice',
        value: highlight.analysisAttackChoiceNote,
        tone: 'border-arena-gold/25 bg-arena-gold/10 text-arena-parchment'
      },
      {
        label: 'Risk',
        value: highlight.analysisRiskNote,
        tone: 'border-arena-bloodGlow/25 bg-arena-blood/10 text-[#ffe4e4]'
      },
      {
        label: 'Next Drill',
        value: highlight.analysisNextDrill,
        tone: 'border-arena-bronzeLight/25 bg-arena-panel/70 text-arena-parchment',
        wide: true
      }
    ].filter((card) => String(card.value || '').trim())
  }, [highlight])

  const retryAnalysis = async () => {
    if (!highlight) {
      return
    }

    setAnalyzing(true)
    setErrorMessage('')
    try {
      const payload = await fetchJson(`/api/highlights/${highlight.id}/analyze?force=1`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ force: true })
      })
      setHighlight(payload.highlight || null)
    } catch (error) {
      setErrorMessage(error.message || 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <section className="section-shell py-14 sm:py-16">
        <div className="panel-card p-10 text-center text-arena-sand">Loading highlight...</div>
      </section>
    )
  }

  if (!highlight) {
    return (
      <section className="section-shell py-14 sm:py-16">
        <div className="panel-card p-10 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-arena-goldBright" />
          <p className="mt-5 font-display text-2xl uppercase tracking-[0.12em] text-arena-goldBright">
            Highlight Missing
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-arena-sand">
            {errorMessage || 'This battle moment could not be found.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-shell py-14 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">AI Coach Detail</p>
            <h1 className="mt-4 section-title">{highlight.characterName} Highlight</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
              {highlight.username} against {highlight.enemyName} in {highlight.levelName || 'the arena'}.
            </p>
          </div>

          <Link to={`/coach?username=${encodeURIComponent(highlight.username)}`} className="ghost-button">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back To Player Highlights
          </Link>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-3xl border border-[#ffb3b3]/20 bg-[#6f1414]/20 px-5 py-4 text-sm text-[#ffd4d4]">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr),minmax(0,0.85fr)]">
          <div className="panel-card overflow-hidden">
            <HighlightClipPlayer highlight={highlight} token={token} />
            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-arena-bronzeLight/25 bg-arena-panel/70 px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-arena-sand">{stat.label}</p>
                  <p className="mt-2 text-lg font-semibold text-arena-parchment">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="status-pill border-arena-gold/35 text-arena-goldBright">
                {highlight.victory ? 'Victory moment' : 'Pressure moment'}
              </span>
              <span
                className={`status-pill ${
                  highlight.analysisStatus === 'complete'
                    ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
                    : 'border-arena-gold/30 bg-arena-gold/10 text-arena-goldBright'
                }`}
              >
                {highlight.analysisStatus === 'complete'
                  ? 'Coach ready'
                  : analyzing
                    ? 'Analyzing...'
                    : 'Analysis pending'}
              </span>
              {highlight.analysisIsVisual && (
                <span className="status-pill border-sky-300/35 bg-sky-400/10 text-sky-100">
                  Visual replay read
                </span>
              )}
              {highlight.analysisProviderError && (
                <span className="status-pill border-amber-300/35 bg-amber-400/10 text-amber-100">
                  Provider fallback
                </span>
              )}
            </div>

            {highlight.analysisStatus !== 'complete' ? (
              <div className="mt-6 rounded-3xl border border-arena-gold/25 bg-arena-gold/10 px-5 py-5">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-arena-goldBright" />
                  <div>
                    <p className="font-semibold text-arena-parchment">Analyzing your highlight...</p>
                    <p className="mt-2 text-sm leading-7 text-arena-sand">
                      The coach page is turning this moment into a quick strength-and-adjustment readout.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 rounded-3xl border border-arena-bronzeLight/25 bg-arena-panel/70 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Coach Read</p>
                  <p className="mt-3 font-display text-2xl uppercase tracking-[0.12em] text-arena-goldBright">
                    {highlight.analysisTitle}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-arena-sand">{highlight.analysisSummary}</p>
                </div>

                {highlight.analysisProviderError && (
                  <div className="mt-5 rounded-3xl border border-amber-300/25 bg-amber-400/10 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                      Provider Fallback
                    </p>
                    <p className="mt-2 text-sm leading-7 text-amber-50">
                      The replay is saved, but the visual model did not return a usable coach read. The page is showing
                      the local fallback analysis.
                    </p>
                    <p className="mt-2 break-words text-xs leading-6 text-amber-100/80">
                      {highlight.analysisProviderError}
                    </p>
                  </div>
                )}

                {coachCards.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {coachCards.map((card) => (
                      <div
                        key={card.label}
                        className={`rounded-3xl border px-4 py-4 ${card.tone} ${
                          card.wide ? 'sm:col-span-2' : ''
                        }`}
                      >
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-arena-sand">
                          {card.label}
                        </p>
                        <p className="mt-2 text-sm leading-7">{card.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-5">
                    <div className="flex items-center gap-2 text-emerald-200">
                      <Sparkles className="h-4 w-4" />
                      <p className="text-xs uppercase tracking-[0.18em]">What Worked</p>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-emerald-100">
                      {(highlight.analysisStrengths || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-arena-bloodGlow/25 bg-arena-blood/10 px-5 py-5">
                    <div className="flex items-center gap-2 text-[#ffd4d4]">
                      <Swords className="h-4 w-4" />
                      <p className="text-xs uppercase tracking-[0.18em]">Tighten Next</p>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-[#ffe4e4]">
                      {(highlight.analysisMistakes || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-arena-gold/25 bg-arena-gold/10 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Coach Tip</p>
                  <p className="mt-3 text-sm leading-7 text-arena-parchment">{highlight.analysisCoachTip}</p>
                </div>
              </>
            )}

            <button type="button" onClick={retryAnalysis} className="ghost-button mt-6" disabled={analyzing}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              Retry Analysis
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
