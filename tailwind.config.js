/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'btn-green': '#10A37F',
      },
    },
  },
  variants: {
    extend: {
      visibility: ["group-hover"],
    },
   },
  plugins: [require('@tailwindcss/typography')],
};
