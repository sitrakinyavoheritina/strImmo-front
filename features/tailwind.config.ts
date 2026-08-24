import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--primary-hover) / <alpha-value>)',
          accent: 'rgb(var(--accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};

export default config;