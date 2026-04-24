import { Github, Mail, Youtube } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Team Progress', to: '/team-progress' }
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/', icon: Github },
  { label: 'YouTube', href: 'https://youtube.com/', icon: Youtube },
  { label: 'Email', href: 'mailto:team@gladiators.game', icon: Mail }
]

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-arena-bronzeLight/30 bg-arena-void/90">
      <div className="section-shell py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-2xl font-bold uppercase text-arena-gold">Gladiators</p>
            <p className="mt-2 text-sm text-arena-sand">
              An action-packed pixel-art fighting game built with C++ and Qt 6.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-arena-sand mb-3">Navigation</p>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className="text-sm text-arena-parchment hover:text-arena-gold transition"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-arena-sand mb-3">Connect</p>
            <div className="flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-arena-bronzeLight/35 bg-arena-panel text-arena-gold hover:border-arena-gold/60 hover:text-arena-goldBright transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-arena-bronzeLight/20 pt-6 text-center text-xs text-arena-sand/80 uppercase tracking-wider">
          © 2026 Gladiators. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
