/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        ruqaa: ['"Aref Ruqaa"', 'serif'],
      },
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-base-2': 'var(--bg-base-2)',
        'aurora-violet': 'var(--aurora-violet)',
        'aurora-cyan': 'var(--aurora-cyan)',
        'aurora-mint': 'var(--aurora-mint)',
        'aurora-coral': 'var(--aurora-coral)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      borderRadius: {
        glass: '28px',
        'glass-sm': '16px',
        'glass-xs': '10px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(90, 110, 160, 0.18)',
        'glass-lg': '0 16px 48px rgba(90, 110, 160, 0.22)',
        'glass-inset': 'inset 0 1px 0 rgba(255,255,255,0.8)',
      },
      keyframes: {
        'blob-drift-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(80px, -60px) scale(1.15)' },
        },
        'blob-drift-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-100px, 40px) scale(1.1)' },
        },
        'blob-drift-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(60px, 80px) scale(0.95)' },
        },
        'blob-drift-4': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-70px, -50px) scale(1.2)' },
        },
        'blob-drift-5': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, 70px) scale(1.05)' },
        },
        'page-fade': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'cell-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(167, 139, 250, 0.0)' },
          '50%': { boxShadow: '0 0 24px 6px rgba(167, 139, 250, 0.55)' },
        },
        'phrase-fade': {
          '0%, 100%': { opacity: '0', transform: 'translateY(8px)' },
          '10%, 30%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'blob-1': 'blob-drift-1 26s ease-in-out infinite alternate',
        'blob-2': 'blob-drift-2 32s ease-in-out infinite alternate',
        'blob-3': 'blob-drift-3 28s ease-in-out infinite alternate',
        'blob-4': 'blob-drift-4 30s ease-in-out infinite alternate',
        'blob-5': 'blob-drift-5 24s ease-in-out infinite alternate',
        'page-fade': 'page-fade 200ms ease-out',
        'shake': 'shake 350ms ease-in-out',
        'cell-glow': 'cell-glow 2s ease-in-out infinite',
        'phrase-fade': 'phrase-fade 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
