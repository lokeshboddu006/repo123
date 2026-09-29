/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grove: {
          50:  '#f0f5ee',
          100: '#dce8d8',
          200: '#b9d1b2',
          300: '#85AB8B',
          400: '#6b9472',
          500: '#4b5b47',
          600: '#3d5638',
          700: '#336443',
          800: '#2d3a2a',
          900: '#1f2a1d',
          950: '#141c12',
        },
        brand: {
          50:  '#f0f5ee',
          100: '#dce8d8',
          200: '#b9d1b2',
          500: '#336443',
          600: '#2d4228',
          700: '#1f2a1d',
          800: '#141c12',
          900: '#0c120b',
        },
        surface: {
          DEFAULT: '#f8faf7',
          50:  '#ffffff',
          100: '#f8faf7',
          200: '#f0f4ee',
          300: '#e4ebe1',
          400: '#d1dace',
        }
      },
      fontFamily: {
        display: ['"Neue Haas Grotesk Display Pro 55 Roman"', '"Neue Haas Grotesk Text Pro"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body:    ['"Neue Haas Grotesk Text Pro"', 'Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        inter:   ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass':     '0 8px 32px rgba(31, 42, 29, 0.08)',
        'glass-lg':  '0 16px 48px rgba(31, 42, 29, 0.12)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'card':       '0 1px 3px rgba(31, 42, 29, 0.06), 0 1px 2px rgba(31, 42, 29, 0.04)',
        'card-hover': '0 10px 40px rgba(31, 42, 29, 0.10)',
        'elevated':   '0 20px 60px rgba(31, 42, 29, 0.15)',
      },
      backgroundImage: {
        'gradient-grove': 'linear-gradient(135deg, #1f2a1d 0%, #336443 50%, #85AB8B 100%)',
        'gradient-grove-soft': 'linear-gradient(135deg, #f0f5ee 0%, #dce8d8 50%, #f8faf7 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #85AB8B30 0px, transparent 50%), radial-gradient(at 80% 80%, #33644320 0px, transparent 50%), radial-gradient(at 0% 50%, #dce8d830 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
