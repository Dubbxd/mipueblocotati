/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:     { DEFAULT: '#AD0A09', dark: '#7C0606', light: '#D62828' },
        accent:    { DEFAULT: '#E2592A', dark: '#B8431A', light: '#F08056' },
        secondary: { DEFAULT: '#745545', dark: '#4A3528', light: '#A87D63' },
        // Tema oscuro tipo "cantina nocturna"
        night:     { DEFAULT: '#1A0E08', soft: '#2A1812', light: '#3D2620', dark: '#0F0805' },
        sand:      { 50: '#FBF6EC', 100: '#F5ECD9', 200: '#EBDFCE', 300: '#D8C4A8' },
        ink:       { DEFAULT: '#232323', muted: '#5A5A5A' }
      },
      fontFamily: {
        script:   ['"Pacifico"', '"Brush Script MT"', 'cursive'],
        sans:     ['"Nunito"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body:     ['"Nunito"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display:  ['"Fraunces"', 'Georgia', '"Times New Roman"', 'serif'],
        impact:   ['"Anton"', '"Bebas Neue"', '"Arial Narrow"', 'sans-serif']
      },
      backgroundImage: {
        'papel-picado':  "url('/assets/decor/papel-picado.svg')",
        'fiesta-pattern':"url('/assets/decor/fiesta-pattern.svg')"
      },
      boxShadow: {
        soft: '0 4px 14px rgba(74,53,40,0.10)',
        elev: '0 12px 32px rgba(74,53,40,0.18)'
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
