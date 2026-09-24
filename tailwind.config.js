/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0b0f',
        surface: '#18161d',
        surface2: '#211e27',
        border: '#2c2933',
        text: '#f4f1f6',
        muted: '#9b96a5',
        faint: '#665f70',
        pink: '#ff2f7e',
        pinkdeep: '#b3114f',
        live: '#35e08c',
        gold: '#ff8a2b',
      },
      fontFamily: {
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
