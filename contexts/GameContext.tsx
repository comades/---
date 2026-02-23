
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Post, GameStatus, Article, Course, Certificate, Exam, User, SystemSettings, Message } from '../types';
import { FEATURED_GAMES, ARTICLES as INITIAL_ARTICLES } from '../constants';
import { useAuth } from './AuthContext';

// --- IndexedDB Utility ---
const DB_NAME = 'XiGuangDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyvalue';

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const idbGet = async <T,>(key: string): Promise<T | null> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result as T);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("IDB Get Error", e);
        return null;
    }
};

const idbSet = async (key: string, value: any) => {
    try {
        const db = await initDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("IDB Set Error", e);
    }
};

// Initial Mock Data
const INITIAL_COURSES: Course[] = [
    { id: "c1", title: "實境遊戲設計基礎", description: "了解 LBS 遊戲的運作原理，學習如何結合 GPS 與敘事。", level: "Basic", duration: "45 分鐘", isLocked: false, completed: true, imageKeyword: "map" },
    { id: "c2", title: "非線性敘事與分支腳本", description: "學習如何設計多重結局，使用邏輯群組管理複雜的劇情線。", level: "Intermediate", duration: "90 分鐘", isLocked: true, completed: false, imageKeyword: "script" },
    { id: "c3", title: "AR 互動模組進階應用", description: "深入解析圖像辨識與 AR 掃描技術，打造虛實整合關卡。", level: "Advanced", duration: "120 分鐘", isLocked: true, completed: false, imageKeyword: "augmented reality" },
    { id: "c4", title: "商業化與導覽設計", description: "如何將遊戲轉化為付費導覽產品，分析使用者數據。", level: "Advanced", duration: "60 分鐘", isLocked: true, completed: false, imageKeyword: "business" }
];

const INITIAL_CERTS: Certificate[] = [
    { id: "cert1", title: "初級創作者認證", description: "完成基礎課程並發布第一個遊戲。", requiredCourseIds: ["c1"], recipients: [{ userId: "u1", date: "2023-11-20" }] },
    { id: "cert2", title: "AR 技術專家", description: "精通 AR 模組的應用與除錯。", requiredCourseIds: ["c3"], recipients: [] }
];

const INITIAL_EXAMS: Exam[] = [
    { id: "ex1", title: "實境遊戲設計基礎考核", courseId: "c1", durationMinutes: 30, passingScore: 80, participants: 45, questions: [] },
];

const INITIAL_USERS: User[] = [
    { id: "u1", name: "StoryMaster", avatarId: 12, points: 15400, level: 15, exp: 450, joinedDate: "2023-01-10", gamesPlayed: 20, gamesCreated: 5, isAdmin: false, isPro: true, followers: 120, following: 10, role: 'creator', status: 'active', messages: [] },
    { id: "u2", name: "NewbiePlayer", avatarId: 3, points: 200, level: 2, exp: 50, joinedDate: "2024-02-01", gamesPlayed: 2, gamesCreated: 0, isAdmin: false, isPro: false, followers: 0, following: 5, role: 'user', status: 'active', messages: [] }
];

const INITIAL_SETTINGS: SystemSettings = {
    basePointsPerGame: 20,
    baseExpPerGame: 100,
    levels: [
        { level: 1, expRequired: 0, title: "新手冒險者" },
        { level: 5, expRequired: 500, title: "熟練探險家" },
        { level: 10, expRequired: 2000, title: "傳奇設計師" }
    ]
};

interface GameContextType {
  games: Game[];
  posts: Post[];
  articles: Article[];
  courses: Course[];
  certificates: Certificate[];
  exams: Exam[];
  allUsers: User[];
  systemSettings: SystemSettings;
  
  saveGame: (game: Game) => void;
  deleteGame: (gameId: string) => void;
  updateGameStatus: (gameId: string, status: GameStatus) => void;
  toggleGameRecommendation: (gameId: string) => void;
  addPost: (post: Post) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  saveArticle: (article: Article) => void;
  deleteArticle: (articleId: string) => void; // Soft delete
  restoreArticle: (articleId: string) => void; // Restore
  permanentlyDeleteArticle: (articleId: string) => void; // Hard delete
  
