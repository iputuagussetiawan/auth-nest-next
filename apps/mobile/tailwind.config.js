const { light, dark } = require('./src/constants/colors');

// Each web theme token becomes a colour with a dark twin: bg-background dark:bg-background-dark
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const colors = Object.fromEntries(
  Object.keys(light).map((name) => [kebab(name), { DEFAULT: light[name], dark: dark[name] }]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: { colors },
  },
  plugins: [],
};
