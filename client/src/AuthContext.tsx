import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, loadAuthTokenFromStorage, setAuthToken } from './api';

type User = {
  _id: string;
  name: string;
  email: string;
  college: string;
  campus?: string;
  role?: 'student' | 'owner' | 'admin';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    college: string;
    campus?: string;
    role?: 'student' | 'owner';
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadAuthTokenFromStorage();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthToken(res.data.token);
  }

  async function register(data: {
    name: string;
    email: string;
    password: string;
    college: string;
    campus?: string;
  }) {
    const res = await api.post('/auth/register', data);
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthToken(res.data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


