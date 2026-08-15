/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#20254a',
          50: '#f4f5f9',
          100: '#e4e6f0',
          200: '#c5cbdf',
          300: '#99a3c6',
          400: '#6774a9',
          500: '#46528d',
          600: '#364075',
          700: '#2c335e',
          800: '#20254a',
          900: '#1a1e3d',
          950: '#101328',
        },
        blue: {
          brand: '#2d36c9',
          accent: '#12b8ed',
        },
        orange: {
          brand: '#f87516',
        },
        soft: '#f6f7fb',
        line: '#d9dce5',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'a4': '0 10px 35px rgba(20, 25, 50, 0.12)',
        'panel': '0 2px 10px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
