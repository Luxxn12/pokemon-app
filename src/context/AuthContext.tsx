// src/context/AuthContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  username: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error('Failed to load user.');
      }
    };
    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (password !== 'password') return false;

    const role: 'admin' | 'user' = username === 'admin' ? 'admin' : 'user';
    const loggedInUser: User = { username, role };
    setUser(loggedInUser);
    await AsyncStorage.setItem('@user', JSON.stringify(loggedInUser));
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
