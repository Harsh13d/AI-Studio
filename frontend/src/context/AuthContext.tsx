import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  useCallback,
  useEffect,
} from 'react';
import * as api from '../services/api';
import type { AuthResponse } from '../types';

type AuthContextValue = {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  authError: string | null;
  signup: (payload: { email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'ai-studio-session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readInitialState = (): AuthResponse | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthResponse | null>(() => readInitialState());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const handleAuth = useCallback(async (action: 'login' | 'signup', payload: { email: string; password: string }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = action === 'login' ? await api.login(payload) : await api.signup(payload);
      setSession(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to authenticate';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      authError,
      signup: (payload) => handleAuth('signup', payload),
      login: (payload) => handleAuth('login', payload),
      logout: () => setSession(null),
    }),
    [session, isLoading, authError, handleAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

