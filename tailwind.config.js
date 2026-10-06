/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F3FA", // Light background
          100: "#D5DEEF", // Soft surface
          200: "#B1C9EF", // Light accent / border
          300: "#8AAEE0", // Muted element
          400: "#638ECB", // Secondary brand blue
          500: "#395886", // Primary dark blue
        },
        accent: {
          DEFAULT: "#FF8C00", // Vibrant Dark Orange
          amber: "#FF8C00", // Amber / Orange
          coral: "#EE6C4D", // Soft Coral / Terracotta
          vibrant: "#FF5722", // High-contrast Deep Orange
        },
      },
    },
  },
  plugins: [],
};
