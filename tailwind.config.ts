import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary':    '#0d0d0d',
        'bg-secondary':  '#1a1a1a',
        'bg-card':       '#1e1e1e',
        'bg-card-hover': '#252525',
        'accent-yellow': '#FFD700',
        'accent-blue':   '#4FC3F7',
        bronze:  '#CD7F32',
        silver:  '#C0C0C0',
        gold:    '#FFD700',
        diamond: '#B9F2FF',
        legend:  '#9B59B6',
      },
      fontFamily: {
        heading: ['var(--font-black-ops)', 'cursive'],
        body:    ['var(--font-inter)',     'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'grid-pan': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '48px 48px' },
        },
        'gold-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(255,215,0,0.4), 0 0 24px rgba(255,215,0,0.15)' },
          '50%':      { boxShadow: '0 0 0 1px rgba(255,215,0,0.7), 0 0 40px rgba(255,215,0,0.3)' },
        },
        'flame-pulse': {
          '0%, 100%': { transform: 'scale(1) rotate(-3deg)' },
          '50%':      { transform: 'scale(1.15) rotate(3deg)' },
        },
      },
      animation: {
        shimmer:       'shimmer 2.8s linear infinite',
        'grid-pan':    'grid-pan 6s linear infinite',
        'gold-pulse':  'gold-pulse 2.4s ease-in-out infinite',
        'flame-pulse': 'flame-pulse 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
