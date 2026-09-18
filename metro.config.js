const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /AdminPenal\/.*/,
];

module.exports = config;