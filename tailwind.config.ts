import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Cinzel', 'serif'],
      },
      colors: {
        primary: '#346231',
        'primary-hover': '#517643',
        cta: '#ebc56b',
        success: '#00A36C',
        background: '#FFFFFF',
        'bg-secondary': '#F8FAF8',
        'bg-cream': '#ffeade',
        'text-primary': '#371f0d',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
} satisfies Config