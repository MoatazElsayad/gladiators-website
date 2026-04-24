import { motion } from 'framer-motion'
import {
  Flame,
  Shield,
  Swords,
  Trophy,
  Crown,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import knight from '../assets/knight.png'
import demonSlayer from '../assets/demon-slayer.png'
import nightweaver from '../assets/nightweaver.png'

const featureCards = [
  {
    icon: Swords,
    title: 'Precision Combat',
    text: 'Built around responsive duels, timed attacks, and high-pressure arena pacing.'
  },
  {
    icon: Trophy,
    title: 'Persistent Glory',
    text: 'Profiles, progress tracking, and leaderboards drive the Battle Arena experience.'
  },
  {
    icon: Shield,
    title: 'Hero Roster',
    text: 'Multiple unique classes with distinct playstyles step into the arena.'
  }
]

const rosterCards = [
  {
    name: 'Knight',
    role: 'Balanced Vanguard',
    art: knight,
    accent: 'border-arena-gold/35 bg-arena-gold/10 text-arena-goldBright',
    description: 'A disciplined champion with shield-first pressure and classic arena presence.'
  },
  {
    name: 'Demon Slayer',
    role: 'Burst Duelist',
    art: demonSlayer,
    accent: 'border-arena-bloodGlow/40 bg-arena-blood/10 text-[#ffd4d4]',
    description: 'Fast, ruthless offense for players who want mobility and aggressive pressure.'
  },
  {
    name: 'Nightweaver',
    role: 'Nightmare Foe',
    art: nightweaver,
    accent: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
    description: 'An eerie presence that reinforces the game world beyond standard duels.'
  }
]

export default function Home() {
  const scrollToTrailer = () => {
    document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section id="hero" className="relative">
        <div className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex rounded-full border border-arena-gold/30 bg-arena-gold/10 px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-arena-goldBright">
                Battle Arena Official
              </p>
            </div>

            <h1 className="mt-4 text-5xl font-bold uppercase tracking-wider text-arena-goldBright sm:text-6xl xl:text-7xl">
              Gladiators
            </h1>

            <p className="mt-6 text-lg text-arena-parchmentSoft">
              Battle Arena reborn for the web
            </p>

            <p className="mt-4 max-w-2xl text-base leading-8 text-arena-sand">
              A fast-paced 2D pixel-art fighting game built with C++ and Qt 6. Enter the arena,
              choose your class, and fight for glory on the leaderboard.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={scrollToTrailer} className="blood-button text-xs">
                <Flame className="mr-2 h-4 w-4" />
                Enter the Arena
              </button>
              <Link to="/leaderboard" className="stone-button text-xs">
                View Leaderboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Heroes Available', value: '9' },
                { label: 'Arena Mood', value: 'Ancient & Brutal' },
                { label: 'Built With', value: 'C++ & Qt 6' }
              ].map((stat) => (
                <div key={stat.label} className="panel-card p-4">
                  <p className="text-xs uppercase tracking-wider text-arena-sand">{stat.label}</p>
                  <p className="mt-2 text-lg font-bold text-arena-goldBright">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute inset-0 rounded-full border border-arena-gold/15 blur-lg" />

              {/* Main card */}
              <div className="gold-frame relative z-10 w-full max-w-sm p-6">
                <div className="rounded-2xl border border-arena-gold/30 bg-gradient-to-b from-arena-ember via-arena-stone to-arena-void px-6 py-10">
                  <img src={knight} alt="Knight hero" className="pixelated mx-auto h-56 object-contain" />
                  <div className="mt-6 text-center">
                    <p className="text-xs uppercase tracking-wider text-arena-sand">Featured Champion</p>
                    <p className="mt-2 text-3xl font-bold uppercase text-arena-goldBright">Knight</p>
                  </div>
                </div>
              </div>

              {/* Floating side cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-16 top-8 hidden w-32 rounded-lg border border-arena-bronzeLight/30 bg-arena-panel/90 p-3 sm:block"
              >
                <img src={nightweaver} alt="Nightweaver" className="pixelated h-24 w-24 mx-auto" />
                <p className="mt-2 text-center text-xs text-arena-sand uppercase">Nightweaver</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -right-16 bottom-8 hidden w-32 rounded-lg border border-arena-bloodGlow/25 bg-arena-blood/10 p-3 sm:block"
              >
                <img src={demonSlayer} alt="Demon Slayer" className="pixelated h-24 w-24 mx-auto" />
                <p className="mt-2 text-center text-xs text-arena-sand uppercase">Demon Slayer</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="section-shell mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {featureCards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="panel-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-arena-gold/35 bg-arena-gold/10 p-3 text-arena-goldBright">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-arena-parchment">{title}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-arena-sand">{text}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Trailer Section */}
      <section id="trailer" className="section-shell mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <div className="panel-card p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-arena-sand">Battle Vision</p>
            <h2 className="mt-4 text-3xl font-bold uppercase text-arena-goldBright">Arena Trailer</h2>
            <p className="mt-4 text-sm leading-6 text-arena-sand">
              Watch the game trailer showcasing combat, characters, and the battle arena experience.
            </p>

            <div className="mt-6 space-y-4">
              {featureCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <div className="flex-shrink-0 p-2 rounded-lg border border-arena-gold/35 bg-arena-gold/10 text-arena-goldBright">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-arena-parchment text-sm">{title}</p>
                    <p className="mt-1 text-xs text-arena-sand">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gold-frame overflow-hidden p-4">
            <div className="aspect-video overflow-hidden rounded-lg border border-arena-gold/25 bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/M7lc1UVf-VE?rel=0"
                title="Gladiators trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Roster Section */}
      <section className="section-shell mt-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-arena-sand">Champions</p>
          <h2 className="mt-2 text-3xl font-bold uppercase text-arena-goldBright">Hero Roster</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {rosterCards.map((fighter, idx) => (
            <motion.div
              key={fighter.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="panel-card overflow-hidden p-6"
            >
              <div className={`inline-block px-3 py-1 rounded-full border text-xs uppercase font-semibold ${fighter.accent}`}>
                {fighter.role}
              </div>

              <div className="mt-4 rounded-lg border border-arena-bronzeLight/25 bg-gradient-to-b from-arena-stone/60 to-arena-void/90 p-6">
                <img src={fighter.art} alt={fighter.name} className="pixelated mx-auto h-40 object-contain" />
              </div>

              <h3 className="mt-4 text-2xl font-bold uppercase text-arena-goldBright">
                {fighter.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-arena-sand">{fighter.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-shell mt-12">
        <div className="panel-card p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-arena-sand">Glory Awaits</p>
              <h2 className="mt-4 text-3xl font-bold uppercase text-arena-goldBright">
                Fight For Eternal Glory
              </h2>
              <p className="mt-4 text-sm leading-6 text-arena-sand">
                Battle Arena is an action-packed pixel-art experience featuring fluid combat,
                secure player profiles, and a progression system built to reward every victory
                in the arena.
              </p>
              <button onClick={scrollToTrailer} className="blood-button mt-6 text-xs">
                <Flame className="mr-2 h-4 w-4" />
                Watch Trailer
              </button>
            </div>

            <div className="rounded-lg border-2 border-dashed border-arena-gold/35 bg-arena-void/70 p-8 text-center">
              <Crown className="mx-auto h-12 w-12 text-arena-goldBright opacity-50 mb-3" />
              <h3 className="text-2xl font-bold uppercase text-arena-goldBright">
                Ready for Launch
              </h3>
              <p className="mt-3 text-sm text-arena-sand">
                The playable game will be embedded here when ready.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
