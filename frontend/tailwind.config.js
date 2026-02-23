/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fdfcf8",  // Clean, elegant cream (doesn't hurt eyes)
          100: "#f5f3ec",
          200: "#e6e0d1",
          300: "#d4a96a",
          400: "#c27d3a",
          500: "#a0611e",
          600: "#7d4a14",
        },
        gold: {
          DEFAULT: "#C5A059", // Refined Champagne/Luxury Gold
          50: "#fbf8f1",
          100: "#f3eada",
          200: "#e3d0ad",
          300: "#d0b17b",
          400: "#c5a059",
          500: "#a68241",
          600: "#80622e",
        },
        dark: {
          DEFAULT: "#0a1128", // Deep luxury midnight blue (inspires trust)
          50: "#eef1f6",
          100: "#d5dce8",
          200: "#aab8cd",
          300: "#7990ae",
          400: "#50698a",
          500: "#364e6e",
          600: "#273a55",
          700: "#1e2c41",
          800: "#152030",
          900: "#0a1128",
          950: "#050916",
        },
        // keep brand for legacy
        brand: {
          50: "#f0f9ff",
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
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fly': 'fly 8s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fly: {
          '0%': { transform: 'translateX(-120px) translateY(30px) rotate(-5deg)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateX(calc(100vw + 120px)) translateY(-60px) rotate(5deg)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
