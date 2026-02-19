
import { Game, Article } from './types';

export const ARTICLES: Article[] = [
  {
    id: "a1",
    title: "【新手指南】如何製作你的第一個實境解謎遊戲？",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    category: "創作教學",
    tags: ["教學", "入門"],
    date: "2023-10-20",
    author: "系統管理員",
    content: "這是一篇關於如何開始使用編輯器的詳細教學...",
    isPublished: true
  },
  {
    id: "a2",
    title: "2024 台北燈節限定：尋找失落的光點",
    imageUrl: "https://images.unsplash.com/photo-1542621323-be307b0eb917?q=80&w=800&auto=format&fit=crop",
    category: "活動公告",
    tags: ["活動", "台北"],
    date: "2024-01-15",
    endDate: "2024-03-01", // Example of limited time event
    author: "活動小組",
    content: "燈節期間的特別活動，請前往北門...",
    isPublished: true
  },
  {
    id: "a3",
    title: "羲光劇遊原創——《大稻埕的午後》製作訪談",
    imageUrl: "https://images.unsplash.com/photo-1552422535-c4581dadc6f5?q=80&w=800&auto=format&fit=crop",
    category: "專欄",
    tags: ["訪談", "幕後"],
    date: "2023-11-05",
    author: "編輯部",
    content: "採訪了製作團隊，深入了解故事背景...",
    isPublished: true
  }
];

