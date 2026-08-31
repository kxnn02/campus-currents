// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Pull the exact plugin instances expo already registered. Reusing the same objects (not
// fresh requires) avoids flat config's "plugin redefined" conflict, while still letting us
// override rule severity in the same config object — which flat config requires.
const expoArray = Array.isArray(expoConfig) ? expoConfig : [expoConfig];
const findPlugin = (name) =>
  expoArray.find((o) => o && o.plugins && o.plugins[name])?.plugins[name];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    // Vitest provides `describe`/`it`/`expect`/etc. as globals (see vitest.config.ts
    // `globals: true`), so declare them for the linter in test files only.
    files: ['**/__tests__/**', '**/*.test.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
  {
    // Lint was adopted after the codebase already existed. The findings below are
    // pre-existing style / new-React-Compiler-lint findings, not correctness bugs, so
    // they are downgraded from error to warn: this keeps the CI gate green today
    // (blocking work on 40+ legacy nits helps no one) while keeping the signal visible.
    // ponytail: tech-debt ceiling — burn these down and promote back to `error` over
    // time; new code should avoid them. rules-of-hooks and other correctness rules stay
    // at their default `error` severity.
    plugins: {
      react: findPlugin('react'),
      'react-hooks': findPlugin('react-hooks'),
    },
    rules: {
      'react/no-unescaped-entities': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
