/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        // Desktop screens that are short (small laptops, or a browser with tall toolbars): used to
        // keep the whole hero, including the "Not sure where you stand?" box, on the first screen.
        short: { raw: "(min-width: 1024px) and (max-height: 760px)" },
      },
      colors: {
        // 6SLOT palette — navy + gold, matching eixn-dota.com (brief §1).
        // Gold is reserved for CTAs, the founder counter, key headline words and the logo "6".
        navy: {
          DEFAULT: "#0E1724",
          raised: "#16212F",
          border: "#24324A",
        },
        gold: {
          DEFAULT: "#E8B54A",
          light: "#F2CB74",
          dark: "#C4932F",
        },
        text: {
          DEFAULT: "#F5F5F5",
          muted: "#8FA0B5",
        },
      },
      fontFamily: {
        // Same families as eixn-dota.com.
        sans: ["Montserrat", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Cinzel", "Georgia", "serif"],
      },
      borderRadius: {
        card: "14px",
        control: "10px",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.6" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        // Giveaway winner card: rotating gold border, light sweep, breathing glow.
        "winner-border": {
          to: { transform: "rotate(360deg)" },
        },
        "winner-shine": {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "55%, 100%": { transform: "translateX(320%) skewX(-20deg)" },
        },
        "winner-glow": {
          "0%, 100%": { boxShadow: "0 0 24px -6px rgba(232,181,74,0.45)" },
          "50%": { boxShadow: "0 0 56px -4px rgba(232,181,74,0.75)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
        "winner-border": "winner-border 4s linear infinite",
        "winner-shine": "winner-shine 3.6s ease-in-out infinite",
        "winner-glow": "winner-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
