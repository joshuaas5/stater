/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        galileo: {
          card: {
            DEFAULT: 'rgb(var(--galileo-card) / <alpha-value>)',
            foreground: 'rgb(var(--galileo-card-foreground))',
          },
          text: {
            DEFAULT: 'rgb(var(--galileo-text) / <alpha-value>)',
            foreground: 'rgb(var(--galileo-text-foreground))',
          },
          border: {
            DEFAULT: 'rgb(var(--galileo-border) / <alpha-value>)',
            foreground: 'rgb(var(--galileo-border-foreground))',
          },
          placeholder: {
            DEFAULT: 'rgb(var(--galileo-placeholder) / <alpha-value>)',
            foreground: 'rgb(var(--galileo-placeholder-foreground))',
          },
        },
      },
    },
  },
  plugins: [],
}
