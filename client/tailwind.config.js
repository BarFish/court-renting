/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // forced dark mode
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent-green': '#39ff14', // neon green for open slots, CTAs
        'accent-blue': '#00d4ff',  // electric blue alternative
        'surface': '#1a1a1a',
        'base': '#0a0a0a',
        'text-primary': '#f1f5f9',
        'muted': '#333333',
        'muted-text': '#555555',
      },
    },
  },
  plugins: [],
}
