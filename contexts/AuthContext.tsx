
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Message } from '../types';

interface AuthContextType {
  user: User | null;
  login: (name: string, password?: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateName: (name: string) => void;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
  addExp: (amount: number) => void;
  markMessageAsRead: (messageId: string) => void;
  refreshUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount AND sync with DB for new messages
  useEffect(() => {
    const storedUser = localStorage.getItem('xiguang_user');
    if (storedUser) {
      const localUser = JSON.parse(storedUser);
      // SYNC FIX: Attempt to fetch the latest version of this user from the main DB
      // This ensures if Admin sent a message while user was offline/logged out, it gets picked up.
      const allUsers = JSON.parse(localStorage.getItem('xiguang_users_db') || '[]');
      const freshUser = allUsers.find((u: User) => u.id === localUser.id);
      
      setUser(freshUser || localUser);
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
            following: 12,
            messages: []
        };
        setUser(adminUser);
        return true;
    }

    // Normal User Login (Simulated)
    // In a real app, this would fetch from the DB (GameContext.allUsers)
    const existingUsers = JSON.parse(localStorage.getItem('xiguang_users_db') || '[]');
    const foundUser = existingUsers.find((u: User) => u.name === name);

    if (foundUser) {
        setUser(foundUser);
    } else {
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
          following: 0,
          messages: [
              {
                  id: 'welcome_msg',
                  title: '歡迎加入羲光剧游',
                  content: '很高興見到你！開始你的創作之旅吧。',
                  sender: 'System',
                  date: new Date().toISOString(),
                  isRead: false,
                  type: 'system'
              }
          ]
        };
        setUser(newUser);
        // Save new user to DB immediately
        localStorage.setItem('xiguang_users_db', JSON.stringify([...existingUsers, newUser]));
    }
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
      if (!user) return;
      const updated = { ...user, ...data };
      setUser(updated);
      
      // Also update DB
      const existingUsers = JSON.parse(localStorage.getItem('xiguang_users_db') || '[]');
      const newUsers = existingUsers.map((u: User) => u.id === user.id ? updated : u);
      localStorage.setItem('xiguang_users_db', JSON.stringify(newUsers));
  };

  const updateName = (name: string) => {
      if (!user) return;
      updateProfile({ name });
  }

  const addPoints = (amount: number) => {
    if (!user) return;
    updateProfile({ points: user.points + amount });
  };

  const deductPoints = (amount: number): boolean => {
    if (!user || user.points < amount) return false;
    updateProfile({ points: user.points - amount });
    return true;
  };

  const addExp = (amount: number) => {
    if (!user) return;
    const newExp = user.exp + amount;
    const newLevel = Math.floor(newExp / 100) + 1;
    updateProfile({ exp: newExp, level: newLevel });
  };

  const markMessageAsRead = (messageId: string) => {
      if (!user || !user.messages) return;
      const updatedMessages = user.messages.map(m => m.id === messageId ? { ...m, isRead: true } : m);
      updateProfile({ messages: updatedMessages });
  };

  // Used by Admin or other contexts to force update local user state if IDs match
  const refreshUser = (updatedUser: User) => {
      if (user && user.id === updatedUser.id) {
          setUser(updatedUser);
      }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, updateName, addPoints, deductPoints, addExp, markMessageAsRead, refreshUser }}>
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
