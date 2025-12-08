/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#000000', // Preto absoluto
          paper: '#09090b',   // Zinc 950 para cards
          subtle: '#18181b'   // Zinc 900 para hovers
        },
        primary: {
          DEFAULT: '#8b5cf6', // Violet 500
          hover: '#7c3aed',   // Violet 600
          glow: '#a78bfa',    // Violet 400
          dim: 'rgba(139, 92, 246, 0.1)'
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.15), 0 0 10px rgba(139, 92, 246, 0.1)',
        'neon-strong': '0 0 30px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'zoom-in': 'zoomIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}