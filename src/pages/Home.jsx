import { motion } from 'framer-motion'
import {
  ArrowRight,
  Crown,
  Flame,
  Shield,
  Sparkles,
  Swords,
  Trophy
} from 'lucide-react'
import { Link } from 'react-router-dom'
import knight from '../assets/knight.png'
import demonSlayer from '../assets/demon-slayer.png'
import nightweaver from '../assets/nightweaver.png'

const featureCards = [
  {
    icon: Swords,
    title: 'Precision Combat',
    text: 'Built around responsive duels, timed attacks, range checks, and high-pressure arena pacing.'
  },
  {
    icon: Trophy,
    title: 'Persistent Glory',
    text: 'Profiles, progress tracking, and leaderboards are at the heart of the Battle Arena experience.'
  },
  {
    icon: Shield,
    title: 'Hero Roster',
    text: 'Knight, Demon Slayer, Huntress, Wizard, and more classes step into the same blood-lit world.'
  }
]

const heroStats = [
  { label: 'Heroes Available', value: '9' },
  { label: 'Arena Mood', value: 'Ancient / Brutal' },
  { label: 'Tech Core', value: 'C++ + Qt 6' }
]

const rosterCards = [
  {
    name: 'Knight',
    role: 'Balanced Vanguard',
    art: knight,
    accent: 'border-arena-gold/35 bg-arena-gold/10 text-arena-goldBright',
    description: 'A disciplined champion with shield-first pressure and the classic arena silhouette.'
  },
  {
    name: 'Demon Slayer',
    role: 'Burst Duelist',
    art: demonSlayer,
    accent: 'border-arena-bloodGlow/40 bg-arena-blood/10 text-[#ffd4d4]',
    description: 'Fast, ruthless offense for players who want mobility, pace, and aggressive kill pressure.'
  },
  {
    name: 'Nightweaver',
    role: 'Nightmare Foe',
    art: nightweaver,
    accent: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
    description: 'An eerie enemy presence that reinforces the game world beyond standard arena duels.'
  }
]

const battlePillars = [
  {
    icon: Crown,
    title: 'Animated Lobbies',
    text: 'The repo already supports live character preview and polished profile selection flows.'
  },
  {
    icon: Flame,
    title: 'Cinematic UX',
    text: 'Damage text, arena HUDs, and dramatic game-over states give the combat loop real ceremony.'
  },
  {
    icon: Sparkles,
    title: 'Pixel Art Identity',
    text: 'The landing page now leans into the game assets instead of drifting into generic fantasy styling.'
  }
]

