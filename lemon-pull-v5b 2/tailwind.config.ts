import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lemon: {
          5: "#e6fef0",
          10: "#c2fbdb",
          20: "#82f8b5",
          30: "#3ff48d",
          40: "#00f068",  // Brand
          50: "#00ca57",
          60: "#00a347",
          70: "#007d36",
          80: "#005625",
          90: "#003015",
        },
        bg: {
          primary: "#000000",
          card: "#1a1a1a",
          elevated: "#2a2a2a",
          chip: "#333333",
        },
        t: {
          primary: "#FFFFFF",
          secondary: "#999999",
          tertiary: "#666666",
          muted: "#444444",
        },
      },
      fontFamily: {
        satoshi: ['"Satoshi"', '"Inter"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        lemon: "0.015em", // 1.5%
      },
    },
  },
  plugins: [],
};
export default config;
