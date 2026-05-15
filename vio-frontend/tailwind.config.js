/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          dark: '#4f46e5',    // Indigo 600
          light: '#818cf8',   // Indigo 400
        },
        secondary: '#14b8a6', // Teal 500
        background: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',    // Slate 900
        },
        surface: {
          DEFAULT: '#f8fafc', // Slate 50
          dark: '#1e293b',    // Slate 800
        },
        'vio-dark': '#173f35',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
