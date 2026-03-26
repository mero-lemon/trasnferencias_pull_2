import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lemon: {
          green: "#4ADE80",
          "green-dark": "#22C55E",
          "green-muted": "rgba(74,222,128,0.08)",
          "green-border": "rgba(74,222,128,0.2)",
        },
        surface: {
          primary: "#0D0D0D",
          card: "#1A1A1A",
          elevated: "#222222",
        },
        txt: {
          primary: "#FFFFFF",
          secondary: "#888888",
          tertiary: "#666666",
          muted: "#444444",
        },
        status: {
          error: "#E24B4A",
          "error-bg": "rgba(226,75,74,0.08)",
          warning: "#EF9F27",
          "warning-bg": "rgba(239,159,39,0.08)",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
        full: "9999px",
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "scan-line": "scan-line 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16,1,0.3,1)",
        "confetti": "confetti 0.6s ease-out forwards",
        "check-draw": "check-draw 0.4s ease-out 0.2s forwards",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "50%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(-100%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-120px) rotate(720deg)", opacity: "0" },
        },
        "check-draw": {
          from: { strokeDashoffset: "24" },
          to: { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
