import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_d04pjpgQbE71dG5r5mD6Li_raGSXlY8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invoice-ebf0e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invoice-ebf0e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invoice-ebf0e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "12098079695",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:12098079695:web:9f203738d7964d317aa0ba",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TT64WX6VTL"
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
