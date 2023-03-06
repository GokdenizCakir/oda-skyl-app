/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebasNeue: ['Bebas Neue'],
        inter: ['Inter'],
      },
      colors: {
        darkBlue: '#070332',
      },
    },
  },
  plugins: [],
};
