module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
darkMode: 'class',   // <-- add this line
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        funnel: ['var(--font-funnel)', 'sans-serif'],
        sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};