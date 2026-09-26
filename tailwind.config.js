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
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 15px rgba(234, 179, 8, 0.6)' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9', boxShadow: '0 0 25px rgba(234, 179, 8, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
