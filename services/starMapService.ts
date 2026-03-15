
import { User, StarTrace, CivilizationDimension, StarRegion, CivilizationNode } from '../types';

// Mock data for regions and nodes
export const STAR_REGIONS: StarRegion[] = [
  { id: 'jiang-an', name: '江岸星域', activation_threshold: 1000, current_progress: 0, awakened_status: false, description: '長江之畔，文明之源。' },
  { id: 'gu-jie', name: '古街星域', activation_threshold: 2000, current_progress: 0, awakened_status: false, description: '青石小徑，歲月留痕。' },
  { id: 'qiao-liang', name: '橋梁星域', activation_threshold: 1500, current_progress: 0, awakened_status: false, description: '跨越天塹，連接古今。' },
];

export const CIVILIZATION_NODES: CivilizationNode[] = [
  { id: 'core', name: '羲光核心', dimension: '羲光核心', x: 500, y: 400, description: '文明的終極奧秘。' },
  { id: 'node1', name: '星圖之眼', dimension: '星圖', x: 500, y: 200, description: '觀星授時，指引前路。' },
  { id: 'node2', name: '城火不息', dimension: '城火', x: 650, y: 250, description: '萬家燈火，文明之光。' },
  { id: 'node3', name: '山河壯麗', dimension: '山河', x: 750, y: 400, description: '大好河山，壯志凌雲。' },
  { id: 'node4', name: '古道西風', dimension: '古道', x: 650, y: 550, description: '絲綢之路，商旅不絕。' },
  { id: 'node5', name: '建築乾坤', dimension: '建築', x: 500, y: 600, description: '雕樑畫棟，巧奪天工。' },
  { id: 'node6', name: '詩文傳情', dimension: '詩文', x: 350, y: 550, description: '唐詩宋詞，千古絕唱。' },
  { id: 'node7', name: '人物風流', dimension: '人物', x: 250, y: 400, description: '英雄輩出，各領風騷。' },
  { id: 'node8', name: '傳說神話', dimension: '傳說', x: 350, y: 250, description: '山海經傳，奇幻瑰麗。' },
  { id: 'node9', name: '市井煙火', dimension: '市井', x: 400, y: 350, description: '街頭巷尾，最是動人。' },
];

export const recordStarTrace = (userId: string, gameId: string, sceneId: string): StarTrace => {
  // In a real app, this would be a Firestore call
  const traces = JSON.parse(localStorage.getItem('xiguang_star_traces') || '[]');
  
  // Determine region based on gameId or sceneId (mock logic)
  const regionId = gameId.includes('river') ? 'jiang-an' : gameId.includes('street') ? 'gu-jie' : 'qiao-liang';
  
  // Determine connected nodes (mock logic: random 1-2 nodes)
  const availableNodes = CIVILIZATION_NODES.filter(n => n.id !== 'core');
  const connectedNodeIds = [availableNodes[Math.floor(Math.random() * availableNodes.length)].id];
  
  const newTrace: StarTrace = {
    id: `trace_${Date.now()}`,
    userId,
    gameId,
    sceneId,
    regionId,
    connectedNodeIds,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('xiguang_star_traces', JSON.stringify([...traces, newTrace]));
  
  // Update Region Progress
  updateRegionProgress(regionId, 50); // Each trace adds 50 progress
  
  // Update User Progress
  updateUserCivilizationProgress(userId, newTrace);
  
  return newTrace;
};

const updateRegionProgress = (regionId: string, amount: number) => {
  const regions = JSON.parse(localStorage.getItem('xiguang_star_regions') || JSON.stringify(STAR_REGIONS));
  const updatedRegions = regions.map((r: StarRegion) => {
    if (r.id === regionId) {
      const newProgress = r.current_progress + amount;
      return {
        ...r,
        current_progress: newProgress,
        awakened_status: newProgress >= r.activation_threshold
      };
    }
    return r;
  });
  localStorage.setItem('xiguang_star_regions', JSON.stringify(updatedRegions));
};

const updateUserCivilizationProgress = (userId: string, trace: StarTrace) => {
  const users = JSON.parse(localStorage.getItem('xiguang_users_db') || '[]');
  const user = users.find((u: User) => u.id === userId);
  
  if (user) {
    // Add dimension based on connected nodes
    const newDimensions = [...(user.unlockedDimensions || [])];
    trace.connectedNodeIds.forEach(nodeId => {
      const node = CIVILIZATION_NODES.find(n => n.id === nodeId);
      if (node && node.dimension !== '羲光核心' && !newDimensions.includes(node.dimension as CivilizationDimension)) {
        newDimensions.push(node.dimension as CivilizationDimension);
      }
    });
    
    // Add activated region
    const newRegions = [...(user.activatedRegions || [])];
    const region = JSON.parse(localStorage.getItem('xiguang_star_regions') || '[]').find((r: StarRegion) => r.id === trace.regionId);
    if (region?.isAwakened && !newRegions.includes(trace.regionId)) {
      newRegions.push(trace.regionId);
    }
    
    // Update profession progress
    const professionProgress = (user.professionProgress || 0) + 10;
    const professionLevel = Math.floor(professionProgress / 100) + 1;
    
    const updatedUser = {
      ...user,
      unlockedDimensions: newDimensions,
      activatedRegions: newRegions,
      professionProgress,
      professionLevel
    };
    
    const newUsers = users.map((u: User) => u.id === userId ? updatedUser : u);
    localStorage.setItem('xiguang_users_db', JSON.stringify(newUsers));
    
    // Update current user in localStorage if matching
    const currentUser = JSON.parse(localStorage.getItem('xiguang_user') || '{}');
    if (currentUser.id === userId) {
      localStorage.setItem('xiguang_user', JSON.stringify(updatedUser));
    }
  }
};

export const getStarTraces = (userId: string): StarTrace[] => {
  const allTraces = JSON.parse(localStorage.getItem('xiguang_star_traces') || '[]');
  return allTraces.filter((t: StarTrace) => t.userId === userId);
};

export const getStarRegions = (): StarRegion[] => {
  return JSON.parse(localStorage.getItem('xiguang_star_regions') || JSON.stringify(STAR_REGIONS));
};
