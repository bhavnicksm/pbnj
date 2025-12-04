/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#FFFCF0',      // Flexoki paper
          bg2: '#F2F0E5',     // Flexoki base-50
          card: '#FFFCF0',    // Same as bg for minimal look
          text: '#100F0F',    // Flexoki black
          muted: '#878580',   // Flexoki base-500
          faint: '#6F6E69',   // Flexoki base-600
          border: '#E6E4D9',  // Flexoki base-100
          'border-hover': '#DAD8CE', // Flexoki base-150
          'border-active': '#B7B5AC', // Flexoki base-300
        },
        flexoki: {
          red: '#AF3029',
          orange: '#BC5215',
          yellow: '#AD8301',
          green: '#66800B',
          cyan: '#24837B',
          blue: '#205EA6',
          purple: '#5E409D',
          magenta: '#A02F6F',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        paper: '0 1px 3px rgba(16, 15, 15, 0.06)',
        'paper-hover': '0 4px 6px rgba(16, 15, 15, 0.08)',
      },
    },
  },
  plugins: [],
}
