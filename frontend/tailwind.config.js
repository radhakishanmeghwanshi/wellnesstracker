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
        // We ensure our primary palette colors are easily accessible and match requested tokens
        pastel: {
          emerald: '#10b981', // emerald-500
          sky: '#0ea5e9',     // sky-500
          amber: '#f59e0b',   // amber-400
          dark: '#0f172a',    // slate-900
          light: '#f8fafc',   // slate-50
        }
      },
      animation: {
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
