

export interface Choice {
  text: string;
  nextSceneId: string;
  sourceDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  targetDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

export type ModuleType = 
  | 'LOCATION' 
  | 'STORY_NARRATION' | 'STORY_DIALOGUE'
  | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' 
  | 'AR_RECOGNIZE' | 'AR_TRANSPARENT'
  | 'ANS_TEXT' | 'ANS_SINGLE' | 'ANS_MULTI' | 'ANS_NUMBER' | 'ANS_IMAGE' | 'ANS_PHOTO' | 'ANS_VOICE' | 'ANS_AR' | 'ANS_GYRO'
  | 'HINT'
  | 'PUZZLE_JIGSAW' | 'PUZZLE_PASSWORD_LOCK' | 'PUZZLE_RHYTHM' | 'PUZZLE_PATTERN_LOCK' | 'PUZZLE_SERIAL_NUMBER';

export interface GameModule {
  id: string;
  type: ModuleType;
  data: any; // Dynamic data based on type
  
  // Countdown settings
  hasCountdown?: boolean;
  countdownSeconds?: number;
  onTimeout?: {
    action: 'JUMP' | 'DEDUCT_EXP';
    targetSceneId?: string;
    expDeduction?: number;
  };
}

export interface Scene {
  id: string;
  title: string;
  text: string;
  imageKeyword?: string; // Used to seed the placeholder image
  choices: Choice[];
  isEnding?: boolean;
  // Editor coordinates
  x?: number;
  y?: number;
  groupId?: string;
  modules?: GameModule[]; // New: Content modules
}

export interface NodeGroup {
  id: string;
  title: string;
  type: 'ALL' | 'ANY'; // ALL = 需全部完成, ANY = 完成其中之一
  sceneIds: string[];
  color?: string;
  choices?: Choice[]; // New: Outgoing connections from the group
}

export type GameType = 'adventure' | 'guide'; // adventure = 實境遊戲, guide = 智慧導覽
export type GameStatus = 'draft' | 'review' | 'published' | 'rejected' | 'off_shelf' | 'deleted';

export interface Character {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
}

export interface GameAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  category?: 'SCENE' | 'OBJECT';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  type: 'BOOK' | 'MERCH' | 'OTHER';
}

export interface Game {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId?: string;
  coverImageKeyword: string;
  startSceneId: string;
  scenes: Scene[];
  groups?: NodeGroup[];  // New: Groups logic
  type?: GameType;       // New: Category of the game
  status?: GameStatus;   // New: Publication status
  isOfficial?: boolean;  // New: Is this an original "Aurora/Xiguang" game?
  isRecommended?: boolean; // New: Editor's Choice flag
  playCount?: number;    // New: For sorting by popularity
  createdAt?: string;    // New: For sorting by newest
  rating?: number;       // New: For recommended
  reviews?: Review[];    // New: User reviews
  ticketPrice?: number;  // New: Price in tickets
  
  // New fields for Editor
  tags?: string[];
  language?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';   // Difficulty level
  location?: string;
  latitude?: number;     // GPS Latitude
  longitude?: number;    // GPS Longitude
  