export const FEATURED_GAMES: Game[] = [
  {
    id: "g1",
    title: "台北古城迷蹤",
    description: "在北門周邊尋找失落的清代寶藏，解開百年謎題。你需要觀察周圍的古蹟細節來回答問題。",
    author: "羲光劇遊",
    coverImageKeyword: "taipei",
    startSceneId: "s1",
    type: 'adventure',
    isOfficial: true,
    isRecommended: true,
    playCount: 12500,
    rating: 4.8,
    createdAt: "2023-09-01",
    scenes: [
        {
            id: "s1",
            title: "北門廣場",
            text: "你站在承恩門下，這座紅磚城門見證了台北的變遷。你的手機震動了一下，顯示出一條神秘訊息：『尋找城門上的監視之眼。』",
            choices: [
                { text: "仔細觀察城門構造", nextSceneId: "s2" },
                { text: "詢問路邊的遊客", nextSceneId: "s3" }
            ]
        },
        {
            id: "s2",
            title: "發現線索",
            text: "你在城門內側發現了一個奇怪的刻痕，形狀像是一隻眼睛。刻痕指向了郵局的方向。",
            isEnding: true,
            choices: []
        },
        {
            id: "s3",
            title: "一無所獲",
            text: "遊客們只是疑惑地看著你。你浪費了寶貴的時間，線索似乎冷卻了。",
            isEnding: true,
            choices: []
        }
    ]
  },
  {
    id: "g2",
    title: "深夜便利商店",
    description: "你是大夜班店員，今晚的客人似乎都有點... 不尋常。這是鬼故事還是溫馨喜劇？",
    author: "MidnightWriter",
    coverImageKeyword: "convenience store",
    startSceneId: "start",
    type: 'adventure',
    isRecommended: false,
    playCount: 3400,
    rating: 4.5,
    createdAt: "2023-10-12",
    scenes: [
        {
            id: "start",
            title: "叮咚",
            text: "凌晨三點。自動門開了，但外面沒有人。一陣冷風吹進來。",
            choices: [
                { text: "大喊歡迎光臨", nextSceneId: "end1" },
                { text: "假裝沒看到繼續補貨", nextSceneId: "end2" }
            ]
        },
        {
            id: "end1",
            title: "幽靈顧客",
            text: "空氣中傳來一聲輕笑。『年輕人很有精神嘛。』你收到了一張冥紙小費。",
            isEnding: true,
            choices: []
        },
        {
            id: "end2",
            title: "平安無事",
            text: "什麼事都沒發生。也許只是感應器壞了。但你總覺得背後有人在看你。",
            isEnding: true,
            choices: []
        }
    ]
  },
  {
    id: "g3",
    title: "台南孔廟智慧導覽",
    description: "跟隨虛擬導遊『阿儒』，深入了解全台首學的歷史故事與建築美學。包含語音解說。",
    author: "TainanCulture",
    coverImageKeyword: "temple",
    startSceneId: "intro",
    type: 'guide',
    isRecommended: true,
    playCount: 8900,
    rating: 4.9,
    createdAt: "2023-08-15",
    scenes: [
        {
            id: "intro",
            title: "全台首學",
            text: "歡迎來到台南孔廟。請抬頭看，這塊『全台首學』的匾額，可是大有來頭...",
            choices: [
                { text: "前往大成殿", nextSceneId: "hall" },
                { text: "了解匾額歷史", nextSceneId: "history" }
            ]
        },
        {
            id: "hall",
            title: "大成殿",
            text: "這裡是孔廟的核心，供奉著孔子牌位。注意屋頂上的裝飾...",
            isEnding: true,
            choices: []
        },
        {
            id: "history",
            title: "歷史淵源",
            text: "這塊匾額是清朝康熙皇帝御筆親題...",
            isEnding: true,
            choices: []
        }
    ]
  },
  {
    id: "g4",
    title: "逃離無人島",
    description: "醒來時你發現自己在一座荒島上。身邊只有一個椰子和一把生鏽的刀。",
    author: "Survivor101",
    coverImageKeyword: "island",
    startSceneId: "beach",
    type: 'adventure',
    isRecommended: false,
    playCount: 560,
    rating: 3.8,
    createdAt: "2023-11-20",
    scenes: [
        {
            id: "beach",
            title: "沙灘",
            text: "烈日當空。你需要水源。",
            choices: [
                { text: "走進叢林尋找", nextSceneId: "jungle" },
                { text: "在沙灘挖掘", nextSceneId: "sand" }
            ]
        },
        {
            id: "jungle",
            title: "叢林深處",
            text: "你發現了一條清澈的小溪，還有... 一個舊時代的碉堡？",
            isEnding: true,
            choices: []
        },
        {
            id: "sand",
            title: "徒勞無功",
            text: "挖了很久只有海水。你體力耗盡了。",
            isEnding: true,
            choices: []
        }
    ]
  },
  {
    id: "g5",
    title: "淡水河畔的低語",
    description: "一款結合 AR 技術的聲音劇場，在淡水老街戴上耳機，聆聽過去的故事。",
    author: "羲光劇遊",
    coverImageKeyword: "river",
    startSceneId: "s1",
    type: 'adventure',
    isOfficial: true,
    isRecommended: true,
    playCount: 2200,
    rating: 4.7,
    createdAt: "2023-11-01",
    scenes: [{ id: "s1", title: "起點", text: "...", choices: [] }]
  },
  {
    id: "g6",
    title: "故宮博物院：翠玉白菜的秘密",
    description: "專為兒童設計的互動導覽，透過解謎來認識國寶。",
    author: "MuseumGuide",
    coverImageKeyword: "jade",
    startSceneId: "s1",
    type: 'guide',
    isRecommended: false,
    playCount: 1500,
    rating: 4.6,
    createdAt: "2023-12-05",
    scenes: [{ id: "s1", title: "起點", text: "...", choices: [] }]
  },
  {
    id: "g7",
    title: "植物園生態巡禮",
    description: "認識城市裡的綠洲，掃描植物 QR Code 解鎖生態知識。",
    author: "EcoLife",
    coverImageKeyword: "forest",
    startSceneId: "s1",
    type: 'guide',
    isRecommended: false,
    playCount: 450,
    rating: 4.2,
    createdAt: "2023-12-10",
    scenes: [{ id: "s1", title: "起點", text: "...", choices: [] }]
  }
];