/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        logo: ["var(--font-logo)", "cursive"],
      },
      colors: {
        ink: "#0F1B2D", // bleu nuit : texte principal, boutons primaires
        "ink-2": "#1E2E47", // hover des boutons primaires
        gold: "#C9A24B", // accents, logo, flèches
        "gold-deep": "#9A7A34", // liens / texte accent sur fond clair
        "gold-soft": "#F1E3C2", // pastilles, fonds de flèches
        paper: "#F9F8F6", // fond de page
        cream: "#FFFDF9", // champs et cartes claires
        sand: "#E9E1D3", // section saison
        mist: "#EAEFF4", // section chiffres
        sky: "#DCE6EF", // carte CTA
        line: "#E4DFD5",
        "line-2": "#D3CCBF",
        muted: "#736E66",
        "muted-2": "#4D4943",
        bubble: "#EFEBE4", // bulles de l'assistant
        placeholder: "#D9D2C4", // fond des photos en chargement
        ok: "#2E7650",
        danger: "#A33A3A",
      },
      boxShadow: {
        card: "0 30px 60px rgba(15,27,45,0.14)",
        float: "0 10px 24px rgba(15,27,45,0.12)",
        panel: "0 30px 80px rgba(15,27,45,0.22)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.35s ease both",
      },
    },
  },
  plugins: [],
};
