/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          'brand-blue': '#1a56db',
          'brand-blue-light': '#1e88e5',
          'brand-blue-dark': '#0e4291',
          'brand-green': '#10b981',
          'brand-green-light': '#34d399',
          'brand-green-dark': '#059669',
          'brand-red': '#ef4444',
          'brand-red-light': '#f87171',
          'brand-red-dark': '#dc2626',
        },
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }