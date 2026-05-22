import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Ignore files/folders
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
  },

  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',

      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],

      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },

  eslintConfigPrettier,
];
