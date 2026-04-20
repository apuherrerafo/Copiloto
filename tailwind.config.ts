import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F5F3',
        surface: '#FFFFFF',
        sage: '#5B7A65',
        coral: '#C47663',
        amber: '#C09050',
        ink: '#1F2420',
        muted: '#6D756F',
        hairline: '#EBE9E6',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31, 36, 32, 0.06), 0 8px 24px rgba(31, 36, 32, 0.06)',
        lift: '0 4px 6px rgba(31, 36, 32, 0.04), 0 16px 40px -12px rgba(31, 36, 32, 0.12)',
        glass: '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 12px 32px -8px rgba(31, 36, 32, 0.1)',
        /** Separates floating panels from home-mesh (sage + peach + coral mist) */
        'hypo-float':
          '0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 10px 36px -10px rgba(91, 122, 101, 0.22), 0 8px 28px -12px rgba(255, 178, 132, 0.28), 0 3px 14px rgba(212, 152, 138, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /** Soft “breathe” on HypoAI invite strip — brightness only, mesh-friendly */
        'hypo-invite-pulse': {
          '0%, 100%': {
            filter: 'brightness(1) saturate(1)',
            boxShadow:
              '0 1px 2px rgba(31, 36, 32, 0.06), 0 8px 24px rgba(31, 36, 32, 0.06), 0 0 0 0 rgba(255, 178, 132, 0)',
          },
          '50%': {
            filter: 'brightness(1.09) saturate(1.05)',
            boxShadow:
              '0 1px 2px rgba(31, 36, 32, 0.06), 0 10px 30px rgba(31, 36, 32, 0.07), 0 0 36px -2px rgba(255, 178, 132, 0.28), 0 0 22px -6px rgba(91, 122, 101, 0.12)',
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'hypo-invite-pulse': 'hypo-invite-pulse 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
