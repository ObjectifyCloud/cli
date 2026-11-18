import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.wrangler/', 'coverage/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // ESM package ("type": "module"): require() throws at runtime, as `logout` once did.
      '@typescript-eslint/no-require-imports': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
    },
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
