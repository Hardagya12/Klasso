"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiData, getToken, loginRequest, setToken } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  school_id: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  settings?: Record<string, unknown> | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshMe = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const me = await apiData<AuthUser>("/api/auth/me");
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, [refreshMe]);

  useEffect(() => {
    if (loading) return;
    const pub = pathname === "/" || pathname?.startsWith("/login");
    if (!getToken() && !pub && pathname !== "/") {
      router.replace("/login");
    }
  }, [loading, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      setToken(data.token);
      await refreshMe();
      const role = data.user?.role as string;
      if (role === "admin") router.replace("/admin");
      else if (role === "teacher") router.replace("/teacher");
      else if (role === "student") {
        const profile = await apiData<{ student: { id: string } }>("/api/students/my/profile");
        router.replace(`/student/${profile.student.id}`);
      } else if (role === "parent") router.replace("/parent");
      else router.replace("/");
    },
    [refreshMe, router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: getToken(),
      loading,
      login,
      logout,
      refreshMe,
    }),
    [user, loading, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
