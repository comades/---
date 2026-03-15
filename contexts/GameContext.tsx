
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Post, GameStatus, Article, Course, Certificate, Exam, User, SystemSettings, Message, Review, DailyQuiz, Product } from '../types';
import { FEATURED_GAMES, ARTICLES as INITIAL_ARTICLES } from '../constants';
import { useAuth } from './AuthContext';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

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
    { id: "c1", title: "實境遊戲設計基礎", description: "了解 LBS 遊戲的運作原理，學習如何結合 GPS 與敘事。", level: "Basic", duration: "45 分鐘", isLocked: false, completed: true, imageKeyword: "map", ticketPrice: 50 },
    { id: "c2", title: "非線性敘事與分支腳本", description: "學習如何設計多重結局，使用邏輯群組管理複雜的劇情線。", level: "Intermediate", duration: "90 分鐘", isLocked: true, completed: false, imageKeyword: "script", ticketPrice: 100 },
    { id: "c3", title: "AR 互動模組進階應用", description: "深入解析圖像辨識與 AR 掃描技術，打造虛實整合關卡。", level: "Advanced", duration: "120 分鐘", isLocked: true, completed: false, imageKeyword: "augmented reality", ticketPrice: 150 },
    { id: "c4", title: "商業化與導覽設計", description: "如何將遊戲轉化為付費導覽產品，分析使用者數據。", level: "Advanced", duration: "60 分鐘", isLocked: true, completed: false, imageKeyword: "business", ticketPrice: 80 }
];

const INITIAL_CERTS: Certificate[] = [
    { id: "cert1", title: "初級創作者認證", description: "完成基礎課程並發布第一個遊戲。", requiredCourseIds: ["c1"], recipients: [{ userId: "u1", date: "2023-11-20" }] },
    { id: "cert2", title: "AR 技術專家", description: "精通 AR 模組的應用與除錯。", requiredCourseIds: ["c3"], recipients: [] }
];

const INITIAL_EXAMS: Exam[] = [
    { id: "ex1", title: "實境遊戲設計基礎考核", courseId: "c1", durationMinutes: 30, passingScore: 80, participants: 45, questions: [] },
];

const INITIAL_USERS: User[] = [
    { id: "admin", name: "admin", avatarId: 1, points: 99999, tickets: 9999, level: 99, exp: 99999, joinedDate: "2024-01-01", gamesPlayed: 0, gamesCreated: 0, isAdmin: true, isPro: true, followers: [], following: [], friends: [], role: 'admin', status: 'active', messages: [] },
    { id: "u1", name: "StoryMaster", avatarId: 12, points: 15400, tickets: 50, level: 15, exp: 450, joinedDate: "2023-01-10", gamesPlayed: 20, gamesCreated: 5, isAdmin: false, isPro: true, followers: [], following: [], friends: [], role: 'creator', status: 'active', messages: [] },
    { id: "u2", name: "NewbiePlayer", avatarId: 3, points: 200, tickets: 0, level: 2, exp: 50, joinedDate: "2024-02-01", gamesPlayed: 2, gamesCreated: 0, isAdmin: false, isPro: false, followers: [], following: [], friends: [], role: 'user', status: 'active', messages: [] }
];

