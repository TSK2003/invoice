import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App instance (singleton)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (with browser support check)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics not supported in this environment:', err);
    });
}

// Firestore Database instance
export const db: Firestore = getFirestore(app);

// Authentication instance
export const auth: Auth = getAuth(app);

// Storage instance
export const storage: FirebaseStorage = getStorage(app);

export default app;
