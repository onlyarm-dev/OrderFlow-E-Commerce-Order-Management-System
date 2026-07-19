/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#18211f', canvas: '#f5f3ee', moss: '#315c4a', lime: '#d9f99d', coral: '#f9735b' },
      boxShadow: { card: '0 14px 40px rgba(24, 33, 31, 0.08)' },
    },
  },
  plugins: [],
};
