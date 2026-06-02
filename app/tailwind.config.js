/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:     { DEFAULT: '#C8501C', dark: '#9E3D15', light: '#E8703C' },
        accent:    { DEFAULT: '#F09828', dark: '#C87018', light: '#F8C058' },
        secondary: { DEFAULT: '#8A5A38', dark: '#5A3820', light: '#B88060' },
        // Tema cálido tipo "atardecer mexicano"
        night:     { DEFAULT: '#3D1A08', soft: '#5C2E14', light: '#7C4828', dark: '#201004' },
        sand:      { 50: '#FFFCF0', 100: '#FFF5DE', 200: '#FFE8C0', 300: '#F0CF98' },
        ink:       { DEFAULT: '#3A2010', muted: '#7A5530' }
      },
      fontFamily: {
        script:   ['"Pacifico"', '"Brush Script MT"', 'cursive'],
        sans:     ['"Plus Jakarta Sans"', '"Nunito"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body:     ['"Plus Jakarta Sans"', '"Nunito"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display:  ['"Outfit"', '"Plus Jakarta Sans"', '"Nunito"', 'sans-serif'],
        impact:   ['"Anton"', '"Bebas Neue"', '"Arial Narrow"', 'sans-serif']
      },
      backgroundImage: {
        'papel-picado':  "url('/assets/decor/papel-picado.svg')",
        'fiesta-pattern':"url('/assets/decor/fiesta-pattern.svg')"
      },
      boxShadow: {
        soft: '0 4px 14px rgba(90,56,32,0.10)',
        elev: '0 12px 32px rgba(90,56,32,0.20)'
      },
      maxWidth: {
        prose: '70ch'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'none' } }
      },
      animation: {
        fadeIn: 'fadeIn .6s ease-out both'
      }
    }
  },
  plugins: []
}
