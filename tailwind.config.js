/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Radiant/Dire riff per SPEC.md §8 — placeholder until brand identity is locked (§10).
        radiant: {
          DEFAULT: "#5FBF4A",
          light: "#8FE07E",
          dark: "#3E8A2F",
        },
        dire: {
          DEFAULT: "#C0392B",
          light: "#E06C5E",
          dark: "#8E2A20",
        },
        ink: {
          DEFAULT: "#0B0B0F",
          raised: "#15151B",
          border: "#26262E",
        },
        paper: {
          DEFAULT: "#F5F5F7",
          muted: "#A8A8B3",
        },
      },
      fontFamily: {
        // Latin + Arabic pairing candidates per SPEC.md §8 — test both before locking in.
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        arabic: ["Cairo", "IBM Plex Sans Arabic", "Tahoma", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        control: "10px",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};
