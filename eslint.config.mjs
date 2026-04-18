import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.ts', '*.config.js'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
            },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        settings: {
            react: { version: '18.2' },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            // React Hooks: only keep the two stable/classic rules. The v7 plugin
            // ships React Compiler lints (cascading renders, preserve-manual-
            // memoization, static-components, set-state-in-effect 등) as errors
            // by default — we don't use React Compiler, so those are noise.
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/ban-ts-comment': [
                'warn',
                {
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': false,
                    'ts-nocheck': true,
                },
            ],
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-empty': ['warn', { allowEmptyCatch: true }],
            'no-prototype-builtins': 'off',
            'no-case-declarations': 'off',
            'prefer-const': 'warn',
            'no-useless-escape': 'warn',
        },
    },
];
