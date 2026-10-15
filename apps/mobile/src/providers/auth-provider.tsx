import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi, type AuthUser } from '@/lib/auth-api';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token-storage';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAccessToken()
      .then((token) => (token ? authApi.me() : null))
      .then((result) => setUser(result?.data ?? null))
      .catch(() => clearAccessToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    const result = await authApi.login({ email: email.trim().toLowerCase(), password });
    await setAccessToken(result.data.access_token);
    setUser(result.data.user);
  }

  async function signUp(data: { firstName: string; lastName: string; email: string; password: string }) {
    await authApi.register({ ...data, email: data.email.trim().toLowerCase() });
  }

  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      await clearAccessToken();
      setUser(null);
    }
  }

  const value = useMemo(() => ({ user, isLoading, signIn, signUp, signOut }), [user, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
