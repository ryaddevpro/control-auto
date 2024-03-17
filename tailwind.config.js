/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#312E81", // Jaune
          secondary: "#00C89C", // Orange
          accent: "#4F8073", // Jaune plus clair
          neutral: "#C7FCEC", // Marron
        },
      },
    ],
    darkMode: false,
  },
};
