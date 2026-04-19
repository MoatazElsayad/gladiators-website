import { motion } from 'framer-motion'

export default function ProgressBar({ progress, completed, total }) {
  return (
    <div className="gold-frame p-6 sm:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-sand">
            Task Completion
          </p>
          <p className="mt-2 font-display text-4xl uppercase tracking-[0.16em] text-arena-goldBright">
            {progress}%
          </p>
        </div>
        <p className="text-sm text-arena-parchment">
          {completed} of {total} tasks completed
        </p>
      </div>

      <div className="h-5 overflow-hidden rounded-full border border-arena-gold/30 bg-arena-void/90">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-arena-bloodGlow via-arena-gold to-arena-goldBright"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </div>
    </div>
  )
}
