import { loginWithEmail, logoutUser, getCurrentUser, subscribeToAuthChanges } from './firebase/auth';
import { User } from 'firebase/auth';

export const authService = {
  async login(email: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const user = await loginWithEmail(email, pass);
      return { success: true, user };
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let message = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email address or password.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to too many failed attempts. Try again later.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  },

  async logout(): Promise<void> {
    await logoutUser();
  },

  getCurrentUser(): User | null {
    return getCurrentUser();
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return subscribeToAuthChanges(callback);
  }
};
