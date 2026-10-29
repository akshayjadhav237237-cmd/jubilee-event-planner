/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'paper-bg': '#FAF7F2',
        'teal-primary': '#005B5C',
        'marigold-accent': '#B45309',
        'ink-text': '#1C1917',
        'stone-border': '#E7E5E4',
        'stone-muted': '#57534E',
      },
    },
  },
  plugins: [],
};
