// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintConfigPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
    {
        // Base configuration - applies to all files
        ignores: ['dist/**', 'node_modules/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            prettier: eslintConfigPrettier,
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
        },
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-require-imports': 'off',

            // General rules
            // 'no-console': 'warn',
            'prefer-const': 'error',
            'no-unused-expressions': 'error',
            'no-duplicate-imports': 'error',

            // Prettier integration
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    trailingComma: 'all',
                    printWidth: 100,
                    tabWidth: 4,
                    semi: true,
                    bracketSpacing: true,
                    arrowParens: 'avoid',
                },
            ],
        },
    },
    prettier,
);
