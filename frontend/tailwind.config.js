/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50:  "#fdf8f0",
          100: "#f5ede0",
          200: "#e8d5b7",
          300: "#d4a96a",
          400: "#c27d3a",
          500: "#a0611e",
          600: "#7d4a14",
        },
        gold: {
          DEFAULT: "#c9a84c",
          50:  "#fdf6e3",
          100: "#f8e9b5",
          200: "#f0d078",
          300: "#d4a83c",
          400: "#c9a84c",
          500: "#a8882a",
          600: "#7a6118",
        },
        dark: {
          DEFAULT: "#1a1a1a",
          50:  "#f5f5f5",
          100: "#e8e8e8",
          200: "#d0d0d0",
          300: "#a0a0a0",
          400: "#6a6a6a",
          500: "#4a4a4a",
          600: "#2a2a2a",
          700: "#1a1a1a",
          800: "#111111",
          900: "#0a0a0a",
        },
        // keep brand for legacy
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      fontFamily: {
        sans:  ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      animation: {
        'fade-up':  'fadeUp 0.7s ease forwards',
        'fly':      'fly 8s ease-in-out infinite',
        'marquee':  'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fly: {
          '0%':   { transform: 'translateX(-120px) translateY(30px) rotate(-5deg)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateX(calc(100vw + 120px)) translateY(-60px) rotate(5deg)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
