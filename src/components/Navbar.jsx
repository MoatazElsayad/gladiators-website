import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Swords, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'AI Coach', to: '/coach' }
]

const linkClasses = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition duration-300',
    isActive
      ? 'bg-arena-gold/15 text-arena-gold'
      : 'text-arena-parchment hover:bg-arena-gold/10 hover:text-arena-goldBright'
  ].join(' ')

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const location = useLocation()
  const logoPath = `${import.meta.env.BASE_URL}logo.svg`
  const { isAuthenticated, player, logout } = useAuth()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!showModal) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [showModal])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-arena-bronzeLight/30 bg-arena-void/80 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logoPath} alt="Gladiators logo" className="h-12 w-auto sm:h-14" />
            <div className="hidden sm:block">
              <p className="font-display text-lg uppercase tracking-[0.18em] text-arena-goldBright">
                Gladiators
              </p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-arena-sand">
                Battle Arena
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClasses}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={linkClasses}>
                  {player?.username || 'Profile'}
                </NavLink>
                <button type="button" onClick={logout} className="ghost-button text-xs">
                  Sign Out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClasses}>
                Sign In
              </NavLink>
            )}
            <button type="button" onClick={() => setShowModal(true)} className="blood-button text-xs">
              <Swords className="mr-2 h-4 w-4" />
              Play Game
            </button>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-arena-gold/35 bg-arena-panel/80 text-arena-gold lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-arena-bronzeLight/30 bg-arena-ember/95 lg:hidden"
            >
              <div className="section-shell flex flex-col gap-3 py-4">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClasses}>
                    {item.label}
                  </NavLink>
                ))}
                {isAuthenticated ? (
                  <>
                    <NavLink to="/profile" className={linkClasses}>
                      {player?.username || 'Profile'}
                    </NavLink>
                    <button type="button" onClick={logout} className="ghost-button text-xs">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <NavLink to="/login" className={linkClasses}>
                    Sign In
                  </NavLink>
                )}
                <button type="button" onClick={() => setShowModal(true)} className="blood-button text-xs">
                  <Swords className="mr-2 h-4 w-4" />
                  Play Game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            aria-hidden={!showModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="play-game-modal-title"
              className="gold-frame w-full max-w-lg p-8 text-center"
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <p
                id="play-game-modal-title"
                className="mb-3 font-display text-3xl uppercase tracking-[0.18em] text-arena-goldBright"
              >
                Arena Gate Locked
              </p>
              <p className="section-copy">
                The live game embed is coming soon. This page is ready for launch now, and the playable
                build can drop into the hero section as soon as it is available.
              </p>
              <button type="button" onClick={() => setShowModal(false)} className="blood-button mt-6 text-xs">
                Return to Camp
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
