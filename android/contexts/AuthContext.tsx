import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { apiData, getToken, loginRequest, setToken } from '@/lib/api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  school_id: string | null;
};

type Ctx = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = await getToken();
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const me = await apiData<AuthUser>('/api/auth/me');
      setUser(me);
    } catch {
      await setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      await setToken(data.token);
      await refresh();
      const role = data.user?.role as string;
      if (role === 'parent') router.replace('/parent');
      else router.replace('/(tabs)');
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
    router.replace('/login');
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth requires AuthProvider');
  return c;
}
