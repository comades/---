import { GameStats } from '../types';

export interface ExplorationArchetype {
    id: string;
    name: string;
    description: string;
    tags: string[];
    criteria: (stats: GameStats) => number; // Returns a score
}

export interface RadarData {
    subject: string;
    value: number;
    fullMark: number;
}

export const EXPLORATION_ARCHETYPES: ExplorationArchetype[] = [
    {
        id: 'scavenger',
        name: '舊城的拾荒者',
        description: '你穿梭於斷瓦殘垣與繁華街道之間，細心收集著城市遺落的每一枚記憶碎片。',
        tags: ['細緻入微', '記憶收集'],
        criteria: (stats) => (stats.interactionCount / Math.max(stats.visitedSceneCount, 1)) * 10 + (stats.visitedSceneCount / Math.max(stats.totalSceneCount, 1)) * 10
    },
    {
        id: 'weaver',
        name: '邏輯的編織師',
        description: '紛亂的線索在你腦中交織成網，你以理性的光芒照亮了隱藏在表象下的真相。',
        tags: ['理性之光', '線索編織'],
        criteria: (stats) => (10 / (stats.puzzleFailures + 1)) * 2 + (stats.interactionCount / Math.max(stats.totalSceneCount, 1)) * 5
    },
    {
        id: 'whisperer',
        name: '時光的低語者',
        description: '你駐足於歷史的迴廊，靜靜聆聽磚石間傳出的呢喃，與過去的靈魂隔空對話。',
        tags: ['歷史共鳴', '靜謐聆聽'],
        criteria: (stats) => stats.averageDecisionTime * 0.5 + (stats.interactionCount / Math.max(stats.totalSceneCount, 1)) * 5
    },
    {
        id: 'gale',
        name: '巷弄的疾風',
        description: '你的步伐輕快而果決，如一陣清風掠過城市的脈絡，直指最終的答案。',
        tags: ['果敢行動', '疾風之速'],
        criteria: (stats) => (stats.visitedSceneCount / Math.max(stats.totalSceneCount, 1)) * 15 - stats.averageDecisionTime
    },
    {
        id: 'lightchaser',
        name: '故事的追光人',
        description: '你追逐著敘事的微光，在字裡行間尋找情感的共振，將旅程化作一首動人的詩。',
        tags: ['情感共振', '敘事追尋'],
        criteria: (stats) => stats.interactionCount * 0.8 + stats.averageDecisionTime * 0.3
    },
    {
        id: 'fogbreaker',
        name: '迷霧的破局者',
        description: '未知的恐懼無法阻擋你的腳步，你以無畏的姿態衝破重重迷霧，開創屬於自己的道路。',
        tags: ['無畏探索', '破局之刃'],
        criteria: (stats) => (stats.visitedSceneCount / Math.max(stats.totalSceneCount, 1)) * 10 + (10 / (stats.puzzleFailures + 1)) * 5
    },
    {
        id: 'resonator',
        name: '城市的共鳴者',
        description: '你與這座城市同呼吸、共命運，在每一次互動中感受它的脈動，達成靈魂的契合。',
        tags: ['靈魂契合', '城市共生'],
        criteria: (stats) => stats.hintCount * 2 + stats.interactionCount * 0.5
    },
    {
        id: 'pilgrim',
        name: '孤獨的巡禮者',
        description: '你獨自走過漫長的旅途，在寂靜中與自我對話，完成一場心靈的朝聖。',
        tags: ['自我對話', '心靈朝聖'],
        criteria: (stats) => (stats.visitedSceneCount / Math.max(stats.totalSceneCount, 1)) * 15 - stats.hintCount * 2
    },
    {
        id: 'flaneur',
        name: '博學的漫遊家',
        description: '你博古通今，在漫步中將知識與風景融合，以優雅的姿態解讀城市的密碼。',
        tags: ['優雅解讀', '博學漫步'],
        criteria: (stats) => stats.averageDecisionTime * 0.4 + (10 / (stats.puzzleFailures + 1)) * 5
    }
];

export function calculateRadarData(stats: GameStats): RadarData[] {
    const {
        interactionCount,
        hintCount,
        puzzleFailures,
        visitedSceneCount,
        totalSceneCount,
        averageDecisionTime
    } = stats;

    const safeTotal = Math.max(totalSceneCount, 1);
    const safeVisited = Math.max(visitedSceneCount, 1);

    return [
        { subject: '觀察力', value: Math.min(100, (interactionCount / safeVisited) * 15), fullMark: 100 },
        { subject: '邏輯力', value: Math.min(100, (10 / (puzzleFailures + 1)) * 10), fullMark: 100 },
        { subject: '探索力', value: Math.min(100, (visitedSceneCount / safeTotal) * 100), fullMark: 100 },
        { subject: '文化感知', value: Math.min(100, averageDecisionTime * 4), fullMark: 100 },
        { subject: '敘事沉浸', value: Math.min(100, interactionCount * 3), fullMark: 100 },
        { subject: '協作力', value: Math.min(100, hintCount * 15), fullMark: 100 },
    ];
}

export function determineArchetype(stats: GameStats): ExplorationArchetype {
    // Score each archetype
    const scored = EXPLORATION_ARCHETYPES.map(a => ({
        ...a,
        score: a.criteria(stats)
    }));
    
    // Return the one with the highest score
    return scored.sort((a, b) => b.score - a.score)[0];
}
