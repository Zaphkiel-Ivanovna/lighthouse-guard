const { withTamagui } = require('@tamagui/metro-plugin')
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
})

config.resolver.sourceExts.push('mjs')

module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
  outputCSS: './tamagui-web.css',
})