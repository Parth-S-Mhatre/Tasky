import { FirebaseError, initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  // getReactNativePersistence is exported from the React Native bundle of
  // firebase/auth but omitted from the shared public typings; Metro resolves
  // it at runtime on native. Guarded with typeof below for web safety.
  // @ts-expect-error -- see comment above
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let initError: string | null = null;

function required(name: string, value: string | undefined): string {
  if (!value) {
    initError = `Missing ${name}. Add it to .env (local) and to EAS environment variables (cloud builds).`;
    throw new Error(initError);
  }
  return value;
}

// NOTE: ALL vars must use static dot-notation `process.env.EXPO_PUBLIC_*`.
// Expo's Metro bundler only inlines dot-notation accesses at bundle time;
// bracket notation (process.env["VAR"]) is NOT inlined and evaluates to
// undefined in release/Hermes builds, breaking Firebase initialisation.
function getFirebaseConfig() {
  return {
    apiKey: required(
      "EXPO_PUBLIC_FIREBASE_API_KEY",
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY
    ),
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: required(
      "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
    ),
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  };
}

/** Returns the singleton FirebaseApp, creating it on first call. */
function getApp(): FirebaseApp {
  if (appInstance) return appInstance;
  const existing = getApps();
  appInstance = existing.length ? existing[0]! : initializeApp(getFirebaseConfig());
  return appInstance;
}

/** Returns the singleton Auth instance backed by AsyncStorage persistence. */
export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  const app = getApp();
  // On web (or any bundle without the RN build) getReactNativePersistence is
  // undefined; fall through to default persistence instead of throwing.
  const rnPersistence =
    typeof getReactNativePersistence === "function"
      ? getReactNativePersistence(AsyncStorage)
      : undefined;
  if (!rnPersistence) {
    authInstance = getAuth(app);
    return authInstance;
  }
  try {
    // initializeAuth with AsyncStorage persistence — sessions survive app restarts.
    authInstance = initializeAuth(app, { persistence: rnPersistence });
  } catch (e) {
    // initializeAuth throws "auth/already-initialized" during Fast Refresh;
    // fall back to getAuth which returns the already-initialised instance.
    if (e instanceof FirebaseError && e.code === "auth/already-initialized") {
      authInstance = getAuth(app);
    } else {
      initError = e instanceof Error ? e.message : "Firebase Authentication could not start.";
      throw e;
    }
  }
  return authInstance;
}

/** Returns the singleton Firestore instance. */
export function getDb(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getApp());
  return dbInstance;
}

export function getInitError(): string | null {
  return initError;
}
