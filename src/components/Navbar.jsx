import { AnimatePresence, motion } from 'framer-motion'
import { Download, Menu, X } from 'lucide-react'
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
  const location = useLocation()
  const logoPath = `${import.meta.env.BASE_URL}logo.png`
  const { isAuthenticated, player, logout } = useAuth()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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
            <a href="/api/download/windows" className="blood-button text-xs">
              <Download className="mr-2 h-4 w-4" />
              Play Game
            </a>
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
                <a href="/api/download/windows" className="blood-button text-xs">
                  <Download className="mr-2 h-4 w-4" />
                  Play Game
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
