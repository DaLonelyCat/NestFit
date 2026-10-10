/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#07080c',
          dark: '#0d0f17',
          surface: '#131622',
          card: '#181c2c',
          cardHover: '#1f2438',
          border: '#282f46',
          cyan: '#00f0ff',
          cyanDark: '#009ba6',
          amber: '#ffb800',
          neon: '#39ff14',
          magenta: '#ff0055',
          textMuted: '#8b9bb4',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(255, 184, 0, 0.35)',
        'glow-neon': '0 0 20px -3px rgba(57, 255, 20, 0.35)',
        'glow-magenta': '0 0 20px -3px rgba(255, 0, 85, 0.35)',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
