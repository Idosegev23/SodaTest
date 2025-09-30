/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'var(--color-bg)',
        'text': 'var(--color-text)',
        'muted': 'var(--color-muted)',
        'chrome': 'var(--color-chrome)',
        'gold': 'var(--color-gold)',
      },
      fontFamily: {
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'rubik': ['var(--font-rubik)', 'sans-serif'],
        'heebo': ['var(--font-rubik)', 'sans-serif'], // Backwards compatibility
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        scroll: 'scroll linear infinite',
        'fade-in': 'fadeIn 1s ease-out',
        marquee: 'marquee 40s linear infinite',
        'marquee-reverse': 'marqueeReverse 40s linear infinite',
      },
    },
  },
  plugins: [],
}

