/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
      },
      animation: {
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
