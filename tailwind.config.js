/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#E81E28',
          primary: '#E81E28',
          hover: '#CD1821',
          active: '#B3131B',
          subtle: '#FFF5F5',
          border: '#FECDCD',
        },
      },
    },
  },
  plugins: [],
}
