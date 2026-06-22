/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['BoldPixels', 'monospace'],
        'display': ['Firlest', 'cursive'],
      },
      colors: {
        'game': {
          'bg': '#0a0c10',
          'surface': '#12141a',
          'card': '#16181e',
          'border': '#2a2d35',
          'border-light': '#3a3d45',
          'gold': '#e8a525',
          'gold-light': '#f0b830',
          'gold-dark': '#c8901a',
          'text': '#d0d0d0',
          'text-dim': '#8a8d95',
          'text-bright': '#ffffff',
          'red': '#c0392b',
          'green': '#27ae60',
          'blue': '#2980b9',
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0 #0a0c10',
        'pixel-sm': '2px 2px 0 #0a0c10',
        'pixel-lg': '6px 6px 0 #0a0c10',
        'gold-glow': '0 0 12px rgba(232, 165, 37, 0.2)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 4px rgba(232, 165, 37, 0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(232, 165, 37, 0.4)' },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        game: {
          "primary": "#e8a525",
          "secondary": "#2a2d35",
          "accent": "#16181e",
          "neutral": "#12141a",
          "base-100": "#0a0c10",
          "base-200": "#12141a",
          "base-300": "#16181e",
          "info": "#2980b9",
          "success": "#27ae60",
          "warning": "#e8a525",
          "error": "#c0392b",
        },
      },
    ],
  },
}
