/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'var(--theme-primary-50, #fff7ed)',
                    100: 'var(--theme-primary-100, #ffedd5)',
                    200: 'var(--theme-primary-200, #fed7aa)',
                    300: 'var(--theme-primary-300, #fdba74)',
                    400: 'var(--theme-primary-400, #fb923c)',
                    500: 'var(--theme-primary-500, #f97316)',
                    600: 'var(--theme-primary-600, #ea580c)',
                    700: 'var(--theme-primary-700, #c2410c)',
                    800: 'var(--theme-primary-800, #9a3412)',
                    900: 'var(--theme-primary-900, #7c2d12)',
                },
                secondary: {
                    50: 'var(--theme-secondary-50, #f8fafc)',
                    100: 'var(--theme-secondary-100, #f1f5f9)',
                    200: 'var(--theme-secondary-200, #e2e8f0)',
                    300: 'var(--theme-secondary-300, #cbd5e1)',
                    400: 'var(--theme-secondary-400, #94a3b8)',
                    500: 'var(--theme-secondary-500, #64748b)',
                    600: 'var(--theme-secondary-600, #475569)',
                    700: 'var(--theme-secondary-700, #334155)',
                    800: 'var(--theme-secondary-800, #1e293b)',
                    900: 'var(--theme-secondary-900, #0f172a)',
                },
                accent: {
                    50: 'var(--theme-accent-50, #fff7ed)',
                    100: 'var(--theme-accent-100, #ffedd5)',
                    200: 'var(--theme-accent-200, #fed7aa)',
                    300: 'var(--theme-accent-300, #fdba74)',
                    400: 'var(--theme-accent-400, #fb923c)',
                    500: 'var(--theme-accent-500, #f97316)',
                    600: 'var(--theme-accent-600, #ea580c)',
                    700: 'var(--theme-accent-700, #c2410c)',
                    800: 'var(--theme-accent-800, #9a3412)',
                    900: 'var(--theme-accent-900, #7c2d12)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'float-gentle': 'floatGentle 4s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'ping-slow': 'pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
                'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
                'shimmer-fast': 'shimmer 1.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                floatGentle: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                pingSlow: {
                    '75%, 100%': { transform: 'scale(2)', opacity: '0' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
