/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jewel-gold': '#D4AF37',
        'jewel-silver': '#C0C0C0',
        'jewel-platinum': '#E5E4E2',
        'jewel-emerald': '#50C878',
        'jewel-ruby': '#E0115F',
        'jewel-sapphire': '#0F52BA',
        'jewel-dark': '#1A1A1A',
      },
      backgroundImage: {
        'jewelry-pattern': "url('/src/assets/jewelry-pattern.svg')",
      },
      boxShadow: {
        'glow': '0 0 15px rgba(212, 175, 55, 0.5)',
      },
      animation: {
        'shine': 'shine 2s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}