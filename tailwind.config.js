/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#001f5b', 800: '#002580', 700: '#003087', 600: '#1a4ba0' },
      }
    }
  },
  plugins: []
}
