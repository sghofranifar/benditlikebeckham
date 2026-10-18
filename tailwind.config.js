/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#07090f', 900: '#0b0f19', 800: '#111726', 700: '#1a2236', 600: '#27304a' },
        chalk: { DEFAULT: '#eef1f7', dim: '#a9b1c6', mute: '#6b7591' },
        lime: { DEFAULT: '#c8ff3d', deep: '#8fd400' },
        saffron: { DEFAULT: '#ffb020', deep: '#e07b00' },
        rose: { DEFAULT: '#ff4d8d', deep: '#d81b60' },
        sky: { DEFAULT: '#5cc8ff' },
        violet: { DEFAULT: '#a78bfa' },
      },
      fontFamily: {
        display: ['"Anton"', 'Impact', 'Haettenschweiler', '"Arial Narrow Bold"', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        hand: ['"Caveat"', '"Comic Sans MS"', 'cursive'],
        teletext: ['"VT323"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 50px -20px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.3)',
        glow: '0 0 0 1px rgba(200,255,61,0.4), 0 0 30px -4px rgba(200,255,61,0.45)',
      },
    },
  },
  plugins: [],
};
