import { useState } from "react";
import { Platform } from "react-native";
import { googleConfig } from "../core/google";
import { useAuthStore } from "./authStore";

let isConfigured = false;

/** Native Google Sign-In, exchanging its ID token for a Firebase credential. */
export function useGoogleAuth(onSuccess: () => void) {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const authLoading = useAuthStore((s) => s.loading);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (authLoading || busy) return;
    setFlowError(null);

    if (Platform.OS === "web") {
      setFlowError("Google sign-in is available in the Android and iOS app.");
      return;
    }
    if (!googleConfig.webClientId) {
      setFlowError("Google sign-in is not configured for this app.");
      return;
    }

    setBusy(true);
    let cancelledCode: string | undefined;
    try {
      // Load only when requested. Expo Go does not contain the native module,
      // and a top-level import would prevent Expo Router from loading auth routes.
      const googleSignIn = await import("@react-native-google-signin/google-signin");
      cancelledCode = googleSignIn.statusCodes.SIGN_IN_CANCELLED;
      if (!isConfigured) {
        googleSignIn.GoogleSignin.configure({
          webClientId: googleConfig.webClientId,
          ...(googleConfig.iosClientId ? { iosClientId: googleConfig.iosClientId } : {}),
          scopes: ["email", "profile"],
        });
        isConfigured = true;
      }
      if (Platform.OS === "android") {
        await googleSignIn.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const result = await googleSignIn.GoogleSignin.signIn();
      if (result.type === "cancelled") return;

      // Android may omit the ID token in the initial response; retrieve it
      // from the signed-in session as recommended by the library.
      const idToken = result.data.idToken ?? (await googleSignIn.GoogleSignin.getTokens()).idToken;
      const success = await signInWithGoogle(idToken);
      if (success) onSuccess();
    } catch (error) {
      const details = error as { code?: string; message?: string };
      if (details.code === cancelledCode) return;
      const message = details.message || String(error);
      console.log("[auth:google-sign-in] Native Google sign-in failed", {
        code: details.code ?? "unknown",
        message,
      });
      setFlowError(
        message.includes("RNGoogleSignin") || message.includes("TurboModuleRegistry")
          ? "Google sign-in needs a development build. Expo Go does not include the native Google Sign-In module."
          : message || "Couldn't complete Google sign-in. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    start,
    ready: !!googleConfig.webClientId && Platform.OS !== "web",
    loading: busy || authLoading,
    error: flowError,
  };
}
