import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "@/lib/tokenStorage";
import * as authService from "@/services/authService";
import { User, UserRole } from "@/types/user";

type AuthContextValue = {
  /** The signed-in user, or null */
  user: User | null;
  /** True while we check a saved token on page load */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: authService.RegisterInput) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Where each role lands after signing in. */
export function dashboardPath(role: UserRole): string {
  return `/${role}/dashboard`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" if there is a saved token to check.
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null);

  // On page load: if a token is saved, ask the server who it belongs to.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authService
      .fetchMe()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // The API client fires this when the server says the session is no longer valid.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("pamoja:unauthorized", onUnauthorized);
    return () => window.removeEventListener("pamoja:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (input: authService.RegisterInput) => {
    const result = await authService.register(input);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** const { user, login, logout } = useAuth();  Only works inside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
