const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo SDK 53's Metro package-exports resolver can select Firebase Auth's
// non-native entry, which leaves the Auth component unregistered at runtime.
// Use Metro's legacy React Native package resolution for Firebase packages.
config.resolver.unstable_enablePackageExports = false;

// Firebase publishes CommonJS entry files that Metro must be able to resolve.
if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

module.exports = config;
