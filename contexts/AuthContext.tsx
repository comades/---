
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Message } from '../types';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (name: string, password?: string) => boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateName: (name: string) => void;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
  addExp: (amount: number) => void;
  markMessageAsRead: (messageId: string) => void;
  refreshUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Force admin for specific email if not already set
            if (firebaseUser.email === 'yhocliff@gmail.com' && !userData.isAdmin) {
              const updatedData = { ...userData, isAdmin: true, role: 'admin' as const };
              await updateDoc(userDocRef, updatedData);
              setUser(updatedData);
            } else {
              setUser(userData);
            }
          } else {
            // Create new user in Firestore
            const isAdmin = firebaseUser.email === 'yhocliff@gmail.com';
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '光光',
              avatarId: Math.floor(Math.random() * 8) + 1,
              points: 100,
              tickets: 0,
              level: 1,
              exp: 0,
              joinedDate: new Date().toISOString(),
              gamesPlayed: 0,
              gamesCreated: 0,
              followers: [],
              following: [],
              friends: [],
              role: isAdmin ? 'admin' : 'user',
              isAdmin: isAdmin,
              status: 'active',
              messages: [
                {
                  id: 'welcome_msg',
                  title: '歡迎加入羲光剧游',
                  content: '很高興見到你，光光！開始你的創作之旅吧。',
                  sender: 'System',
                  date: new Date().toISOString(),
                  isRead: false,
                  type: 'system'
                }
              ],
              baguaProgress: ['history']
            };
            try {
              await setDoc(userDocRef, newUser);
              setUser(newUser);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
            }
          }

          // Listen for real-time updates
          onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setUser(snapshot.data() as User);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (name: string, password?: string): boolean => {
    // This is the legacy login, we'll keep it for admin or fallback
    if (name === 'admin' && password === '19327829319') {
      setUser({
        id: 'admin_legacy',
        name: '系統管理員',
        avatarId: 1,
        points: 999999,
        level: 99,
        exp: 999999,
        joinedDate: new Date().toISOString(),
        gamesPlayed: 0,
        gamesCreated: 0,
        role: 'admin',
        isAdmin: true,
        status: 'active',
        followers: [],
        following: [],
        friends: [],
        tickets: 999999
      });
      return true;
    }
    return false; 
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Always update local state
    setUser(prev => prev ? { ...prev, ...data } : null);

    // Only sync to Firestore if authenticated with Firebase
    if (auth.currentUser && user.id === auth.currentUser.uid) {
      const userDocRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userDocRef, data);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      }
    }
  };

  const updateName = (name: string) => {
    if (!user) return;
    updateProfile({ name });
  };

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

  const refreshUser = (updatedUser: User) => {
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, updateName, addPoints, deductPoints, addExp, markMessageAsRead, refreshUser }}>
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
