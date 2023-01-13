/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      transparent: "transparent",
      white: "#fff",
      purple: {
        DEFAULT: "#5f55ec",
      },
      gray: {
        DEFAULT: "#7b7b7b",
      },
      "cool-black": "#333",
    },
  },
  plugins: [],
};
