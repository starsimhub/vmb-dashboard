/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif Pro', 'Georgia', 'serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#1B4F72',
          blueMid: '#2E86C1',
          teal: '#0E7490',
          tealLight: '#0891B2',
          grayMid: '#6B7280',
          grayLight: '#F3F4F6',
          gold: '#D4A017',
          goldLight: '#F5D76E',
        },
      },
      boxShadow: {
        header: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
