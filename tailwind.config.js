/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0b0d0c',
          card: '#141816',
          cardHover: '#191f1c',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          input: '#1a201d',
          muted: '#84948a',
          text: '#f0f4f1',
        },
        fintech: {
          lime: '#c6ff3d',
          emerald: '#2ee6a0',
          violet: '#a78bfa',
          amber: '#ffc247',
          red: '#ff6b6b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-lime': '0 0 24px -4px rgba(198, 255, 61, 0.25)',
        'glow-emerald': '0 0 24px -4px rgba(46, 230, 160, 0.25)',
        'glow-amber': '0 0 24px -4px rgba(255, 194, 71, 0.25)',
        'glow-red': '0 0 24px -4px rgba(255, 107, 107, 0.25)',
        card: '0 8px 30px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
