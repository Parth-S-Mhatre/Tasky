import { create } from "zustand";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, getInitError } from "../core/firebase";
import { errorCode, friendlyAuthError, friendlyGoogleError, friendlyPasswordResetError } from "../core/errors";
import { authRepository } from "../data/authRepository";
import { useTaskStore } from "./taskStore";

function logAuthFailure(operation: "sign-in" | "sign-up" | "password-reset", error: unknown) {
  const details =
    typeof error === "object" && error !== null
      ? (error as { message?: unknown; stack?: unknown })
      : undefined;
  // console.error opens Expo's red error overlay, which hides the helpful
  // error message on the login screen. Keep this as a regular diagnostic log.
  console.log(`[auth:${operation}] Authentication failed`, {
    code: errorCode(error),
    message:
      typeof details?.message === "string"
        ? details.message
        : String(error),
    ...(typeof details?.stack === "string" ? { stack: details.stack } : {}),
  });
}

interface AuthState {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  init: () => () => void;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signInWithGoogle: (idToken: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initializing: true,
  loading: false,
  error: getInitError(),

  init: () => {
    let unsub: () => void = () => {};
    try {
      unsub = onAuthStateChanged(
        getFirebaseAuth(),
        (user) => {
          const prevUid = get().user?.uid;
          set({ user, initializing: false });
          // Prevent cross-account leakage: resubscribe / clear tasks.
          if (user?.uid !== prevUid) {
            useTaskStore.getState().handleAccountChange(user?.uid ?? null);
          }
        },
        () =>
          set({
            initializing: false,
            error: "Couldn't restore session. Please sign in.",
          })
      );
    } catch {
      set({ initializing: false, error: getInitError() });
    }
    return unsub;
  },

  signUp: async (email, password) => {
    if (get().loading) return false;
    set({ loading: true, error: null });
    try {
      await authRepository.signUp(email, password);
      set({ loading: false });
      return true;
    } catch (e) {
      logAuthFailure("sign-up", e);
      set({ loading: false, error: friendlyAuthError(e) });
      return false;
    }
  },

  signIn: async (email, password) => {
    if (get().loading) return false;
    set({ loading: true, error: null });
    try {
      await authRepository.signIn(email, password);
      set({ loading: false });
      return true;
    } catch (e) {
      logAuthFailure("sign-in", e);
      set({ loading: false, error: friendlyAuthError(e) });
      return false;
    }
  },

  sendPasswordReset: async (email) => {
    if (get().loading) return false;
    set({ loading: true, error: null });
    try {
      await authRepository.sendPasswordReset(email);
      set({ loading: false });
      return true;
    } catch (e) {
      logAuthFailure("password-reset", e);
      set({ loading: false, error: friendlyPasswordResetError(e) });
      return false;
    }
  },

  signInWithGoogle: async (idToken) => {
    if (get().loading) return false;
    set({ loading: true, error: null });
    try {
      await authRepository.signInWithGoogle(idToken);
      set({ loading: false });
      return true;
    } catch (e) {
      // Dismissals stay silent; real failures surface a message.
      set({ loading: false, error: friendlyGoogleError(e) });
      return false;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await authRepository.signOut();
    } finally {
      useTaskStore.getState().handleAccountChange(null);
      set({ loading: false, user: null, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
