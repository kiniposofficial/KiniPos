/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',    // Indigo - accent utama
          dark: '#111827',       // Gray-900 - teks utama
          muted: '#6B7280',      // Gray-500 - teks sekunder
          surface: '#F9FAFB',    // Gray-50 - background section
          border: '#E5E7EB',     // Gray-200 - border
          light: '#EEF2FF',      // Indigo-50 - highlight ringan
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
