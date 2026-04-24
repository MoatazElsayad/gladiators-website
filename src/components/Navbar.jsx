import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Flame } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Team Progress', to: '/team-progress' }
]

const linkClasses = ({ isActive }) =>
  `px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition ${
    isActive
      ? 'bg-arena-gold/15 text-arena-gold'
      : 'text-arena-parchment hover:bg-arena-gold/10 hover:text-arena-goldBright'
  }`

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const logoPath = `${import.meta.env.BASE_URL}logo.svg`

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-arena-bronzeLight/30 bg-arena-void/80 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <img src={logoPath} alt="Gladiators" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <p className="text-lg font-bold uppercase text-arena-goldBright">Gladiators</p>
              <p className="text-xs uppercase tracking-wider text-arena-sand">Battle Arena</p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClasses}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <button className="blood-button text-xs">
              <Flame className="mr-2 h-4 w-4" />
              Play Game
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden inline-flex h-12 w-12 items-center justify-center rounded-full border border-arena-gold/35 bg-arena-panel/80 text-arena-gold"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-arena-bronzeLight/30 bg-arena-ember/95 lg:hidden"
            >
              <div className="section-shell flex flex-col gap-2 py-4">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClasses}>
                    {item.label}
                  </NavLink>
                ))}
                <button className="blood-button text-xs w-full">
                  <Flame className="mr-2 h-4 w-4" />
                  Play Game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
