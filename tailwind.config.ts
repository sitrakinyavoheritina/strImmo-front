import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--color-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
          'secondary-hover': 'rgb(var(--color-secondary-hover) / <alpha-value>)',
        },
        surface: {
          app: 'rgb(var(--color-bg-app) / <alpha-value>)',
          card: 'rgb(var(--color-bg-surface) / <alpha-value>)',
          dark: 'rgb(var(--color-bg-dark) / <alpha-value>)',
        },
        content: {
          main: 'rgb(var(--color-text-main) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        stroke: 'rgb(var(--color-border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

export default config;