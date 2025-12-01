/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a', // Background utama
          800: '#1e293b', // Background kartu
          700: '#334155', // Border
        },
        primary: {
          500: '#ec4899', // Pink Neon
          600: '#db2777',
        },
        accent: '#8b5cf6' // Ungu
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: []
}