/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        academy: {
          black: "rgb(var(--academy-black) / <alpha-value>)",
          charcoal: "rgb(var(--academy-charcoal) / <alpha-value>)",
          panel: "rgb(var(--academy-panel) / <alpha-value>)",
          line: "rgb(var(--academy-line) / <alpha-value>)",
          gold: "rgb(var(--academy-gold) / <alpha-value>)",
          goldSoft: "rgb(var(--academy-gold-soft) / <alpha-value>)",
          ash: "rgb(var(--academy-ash) / <alpha-value>)",
        },
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [],
};
