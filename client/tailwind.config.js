/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Adding a sophisticated sans-serif stack
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // You can define custom brand colors here if needed
      colors: {
        brand: {
          primary: '#e11d48', // rose-600
          dark: '#4c0519',    // rose-950
        }
      }
    },
  },
  plugins: [],
}