import { FirebaseError } from "firebase/app";

/** Map Firebase auth/firestore errors to friendly messages. Keeps technical code for debugging. */
export function friendlyAuthError(e: unknown): string {
  const code = e instanceof FirebaseError ? e.code : "";
  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and retry.";
    case "auth/missing-password":
      return "Enter your password.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function friendlyFirestoreError(e: unknown): string {
  const code = e instanceof FirebaseError ? e.code : "";
  if (code === "permission-denied")
    return "You don't have permission for this action. Please sign in again.";
  if (code === "unavailable" || code === "failed-precondition")
    return "Network error. Check your connection and retry.";
  if (code === "not-found") return "Task not found. It may have been deleted.";
  return "Couldn't save your tasks. Please try again.";
}

export function errorCode(e: unknown): string {
  return e instanceof FirebaseError ? e.code : "unknown";
}
