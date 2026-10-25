// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // React Native's package exports are resolved by Metro, not eslint's Node resolver.
      'import/no-unresolved': ['error', { ignore: ['^react-native$'] }],
    },
  },
]);
