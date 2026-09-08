/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2736C7',
          50: '#F0F3FF',
          100: '#E0E7FE',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#2736C7',
          600: '#202CB0',
          700: '#1B2496',
          800: '#161D7C',
          900: '#101660',
          950: '#0B0F40',
        },
        navy: {
          DEFAULT: '#1E293B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        page: '#F6F7F9',
        surface: '#FFFFFF',
        line: '#D9DEE7',
        primary: '#1F2937',
        secondary: '#667085',
        muted: '#98A2B3',
        blue: {
          brand: '#2736C7',
        },
      },
      borderRadius: {
        'xs': '4px',
        'sm': '5px',
        'md': '6px',
        'lg': '8px',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'a4': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'panel': '0 1px 2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}

