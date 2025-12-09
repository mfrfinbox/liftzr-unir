module.exports = function (api) {
  api.cache(true);
  const plugins = [['inline-import', { extensions: ['.sql'] }]];

  // Push React Native Worklets plugin at the end of the plugins array (replaces reanimated plugin)
  plugins.push('react-native-worklets/plugin');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins,
  };
};
