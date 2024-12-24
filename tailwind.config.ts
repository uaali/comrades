import type { Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["PoppinsBold", "sans-serif"],
        poppinsB: ["PoppinsExtraBold", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        text: {
          50: "#050316", // original text color
          100: "#1a1830",
          200: "#2f2d4a",
          300: "#454264",
          400: "#5b577e",
          500: "#716d98",
          600: "#8884b2",
        },
        background: {
          50: "#f0f0ff",
          100: "#f5f5ff",
          200: "#fbfbfe", // original background color
          300: "#ffffff",
        },
        primary: {
          50: "#0d0936",
          100: "#1a1568",
          200: "#2f27ce", // original primary color
          300: "#443dff",
          400: "#6659ff",
          500: "#8875ff",
        },
        secondary: {
          50: "#d1ceff",
          100: "#d6d3ff",
          200: "#dddbff", // original secondary color
          300: "#e4e3ff",
          400: "#ebeaff",
        },
        accent: {
          50: "#2f27ce",
          100: "#3832e6",
          200: "#443dff", // original accent color
          300: "#5950ff",
          400: "#6e66ff",
        },
      },
    },
  },
  plugins: [flowbite.plugin()],
} satisfies Config;
