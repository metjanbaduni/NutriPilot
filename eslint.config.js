const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    plugins: {
      react
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'max-len': ['error', { code: 100 }],
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 50, skipComments: true, skipBlankLines: true }],
      'max-depth': ['error', 3]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['tests/**/*.{js,jsx}'],
    rules: {
      'max-lines-per-function': 'off'
    }
  },
  {
    // Amplify `override.ts` files (amplify/backend/api/*/override.ts and any future
    // category overrides). These are authored source that ships real behaviour — the
    // /profile Cognito authorizer lives here — so they get the same rules as the rest
    // of the tree. Parser only, no TS-specific plugin: the goal is to stop these files
    // being silently skipped, not to introduce a second rule set.
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'warn',
      // Amplify fixes the override(resources, amplifyProjectInfo) signature; the second
      // parameter is part of the contract even when a given override doesn't read it.
      'no-unused-vars': ['error', { args: 'none' }],
      'max-len': ['error', { code: 100 }],
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 50, skipComments: true, skipBlankLines: true }],
      'max-depth': ['error', 3]
    }
  }
];
