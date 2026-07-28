import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        danger: 'var(--color-danger)',
        'text-primary': 'var(--color-text)',
        'text-muted': 'var(--color-muted)',
      },
      fontFamily: {
        sans: ['Noto Sans Bengali', 'Hind Siliguri', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
