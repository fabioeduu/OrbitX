// tailwind.config.js — CORRETO
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Inclui app/, components/, hooks/ e screens
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')], // ← OBRIGATÓRIO no NativeWind v4
  theme: {
    extend: {},
  },
  plugins: [],
};