  // Shared Resources
  characters?: Character[];
  assets?: GameAsset[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // Updated: List of user IDs
  comments: Comment[]; // Updated: List of comments
  shares: number;   
  createdAt: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  sender: string;
  date: string;
  isRead: boolean;
  type: 'system' | 'notification' | 'alert';
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface TranslationData {
  [key: string]: {
    [lang: string]: string;
  };
}

export interface User {
  id: string;
  name: string;
  avatarId: number; // 1-10 for mock avatars
  avatarUrl?: string; // Custom avatar
  profileBanner?: string; // Custom profile background
  isAdmin?: boolean;
  points: number;
  level: number;
  exp: number;
  joinedDate: string;
  gamesPlayed: number;
  gamesCreated: number;
  isPro?: boolean; // New: Subscription status
  tickets: number; // New: Shop currency
  followers: string[]; // Updated: List of user IDs
  following: string[]; // Updated: List of user IDs
  friends: string[]; // New: List of user IDs
  status?: 'active' | 'banned'; // New
  language?: 'zh-TW' | 'zh-CN' | 'en'; // New: User language preference
  role?: 'user' | 'creator' | 'admin'; // New
  profession?: string; // New: Added profession
  messages?: Message[]; // New: User inbox
  title?: string; // New: Acquired title (e.g., "定辰君")
  titlePrefix?: string; // New: Title prefix (e.g., "438")
  revenue?: number; // New: Creator revenue
  baguaProgress?: string[]; // New: Bagua puzzle progress
  
  // New: Contact fields
  phone?: string;
  address?: string;
  wechatId?: string;
  
  purchasedGames?: string[]; // New: List of purchased game IDs
  purchasedCourses?: string[]; // New: List of purchased course IDs
  purchasedProducts?: string[]; // New: List of purchased product IDs
  
  // Daily Quiz tracking
  lastQuizDate?: string;
  quizStreak?: number;
  
  // Star Map tracking
  starPoints?: number;
  litCivilizations?: string[]; // IDs of lit civilizations
  starPaths?: { from: string, to: string }[];
}

export interface Article {
  id: string;
  title: string;
  imageUrl: string;
  category: string; // e.g., '創作教學', '活動公告', '專欄'
  tags?: string[];
  date: string; // Publication date
  endDate?: string; // Auto-takedown date (optional)
  author?: string;
  content?: string; // Markdown content
  isPublished: boolean;
  views?: number; // New
  deletedAt?: string | null; // New: For soft delete
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  duration: string;
  isLocked: boolean;
  completed: boolean;
  imageKeyword: string;
  content?: string; // Markdown content
  videoUrl?: string; // New: Video upload
  ticketPrice?: number; // New: Price in tickets
}

export interface Certificate {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    requiredCourseIds: string[];
    recipients?: { userId: string, date: string }[];
}

export interface ExamQuestion {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
}

export interface Exam {
    id: string;
    title: string;
    courseId?: string;
    durationMinutes: number;
    passingScore: number;
    questions: ExamQuestion[];
    participants?: number;
}

export interface LevelConfig {
    level: number;
    expRequired: number;
    title: string;
}

export interface RolePermissions {
    canUseAI: boolean;
    canUseAdvancedLogic: boolean;
    canPublish: boolean;
    canAddLocation: boolean;
    canAddStoryNarration: boolean;
    canAddStoryDialogue: boolean;
    canAddText: boolean;
    canUploadImage: boolean;
    canUploadVideo: boolean;
    canUploadAudio: boolean;
    canAddARRecognize: boolean;
    canAddARTransparent: boolean;
    canAddQuizText: boolean;
    canAddQuizSingle: boolean;
    canAddQuizMulti: boolean;
    canAddQuizNumber: boolean;
    canAddQuizImage: boolean;
    canAddQuizPhoto: boolean;
    canAddQuizVoice: boolean;
    canAddQuizGyro: boolean;
    canAddQuizAR: boolean;
    canAddPuzzle: boolean;
    canAddHint: boolean;
    canExplore: boolean;
    canAccessAcademy: boolean;
    canAccessShop: boolean;
    canAccessLeaderboard: boolean;
}

export interface DailyQuiz {
  id: string;
  date: string; // YYYY-MM-DD
  question: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'SORT';
  options: string[];
  correctAnswer: any; // index, array of indices, or boolean
  explanation?: string;
  exp: number;
  category: string;
}

export interface StarSector {
  id: string;
  name: string;
  description: string;
  requiredPlayers: number;
  currentPlayers?: number;
  isAwakened: boolean;
  color: string;
}

export interface ExpSettings {
  quizCorrect: number;
  quizStreak7: number;
  quizStreak30: number;
  memberDayParticipation: number;
  memberDayTask: number;
  leaderboardTop10: number;
}

export interface SystemSettings {
    levels: LevelConfig[];
    basePointsPerGame: number;
    baseExpPerGame: number;
    expSettings?: ExpSettings;
    sectorThresholds?: { [sectorId: string]: number };
    starSectors?: StarSector[]; // New: List of star sectors
    apiKeys?: { [key: string]: string }; // New: API management
    rolePermissions: {
        user: RolePermissions;
        creator: RolePermissions;
        admin: RolePermissions;
    };
    payment?: {
        alipay?: boolean;
        wechat?: boolean;
        creditCard?: boolean;
    };
    shipping?: {
        provider?: string;
        fee?: number;
    };
    ticketPacks?: {
        id: string;
        name: string;
        description: string;
        price: number;
        cashPrice: number;
        tickets: number;
    }[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number; // Price in tickets
  cashPrice?: number; // Price in real currency
  quantity?: number; // New: Stock quantity
  type: 'GAME' | 'COURSE' | 'TICKET_PACK' | 'OTHER' | 'BOOK'; // Added BOOK
  targetId?: string; // ID of the game or course
  imageUrl?: string;
}

export type ViewState = 'HOME' | 'EXPLORE' | 'CREATE' | 'PLAY' | 'LOGIN' | 'PROFILE' | 'PROFILE_MESSAGES' | 'LEADERBOARD' | 'ACADEMY' | 'ADMIN' | 'STYLE_GUIDE' | 'SHOP';

export interface ViewProps {
  setView: (view: ViewState) => void;
  setCurrentGame: (game: Game | null) => void;
  currentGame?: Game | null;
}

export interface GameStats {
    startTime: number;
    endTime?: number;
    interactionCount: number;
    hintCount: number;
    puzzleFailures: number;
    visitedSceneCount: number;
    totalSceneCount: number;
    averageDecisionTime: number; // in seconds
}

export interface StarRegion {
  id: string;
  name: string;
  activation_threshold: number;
  current_progress: number;
  awakened_status: boolean;
  description?: string;
}

export interface CivilizationNode {
  id: string;
  name: string;
  dimension: string;
  x: number;
  y: number;
  description?: string;
  isLit?: boolean;
}

export interface StarTrace {
  id: string;
  userId: string;
  gameId: string;
  sceneId: string;
  regionId: string;
  connectedNodeIds: string[];
  timestamp: string;
}

export type CivilizationDimension = '星圖' | '城火' | '山河' | '古道' | '建築' | '詩文' | '人物' | '傳說' | '市井' | '羲光核心';

export type SocialResonance = any;
export type ProfessionType = string;
