import { FirebaseError } from "firebase/app";

/** Map Firebase auth/firestore errors to friendly messages. Keeps technical code for debugging. */
export function friendlyAuthError(e: unknown): string {
  // Read the Firebase code structurally as well as with instanceof. React Native
  // bundles can load more than one copy of the Firebase error class, making
  // instanceof return false for a real Firebase auth error.
  const code = getFirebaseCode(e);
  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is disabled for this app. Enable it in Firebase Authentication.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
      return "Firebase configuration is invalid. Check the app's Firebase API key.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and retry.";
    case "auth/missing-password":
      return "Enter your password.";
    default:
      // Never surface raw SDK internals in the UI; details stay in console
      // logs via logAuthFailure for debugging.
      return "Something went wrong. Please try again.";
  }
}

function getFirebaseCode(e: unknown): string {
  if (e instanceof FirebaseError) return e.code;
  if (typeof e === "object" && e !== null && "code" in e) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return "";
}

export function friendlyFirestoreError(e: unknown): string {
  const code = getFirebaseCode(e);
  if (code === "permission-denied")
    return "You don't have permission for this action. Please sign in again.";
  if (code === "unavailable" || code === "failed-precondition")
    return "Network error. Check your connection and retry.";
  if (code === "not-found") return "Task not found. It may have been deleted.";
  return "Couldn't save your tasks. Please try again.";
}

export function errorCode(e: unknown): string {
  return getFirebaseCode(e) || "unknown";
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message.trim()) return e.message.trim();
  if (typeof e === "object" && e !== null && "message" in e) {
    const message = (e as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return "";
}

export function friendlyPasswordResetError(e: unknown): string {
  const code = getFirebaseCode(e);
  if (code === "auth/user-not-found") return "No account was found for that email address.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection and retry.";
  return getErrorMessage(e) || "Couldn't send a reset email. Please try again.";
}

/**
 * Google sign-in errors. Returns null when the user dismissed the flow
 * (cancellation is silent, not an error state).
 */
export function friendlyGoogleError(e: unknown): string | null {
  const code = getFirebaseCode(e);
  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/user-cancelled"
  ) {
    return null;
  }
  switch (code) {
    case "auth/account-exists-with-different-credential":
      return "This email already uses another sign-in method. Log in with your password instead.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled for this project yet. Enable it in Firebase Authentication.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and retry.";
    case "auth/invalid-credential":
      return "Google sign-in failed. Check the OAuth client configuration and retry.";
    default:
      break;
  }
  const message = e instanceof Error ? e.message : "";
  if (/dismiss|cancel|435/i.test(message)) return null;
  if (/network/i.test(message))
    return "Network error. Check your connection and retry.";
  if (/client|config|redirect|origin/i.test(message))
    return "Google sign-in isn't configured correctly. Check the OAuth client IDs and retry.";
  return "Couldn't complete Google sign-in. Please try again.";
}
