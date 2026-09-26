module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Plugins run before presets: Unistyles must process files before the React Compiler (bundled in babel-preset-expo).
    plugins: [['react-native-unistyles/plugin', { root: 'src' }]],
  };
};
