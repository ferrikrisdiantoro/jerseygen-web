import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f4f2",
        surface: "#ffffff",
        ink: {
          DEFAULT: "#0a0a0a",
          mute: "#6f6f68",
          soft: "#9b9b92",
        },
        line: {
          DEFAULT: "#e7e5e0",
          strong: "#d6d4cd",
        },
        accent: {
          DEFAULT: "#ff5b04",
          dark: "#e04e00",
          soft: "#fff0e6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 8px 24px -16px rgba(10,10,10,0.12)",
        pop: "0 24px 60px -24px rgba(10,10,10,0.35)",
      },
      borderRadius: {
        "2xl": "1.1rem",
      },
    },
  },
  plugins: [],
};

export default config;
