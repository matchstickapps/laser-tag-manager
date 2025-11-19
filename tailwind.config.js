/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'team-red': '#EF4444',
        'team-blue': '#3B82F6',
      }
    },
  },
  plugins: [],
}
