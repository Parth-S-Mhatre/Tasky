import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "../core/firebase";

/** All Firebase Auth calls go through here; screens use the store. */
export const authRepository = {
  async signUp(email: string, password: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );
    return cred.user;
  },
  async signIn(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );
    return cred.user;
  },
  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth());
  },
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  },
  /** Google Sign-In ID token exchanged for a Firebase user. */
  async signInWithGoogle(idToken: string): Promise<User> {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCred = await signInWithCredential(getFirebaseAuth(), credential);
    return userCred.user;
  },
};
