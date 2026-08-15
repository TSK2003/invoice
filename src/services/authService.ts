// AESCION Document Studio Authentication Service

export interface AuthSession {
  email: string;
  token: string;
  loginTime: number;
  lastActiveTime: number;
}

const AUTH_STORAGE_KEY = 'aescion_auth_session_v1';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const VALID_EMAIL = 'contact.aescion@gmail.com';
const VALID_PASSWORD = 'Aescion#@2025';

export const authService = {
  login(username: string, password: string): { success: boolean; error?: string } {
    const cleanUsername = username.trim().toLowerCase();
    
    if (!cleanUsername || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    if (cleanUsername === VALID_EMAIL.toLowerCase() && password === VALID_PASSWORD) {
      const now = Date.now();
      const session: AuthSession = {
        email: cleanUsername,
        token: `session_${now}_${Math.random().toString(36).substring(2, 12)}`,
        loginTime: now,
        lastActiveTime: now,
      };

      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.error('Failed to write auth session to sessionStorage', e);
      }

      return { success: true };
    }

    return { success: false, error: 'Invalid email address or password. Please check your credentials.' };
  },

  logout(): void {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth session from sessionStorage', e);
    }
  },

  getSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const elapsed = now - (session.lastActiveTime || session.loginTime);

    if (elapsed > INACTIVITY_TIMEOUT_MS) {
      this.logout();
      return false;
    }

    return true;
  },

  touchActivity(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const elapsed = now - session.lastActiveTime;

    if (elapsed > INACTIVITY_TIMEOUT_MS) {
      this.logout();
      return false;
    }

    session.lastActiveTime = now;
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to update active time', e);
    }
    return true;
  },

  getInactivityTimeoutMs(): number {
    return INACTIVITY_TIMEOUT_MS;
  }
};
