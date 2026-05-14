import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Swords, Shield, Biohazard, Wifi } from 'lucide-react'

const gameModes = [
  {
    name: '1v1 Exhibition',
    badge: 'DUEL',
    badgeColor: 'bg-red-600',
    icon: Swords,
    description: 'Classic exhibition duels with dedicated rival setup, manual or random matchups, and selectable arena themes.'
  },
  {
    name: 'Save the Kings',
    badge: 'DEFENSE',
    badgeColor: 'bg-purple-600',
    icon: Shield,
    description: 'The current playable campaign build: defend the ruler through enemy stages.'
  },
  {
    name: 'Zombie',
    badge: 'ZOMBIE',
    badgeColor: 'bg-green-600',
    icon: Biohazard,
    description: 'Survive two infected waves, push through advanced zombies, and reclaim the city.'
  },
  {
    name: 'LAN Battle',
    badge: 'LAN',
    badgeColor: 'bg-blue-600',
    icon: Wifi,
    description: 'Host or join a nearby LAN challenger. Session sync, ready states, and live duel handoff are now wired.'
  }
]

export default function GameModesShowcase() {
  const [currentMode, setCurrentMode] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMode((prev) => (prev + 1) % gameModes.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const mode = gameModes[currentMode]
  const Icon = mode.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative flex min-h-[34rem] flex-col items-center justify-center px-4"
    >
      {/* Background circles */}
      <div className="absolute inset-6 rounded-full border border-arena-gold/15" />
      <div className="absolute inset-10 rounded-full bg-arena-blood/15 blur-3xl" />
      <div className="absolute h-72 w-72 rounded-full border border-arena-gold/25 bg-arena-gold/10 blur-2xl" />
      <div className="absolute bottom-5 left-1/2 h-16 w-[78%] -translate-x-1/2 rounded-full bg-black/45 blur-xl" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full border-2 border-arena-gold bg-arena-gold/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-arena-gold" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-arena-gold">
              Game Modes
            </p>
          </div>
          <p className="text-lg uppercase tracking-[0.12em] text-arena-parchment leading-8">
            Pick the type of fight you want to step into next
          </p>
        </motion.div>

        {/* Mode Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full rounded-[28px] border border-arena-bronzeLight/40 bg-gradient-to-br from-arena-stone/30 via-arena-void/60 to-arena-ember/20 p-8 backdrop-blur-sm overflow-hidden"
          >
            {/* Content Grid */}
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-14 h-14 rounded-lg border border-arena-bronzeLight/40 bg-arena-void/80 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-arena-gold" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h3 className="font-display text-4xl uppercase tracking-[0.08em] text-arena-goldBright leading-tight">
                    {mode.name}
                  </h3>
                  <span className={`${mode.badgeColor} text-white text-xs font-bold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap`}>
                    {mode.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-base leading-7 text-arena-sand">
                  {mode.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mode Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center items-center gap-2.5"
        >
          {gameModes.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentMode(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentMode
                  ? 'bg-arena-gold h-3 w-8'
                  : 'bg-arena-bronzeLight/40 h-3 w-3 hover:bg-arena-bronzeLight/60'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Go to mode ${index + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
