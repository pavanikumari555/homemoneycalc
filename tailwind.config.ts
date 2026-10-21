import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Ivy" brand palette - deep green + warm accents (finance = trust, growth)
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
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