  // Academy
  saveCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  saveCertificate: (cert: Certificate) => void;
  deleteCertificate: (certId: string) => void;
  saveExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;

  // Users & System
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  sendMessage: (userId: string, title: string, content: string) => void;
  updateSystemSettings: (settings: SystemSettings) => void;

  getPublishedGames: () => Game[];
  getUserGames: (authorName: string) => Game[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth();

  // State
  const [games, setGames] = useState<Game[]>([]); // Initialize empty, load async
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTS);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Data
  useEffect(() => {
    const loadData = async (retries = 3) => {
        // 1. Load Games (Async from API)
        try {
            const response = await fetch('/api/games');
            if (response.ok) {
                const loadedGames = await response.json();
                setGames(loadedGames);
            } else {
                if (retries > 0) {
                    console.log(`Fetch failed, retrying... (${retries} left)`);
                    setTimeout(() => loadData(retries - 1), 1000);
                    return;
                }
                console.error("Failed to fetch games from API");
                setGames(FEATURED_GAMES);
            }
        } catch (e) {
            if (retries > 0) {
                console.log(`Fetch error, retrying... (${retries} left)`);
                setTimeout(() => loadData(retries - 1), 1000);
                return;
            }
            console.error("API Error", e);
            setGames(FEATURED_GAMES);
        }

        // 2. Load other data from LocalStorage (Sync)
        const loadLS = <T,>(key: string, defaultVal: T, setter: (v: T) => void) => {
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    setter(JSON.parse(saved));
                } catch(e) {
                    console.error(`Failed to parse ${key}`, e);
                    setter(defaultVal);
                }
            } else {
                setter(defaultVal);
            }
        };

        loadLS('xiguang_posts', [], setPosts);
        loadLS('xiguang_articles', INITIAL_ARTICLES, setArticles);
        loadLS('xiguang_courses', INITIAL_COURSES, setCourses);
        loadLS('xiguang_certs', INITIAL_CERTS, setCertificates);
        loadLS('xiguang_exams', INITIAL_EXAMS, setExams);
        loadLS('xiguang_users_db', INITIAL_USERS, setAllUsers);
        loadLS('xiguang_settings', INITIAL_SETTINGS, setSystemSettings);
        
        setIsLoaded(true);
    };

