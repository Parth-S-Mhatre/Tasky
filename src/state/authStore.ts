import { create } from "zustand";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, getInitError } from "../core/firebase";
import { friendlyAuthError } from "../core/errors";
import { authRepository } from "../data/authRepository";
import { useTaskStore } from "./taskStore";

interface AuthState {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  init: () => () => void;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
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
      set({ loading: false, error: friendlyAuthError(e) });
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
