/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stater-blue': '#31518b',
        'stater-blue-dark': '#1d2951',
      },
      height: {
        'screen-safe': [
          '100vh',
          '100dvh',
          'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
        ],
        'dvh': '100dvh',
        'svh': '100svh',
      },
      minHeight: {
        'screen-safe': [
          '100vh',
          '100dvh', 
          'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
        ],
        'dvh': '100dvh',
        'svh': '100svh',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      padding: {
        'safe': 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        'safe-t': 'env(safe-area-inset-top)',
        'safe-r': 'env(safe-area-inset-right)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
      },
      margin: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-r': 'env(safe-area-inset-right)', 
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
      }
    },
  },
  plugins: [],
}
