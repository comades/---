

export interface Choice {
  text: string;
  nextSceneId: string;
}

export type ModuleType = 
  | 'LOCATION' 
  | 'STORY_NARRATION' | 'STORY_DIALOGUE'
  | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' 
  | 'AR_RECOGNIZE' | 'AR_TRANSPARENT'
  | 'ANS_TEXT' | 'ANS_SINGLE' | 'ANS_MULTI' | 'ANS_NUMBER' | 'ANS_IMAGE' | 'ANS_PHOTO' | 'ANS_VOICE' | 'ANS_AR'
  | 'HINT';

export interface GameModule {
  id: string;
  type: ModuleType;
  data: any; // Dynamic data based on type
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
export type GameStatus = 'draft' | 'review' | 'published' | 'rejected' | 'off_shelf';

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
  
  // New fields for Editor
  tags?: string[];
  language?: string;
  difficulty?: number;   // 1-5 stars
  location?: string;
  latitude?: number;     // GPS Latitude
  longitude?: number;    // GPS Longitude
  
  // Shared Resources
  characters?: Character[];
  assets?: GameAsset[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number; 
  shares: number;   
  isLiked?: boolean;
  createdAt: string;
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
  followers: number; // New
  following: number; // New
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
  content?: string; // Full content or summary
  isPublished: boolean;
  views?: number; // New
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
}

export type ViewState = 'HOME' | 'EXPLORE' | 'CREATE' | 'PLAY' | 'LOGIN' | 'PROFILE' | 'LEADERBOARD' | 'ACADEMY' | 'ADMIN';

export interface ViewProps {
  setView: (view: ViewState) => void;
  setCurrentGame: (game: Game | null) => void;
  currentGame?: Game | null;
}