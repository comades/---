
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';

export type BaguaCategory = 
  | 'history' 
  | 'geography' 
  | 'river' 
  | 'culture' 
  | 'architecture' 
  | 'legend' 
  | 'events' 
  | 'street_life';

interface TrigramProps {
  type: BaguaCategory;
  isCompleted: boolean;
  rotation: number;
  label: string;
}

const Trigram: React.FC<TrigramProps> = ({ type, isCompleted, rotation, label }) => {
  // Trigram patterns (solid = 1, broken = 0)
  // Top to bottom in standard orientation
  const patterns: Record<BaguaCategory, number[]> = {
    history: [1, 1, 1],      // Qian (Heaven)
    geography: [0, 0, 0],    // Kun (Earth)
    river: [0, 1, 0],        // Kan (Water)
    culture: [1, 0, 1],      // Li (Fire)
    architecture: [1, 0, 0], // Gen (Mountain)
    legend: [0, 0, 1],       // Zhen (Thunder)
    events: [0, 1, 1],       // Dui (Lake)
    street_life: [1, 1, 0],  // Xun (Wind)
  };

  const pattern = patterns[type];

  return (
    <motion.g
      initial={false}
      animate={{
        opacity: 1,
        filter: isCompleted ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none'
      }}
      style={{ transform: `rotate(${rotation}deg) translateY(-140px)` }}
    >
      {/* Trigram Lines */}
      {pattern.map((line, idx) => (
        <React.Fragment key={idx}>
          {line === 1 ? (
            // Solid line
            <motion.rect
              x="-20"
              y={idx * 12 - 15}
              width="40"
              height="6"
              rx="1"
              fill={isCompleted ? "#FBBF24" : "#3D4439"}
              stroke={isCompleted ? "#F59E0B" : "#1A1D18"}
              strokeWidth="0.5"
              animate={{
                fill: isCompleted ? "#FBBF24" : "#3D4439",
                stroke: isCompleted ? "#F59E0B" : "#1A1D18",
              }}
            />
          ) : (
            // Broken line
            <g>
              <motion.rect
                x="-20"
                y={idx * 12 - 15}
                width="18"
                height="6"
                rx="1"
                fill={isCompleted ? "#FBBF24" : "#3D4439"}
                stroke={isCompleted ? "#F59E0B" : "#1A1D18"}
                strokeWidth="0.5"
                animate={{
                  fill: isCompleted ? "#FBBF24" : "#3D4439",
                  stroke: isCompleted ? "#F59E0B" : "#1A1D18",
                }}
              />
              <motion.rect
                x="2"
                y={idx * 12 - 15}
                width="18"
                height="6"
                rx="1"
                fill={isCompleted ? "#FBBF24" : "#3D4439"}
                stroke={isCompleted ? "#F59E0B" : "#1A1D18"}
                strokeWidth="0.5"
                animate={{
                  fill: isCompleted ? "#FBBF24" : "#3D4439",
                  stroke: isCompleted ? "#F59E0B" : "#1A1D18",
                }}
              />
            </g>
          )}
        </React.Fragment>
      ))}
      
      {/* Label */}
      <text
        y="35"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill={isCompleted ? "#FBBF24" : "#6B7280"}
        style={{ transform: `rotate(${-rotation}deg)`, pointerEvents: 'none' }}
        className="font-serif"
      >
        {label}
      </text>
    </motion.g>
  );
};

interface BaguaProgressProps {
  completedCategories: BaguaCategory[];
  size?: number;
}

export const BaguaProgress: React.FC<BaguaProgressProps> = ({ 
  completedCategories, 
  size = 400 
}) => {
  const categories: { id: BaguaCategory; label: string }[] = [
    { id: 'history', label: '歷史' },
    { id: 'geography', label: '地理' },
    { id: 'river', label: '河流' },
    { id: 'culture', label: '文化' },
    { id: 'architecture', label: '建築' },
    { id: 'legend', label: '傳說' },
    { id: 'events', label: '事件' },
    { id: 'street_life', label: '市井' },
  ];

  const isAllCompleted = completedCategories.length === categories.length;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Bronze Ring */}
      <div className="absolute inset-0 rounded-full border-[12px] border-[#2D3429] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
      <div className="absolute inset-4 rounded-full border-2 border-[#3D4439] opacity-50" />
      
      {/* SVG Container */}
      <motion.svg
        viewBox="-200 -200 400 400"
        width={size}
        height={size}
        className="relative z-10"
        animate={isAllCompleted ? { rotate: 360 } : { rotate: 0 }}
        transition={isAllCompleted ? { duration: 20, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
      >
        {/* Bronze Texture Pattern */}
        <defs>
          <radialGradient id="bronzeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4A5245" />
            <stop offset="70%" stopColor="#2D3429" />
            <stop offset="100%" stopColor="#1A1D18" />
          </radialGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Inner Circle */}
        <circle r="80" fill="url(#bronzeGradient)" stroke="#3D4439" strokeWidth="2" />
        
        {/* Trigrams */}
        {categories.map((cat, index) => (
          <Trigram
            key={cat.id}
            type={cat.id}
            label={cat.label}
            isCompleted={completedCategories.includes(cat.id)}
            rotation={index * 45}
          />
        ))}

        {/* Center Fire / City Light */}
        {isAllCompleted && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <circle r="40" fill="rgba(251, 191, 36, 0.2)" filter="url(#glow)" />
            <motion.g
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <foreignObject x="-20" y="-20" width="40" height="40">
                <div className="flex items-center justify-center h-full w-full">
                  <Flame className="text-amber-500 w-8 h-8 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </div>
              </foreignObject>
            </motion.g>
            
            {/* Decorative Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.circle
                key={i}
                r="1.5"
                fill="#FBBF24"
                animate={{
                  y: [-20, -60],
                  x: [0, (i % 2 === 0 ? 20 : -20)],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </motion.g>
        )}
      </motion.svg>

      {/* Outer Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#2D3429] rotate-45 border-2 border-[#3D4439]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[#2D3429] rotate-45 border-2 border-[#3D4439]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-[#2D3429] rotate-45 border-2 border-[#3D4439]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-[#2D3429] rotate-45 border-2 border-[#3D4439]" />
      </div>

      {/* Modern UI Overlay */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-100 uppercase tracking-widest">
            {completedCategories.length} / 8 卦象已覺醒
          </span>
        </div>
      </div>
    </div>
  );
};
