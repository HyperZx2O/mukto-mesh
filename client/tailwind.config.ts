import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#141414',
        border: '#262626',
        primary: '#006A4E',   // Bangladesh green
        danger: '#C8102E',    // Bangladesh red
        'text-primary': '#f5f5f5',
        'text-muted': '#737373',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config
