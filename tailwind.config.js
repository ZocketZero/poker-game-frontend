/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        table: {
          felt: '#1b5e20',
          feltDark: '#0f3813',
          border: '#3e2723',
          rim: '#2d1810',
          accent: '#d4af37'
        },
        chip: {
          white: '#f8fafc',
          red: '#dc2626',
          blue: '#2563eb',
          green: '#16a34a',
          black: '#1e293b',
          purple: '#9333ea',
          gold: '#eab308'
        }
      },
      boxShadow: {
        'felt-inner': 'inset 0 0 80px rgba(0, 0, 0, 0.65)',
        'table-rail': '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        'chip': '0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.3)',
        'card': '0 6px 12px -2px rgba(0, 0, 0, 0.35)',
        'turn-pulse': '0 0 18px 4px rgba(234, 179, 8, 0.7)'
      },
      animation: {
        'pulse-glow':    'pulseGlow 2s infinite',
        'fade-in':       'fadeIn 0.3s ease-out forwards',
        'fade-in-up':    'fadeInUp 0.35s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'card-deal':     'cardDeal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'community-deal':'communityDeal 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'chip-pop':      'chipPop 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'turn-ring':     'turnRing 1.8s ease-in-out infinite',
        'winner-in':     'winnerIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 15px rgba(234, 179, 8, 0.6)' },
          '50%':      { transform: 'scale(1.02)', opacity: '0.9', boxShadow: '0 0 25px rgba(234, 179, 8, 0.9)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        cardDeal: {
          '0%':   { opacity: '0', transform: 'scale(0.6) rotateY(90deg) translateY(-20px)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateY(0deg) translateY(0)' },
        },
        communityDeal: {
          '0%':   { opacity: '0', transform: 'scale(0.7) translateY(-18px) rotateX(30deg)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0) rotateX(0deg)' },
        },
        chipPop: {
          '0%':   { transform: 'scale(0.5) translateY(8px)', opacity: '0' },
          '70%':  { transform: 'scale(1.1) translateY(-2px)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        turnRing: {
          '0%, 100%': { boxShadow: '0 0 0 2px rgba(234,179,8,0.9), 0 0 12px 4px rgba(234,179,8,0.5)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(234,179,8,1), 0 0 22px 8px rgba(234,179,8,0.7)' },
        },
        winnerIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.85)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
