import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase';

export async function loginWithEmail(email: string, password: string):Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}
