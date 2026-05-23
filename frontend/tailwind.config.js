/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3D52D5',
          hover: '#2D3DB5',
          dark: '#1E1E3A',
        },
        sidebar: {
          light: '#3D52D5',
          dark: '#252545',
        },
        bg: {
          light: '#EEF2FF',
          dark: '#1A1A2E',
        },
        card: {
          dark: '#252545',
        },
      },
    },
  },
  plugins: [],
}
