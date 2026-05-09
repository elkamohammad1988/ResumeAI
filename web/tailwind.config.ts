import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#00d96f",
          dark: "#00c463",
          deep: "#00a350",
          glow: "rgba(0, 217, 111, 0.4)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heroRise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-20px, 20px) scale(1.1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
        heroRise: "heroRise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        slideInRight: "slideInRight 0.25s ease-out both",
        blob: "blob 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
