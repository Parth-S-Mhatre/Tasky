// Google OAuth client IDs (Expo public vars, inlined at bundle time).
// The Google button is only rendered when a web client ID is configured,
// so an unconfigured project never shows a dead button.
export const googleConfig = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
};

export const isGoogleConfigured = googleConfig.webClientId.length > 0;