export default function Home() {
  const scrollToTrailer = () => {
    document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pb-8">
      <section id="hero" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,160,23,0.22),transparent_26%),radial-gradient(circle_at_80%_14%,rgba(188,26,26,0.18),transparent_22%),linear-gradient(180deg,rgba(26,20,15,0.2),rgba(26,20,15,0.88))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-arena-void to-transparent" />

        <div className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-16 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
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
              Battle Arena reborn for the web
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-arena-sand sm:text-lg">
              A fast-paced 2D pixel-art fighting game built with C++ and Qt 6. Enter the Battle Arena,
              choose your class, and fight through a world of blood-red banners, ancient steel, and
              leaderboard-driven glory.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button type="button" onClick={scrollToTrailer} className="blood-button text-xs">
                <Flame className="mr-2 h-4 w-4" />
                Enter the Arena
              </button>
              <Link to="/leaderboard" className="stone-button text-xs">
                View Leaderboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 rounded-[28px] border border-arena-bronzeLight/30 bg-black/20 p-5 backdrop-blur-sm sm:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-arena-sand">Arena Oath</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-arena-parchment">
                Action-packed combat, fluid mechanics, rich pixel art, and a progression system built to
                reward every victory earned in the dust of the arena.
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex min-h-[34rem] items-center justify-center"
          >
            <div className="absolute inset-6 rounded-full border border-arena-gold/15" />
            <div className="absolute inset-10 rounded-full bg-arena-blood/15 blur-3xl" />
            <div className="absolute h-72 w-72 rounded-full border border-arena-gold/25 bg-arena-gold/10 blur-2xl" />
            <div className="absolute bottom-5 left-1/2 h-16 w-[78%] -translate-x-1/2 rounded-full bg-black/45 blur-xl" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 top-20 hidden w-40 rounded-[28px] border border-arena-bronzeLight/30 bg-arena-panel/90 p-5 shadow-arena sm:block"
            >
              <img src={nightweaver} alt="Nightweaver enemy" className="pixelated mx-auto h-28 w-28 object-contain" />
              <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-arena-sand">Nightweaver</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="gold-frame relative z-10 w-full max-w-md p-6 sm:p-8"
            >
              <div className="rounded-[24px] border border-arena-gold/30 bg-gradient-to-b from-arena-ember via-arena-stone to-arena-void px-6 py-10">
                <div className="mx-auto mb-5 w-fit rounded-full border border-arena-gold/30 bg-arena-gold/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-arena-goldBright">
                  Champion spotlight
                </div>
                <img src={knight} alt="Knight hero art from Gladiators" className="pixelated mx-auto h-60 object-contain" />
                <div className="mt-6 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-arena-sand">Featured Champion</p>
                  <p className="mt-2 font-display text-3xl uppercase tracking-[0.16em] text-arena-goldBright">Knight</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 right-0 hidden w-44 rounded-[28px] border border-arena-bloodGlow/25 bg-arena-blood/10 p-5 shadow-blood sm:block"
            >
              <img src={demonSlayer} alt="Demon Slayer hero art" className="pixelated mx-auto h-28 w-28 object-contain" />
              <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-arena-sand">Demon Slayer</p>
            </motion.div>
          </motion.div>
        </div>
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

      <section id="trailer" className="section-shell mt-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="panel-card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Battle Vision</p>
            <h2 className="mt-4 section-title">Arena Trailer</h2>
            <p className="mt-5 section-copy">
              The game trailer slot is already staged for launch. Replace the placeholder YouTube ID and
              the landing page is ready to spotlight the real combat showcase.
            </p>
            <div className="mt-8 space-y-4">
              {featureCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[24px] border border-arena-bronzeLight/25 bg-arena-void/65 p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-arena-parchment">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-arena-sand">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className="gold-frame overflow-hidden p-4 sm:p-5"
          >
            <div className="relative aspect-video overflow-hidden rounded-[24px] border border-arena-gold/25 bg-black">
              {/* REPLACE WITH REAL TRAILER ID */}
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/M7lc1UVf-VE?rel=0"
                title="Gladiators trailer placeholder"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="section-shell mt-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {rosterCards.map((fighter, index) => (
            <motion.article
              key={fighter.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.08 }}
              className="panel-card overflow-hidden p-6"
            >
              <div className={`status-pill ${fighter.accent}`}>{fighter.role}</div>
              <div className="mt-5 rounded-[24px] border border-arena-bronzeLight/25 bg-gradient-to-b from-arena-stone/60 to-arena-void/90 px-6 py-8">
                <img src={fighter.art} alt={fighter.name} className="pixelated mx-auto h-40 object-contain" />
              </div>
              <h3 className="mt-5 font-display text-3xl uppercase tracking-[0.14em] text-arena-goldBright">
                {fighter.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-arena-sand">{fighter.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="section-shell mt-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="panel-card p-6 sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_0.88fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Official Description</p>
              <h2 className="mt-4 section-title">Fight For Eternal Glory</h2>
              <p className="mt-5 section-copy">
                Battle Arena is an action-packed pixel-art experience featuring fluid character animation,
                responsive menu systems, live class previews, secure player profiles, and a scalable
                leaderboard-ready progression loop.
              </p>
              <p className="mt-5 section-copy">
                This landing page now leans harder into the actual game identity: Roman metals, blood-red
                accents, real character art, and a presentation that feels closer to the in-game lobby.
              </p>
            </div>

            <div className="rounded-[28px] border border-dashed border-arena-gold/35 bg-arena-void/70 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">Future Embed Zone</p>
              <h3 className="mt-4 font-display text-3xl uppercase tracking-[0.16em] text-arena-goldBright">
                Playable Build Placeholder
              </h3>
              <p className="mt-4 text-sm leading-7 text-arena-sand">
                The actual game will be embedded here later. The structure, CTA flow, and spacing are ready
                for the live build.
              </p>
              {/* Game will be embedded here later */}
              <div className="mt-8 rounded-[24px] border border-arena-bronzeLight/25 bg-gradient-to-br from-arena-stone/70 to-arena-ember/90 px-6 py-10 text-center">
                <p className="font-display text-2xl uppercase tracking-[0.16em] text-arena-gold">Game Portal Ready</p>
                <p className="mt-3 text-sm text-arena-parchment">
                  Drop the production game iframe, canvas, or launcher module into this slot.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
