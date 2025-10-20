/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fog: {
          light: '#9b9faa',
          DEFAULT: '#5a5d6e',
          dark: '#2d2d3f',
        },
        magic: {
          fire: '#ff4444',
          ice: '#44ccff',
          thunder: '#ffff44',
          nature: '#44ff44',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
