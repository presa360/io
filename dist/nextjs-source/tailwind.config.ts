import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1116",
          muted: "#5B6573",
          faint: "#9AA2AE",
        },
        red: {
          DEFAULT: "#E5322B",
          600: "#CC241E",
          700: "#AC1B16",
          50: "#FFF2F0",
          100: "#FCE0DC",
        },
        surface: "#FFFFFF",
        subtle: "#F6F7F9",
        border: "#E9EBEF",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "18px",
        "2xl": "26px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,17,22,.04), 0 2px 6px rgba(14,17,22,.05)",
        md: "0 6px 22px -6px rgba(14,17,22,.10), 0 2px 6px rgba(14,17,22,.05)",
        lg: "0 24px 60px -24px rgba(14,17,22,.22), 0 8px 24px -12px rgba(14,17,22,.10)",
        red: "0 12px 28px -10px rgba(229,50,43,.35)",
      },
    },
  },
  plugins: [],
};

export default config;
