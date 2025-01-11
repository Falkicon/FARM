module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      template: true,
      decorators: true
    }
  },
  env: {
    browser: true,
    es2020: true
  },
  globals: {
    HTMLElement: 'readonly'
  },
  plugins: [
    '@typescript-eslint',
    'fluent-components'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:fluent-components/recommended'
  ],
  rules: {
    'fluent-components/validate-usage': 'error',
    'no-useless-escape': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off'
  },
  settings: {
    'fluent-components': {
      templateLiteral: true,
      components: {
        directory: 'src/**/*.ts'
      }
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ]
};
