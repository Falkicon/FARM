import { validateUsage } from '../eslint-rules/fluent-component-validator.js';

export const fluentComponents = {
  rules: {
    'validate-usage': validateUsage
  },
  configs: {
    recommended: {
      plugins: ['fluent-components'],
      rules: {
        'fluent-components/validate-usage': 'error'
      }
    }
  }
};
