import { fluentComponents } from './scripts/eslint-plugin-fluent-components/index.js';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          template: true,
          decorators: true
        }
      }
    },
    plugins: {
      'fluent-components': fluentComponents,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      'fluent-components/validate-usage': 'error',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
        template: true,
        decorators: true
      }
    },
    plugins: {
      'fluent-components': fluentComponents
    },
    rules: {
      'fluent-components/validate-usage': 'error'
    }
  }
];
