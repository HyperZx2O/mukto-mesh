import type { Config } from 'tailwindcss'

const token = (name: string) => `var(--${name})`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paper
        paper:        token('color-paper'),
        'paper-alt':  token('color-paper-alt'),
        surface:      token('color-surface'),
        'surface-hover': token('color-surface-hover'),
        elevated:     token('color-elevated'),
        // Border
        border:       token('color-border'),
        'border-hover': token('color-border-hover'),
        // Accent
        primary:      token('color-accent'),
        'primary-hover': token('color-accent-hover'),
        'primary-muted': token('color-accent-muted'),
        'primary-text':  token('color-accent-text'),
        // Semantic
        danger:       token('color-danger'),
        'danger-hover': token('color-danger-hover'),
        'danger-muted': token('color-danger-muted'),
        success:      token('color-success'),
        'success-muted': token('color-success-muted'),
        warning:      token('color-warning'),
        'warning-muted': token('color-warning-muted'),
        // Text
        'text-primary': token('color-text'),
        'text-heading': token('color-text-heading'),
        'text-muted':   token('color-text-muted'),
        'text-dim':     token('color-text-dim'),
        'text-inverse': token('color-text-inverse'),
        // Legacy compat aliases
        background:   token('color-paper'),
        'color-bg':   token('color-paper'),
        'color-surface': token('color-surface'),
        'color-border': token('color-border'),
        'color-danger': token('color-danger'),
        'color-text': token('color-text'),
        'color-muted': token('color-text-muted'),
        'color-primary': token('color-accent'),
        // Tag badges
        'tag-safety':  token('color-tag-safety'),
        'tag-medical': token('color-tag-medical'),
        'tag-food':    token('color-tag-food'),
        'tag-legal':   token('color-tag-legal'),
        'tag-news':    token('color-tag-news'),
      },
      fontFamily: {
        display: ['Noto Serif Bengali', 'Noto Sans Bengali', 'Georgia', 'serif'],
        body:    ['Noto Sans Bengali', 'Hind Siliguri', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        sans:    ['Noto Sans Bengali', 'Hind Siliguri', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        display:  token('text-display'),
        heading:  token('text-heading'),
        subhead:  token('text-subhead'),
        body:     token('text-body'),
        'body-sm': token('text-small'),
        caption:  token('text-caption'),
        micro:    token('text-micro'),
      },
      fontWeight: {
        display:  token('weight-display'),
        heading:  token('weight-heading'),
        subhead:  token('weight-subhead'),
        body:     token('weight-body'),
        'body-bold': token('weight-bold'),
      },
      letterSpacing: {
        display:  token('tracking-display'),
        heading:  token('tracking-heading'),
        'body-wide':   token('tracking-wide'),
        'body-wider':  token('tracking-wider'),
        'body-widest': token('tracking-widest'),
      },
      spacing: {
        '4.5': '1.125rem',
        '7':   '1.75rem',
        '9':   '2.25rem',
        '11':  '2.75rem',
        '14':  '3.5rem',
        '18':  '4.5rem',
      },
      borderRadius: {
        sm:    token('radius-sm'),
        DEFAULT: token('radius'),
        lg:    token('radius-lg'),
        pill:  token('radius-pill'),
      },
      boxShadow: {
        sm:  token('shadow-sm'),
        md:  token('shadow-md'),
        lg:  token('shadow-lg'),
      },
      transitionDuration: {
        fast:   token('dur-fast'),
        normal: token('dur-normal'),
        slow:   token('dur-slow'),
      },
      transitionTimingFunction: {
        out:     token('ease-out'),
        'in':    token('ease-in'),
        'in-out': token('ease-in-out'),
      },
    },
  },
  plugins: [],
} satisfies Config
