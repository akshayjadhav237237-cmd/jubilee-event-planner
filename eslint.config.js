import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const REACT_DEPS = [
  { name: 'react', message: 'Domain/Data layers cannot depend on React.' },
  { name: 'react-dom', message: 'Domain/Data layers cannot depend on React DOM.' },
  { name: 'zustand', message: 'Domain/Data layers cannot depend on Zustand.' },
];

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.log'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022, ...globals.node },
    },
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: false, skipComments: false }],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['error', { max: 90, skipBlankLines: false, skipComments: false }],
    },
  },
  {
    files: ['tests/**/*'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['src/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Default exports are not allowed in src/. Use named exports instead.',
        },
      ],
    },
  },
  {
    files: ['src/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: REACT_DEPS,
          patterns: [
            {
              group: [
                '../data/**',
                '../ai/**',
                '../state/**',
                '../features/**',
                '../app/**',
                '../shared/**',
              ],
              message: 'Domain layer must only import from src/domain and src/config.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/data/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: REACT_DEPS,
          patterns: [
            {
              group: ['../ai/**', '../state/**', '../features/**', '../app/**', '../shared/**'],
              message: 'Data layer can only import from src/domain.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ai/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'AI layer cannot depend on React.' },
            { name: 'react-dom', message: 'AI layer cannot depend on React DOM.' },
          ],
          patterns: [
            {
              group: ['../features/**', '../state/**'],
              message: 'AI layer cannot import react, features, or state.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/state/**'],
    ignores: ['src/state/hooks.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'State layer cannot depend on React.' },
            { name: 'react-dom', message: 'State layer cannot depend on React DOM.' },
          ],
          patterns: [
            {
              group: ['../features/**', '../ai/**'],
              message: 'State cannot import features or ai.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/state/hooks.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'react-dom', message: 'Hooks cannot depend on React DOM.' }],
          patterns: [
            {
              group: ['../features/**', '../ai/**'],
              message: 'Hooks cannot import features or ai.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../features/**', '**/features/**'], message: 'No cross-feature imports.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../domain/**',
                '../data/**',
                '../state/**',
                '../ai/**',
                '../features/**',
                '../app/**',
              ],
              message: 'Shared layer isolated.',
            },
          ],
        },
      ],
    },
  },
);
