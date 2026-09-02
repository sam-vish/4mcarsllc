/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Both are loaded by next/font in app/layout.tsx, which sets the
        // --font-sans / --font-display variables.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        // ===== DEALER TOKENS — only these two change per dealer =====
        // Channel triples (not hex) so opacity modifiers keep working:
        // bg-brand/15, border-brand/40, selection:bg-brand/50. The values are
        // derived from theme.brand in dealer-config.json and set on :root by
        // app/layout.tsx.
        brand: "rgb(var(--brand-rgb) / <alpha-value>)",
        "brand-hover": "rgb(var(--brand-hover-rgb) / <alpha-value>)",
        // =============================================================
        steel: "#B9BDC3",
        asphalt: "#1C1D20",
        tarmac: "#26282C",
        chalk: "#F2F1EE",
        smoke: "#8E9197",
      },
    },
  },
  plugins: [],
};
