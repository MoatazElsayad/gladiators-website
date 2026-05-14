export default function GladiatorCarousel() {
  const players = [
    { name: 'Knight', image: '/fighters/Knight.png' },
    { name: 'Arcen', image: '/fighters/Arcen.png' },
    { name: 'Demon Slayer', image: '/fighters/Demon_Slayer.png' },
    { name: 'Fantasy Warrior', image: '/fighters/Fantasy_Warrior.png' },
    { name: 'Huntress', image: '/fighters/Huntress.png' },
    { name: 'Martial', image: '/fighters/Martial.png' },
    { name: 'Martial Hero', image: '/fighters/Martial_Hero.png' },
    { name: 'Medieval Warrior', image: '/fighters/Medieval_Warrior.png' },
    { name: 'Wizard', image: '/fighters/Wizard.png' }
  ]

  const enemies = [
    { name: 'Evil Wizard', image: '/fighters/Enemy_Evil_Wizard.png' },
    { name: 'Fire Wizard', image: '/fighters/Enemy_Fire_Wizard.png' },
    { name: 'Fire Worm', image: '/fighters/Enemy_Fire_Worm.png' },
    { name: 'Flying Demon', image: '/fighters/Enemy_Flying_Demon.png' },
    { name: 'Nightweaver', image: '/fighters/Enemy_Nightweaver.png' },
    { name: 'Werewolf', image: '/fighters/Beast_werewolf.png' }
  ]

  return (
    <div className="w-full space-y-12 py-8 px-4">
      <style>{`
        @keyframes scroll-right-to-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 2)); }
        }
        @keyframes scroll-left-to-right {
          0% { transform: translateX(calc(-100% / 2)); }
          100% { transform: translateX(0); }
        }
        .carousel-container {
          overflow: hidden;
          width: 100%;
        }
        .carousel-track-rtl {
          display: flex;
          gap: 24px;
          animation: scroll-right-to-left 80s linear infinite;
          width: fit-content;
        }
        .carousel-track-ltr {
          display: flex;
          gap: 24px;
          animation: scroll-left-to-right 80s linear infinite;
          width: fit-content;
        }
        .carousel-item {
          flex-shrink: 0;
          width: 256px;
        }
      `}</style>

      {/* Players Section - Right to Left */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-arena-gold">
          Playable Gladiators
        </h3>
        <div className="carousel-container">
          <div className="carousel-track-rtl">
            {[...players, ...players].map((p, i) => (
              <div key={`player-${i}`} className="carousel-item">
                <div className="rounded-[24px] border border-arena-bronzeLight/30 bg-arena-panel/70 overflow-hidden shadow-arena hover:shadow-gold transition-shadow duration-300 group cursor-pointer h-full hover:scale-105 hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-64 bg-gradient-to-b from-arena-stone/60 to-arena-void/90 flex items-center justify-center overflow-hidden p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="pixelated h-56 w-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm uppercase text-arena-goldBright font-semibold truncate">{p.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enemies Section - Left to Right */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-arena-bloodGlow">
          Enemy Forces
        </h3>
        <div className="carousel-container">
          <div className="carousel-track-ltr">
            {[...enemies, ...enemies].map((e, i) => (
              <div key={`enemy-${i}`} className="carousel-item">
                <div className="rounded-[24px] border border-arena-bloodGlow/30 bg-arena-blood/10 overflow-hidden shadow-blood hover:shadow-blood transition-shadow duration-300 group cursor-pointer h-full hover:scale-105 hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-64 bg-gradient-to-b from-arena-ember/40 to-arena-void/90 flex items-center justify-center overflow-hidden p-4">
                    <img
                      src={e.image}
                      alt={e.name}
                      className="pixelated h-56 w-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm uppercase text-[#ffd4d4] font-semibold truncate">{e.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-arena-void to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-arena-void to-transparent pointer-events-none z-10" />
    </div>
  )
}
