

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (name: string, password?: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateName: (name: string) => void;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
  addExp: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('xiguang_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save user to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('xiguang_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('xiguang_user');
    }
  }, [user]);

  const login = (name: string, password?: string): boolean => {
    // Admin Check
    if (name === 'admin' && password === '19327829319') {
        const adminUser: User = {
            id: 'admin_id',
            name: '系統管理員',
            avatarId: 1,
            points: 99999,
            level: 99,
            exp: 99999,
            joinedDate: new Date().toISOString(),
            gamesPlayed: 0,
            gamesCreated: 0,
            isAdmin: true,
            isPro: true,
            followers: 8888,
            following: 12
        };
        setUser(adminUser);
        return true;
    }

    // Normal User Login (Simulated)
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      avatarId: Math.floor(Math.random() * 8) + 1,
      points: 100, // Welcome bonus
      level: 1,
      exp: 0,
      joinedDate: new Date().toISOString(),
      gamesPlayed: 0,
      gamesCreated: 0,
      followers: 0,
      following: 0
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
      if (!user) return;
      setUser({ ...user, ...data });
  };

  const updateName = (name: string) => {
      if (!user) return;
      setUser({ ...user, name });
  }

  const addPoints = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, points: prev.points + amount } : null);
  };

  const deductPoints = (amount: number): boolean => {
    if (!user || user.points < amount) return false;
    setUser(prev => prev ? { ...prev, points: prev.points - amount } : null);
    return true;
  };

  const addExp = (amount: number) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const newExp = prev.exp + amount;
      const newLevel = Math.floor(newExp / 100) + 1;
      return { ...prev, exp: newExp, level: newLevel };
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, updateName, addPoints, deductPoints, addExp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};