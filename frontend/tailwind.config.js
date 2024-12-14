/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        portage: {
          50: "#f2f7fb",
          100: "#e7f0f8",
          200: "#d3e3f2",
          300: "#b9d0e8",
          400: "#9cb6dd",
          500: "#839dd1",
          600: "#6a80c1",
          700: "#596ca9",
          800: "#4a5a89",
          900: "#414e6e",
          950: "#262d40",
        },
        "barley-corn": {
          50: "#f7f5ef",
          100: "#eae8d7",
          200: "#d7cfb1",
          300: "#c0b284",
          400: "#ad9962",
          500: "#9e8754",
          600: "#876e47",
          700: "#6d563b",
          800: "#5d4836",
          900: "#513f32",
          950: "#2e221a",
        },
      },
      fontFamily: {
        'montserrat': ["Montserrat", "sans-serif"],
        'quicksand': ["Quicksand", "sans-serif"],
      }
    },
  },
  plugins: [],
};