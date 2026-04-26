import { Github, Instagram, Mail, Youtube } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Team Progress', to: '/team-progress' }
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/', icon: Github },
  { label: 'YouTube', href: 'https://youtube.com/', icon: Youtube },
  { label: 'Instagram', href: 'https://instagram.com/', icon: Instagram },
  { label: 'Email', href: 'mailto:team@gladiators.game', icon: Mail }
]

export default function Footer() {
  const logoPath = `${import.meta.env.BASE_URL}brand/logo.png`
  const shieldPath = `${import.meta.env.BASE_URL}brand/shield.png`

  return (
    <footer className="relative z-10 mt-20 border-t border-arena-bronzeLight/30 bg-arena-void/90">
      <div className="section-shell flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-arena-gold/30 bg-arena-gold/10 shadow-gold">
              <img src={shieldPath} alt="Gladiators shield icon" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <img src={logoPath} alt="Gladiators logo" className="h-9 w-auto" />
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-arena-sand">Battle Arena</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-arena-sand">
            The official Battle Arena landing page. Made with blood and steel in Cairo.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:w-[34rem]">
          <div className="flex flex-wrap gap-2">
            {footerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className="rounded-full border border-arena-bronzeLight/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-arena-parchment transition hover:border-arena-gold/60 hover:text-arena-gold"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-arena-bronzeLight/35 bg-arena-panel text-arena-gold transition hover:-translate-y-0.5 hover:border-arena-gold/60 hover:text-arena-goldBright"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-arena-bronzeLight/20 py-4 text-center text-xs uppercase tracking-[0.16em] text-arena-sand/80">
        (C) 2026 Gladiators. All arena rights reserved.
      </div>
    </footer>
  )
}
