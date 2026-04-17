/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const rotateX = plugin(function ({ addUtilities }) {
    addUtilities({
        '.rotate-y-180': {
            transform: 'rotateY(180deg)',
        },
    });
});

// Sidebar width from environment variables
const sidebarWidth = process.env.NEXT_PUBLIC_SIDEBAR_WIDTH || '220';
const sidebarCollapsedWidth = process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSED_WIDTH || '100';

module.exports = {
    content: [
        "./src/**/*.{js,jsx,tsx,ts}",
    ],
    safelist: [
        'lg:col-start-1',
        'col-span-full',
    ],
    corePlugins: {
        preflight: false,
    },
    darkMode: 'class',
    theme: {
        container: {
            center: true,
        },
        extend: {
            backgroundOpacity: {
                '82' : '0.82'
            },
            colors: {
                // === CSS Variable-based theme colors (auto dark mode support) ===
                'bg-primary': 'var(--color-bg-primary)',
                'bg-secondary': 'var(--color-bg-secondary)',
                'bg-tertiary': 'var(--color-bg-tertiary)',
                'bg-panel': 'var(--color-bg-panel)',
                'bg-sidebar': 'var(--color-bg-sidebar)',
                'bg-header': 'var(--color-bg-header)',
                'bg-dropdown': 'var(--color-bg-dropdown)',
                'bg-modal': 'var(--color-bg-modal)',
                'bg-hover': 'var(--color-bg-hover)',
                'bg-active': 'var(--color-bg-active)',
                'bg-selected': 'var(--color-bg-selected)',

                'text-primary-theme': 'var(--color-text-primary)',
                'text-secondary-theme': 'var(--color-text-secondary)',
                'text-tertiary-theme': 'var(--color-text-tertiary)',
                'text-link-theme': 'var(--color-text-link)',

                'border-primary-theme': 'var(--color-border-primary)',
                'border-secondary-theme': 'var(--color-border-secondary)',
                'border-light-theme': 'var(--color-border-light)',
                'border-dark-theme': 'var(--color-border-dark)',

                // === Original colors (maintained for compatibility) ===
                primary: {
                    DEFAULT: '#4680ff',
                    light: '#eaf1ff',
                    'dark-light': 'rgba(67,97,238,.15)',
                },
                secondary: {
                    DEFAULT: '#805dca',
                    light: '#ebe4f7',
                    'dark-light': 'rgb(128 93 202 / 15%)',
                },
                success: {
                    DEFAULT: '#00ab55',
                    light: '#ddf5f0',
                    'dark-light': 'rgba(0,171,85,.15)',
                },
                danger: {
                    DEFAULT: '#e7515a',
                    light: '#fff5f5',
                    'dark-light': 'rgba(231,81,90,.15)',
                },
                warning: {
                    DEFAULT: '#e2a03f',
                    light: '#fff9ed',
                    'dark-light': 'rgba(226,160,63,.15)',
                },
                info: {
                    DEFAULT: '#2196f3',
                    light: '#e7f7ff',
                    'dark-light': 'rgba(33,150,243,.15)',
                },
                dark: {
                    DEFAULT: '#3b3f5c',
                    light: '#eaeaec',
                    'dark-light': 'rgba(59,63,92,.15)',
                },
                black: {
                    DEFAULT: '#0e1726',
                    light: '#e3e4eb',
                    'dark-light': 'rgba(14,23,38,.15)',
                },
                white: {
                    DEFAULT: '#ffffff',
                    light: '#e0e6ed',
                    dark: '#888ea8',
                },
                gray: {
                    DEFAULT: '#868e96',
                    light: '#f1f3f5',
                    'dark-light': 'rgba(134,142,150,.15)',
                },
                red: {
                    DEFAULT: '#fa5252',
                    light: '#ffe3e3',
                    'dark-light': 'rgba(250,82,82,.15)',
                },
                pink: {
                    DEFAULT: '#e64980',
                    light: '#f8d7da',
                    'dark-light': 'rgba(230,73,128,.15)',
                },
                grape: {
                    DEFAULT: '#be4bdb',
                    light: '#f3d9fa',
                    'dark-light': 'rgba(190,75,219,.15)',
                },
                violet: {
                    DEFAULT: '#7950f2',
                    light: '#edf2ff',
                    'dark-light': 'rgba(121,80,242,.15)',
                },
                indigo: {
                    DEFAULT: '#4c6ef5',
                    light: '#e0ebff',
                    'dark-light': 'rgba(76,110,245,.15)',
                },
                blue: {
                    DEFAULT: '#228be6',
                    light: '#d0ebff',
                    'dark-light': 'rgba(34,139,230,.15)',
                },
                cyan: {
                    DEFAULT: '#15aabf',
                    light: '#c3fae8',
                    'dark-light': 'rgba(21,170,191,.15)',
                },
                green: {
                    DEFAULT: '#40c057',
                    light: '#d3f9d8',
                    'dark-light': 'rgba(64,192,87,.15)',
                },
                lime: {
                    DEFAULT: '#82c91e',
                    light: '#f4fce3',
                    'dark-light': 'rgba(130,201,30,.15)',
                },
                yellow: {
                    DEFAULT: '#fab005',
                    light: '#fff3bf',
                    'dark-light': 'rgba(250,176,5,.15)',
                },
                orange: {
                    DEFAULT: '#f76707',
                    light: '#ffe8cc',
                    'dark-light': 'rgba(247,103,7,.15)',
                },
                teal: {
                    DEFAULT: '#20c997',
                    light: '#e6fcf5',
                    'dark-light': 'rgba(32,201,151,.15)',
                },

            },
            fontFamily: {
                pretendard: ["var(--font-pretendard)"],
            },
            spacing: {
                4.5: '18px',
            },
            boxShadow: {
                '3xl': '0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)',
            },
            animation: {
                'pulse-grow': 'pulse-grow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'mantine-pulse': 'mantine-pulse 1.5s linear infinite',
            },
            keyframes: {
                'pulse-grow': {
                    '0%, 100%': {
                        opacity: 1,
                    },
                    '50%': {
                        transform: 'scale(1.3)',
                        opacity: 0,
                    },
                },
                'mantine-pulse': {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' },
                },
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-invert-headings': theme('colors.white.dark'),
                        '--tw-prose-invert-links': theme('colors.white.dark'),
                        h1: { fontSize: '40px', marginBottom: '0.5rem', marginTop: 0 },
                        h2: { fontSize: '32px', marginBottom: '0.5rem', marginTop: 0 },
                        h3: { fontSize: '28px', marginBottom: '0.5rem', marginTop: 0 },
                        h4: { fontSize: '24px', marginBottom: '0.5rem', marginTop: 0 },
                        h5: { fontSize: '20px', marginBottom: '0.5rem', marginTop: 0 },
                        h6: { fontSize: '16px', marginBottom: '0.5rem', marginTop: 0 },
                        p: { marginBottom: '0.5rem' },
                        li: { margin: 0 },
                        img: { margin: 0 },
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'),
        rotateX,
    ],
};