
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Map as MapIcon, Zap, Trophy, History, Shield, Flame, Mountain, MapPin, Building2, ScrollText, Users, Sparkles, Store, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { Stage, Layer, Circle, Line, Text, Group } from 'react-konva';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ViewProps, StarRegion, CivilizationNode, StarTrace, SocialResonance, ProfessionType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useGame } from '../contexts/GameContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data for initial development
const MOCK_REGIONS: StarRegion[] = [
  { id: 'r1', name: '江岸星域', activation_threshold: 1000, current_progress: 1200, awakened_status: true },
  { id: 'r2', name: '古街星域', activation_threshold: 2000, current_progress: 1500, awakened_status: false },
  { id: 'r3', name: '橋梁星域', activation_threshold: 1500, current_progress: 800, awakened_status: false },
];

const MOCK_NODES: CivilizationNode[] = [
  { id: 'n1', name: '羲光核心', dimension: '星图', x: 0, y: 0, description: '文明的起源，萬物之始。' },
  { id: 'n2', name: '星圖之眼', dimension: '星图', x: 200, y: -150, isLit: true },
  { id: 'n3', name: '城火祭壇', dimension: '城火', x: -200, y: -150, isLit: true },
  { id: 'n4', name: '山河印記', dimension: '山河', x: 300, y: 50, isLit: false },
  { id: 'n5', name: '古道驛站', dimension: '古道', x: -300, y: 50, isLit: true },
  { id: 'n6', name: '建築之魂', dimension: '建筑', x: 0, y: 300, isLit: false },
  { id: 'n7', name: '詩文閣', dimension: '诗文', x: 150, y: 200, isLit: true },
  { id: 'n8', name: '英雄塚', dimension: '人物', x: -150, y: 200, isLit: false },
  { id: 'n9', name: '傳說之泉', dimension: '传说', x: 400, y: -100, isLit: false },
  { id: 'n10', name: '市井煙火', dimension: '市井', x: -400, y: -100, isLit: true },
];

const DIMENSIONS = [
  { name: '星图', icon: Star, color: '#EAB308' },
  { name: '城火', icon: Flame, color: '#EF4444' },
  { name: '山河', icon: Mountain, color: '#10B981' },
  { name: '古道', icon: MapPin, color: '#F59E0B' },
  { name: '建筑', icon: Building2, color: '#6366F1' },
  { name: '诗文', icon: ScrollText, color: '#EC4899' },
  { name: '人物', icon: Users, color: '#8B5CF6' },
  { name: '传说', icon: Sparkles, color: '#06B6D4' },
  { name: '市井', icon: Store, color: '#F97316' },
];

type TabType = 'LIT' | 'TRACES' | 'REGIONS' | 'RESONANCE' | 'RANKING';

