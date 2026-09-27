const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

const RESTRICTED_PATHS = [
  {
    name: 'react-native',
    importNames: ['StyleSheet'],
    message: "Import StyleSheet from 'react-native-unistyles'.",
  },
  {
    name: '@react-native-async-storage/async-storage',
    message: 'Persist through MMKV via @/core/storage.',
  },
];

const RESTRICTED_PATTERNS = {
  navigation: {
    group: ['@react-navigation/*'],
    message: 'expo-router forked React Navigation (SDK 56+): import from expo-router.',
  },
  styling: {
    group: ['uniwind', 'nativewind', 'heroui-native', 'tailwind-*', 'clsx'],
    message: 'Styling is Unistyles v3 only.',
  },
  ble: {
    group: ['react-native-ble-nitro', 'react-native-ble-plx'],
    message: 'Only src/core/ble/transport may talk to the BLE library. Use @/core/ble.',
  },
  appIcon: {
    group: ['expo-alternate-app-icons'],
    message: 'Only src/core/app-icon may change the app icon. Use @/core/app-icon.',
  },
  deepFeature: {
    group: ['@/features/*/*'],
    message: 'Import other features through their public index: @/features/<name>.',
  },
};

const restrictedImports = (...patternKeys) => [
  'error',
  {
    paths: RESTRICTED_PATHS,
    patterns: patternKeys.map((key) => RESTRICTED_PATTERNS[key]),
  },
];

const layerZone = (target, from) => ({
  target: `./src/${target}`,
  from: from.map((layer) => `./src/${layer}`),
  message: 'Layer violation. Allowed direction: app → features → shared → theme → core.',
});

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'coverage/*', 'expo-env.d.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-restricted-imports': restrictedImports('navigation', 'styling', 'ble', 'appIcon', 'deepFeature'),
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            layerZone('core', ['app', 'features', 'shared', 'theme']),
            layerZone('theme', ['app', 'features', 'shared']),
            layerZone('shared', ['app', 'features']),
            layerZone('features', ['app']),
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/logger/logger.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['src/theme/unistyles.ts'],
    rules: { '@typescript-eslint/no-empty-object-type': 'off' },
  },
  {
    files: ['jest.setup.ts', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-restricted-imports': restrictedImports('navigation', 'styling', 'ble', 'deepFeature'),
    },
  },
  {
    files: ['src/core/ble/transport/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedImports('navigation', 'styling', 'appIcon', 'deepFeature'),
    },
  },
  {
    files: ['src/core/app-icon/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedImports('navigation', 'styling', 'ble', 'deepFeature'),
    },
  },
]);