    loadData();
  }, []);

  // --- Games Actions (Using API) ---
  const saveGame = async (game: Game) => {
      setGames(prev => {
          const exists = prev.find(g => g.id === game.id);
          const newGames = exists ? prev.map(g => g.id === game.id ? game : g) : [...prev, game];
          return newGames;
      });
      try {
          await fetch('/api/games', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(game)
          });
      } catch (e) {
          console.error("API Save Failed", e);
      }
  };

  const deleteGame = async (gameId: string) => {
      setGames(prev => prev.filter(g => g.id !== gameId));
      try {
          await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
      } catch (e) {
          console.error("API Delete Failed", e);
      }
  };

  const updateGameStatus = async (gameId: string, status: GameStatus) => {
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, status } : g));
      try {
          await fetch(`/api/games/${gameId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
          });
      } catch (e) {
          console.error("API Status Update Failed", e);
      }
  };

  const toggleGameRecommendation = async (gameId: string) => {
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, isRecommended: !g.isRecommended } : g));
      try {
          await fetch(`/api/games/${gameId}/recommend`, { method: 'PUT' });
      } catch (e) {
          console.error("API Recommend Update Failed", e);
      }
  }

  // --- Other Actions (Using LocalStorage) ---
  const persist = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const addPost = (post: Post) => {
      const newPosts = [post, ...posts];
      setPosts(newPosts);
      persist('xiguang_posts', newPosts);
  };

  const deletePost = (postId: string) => {
      const newPosts = posts.filter(p => p.id !== postId);
      setPosts(newPosts);
      persist('xiguang_posts', newPosts);
  };

  const toggleLikePost = (postId: string) => {
      const newPosts = posts.map(p => p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p);
      setPosts(newPosts);
      persist('xiguang_posts', newPosts);
  }

  // Article Actions
  const saveArticle = (article: Article) => {
      const newArticles = articles.find(a => a.id === article.id) ? articles.map(a => a.id === article.id ? article : a) : [...articles, article];
      setArticles(newArticles);
      persist('xiguang_articles', newArticles);
  }
  const deleteArticle = (id: string) => {
      // Soft delete
      const newArticles = articles.map(a => a.id === id ? { ...a, deletedAt: new Date().toISOString() } : a);
      setArticles(newArticles);
      persist('xiguang_articles', newArticles);
  }
  const restoreArticle = (id: string) => {
      const newArticles = articles.map(a => a.id === id ? { ...a, deletedAt: undefined } : a);
      setArticles(newArticles);
      persist('xiguang_articles', newArticles);
  }
  const permanentlyDeleteArticle = (id: string) => {
      const newArticles = articles.filter(a => a.id !== id);
      setArticles(newArticles);
      persist('xiguang_articles', newArticles);
  }

  // Academy Actions
  const saveCourse = (c: Course) => {
      const next = courses.find(x => x.id === c.id) ? courses.map(x => x.id === c.id ? c : x) : [...courses, c];
      setCourses(next); persist('xiguang_courses', next);
  };
  const deleteCourse = (id: string) => {
      const next = courses.filter(x => x.id !== id);
      setCourses(next); persist('xiguang_courses', next);
  };
  
  const saveCertificate = (c: Certificate) => { const next = certificates.find(x => x.id === c.id) ? certificates.map(x => x.id === c.id ? c : x) : [...certificates, c]; setCertificates(next); persist('xiguang_certs', next); };
  const deleteCertificate = (id: string) => { const next = certificates.filter(x => x.id !== id); setCertificates(next); persist('xiguang_certs', next); };
  
  const saveExam = (e: Exam) => { const next = exams.find(x => x.id === e.id) ? exams.map(x => x.id === e.id ? e : x) : [...exams, e]; setExams(next); persist('xiguang_exams', next); };
  const deleteExam = (id: string) => { const next = exams.filter(x => x.id !== id); setExams(next); persist('xiguang_exams', next); };

  // User Actions
  const updateUser = (id: string, data: Partial<User>) => {
      const next = allUsers.map(u => u.id === id ? { ...u, ...data } : u);
      setAllUsers(next);
      persist('xiguang_users_db', next);
      
      // If updating the current logged in user, refresh AuthContext
      if (user && user.id === id) {
          refreshUser({ ...user, ...data });
      }
  };
  const deleteUser = (id: string) => {
      const next = allUsers.filter(u => u.id !== id);
      setAllUsers(next);
      persist('xiguang_users_db', next);
  };
  const sendMessage = (userId: string, title: string, content: string) => {
      const target = allUsers.find(u => u.id === userId);
      if (target) {
          const newMessage: Message = {
              id: `msg_${Date.now()}`,
              title,
              content,
              sender: '系統管理員',
              date: new Date().toISOString(),
              isRead: false,
              type: 'system'
          };
          updateUser(userId, { messages: [newMessage, ...(target.messages || [])] });
      }
  };

  const updateSystemSettings = (s: SystemSettings) => {
      setSystemSettings(s);
      persist('xiguang_settings', s);
  };

  // Getters
  const getPublishedGames = () => games.filter(g => g.status === 'published');
  const getUserGames = (name: string) => games.filter(g => g.author === name);

  return (
    <GameContext.Provider value={{
        games, posts, articles, courses, certificates, exams, allUsers, systemSettings,
        saveGame, deleteGame, updateGameStatus, toggleGameRecommendation,
        addPost, deletePost, toggleLikePost,
        saveArticle, deleteArticle, restoreArticle, permanentlyDeleteArticle,
        saveCourse, deleteCourse, saveCertificate, deleteCertificate, saveExam, deleteExam,
        updateUser, deleteUser, sendMessage, updateSystemSettings,
        getPublishedGames, getUserGames
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
