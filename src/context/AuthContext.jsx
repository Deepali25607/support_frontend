import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get('/api/auth/me');
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const { user } = await api.post('/api/auth/login', { email, password });
    setUser(user);
    return user;
  };

  const signup = async (payload) => {
    const { user } = await api.post('/api/auth/signup', payload);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { user } = await api.patch('/api/auth/me', payload);
    setUser(user);
    return user;
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout, refresh, updateProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
