import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { decodeJwt } from '../utils/jwt';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  userId: number | null;
  userRole: string | null;
  isAdmin: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  const decoded = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token);
  }, [token]);

  const userId = decoded ? parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || '0', 10) : null;
  const userRole = decoded ? (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'Member') : null;
  const isAdmin = userRole === 'Admin' || userRole === 'admin';

  const logout = () => setTokenState(null);
  const setToken = (t: string | null) => setTokenState(t);

  const value = useMemo(() => ({ token, isAuthenticated: !!token, userId, userRole, isAdmin, setToken, logout }), [token, userId, userRole, isAdmin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


