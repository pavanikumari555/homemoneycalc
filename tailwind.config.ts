import type { Config } from "tailwindcss";

// Semantic colors (bg, surface, ink, muted, line) CSS variables se aate hain
// (globals.css). Isse dark mode automatic: sirf variables badalte hain, classes nahi.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "surface-2": v("surface-2"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
        // "Ivy" brand palette - deep green (finance = trust, growth)
        ivy: {
          50: "#f0f7f2",
          100: "#dbeddf",
          200: "#b9dbc3",
          300: "#8bc09e",
          400: "#5aa074",
          500: "#3a8557",
          600: "#2a6a44",
          700: "#225538",
          800: "#1d4430",
          900: "#193829",
          950: "#0d2018",
        },
        // Warm accent for highlights / "savings" moments
        sun: {
          100: "#fff4d6",
          300: "#ffd166",
          400: "#f7b733",
          500: "#e89b0c",
          600: "#c47c00",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(16 24 20 / 0.04), 0 8px 24px -8px rgb(16 24 20 / 0.10)",
        lift: "0 2px 4px rgb(16 24 20 / 0.05), 0 18px 40px -12px rgb(16 24 20 / 0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        draw: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        draw: "draw 0.9s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