export const StarMap: React.FC<ViewProps> = ({ setView }) => {
  const { systemSettings } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('LIT');
  const [selectedNode, setSelectedNode] = useState<CivilizationNode | null>(null);
  const [profession, setProfession] = useState<ProfessionType>('星图学者');
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIT':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-200 mb-4 font-serif">已點亮文明</h3>
            <div className="grid grid-cols-3 gap-3">
              {DIMENSIONS.map((dim) => (
                <div key={dim.name} className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <dim.icon className="w-6 h-6 mb-2" style={{ color: dim.color }} />
                  <span className="text-xs text-white/70">{dim.name}</span>
                  <span className="text-sm font-bold text-amber-400">45%</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'TRACES':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-200 mb-4 font-serif">我的星跡</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">探索：江岸古鎮</p>
                    <p className="text-xs text-white/50">2024-03-14 10:00</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
              ))}
            </div>
          </div>
        );
      case 'REGIONS':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-200 mb-4 font-serif">文明星域</h3>
            <div className="space-y-4">
              {(systemSettings.starSectors || []).map((region) => (
                <div key={region.id} className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white">{region.name}</span>
                    {region.isAwakened ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">星域已蘇醒</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/20">沉睡中</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((region.currentPlayers || 0) / region.requiredPlayers) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-white/40">
                    <span>進度: {region.currentPlayers || 0} 人</span>
                    <span>閾值: {region.requiredPlayers} 人</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'RESONANCE':
        return (
          <div className="space-y-4 text-center py-8">
            <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-amber-200 font-serif">文明共振</h3>
            <p className="text-sm text-white/60 px-4">當多位探索者的星跡交匯，文明將產生共鳴。目前已有 12 處共振點。</p>
            <button className="mt-6 px-6 py-2 rounded-full bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors">
              查看隊友星圖
            </button>
          </div>
        );
      case 'RANKING':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-200 mb-4 font-serif">文明貢獻榜</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3",
                    rank === 1 ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"
                  )}>{rank}</span>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-white">探索者_{rank * 123}</p>
                    <p className="text-[10px] text-white/40">光光身份: 文明守望者</p>
                  </div>
                  <span className="text-amber-400 font-mono text-sm">12,450</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Star Map Canvas */}
      <div className="absolute inset-0 z-0">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-24 right-6 z-20 flex flex-col gap-2">
                <button onClick={() => zoomIn()} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ZoomIn size={20} />
                </button>
                <button onClick={() => zoomOut()} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ZoomOut size={20} />
                </button>
                <button onClick={() => resetTransform()} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Maximize2 size={20} />
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <Stage width={dimensions.width} height={dimensions.height}>
                  <Layer>
                    {/* Background Stars */}
                    {Array.from({ length: 100 }).map((_, i) => (
                      <Circle
                        key={i}
                        x={Math.random() * dimensions.width}
                        y={Math.random() * dimensions.height}
                        radius={Math.random() * 1.5}
                        fill="white"
                        opacity={Math.random() * 0.5}
                      />
                    ))}

                    {/* Nine-Point Structure Lines */}
                    <Group x={dimensions.width / 2} y={dimensions.height / 2}>
                      {MOCK_NODES.filter(n => n.id !== 'n1').map(node => (
                        <Line
                          key={`line-${node.id}`}
                          points={[0, 0, node.x, node.y]}
                          stroke="rgba(251, 191, 36, 0.1)"
                          strokeWidth={1}
                          dash={[5, 5]}
                        />
                      ))}

                      {/* Connection Lines (Traces) */}
                      <Line
                        points={[MOCK_NODES[1].x, MOCK_NODES[1].y, MOCK_NODES[2].x, MOCK_NODES[2].y]}
                        stroke="rgba(251, 191, 36, 0.4)"
                        strokeWidth={2}
                        shadowBlur={10}
                        shadowColor="#FBBF24"
                      />

                      {/* Nodes */}
                      {MOCK_NODES.map((node) => (
                        <Group 
                          key={node.id} 
                          x={node.x} 
                          y={node.y}
                          onClick={() => setSelectedNode(node)}
                          onTap={() => setSelectedNode(node)}
                        >
                          <Circle
                            radius={node.id === 'n1' ? 12 : 6}
                            fill={node.isLit || node.id === 'n1' ? '#FBBF24' : '#333'}
                            shadowBlur={node.isLit ? 15 : 0}
                            shadowColor="#FBBF24"
                            stroke={node.id === 'n1' ? '#FBBF24' : 'transparent'}
                            strokeWidth={2}
                          />
                          {node.isLit && (
                            <Circle
                              radius={10}
                              stroke="#FBBF24"
                              strokeWidth={1}
                              opacity={0.3}
                            />
                          )}
                          <Text
                            text={node.name}
                            y={node.id === 'n1' ? 20 : 12}
                            x={-30}
                            width={60}
                            align="center"
                            fill={node.isLit || node.id === 'n1' ? '#FBBF24' : '#666'}
                            fontSize={10}
                            fontFamily="serif"
                          />
                        </Group>
                      ))}
                    </Group>
                  </Layer>
                </Stage>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-widest text-[#B21D2D] font-serif mb-1">文明星圖</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Civilization Constellation System</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">當前身份</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-200">{profession}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=star" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Left Sidebar - Navigation */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
          {[
            { id: 'LIT', icon: Star, label: '已點亮文明' },
            { id: 'TRACES', icon: History, label: '我的星跡' },
            { id: 'REGIONS', icon: MapIcon, label: '文明星域' },
            { id: 'RESONANCE', icon: Zap, label: '文明共振' },
            { id: 'RANKING', icon: Trophy, label: '排行榜' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={cn(
                "group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                activeTab === item.id 
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="absolute left-16 px-3 py-1 rounded-md bg-black/80 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Right Panel - Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-6 top-24 bottom-24 w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 pointer-events-auto overflow-y-auto custom-scrollbar"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Info - Selected Node */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] bg-black/60 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 pointer-events-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-amber-200 font-serif">{selectedNode.name}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{selectedNode.dimension} 維度</p>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              {selectedNode.description || "這是一個古老的文明節點，蘊含著深厚的歷史底蘊。通過探索與記錄，你將逐步揭開它的神秘面紗。"}
            </p>
            <div className="flex gap-3">
              <button className="flex-grow py-2 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors">
                前往探索
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">
                查看詳情
              </button>
            </div>
          </motion.div>
        )}

        {/* Nine-Point Progress Bar */}
        <div className="absolute bottom-10 left-6 flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">文明陣列進度</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-6 h-1 rounded-full transition-all duration-500",
                  i < 4 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white/10"
                )} 
              />
            ))}
          </div>
          <span className="text-[10px] text-white/30 mt-1">4 / 9 維度已覺醒</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};
