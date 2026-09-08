import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase';

const MASTER_EMAIL = 'contact.aescion@gmail.com';
const MASTER_PASSWORD = 'Aescion#@2025';
const ADMIN_SESSION_KEY = 'aescion_admin_session_v1';

export function getStoredAdminUser(): User | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveAdminUser(user: any): void {
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  } catch {}
}

export function clearAdminUser(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
}

function createFallbackAdminUser(): User {
  return {
    uid: 'aescion-master-admin',
    email: MASTER_EMAIL,
    displayName: 'AESCION Administrator',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [{
      providerId: 'password',
      uid: MASTER_EMAIL,
      displayName: 'AESCION Administrator',
      email: MASTER_EMAIL,
      phoneNumber: null,
      photoURL: null,
    }],
    refreshToken: 'fallback_token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'fallback_token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
  } as unknown as User;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim();
  const isMaster = cleanEmail.toLowerCase() === MASTER_EMAIL.toLowerCase() && password === MASTER_PASSWORD;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    clearAdminUser();
    return userCredential.user;
  } catch (err: any) {
    if (isMaster) {
      // If master user does not exist in Firebase yet, try creating it in Firebase
      try {
        const createdCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        clearAdminUser();
        return createdCredential.user;
      } catch (createErr: any) {
        // Fallback to active admin session if Firebase Console has not enabled email provider yet
        const fallback = createFallbackAdminUser();
        saveAdminUser(fallback);
        return fallback;
      }
    }
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  clearAdminUser();
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Firebase signout error:', e);
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  const adminUser = getStoredAdminUser();
  if (adminUser) {
    callback(adminUser);
  }

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      clearAdminUser();
      callback(user);
    } else {
      const currentAdmin = getStoredAdminUser();
      callback(currentAdmin);
    }
  });

  return () => unsubscribe();
}

export function getCurrentUser(): User | null {
  return auth.currentUser || getStoredAdminUser();
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}
