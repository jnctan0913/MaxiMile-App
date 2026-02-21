/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#C5A55A',
          'gold-dark': '#A8893E',
          'gold-light': '#E8D9A8',
          charcoal: '#2D3748',
        },
        primary: {
          DEFAULT: '#1A73E8',
          light: '#E8F0FE',
          dark: '#1557B0',
        },
        surface: {
          bg: '#F8F9FA',
          card: '#FFFFFF',
          border: '#E0E0E0',
          'border-light': '#F0F0F0',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#5F6368',
          tertiary: '#9AA0A6',
        },
        status: {
          success: '#34A853',
          'success-dark': '#2D9249',
          warning: '#FBBC04',
          danger: '#EA4335',
          info: '#4A90D9',
        },
      },
      borderColor: {
        'gold-tint': 'rgba(197, 165, 90, 0.15)',
        'gold-tint-strong': 'rgba(197, 165, 90, 0.3)',
      },
      backgroundColor: {
        glass: 'rgba(255, 255, 255, 0.7)',
        'glass-strong': 'rgba(255, 255, 255, 0.85)',
      },
    },
  },
  plugins: [],
};
