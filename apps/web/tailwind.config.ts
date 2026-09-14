import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '475px',  // Between mobile (320px) and sm (640px) — covers most phones
      },
      colors: {
        'brand-green': '#1FA37B',
        'brand-blue': '#1565C0',
        'brand-teal': '#0E8C82',
        'brand-teal-dark': '#0A6E66',
        'tint-green': '#E4F5F1',
        'tint-blue': '#E8F0FB',
        'text-slate': '#3B3F45',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1FA37B 0%, #0E8C82 45%, #1565C0 100%)',
        'gradient-bg-soft': 'linear-gradient(160deg, #E4F5F1 0%, #EAF3F8 50%, #E8F0FB 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0d382d 0%, #082d2b 45%, #0d284a 100%)',
      },
      fontFamily: {
        sans: ['var(--font-lora)', 'Lora', 'Georgia', 'Cambria', 'serif'],
        serif: ['var(--font-lora)', 'Lora', 'Georgia', 'Cambria', 'serif'],
        lora: ['var(--font-lora)', 'Lora', 'Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
