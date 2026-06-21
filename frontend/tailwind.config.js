/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood-dark': '#4E342E',
        'wood-medium': '#6D4C41',
        'wood-light': '#D7CCC8',
        'wood-cream': '#C8B6A6',
        'chocolate': '#3E2723',
        'walnut': '#3B2F2F',
        'gold-accent': '#FFD700',
      },
      backgroundImage: {
        'wood-gradient': 'linear-gradient(180deg, #6D4C41 0%, #4E342E 100%)',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        gametheme: {
          "primary": "#FFD700",
          "secondary": "#6D4C41",
          "accent": "#3E2723",
          "neutral": "#3B2F2F",
          "base-100": "#4E342E",
          "base-200": "#3E2723",
          "base-300": "#2D1F1A",
          "info": "#6D4C41",
          "success": "#4CAF50",
          "warning": "#FFD700",
          "error": "#F44336",
        },
      },
    ],
  },
}