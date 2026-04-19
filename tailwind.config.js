/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        arena: {
          void: '#1A140F',
          ember: '#2A1810',
          panel: '#2C1F14',
          stone: '#3D2817',
          bronze: '#5C4033',
          bronzeLight: '#7C5A24',
          bronzeMuted: '#8B7355',
          gold: '#D4A017',
          goldSoft: '#D4AF37',
          goldBright: '#FFD700',
          parchment: '#F5E6D3',
          parchmentSoft: '#EFDDAA',
          sand: '#CBB68A',
          blood: '#8B0000',
          bloodBright: '#A50000',
          bloodGlow: '#BC1A1A'
        }
      },
      fontFamily: {
        display: ['"Showcard Gothic"', '"Cinzel Decorative"', 'Georgia', 'serif'],
        body: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
      },
      boxShadow: {
        arena: '0 24px 80px rgba(0, 0, 0, 0.45)',
        gold: '0 0 0 1px rgba(212, 160, 23, 0.25), 0 16px 44px rgba(0, 0, 0, 0.4)',
        blood: '0 16px 42px rgba(139, 0, 0, 0.28)'
      },
      backgroundImage: {
        'arena-glow':
          'radial-gradient(circle at top, rgba(212, 160, 23, 0.18), transparent 34%), linear-gradient(135deg, rgba(110, 13, 13, 0.22), transparent 52%)',
        'stone-texture':
          'linear-gradient(135deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.02) 25%, rgba(26,20,15,0.95) 25%)'
      }
    }
  },
  plugins: []
}