const INITIAL_SETTINGS: SystemSettings = {
    basePointsPerGame: 20,
    baseExpPerGame: 100,
    levels: [
        { level: 1, expRequired: 0, title: "新手冒險者" },
        { level: 5, expRequired: 500, title: "熟練探險家" },
        { level: 10, expRequired: 2000, title: "傳奇設計師" }
    ],
    expSettings: {
        quizCorrect: 50,
        quizStreak7: 200,
        quizStreak30: 1000,
        memberDayParticipation: 100,
        memberDayTask: 300,
        leaderboardTop10: 500
    },
    sectorThresholds: {
        'central': 10,
        'south': 20,
        'north': 30,
        'west': 40,
        'east': 50,
        'southwest': 60
    },
    starSectors: [
        { id: 'central', name: '中原星域', description: '文明的發源地', requiredPlayers: 10, isAwakened: false, color: '#FFD700' },
        { id: 'south', name: '江南星域', description: '水鄉澤國', requiredPlayers: 20, isAwakened: false, color: '#4ade80' },
        { id: 'north', name: '西北星域', description: '大漠風情', requiredPlayers: 30, isAwakened: false, color: '#f87171' },
        { id: 'west', name: '西南星域', description: '神秘高原', requiredPlayers: 40, isAwakened: false, color: '#c084fc' },
        { id: 'east', name: '嶺南星域', description: '百越之地', requiredPlayers: 50, isAwakened: false, color: '#60a5fa' },
        { id: 'southwest', name: '東北星域', description: '白山黑水', requiredPlayers: 60, isAwakened: false, color: '#f472b6' }
    ],
    rolePermissions: {
        user: { canUseAI: false, canUseAdvancedLogic: false, canPublish: false, canAddLocation: false, canAddStoryNarration: false, canAddStoryDialogue: false, canAddText: true, canUploadImage: true, canUploadVideo: false, canUploadAudio: false, canAddARRecognize: false, canAddARTransparent: false, canAddQuizText: false, canAddQuizSingle: false, canAddQuizMulti: false, canAddQuizNumber: false, canAddQuizImage: false, canAddQuizPhoto: false, canAddQuizVoice: false, canAddQuizGyro: false, canAddQuizAR: false, canAddPuzzle: false, canAddHint: false, canExplore: false, canAccessAcademy: false, canAccessShop: false, canAccessLeaderboard: false },
        creator: { canUseAI: true, canUseAdvancedLogic: true, canPublish: true, canAddLocation: true, canAddStoryNarration: true, canAddStoryDialogue: true, canAddText: true, canUploadImage: true, canUploadVideo: true, canUploadAudio: true, canAddARRecognize: true, canAddARTransparent: true, canAddQuizText: true, canAddQuizSingle: true, canAddQuizMulti: true, canAddQuizNumber: true, canAddQuizImage: true, canAddQuizPhoto: true, canAddQuizVoice: true, canAddQuizGyro: true, canAddQuizAR: true, canAddPuzzle: true, canAddHint: true, canExplore: true, canAccessAcademy: true, canAccessShop: true, canAccessLeaderboard: true },
        admin: { canUseAI: true, canUseAdvancedLogic: true, canPublish: true, canAddLocation: true, canAddStoryNarration: true, canAddStoryDialogue: true, canAddText: true, canUploadImage: true, canUploadVideo: true, canUploadAudio: true, canAddARRecognize: true, canAddARTransparent: true, canAddQuizText: true, canAddQuizSingle: true, canAddQuizMulti: true, canAddQuizNumber: true, canAddQuizImage: true, canAddQuizPhoto: true, canAddQuizVoice: true, canAddQuizGyro: true, canAddQuizAR: true, canAddPuzzle: true, canAddHint: true, canExplore: true, canAccessAcademy: true, canAccessShop: true, canAccessLeaderboard: true }
    }
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
  dailyQuizzes: DailyQuiz[];
  products: Product[];
  
  saveGame: (game: Game) => void;
  deleteGame: (gameId: string) => void;
  restoreGame: (gameId: string) => void;
  permanentlyDeleteGame: (gameId: string) => void;
  updateGameStatus: (gameId: string, status: GameStatus, extraData?: Partial<Game>) => void;
  toggleGameRecommendation: (gameId: string) => void;
  addPost: (post: Post) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string, userId: string) => void;
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
  saveDailyQuiz: (quiz: DailyQuiz) => void;
  deleteDailyQuiz: (quizId: string) => void;
  addReview: (gameId: string, review: Review) => void;
  updateProducts: (products: Product[]) => void;
  purchaseGame: (gameId: string) => Promise<void>;
  purchaseCourse: (courseId: string) => Promise<void>;
  purchaseProduct: (productId: string) => Promise<void>;

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
  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuiz[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Data
  useEffect(() => {
    const loadData = async (retries = 3) => {
        // 0. Try IndexedDB for Games first
        const savedGames = await idbGet<Game[]>('xiguang_games');
        if (savedGames) {
            setGames(savedGames);
        } else {
            // 1. Load Games (Async from API)
            try {
                const response = await fetch('/api/games');
                if (response.ok) {
                    const loadedGames = await response.json();
                    setGames(loadedGames);
                    await idbSet('xiguang_games', loadedGames);
                } else {
                    if (retries > 0) {
                        console.log(`Fetch failed, retrying... (${retries} left)`);
                        setTimeout(() => loadData(retries - 1), 1000);
                        return;
                    }
                    console.error("Failed to fetch games from API");
                    setGames(FEATURED_GAMES);
                    await idbSet('xiguang_games', FEATURED_GAMES);
                }
            } catch (e) {
                if (retries > 0) {
                    console.log(`Fetch error, retrying... (${retries} left)`);
                    setTimeout(() => loadData(retries - 1), 1000);
                    return;
                }
                console.error("API Error", e);
                setGames(FEATURED_GAMES);
                await idbSet('xiguang_games', FEATURED_GAMES);
            }
        }

        // 2. Load other data from IndexedDB (Async)
        const loadIDB = async <T,>(key: string, defaultVal: T, setter: (v: T) => void) => {
            const saved = await idbGet<T>(key);
            if (saved !== null && saved !== undefined) {
                setter(saved);
            } else {
                setter(defaultVal);
            }
        };

        await loadIDB('xiguang_posts', [], setPosts);
        await loadIDB('xiguang_articles', INITIAL_ARTICLES, setArticles);
        await loadIDB('xiguang_courses', INITIAL_COURSES, setCourses);
        await loadIDB('xiguang_certs', INITIAL_CERTS, setCertificates);
        await loadIDB('xiguang_exams', INITIAL_EXAMS, setExams);
        await loadIDB('xiguang_users_db', INITIAL_USERS, setAllUsers);
        await loadIDB('xiguang_settings', INITIAL_SETTINGS, setSystemSettings);
        await loadIDB('xiguang_daily_quizzes', [], setDailyQuizzes);
        await loadIDB('xiguang_products', [], setProducts);
        
        setIsLoaded(true);
    };

    loadData();
  }, []);

  // --- Games Actions (Using API) ---
  const saveGame = async (game: Game) => {
      let newGames: Game[] = [];
      setGames(prev => {
          if (!Array.isArray(prev)) newGames = [game];
          else {
              const exists = (prev || []).find(g => g.id === game.id);
              newGames = exists ? prev.map(g => g.id === game.id ? game : g) : [...prev, game];
          }
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
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
      let newGames: Game[] = [];
      setGames(prev => {
          if (!Array.isArray(prev)) return [];
          newGames = prev.map(g => g.id === gameId ? { ...g, status: 'deleted' as GameStatus } : g);
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
      try {
          await fetch(`/api/games/${gameId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'deleted' }) });
      } catch (e) {
          console.error("API Soft Delete Failed", e);
      }
  };

  const restoreGame = async (gameId: string) => {
      let newGames: Game[] = [];
      setGames(prev => {
          newGames = prev.map(g => g.id === gameId ? { ...g, status: 'draft' as GameStatus } : g);
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
      try {
          await fetch(`/api/games/${gameId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }) });
      } catch (e) {
          console.error("API Restore Failed", e);
      }
  };

  const permanentlyDeleteGame = async (gameId: string) => {
      let newGames: Game[] = [];
      setGames(prev => {
          newGames = (prev || []).filter(g => g.id !== gameId);
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
      try {
          await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
      } catch (e) {
          console.error("API Hard Delete Failed", e);
      }
  };

  const updateGameStatus = async (gameId: string, status: GameStatus, extraData?: Partial<Game>) => {
      let newGames: Game[] = [];
      setGames(prev => {
          newGames = prev.map(g => g.id === gameId ? { ...g, status, ...extraData } : g);
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
      try {
          await fetch(`/api/games/${gameId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, ...extraData })
          });
      } catch (e) {
          console.error("API Status Update Failed", e);
      }
  };

  const toggleGameRecommendation = async (gameId: string) => {
      let newGames: Game[] = [];
      setGames(prev => {
          newGames = prev.map(g => g.id === gameId ? { ...g, isRecommended: !g.isRecommended } : g);
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
      try {
          await fetch(`/api/games/${gameId}/recommend`, { method: 'PUT' });
      } catch (e) {
          console.error("API Recommend Update Failed", e);
      }
  }

  const addReview = async (gameId: string, review: Review) => {
      let newGames: Game[] = [];
      setGames(prev => {
          newGames = prev.map(g => {
              if (g.id === gameId) {
                  const newReviews = [review, ...(g.reviews || [])];
                  // Recalculate average rating
                  const totalRating = newReviews.reduce((acc, r) => acc + r.rating, 0);
                  const avgRating = totalRating / newReviews.length;
                  return { ...g, reviews: newReviews, rating: avgRating };
              }
              return g;
          });
          return newGames;
      });
      await idbSet('xiguang_games', newGames);
      
      try {
          await fetch(`/api/games/${gameId}/reviews`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(review)
          });
      } catch (e) {
          console.error("API Review Add Failed", e);
      }
  };

  // --- Other Actions (Using IndexedDB) ---
  const persist = async (key: string, data: any) => {
      try {
          await idbSet(key, data);
      } catch (e) {
          console.error(`GameContext: Failed to persist ${key}`, e);
      }
  };

  const addPost = async (post: Post) => {
      const newPosts = [post, ...posts];
      setPosts(newPosts);
      await persist('xiguang_posts', newPosts);
  };

  const deletePost = async (postId: string) => {
      const newPosts = (posts || []).filter(p => p.id !== postId);
      setPosts(newPosts);
      await persist('xiguang_posts', newPosts);
  };

  const toggleLikePost = async (postId: string, userId: string) => {
      const newPosts = posts.map(p => {
          if (p.id === postId) {
              const isLiked = p.likes.includes(userId);
              const newLikes = isLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId];
              return { ...p, likes: newLikes };
          }
          return p;
      });
      setPosts(newPosts);
      await persist('xiguang_posts', newPosts);
  }

  // Article Actions
  const saveArticle = async (article: Article) => {
      const safeArticles = articles || [];
      const newArticles = safeArticles.find(a => a.id === article.id) ? safeArticles.map(a => a.id === article.id ? article : a) : [...safeArticles, article];
      setArticles(newArticles);
      await persist('xiguang_articles', newArticles);
  }
  const deleteArticle = async (id: string) => {
      // Soft delete
      const newArticles = (articles || []).map(a => a.id === id ? { ...a, deletedAt: new Date().toISOString() } : a);
      setArticles(newArticles);
      await persist('xiguang_articles', newArticles);
  }
  const restoreArticle = async (id: string) => {
      const newArticles = (articles || []).map(a => a.id === id ? { ...a, deletedAt: undefined } : a);
      setArticles(newArticles);
      await persist('xiguang_articles', newArticles);
  }
  const permanentlyDeleteArticle = async (id: string) => {
      const newArticles = (articles || []).filter(a => a.id !== id);
      setArticles(newArticles);
      await persist('xiguang_articles', newArticles);
  }

  // Academy Actions
  const saveCourse = async (c: Course) => {
      const safeCourses = courses || [];
      const next = safeCourses.find(x => x.id === c.id) ? safeCourses.map(x => x.id === c.id ? c : x) : [...safeCourses, c];
      setCourses(next); await persist('xiguang_courses', next);
  };
  const deleteCourse = async (id: string) => {
      const next = (courses || []).filter(x => x.id !== id);
      setCourses(next); await persist('xiguang_courses', next);
  };
  
  const saveCertificate = async (c: Certificate) => { const next = (certificates || []).find(x => x.id === c.id) ? certificates.map(x => x.id === c.id ? c : x) : [...certificates, c]; setCertificates(next); await persist('xiguang_certs', next); };
  const deleteCertificate = async (id: string) => { const next = (certificates || []).filter(x => x.id !== id); setCertificates(next); await persist('xiguang_certs', next); };
  
  const saveExam = async (e: Exam) => { const next = (exams || []).find(x => x.id === e.id) ? exams.map(x => x.id === e.id ? e : x) : [...exams, e]; setExams(next); await persist('xiguang_exams', next); };
  const deleteExam = async (id: string) => { const next = (exams || []).filter(x => x.id !== id); setExams(next); await persist('xiguang_exams', next); };

  // User Actions
  const updateUser = async (id: string, data: Partial<User>) => {
      const next = allUsers.map(u => u.id === id ? { ...u, ...data } : u);
      setAllUsers(next);
      await persist('xiguang_users_db', next);
      
      // If updating the current logged in user, refresh AuthContext
      if (user && user.id === id) {
          refreshUser({ ...user, ...data });
      }
  };
  const deleteUser = async (id: string) => {
      const next = (allUsers || []).filter(u => u.id !== id);
      setAllUsers(next);
      await persist('xiguang_users_db', next);
  };
  const sendMessage = async (userId: string, title: string, content: string) => {
      const newMessage: Message = {
          id: `msg_${Date.now()}`,
          title,
          content,
          sender: '系統管理員',
          date: new Date().toISOString(),
          isRead: false,
          type: 'system'
      };

      const target = (allUsers || []).find(u => u.id === userId);
      if (target) {
          await updateUser(userId, { messages: [newMessage, ...(target.messages || [])] });
      } else if (user && user.id === userId) {
          // Fallback for users not in allUsers (like hardcoded admin)
          refreshUser({ ...user, messages: [newMessage, ...(user.messages || [])] });
      }
  };

  const updateSystemSettings = async (s: SystemSettings) => {
      setSystemSettings(s);
      await persist('xiguang_settings', s);
      
      // Also persist to Firestore if user is admin and authenticated
      if (user?.isAdmin && auth.currentUser) {
          try {
              await setDoc(doc(db, 'system', 'settings'), s);
          } catch (e) {
              console.error("Failed to sync settings to Firestore", e);
          }
      }
  };

  const saveDailyQuiz = async (quiz: DailyQuiz) => {
      const next = dailyQuizzes.find(q => q.id === quiz.id) ? dailyQuizzes.map(q => q.id === quiz.id ? quiz : q) : [quiz, ...dailyQuizzes];
      setDailyQuizzes(next);
      await persist('xiguang_daily_quizzes', next);

      // Also persist to Firestore as the "current" daily quiz if user is admin and authenticated
      if (user?.isAdmin && auth.currentUser) {
          try {
              await setDoc(doc(db, 'system', 'dailyQuiz'), quiz);
          } catch (e) {
              console.error("Failed to sync quiz to Firestore", e);
          }
      }
  };

  const deleteDailyQuiz = async (id: string) => {
      const next = dailyQuizzes.filter(q => q.id !== id);
      setDailyQuizzes(next);
      await persist('xiguang_daily_quizzes', next);
  };

  const updateProducts = async (newProducts: Product[]) => {
      setProducts(newProducts);
      await persist('xiguang_products', newProducts);
  };

  const purchaseGame = async (gameId: string) => {
      if (!user) return;
      await updateUser(user.id, { purchasedGames: [...(user.purchasedGames || []), gameId] });
  };
  const purchaseCourse = async (courseId: string) => {
      if (!user) return;
      await updateUser(user.id, { purchasedCourses: [...(user.purchasedCourses || []), courseId] });
  };
  const purchaseProduct = async (productId: string) => {
      if (!user) return;
      await updateUser(user.id, { purchasedProducts: [...(user.purchasedProducts || []), productId] });
  };

  // Getters
  const getPublishedGames = () => (games || []).filter(g => g.status === 'published');
  const getUserGames = (name: string) => (games || []).filter(g => g.author === name);

  return (
    <GameContext.Provider value={{
        games, posts, articles, courses, certificates, exams, allUsers, systemSettings, dailyQuizzes, products,
        saveGame, deleteGame, restoreGame, permanentlyDeleteGame, updateGameStatus, toggleGameRecommendation, addReview,
        addPost, deletePost, toggleLikePost,
        saveArticle, deleteArticle, restoreArticle, permanentlyDeleteArticle,
        saveCourse, deleteCourse, saveCertificate, deleteCertificate, saveExam, deleteExam,
        updateUser, deleteUser, sendMessage, updateSystemSettings, saveDailyQuiz, deleteDailyQuiz, updateProducts,
        purchaseGame, purchaseCourse, purchaseProduct,
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
