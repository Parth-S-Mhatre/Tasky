const staticConfig = require("./app.json").expo;

const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "";
const iosUrlScheme = iosClientId
  ? `com.googleusercontent.apps.${iosClientId.replace(/\.apps\.googleusercontent\.com$/, "")}`
  : null;

module.exports = {
  ...staticConfig,
  plugins: [
    ...staticConfig.plugins,
    ...(iosUrlScheme
      ? [["@react-native-google-signin/google-signin", { iosUrlScheme }]]
      : []),
  ],
};
