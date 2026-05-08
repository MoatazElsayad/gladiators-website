import { motion } from 'framer-motion'
import { BrainCircuit, LogOut, Shield, Trophy } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Profile() {
  const { player, loading, isAuthenticated, logout } = useAuth()

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
            <h1 className="mt-4 section-title">{player.username}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arena-sand">
              This website profile is tied to the same username that the desktop game uploads results and highlights for.
            </p>
          </div>

          <button type="button" onClick={logout} className="ghost-button">
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="panel-card p-6">
            <Shield className="h-5 w-5 text-arena-goldBright" />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">Rank</p>
            <p className="mt-3 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
              {player.rankLabel}
            </p>
          </div>
          <div className="panel-card p-6">
            <Trophy className="h-5 w-5 text-arena-goldBright" />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">Score</p>
            <p className="mt-3 font-display text-3xl uppercase tracking-[0.12em] text-arena-goldBright">
              {Number(player.totalScore || 0).toLocaleString()}
            </p>
          </div>
          <div className="panel-card p-6">
            <BrainCircuit className="h-5 w-5 text-arena-goldBright" />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-arena-sand">AI Coach</p>
            <Link to="/coach" className="ghost-button mt-4">
              Open Highlights
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
