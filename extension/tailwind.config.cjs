/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  darkMode: "media",
  theme: {
    colors: {
      inherit: "inherit",
      transparent: "transparent",
      white: "#fff",
      current: "currentColor",
      black: "#000",
      faded: "color-mix(in srgb, currentColor 10%, transparent)",
      accent: "var(--color-accent)",
      primary: "var(--color-primary)",
    },
    fontSize: {
      11: "11px",
      12: "12px",
      13: "13px",
      14: "14px",
    },
    borderRadius: {
      6: "6px",
      full: "9999px",
    },
    lineHeight: {},
    spacing: { 0: "0", 2: "2px", 6: "6px", 8: "8px", 12: "12px", 18: "18px" },
    extend: {},
  },
  plugins: [],
};
