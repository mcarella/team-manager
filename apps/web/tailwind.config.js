/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forma: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-2': 'var(--color-surface-2)',
          border: 'var(--color-border)',
          'border-hover': 'var(--color-border-hover)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
          'accent-dim': 'var(--color-accent-dim)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'forma-hero': 'var(--text-hero)',
        'forma-h1': 'var(--text-h1)',
        'forma-h2': 'var(--text-h2)',
        'forma-h3': 'var(--text-h3)',
        'forma-body': 'var(--text-body)',
        'forma-small': 'var(--text-small)',
        'forma-caption': 'var(--text-caption)',
      },
      borderRadius: {
        'forma-sm': 'var(--radius-sm)',
        'forma-md': 'var(--radius-md)',
        'forma-lg': 'var(--radius-lg)',
      },
      maxWidth: {
        'forma-content': 'var(--content-w)',
      },
    },
  },
  plugins: [],
}
