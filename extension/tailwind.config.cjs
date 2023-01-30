/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    colors: {
      inherit: "inherit",
      transparent: "transparent",
      white: "#fff",
      purple: {
        light: "#EFEDFC",
        DEFAULT: "#5F55EC",
      },
      "cool-black": "#333",
      gray: {
        DEFAULT: "#7b7b7b",
      },
    },
    fontSize: {
      11: "11px",
      13: "13px",
      14: "14px",
    },
    borderRadius: {
      6: "6px",
    },
    lineHeight: {},
    spacing: { 0: "0", 12: "12px", 18: "18px" },
    extend: {},
  },
  plugins: [],
};
