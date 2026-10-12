import { FirebaseError, initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  type Auth,
  // @ts-expect-error - available in firebase v10+ RN builds
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

let authInstance: Auth | null = null;
let initError: string | null = null;

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    initError = `Missing ${name}. Copy .env.example to .env and fill Firebase values.`;
    throw new Error(initError);
  }
  return v;
}

function getFirebaseConfig() {
  return {
    apiKey: required("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: process.env["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"] ?? "",
    projectId: required("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: process.env["EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"] ?? "",
    messagingSenderId: process.env["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
    appId: process.env["EXPO_PUBLIC_FIREBASE_APP_ID"] ?? "",
  };
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  const apps = getApps();
  const app = apps.length ? apps[0]! : initializeApp(getFirebaseConfig());
  // AsyncStorage-backed persistence where supported (firebase v10 RN).
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // initializeAuth throws if already initialized (e.g. Fast Refresh).
    if (e instanceof FirebaseError && e.code === "auth/already-initialized") {
      authInstance = getAuth(app);
    } else {
      // Fallback: in-memory persistence still works for the session.
      authInstance = getAuth(app);
    }
  }
  return authInstance;
}

export function getDb() {
  const apps = getApps();
  const app = apps.length ? apps[0]! : initializeApp(getFirebaseConfig());
  return getFirestore(app);
}

export function getInitError(): string | null {
  return initError;
}
