import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // YouApp brand colors - dark themed dating app
        youapp: {
          dark: '#09141A',
          darker: '#0D1D25',
          card: '#162329',
          gold: '#D5BE88',
          'gold-light': '#F3EDA6',
          white: '#FFFFFF',
          gray: '#9CA3AF',
          'gray-light': '#D1D5DB',
          green: '#4CAF50',
          blue: '#3B82F6',
          gradient: {
            start: '#1F4247',
            mid: '#0D1D25',
            end: '#09141A',
          },
        },
      },
      backgroundImage: {
        'youapp-gradient': 'linear-gradient(135deg, #1F4247 0%, #0D1D25 50%, #09141A 100%)',
        'youapp-card': 'linear-gradient(180deg, #162329 0%, #1A2C33 100%)',
        'youapp-gold': 'linear-gradient(135deg, #94783E 0%, #F3EDA6 20%, #F8FAE5 40%, #FFE2BE 60%, #D5BE88 80%, #F8FAE5 100%)',
        'youapp-blue-btn': 'linear-gradient(135deg, #62CDCB 0%, #4599DB 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '17px',
      },
    },
  },
  plugins: [],
};
export default config;
