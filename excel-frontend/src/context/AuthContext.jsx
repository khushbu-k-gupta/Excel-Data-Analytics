import { createContext, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { TOKEN_KEY, ROLE_KEY, USER_KEY } from '../constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  // 🆕 Poora user restore — name, role, avatar sab
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLE_KEY, data.role);
    setToken(data.token);
    persistUser({ id: data.id, name: data.username, role: data.role });
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLE_KEY, data.role);
    setToken(data.token);
    persistUser({ id: data.id, name: data.username, role: data.role });
    return data;
  }, []);

  // 🆕 Profile save ke baad — Navbar/Dashboard turant update
  const updateUser = useCallback((fields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...fields };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    [TOKEN_KEY, ROLE_KEY, USER_KEY].forEach((k) => localStorage.removeItem(k));
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};