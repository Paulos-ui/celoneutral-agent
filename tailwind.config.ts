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
        gold: {
          DEFAULT: "#F7C948",
          50: "#FEF9E9",
          100: "#FDF1C7",
          200: "#FBE48C",
          300: "#F9D666",
          400: "#F7C948",
          500: "#E5B025",
          600: "#C2901A",
          700: "#946C12",
        },
        ink: {
          950: "#0B0B0B",
          900: "#111111",
          850: "#161616",
          800: "#1E1E1E",
          700: "#2A2A2A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(247,201,72,0.15), 0 8px 40px -12px rgba(247,201,72,0.35)",
      },
      backgroundImage: {
        "gold-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(247,201,72,0.12) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
