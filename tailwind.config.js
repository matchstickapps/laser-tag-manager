/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#EA7013',
        'background': '#1F2E33',
        'team-red': '#EF4444',
        'team-blue': '#3B82F6',
      }
    },
  },
  plugins: [],
}
