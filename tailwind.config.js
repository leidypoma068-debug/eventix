import defaultTheme from 'tailwindcss/defaultTheme.js';
import colors from 'tailwindcss/colors.js';
import forms from '@tailwindcss/forms';

export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],

    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
                lg: '4rem',
                xl: '5rem',
                '2xl': '10rem',
            },
        },

        extend: {
            colors: {
                primary: {
                    ...colors.indigo,
                    500: '#6859FB',
                    600: '#5342F9',
                    700: '#4532DB',
                },
                sidebar: '#1B2F62',
                background: '#F5F8FF',
            },

            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};