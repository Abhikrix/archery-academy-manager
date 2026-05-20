/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        academy: {
          black: "#090909",
          charcoal: "#111111",
          panel: "#171717",
          line: "#2a2418",
          gold: "#d4af37",
          goldSoft: "#f4d77a",
          ash: "#a3a3a3",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212, 175, 55, 0.12), 0 18px 48px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
