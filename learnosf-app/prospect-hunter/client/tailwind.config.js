/** @type {import('tailwindcss').Config} */
import animatePlugin from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [animatePlugin]
};
