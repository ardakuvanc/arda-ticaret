/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                love: {
                    50: '#fff0f1',
                    100: '#ffe3e6',
                    200: '#ffcbd2',
                    300: '#ff9ea9',
                    400: '#ff6b7e',
                    500: '#f63b53',
                    600: '#e11d38',
                },
                gold: '#FFD93D',
            },
            fontFamily: {
                sans: ['Nunito', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
            }
        },
    },
    plugins: [],
}
