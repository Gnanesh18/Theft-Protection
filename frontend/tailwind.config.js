/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#0A0A0B',    // Deep charcoal background
          light: '#D9A752',   // Primary accent gold
          medium: '#141416',  // Card background charcoal
          border: '#2A2A2F',  // Slate border
        },
        slate: {
          gray: '#8E8E93',
          light: '#C7C7CC',
        },
        safety: {
          emerald: '#10B981', // Resolved
          amber: '#F59E0B',   // Pending
          crimson: '#EF4444', // Active
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'glass-hover': '0 8px 32px 0 rgba(217, 167, 82, 0.15)',
        'neon-gold': '0 0 15px rgba(217, 167, 82, 0.3)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.4)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
