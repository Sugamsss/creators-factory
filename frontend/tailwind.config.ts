import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a3a2a",
          light: "#2d5a45",
          dark: "#0f261c",
          50: "#e8f0ec",
          100: "#c5ddd2",
          200: "#9ec5b4",
          300: "#77ad95",
          400: "#5a9a7d",
          500: "#3d8766",
          600: "#2f6b50",
          700: "#23503c",
          800: "#1a3a2a",
          900: "#0f261c",
        },
        accent: {
          DEFAULT: "#4a9e8a",
          light: "#6bb8a3",
          dark: "#2f7a68",
        },
        surface: {
          50: "#fafcfb",
          100: "#f4f7f5",
          200: "#e8ede9",
          300: "#d4ddd6",
          400: "#b3c2b7",
          500: "#8fa694",
          600: "#6b8472",
          700: "#506657",
          800: "#3a4a40",
          900: "#28332d",
        },
        background: {
          light: "#f4f7f5",
          dark: "#0f1a18",
        },
        // Exact colors from screenshots
        sidebar: "#1a3a2a",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
        full: "9999px",
      },
      boxShadow: {
        // Card subtle shadow
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)",
        // Card hover shadow (lift)
        "card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        // Soft shadow for panels
        panel: "0 25px 50px -12px rgba(0, 0, 0, 0.12)",
        // Subtle outline shadow
        soft: "0 1px 3px rgba(0, 0, 0, 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [containerQueries, forms],
};
export default config;
