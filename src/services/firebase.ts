import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBC0XCJNBvPPTCk7jRXwwyqdlQIUv1Cmpg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invoice-88bba.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invoice-88bba",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invoice-88bba.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1084310681550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1084310681550:web:e1c399aa95ae68358ddd9f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S8NK6VC8EK"
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

export default app;
