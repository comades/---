
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Post, GameStatus, Article, Course } from '../types';
import { FEATURED_GAMES, ARTICLES as INITIAL_ARTICLES } from '../constants';

// Initial Mock Courses
const INITIAL_COURSES: Course[] = [
    {
        id: "c1",
        title: "實境遊戲設計基礎",
        description: "了解 LBS 遊戲的運作原理，學習如何結合 GPS 與敘事，創造引人入勝的第一個遊戲。",
        level: "Basic",
        duration: "45 分鐘",
        isLocked: false,
        completed: true,
        imageKeyword: "map"
    },
    {
        id: "c2",
        title: "非線性敘事與分支腳本",
        description: "學習如何設計多重結局，使用邏輯群組管理複雜的劇情線，讓玩家的選擇更有意義。",
        level: "Intermediate",
        duration: "90 分鐘",
        isLocked: true,
        completed: false,
        imageKeyword: "script"
    },
    {
        id: "c3",
        title: "AR 互動模組進階應用",
        description: "深入解析圖像辨識與 AR 掃描技術，打造虛實整合的解謎關卡。",
        level: "Advanced",
        duration: "120 分鐘",
        isLocked: true,
        completed: false,
        imageKeyword: "augmented reality"
    },
    {
        id: "c4",
        title: "商業化與導覽設計",
        description: "如何將遊戲轉化為付費導覽產品，分析使用者數據並優化體驗。",
        level: "Advanced",
        duration: "60 分鐘",
        isLocked: true,
        completed: false,
        imageKeyword: "business"
    }
];

interface GameContextType {
  games: Game[];
  posts: Post[];
  articles: Article[];
  courses: Course[];
  saveGame: (game: Game) => void;
  deleteGame: (gameId: string) => void;
  updateGameStatus: (gameId: string, status: GameStatus) => void;
  toggleGameRecommendation: (gameId: string) => void;
  addPost: (post: Post) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  saveArticle: (article: Article) => void;
  deleteArticle: (articleId: string) => void;
  saveCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  getPublishedGames: () => Game[];
  getUserGames: (authorName: string) => Game[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Initialize with featured games and load from local storage
  useEffect(() => {
    const storedGames = localStorage.getItem('xiguang_games');
    const storedPosts = localStorage.getItem('xiguang_posts');
    const storedArticles = localStorage.getItem('xiguang_articles');
    const storedCourses = localStorage.getItem('xiguang_courses');
    
    if (storedGames) {
      setGames(JSON.parse(storedGames));
    } else {
      // Initialize with constants, marking them as published
      const initialGames = FEATURED_GAMES.map(g => ({ ...g, status: 'published' as GameStatus }));
      setGames(initialGames);
    }

    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }

    if (storedArticles) {
      setArticles(JSON.parse(storedArticles));
    } else {
      setArticles(INITIAL_ARTICLES);
    }

    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    } else {
      setCourses(INITIAL_COURSES);
    }
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      localStorage.setItem('xiguang_games', JSON.stringify(games));
    }
  }, [games]);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('xiguang_posts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('xiguang_articles', JSON.stringify(articles));
    }
  }, [articles]);

  useEffect(() => {
      if (courses.length > 0) {
          localStorage.setItem('xiguang_courses', JSON.stringify(courses));
      }
  }, [courses]);

  const saveGame = (game: Game) => {
    setGames(prev => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        return prev.map(g => g.id === game.id ? game : g);
      }
      return [...prev, game];
    });
  };

  const deleteGame = (gameId: string) => {
    setGames(prev => prev.filter(g => g.id !== gameId));
  };

  const updateGameStatus = (gameId: string, status: GameStatus) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status } : g));
  };

  const toggleGameRecommendation = (gameId: string) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, isRecommended: !g.isRecommended } : g));
  };

  const addPost = (post: Post) => {
    const enrichedPost = {
        ...post,
        comments: post.comments || 0,
        shares: post.shares || 0,
        isLiked: false
    };
    setPosts(prev => [enrichedPost, ...prev]);
  };

  const deletePost = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const toggleLikePost = (postId: string) => {
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              return {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked ? p.likes - 1 : p.likes + 1
              };
          }
          return p;
      }));
  };

  // Article CRUD
  const saveArticle = (article: Article) => {
    setArticles(prev => {
      const exists = prev.find(a => a.id === article.id);
      if (exists) {
        return prev.map(a => a.id === article.id ? article : a);
      }
      return [article, ...prev];
    });
  };

  const deleteArticle = (articleId: string) => {
    setArticles(prev => prev.filter(a => a.id !== articleId));
  };

  // Course CRUD
  const saveCourse = (course: Course) => {
      setCourses(prev => {
          const exists = prev.find(c => c.id === course.id);
          if (exists) {
              return prev.map(c => c.id === course.id ? course : c);
          }
          return [...prev, course];
      });
  };

  const deleteCourse = (courseId: string) => {
      setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const getPublishedGames = () => {
    return games.filter(g => g.status === 'published');
  };

  const getUserGames = (authorName: string) => {
    return games.filter(g => g.author === authorName);
  };

  return (
    <GameContext.Provider value={{ 
      games, posts, articles, courses,
      saveGame, deleteGame, updateGameStatus, toggleGameRecommendation,
      addPost, deletePost, toggleLikePost,
      saveArticle, deleteArticle, 
      saveCourse, deleteCourse,
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