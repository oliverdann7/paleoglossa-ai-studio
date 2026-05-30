import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.claude/**',
      'android/**',
      'ios/**',
      'workspace/**',
      'coverage/**',
      'app/applet/**',
      'cleanup.js',
      'scripts/**',
    ],
  },
  // ── TypeScript source files (src + api + e2e + config) ──────────────────
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}', 'api/**/*.{ts,tsx}', 'e2e/**/*.ts', 'vite.config.ts', 'server.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ── TypeScript overrides ─────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      // Disable rules that require a dedicated clean-up pass (pre-existing violations):
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      // ── JS style rules not in this project's style guide ─────────────────
      'curly': 'off',
      'no-shadow': 'off',
    },
  },
  // ── React-specific rules: only for the frontend ─────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Only apply the stable subset of react-hooks v7 rules.
      // Spreading ...reactHooks.configs.recommended.rules pulls in experimental
      // rules that are not yet widely documented.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'error',
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // ── Firebase Security Rules files ────────────────────────────────────────
  {
    files: ['**/*.rules'],
    plugins: {
      '@firebase/security-rules': firebaseRulesPlugin,
    },
    ...firebaseRulesPlugin.configs['flat/recommended'],
    rules: {
      // syntaxAnnotations intentionally allows public reads — it is server-managed (Admin SDK writes only).
      // The @firebase/eslint-plugin-security-rules v0.0.2 does not support inline eslint-disable
      // comments in .rules files, so the suppression is applied at the config level instead.
      '@firebase/security-rules/no-open-reads': 'off',
    },
  }
);
