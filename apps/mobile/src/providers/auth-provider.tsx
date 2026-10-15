import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { onSessionExpired } from '@/lib/api';
import { authApi, type AuthUser } from '@/lib/auth-api';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/token-storage';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Resolves false when the user closes the browser without signing in */
  signInWithGoogle: () => Promise<boolean>;
  signUp: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Reasons the API puts in the redirect when Google sign-in fails
const GOOGLE_ERRORS: Record<string, string> = {
  signup_closed: 'Sign-up is closed at the moment. Please try again later.',
  email_unverified: 'Your Google account email is not verified.',
  account_disabled: 'This account has been disabled.',
};
const GOOGLE_FAILED = 'Google sign-in failed. Please try again.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // An expired access token is fine: /user/me refreshes it with the stored refresh token
    Promise.all([getAccessToken(), getRefreshToken()])
      .then(([access, refresh]) => (access || refresh ? authApi.me() : null))
      .then((result) => setUser(result?.data ?? null))
      // A refused refresh already cleared the tokens; anything else (offline) keeps them for next launch
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // A refused refresh means the session ended elsewhere (logout, deactivation, expiry); screens
  // redirect to login once there is no user
  useEffect(() => onSessionExpired(() => setUser(null)), []);

  async function signIn(email: string, password: string) {
    const result = await authApi.login({ email: email.trim().toLowerCase(), password });
    await setTokens(result.data.access_token, result.data.refresh_token);
    setUser(result.data.user);
  }

  async function signInWithGoogle() {
    // myauthmobile://auth/google in a build, exp://<host>/--/auth/google in Expo Go
    const redirectUri = Linking.createURL('auth/google');
    const start = await authApi.googleStart({ redirectUri });
    const result = await WebBrowser.openAuthSessionAsync(start.data.url, redirectUri);
    if (result.type !== 'success') return false;

    const { error, code } = Linking.parse(result.url).queryParams ?? {};
    if (typeof error === 'string') throw new Error(GOOGLE_ERRORS[error] ?? GOOGLE_FAILED);
    if (typeof code !== 'string') throw new Error(GOOGLE_FAILED);

    const login = await authApi.googleExchange({ code, verifier: start.data.verifier });
    await setTokens(login.data.access_token, login.data.refresh_token);
    setUser(login.data.user);
    return true;
  }

  async function signUp(data: { firstName: string; lastName: string; email: string; password: string }) {
    await authApi.register({ ...data, email: data.email.trim().toLowerCase() });
  }

  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      await clearTokens();
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({ user, isLoading, signIn, signInWithGoogle, signUp, signOut }),
    [user, isLoading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
