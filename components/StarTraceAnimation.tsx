
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StarTraceAnimationProps {
  isActive: boolean;
  history: string[];
  currentSceneId: string;
  onComplete?: () => void;
}

// Deterministic position for nodes
const getPosition = (id: string, index: number) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Spiral or radial distribution for a "formation" feel
    const angle = (index * 137.5) * (Math.PI / 180);
    const radius = 50 + (index * 20);
    const x = 500 + Math.cos(angle) * radius;
    const y = 400 + Math.sin(angle) * radius;
    return { x, y };
};

export const StarTraceAnimation: React.FC<StarTraceAnimationProps> = ({ 
    isActive, 
    history, 
    currentSceneId, 
    onComplete 
}) => {
  const [step, setStep] = useState(0);

  // Calculate coordinates for civilization nodes
  const nodes = useMemo(() => {
      const allIds = [...history];
      if (!allIds.includes(currentSceneId)) allIds.push(currentSceneId);
      return allIds.map((id, i) => ({ id, ...getPosition(id, i) }));
  }, [history, currentSceneId]);

  useEffect(() => {
    if (isActive) {
      setStep(1);
      
      // Animation Timeline:
      // 0-1s: Freeze & Darken (Step 1)
      // 1-2.5s: Trace extraction & flow to center (Step 2 & 3)
      // 2.5-4.5s: Civilization Formation growth (Step 4)
      // 4.5-5.5s: Resonance Pulse (Step 5)
      // 5.5-7s: New directional line (Step 6)
      // 7s+: Completion
      
      const timers = [
        setTimeout(() => setStep(2), 1000), // Extraction
        setTimeout(() => setStep(3), 2500), // Formation
        setTimeout(() => setStep(4), 4500), // Pulse
        setTimeout(() => setStep(5), 5500), // New Line
        setTimeout(() => {
            if (onComplete) onComplete();
            setStep(0);
        }, 8000)
      ];

      return () => timers.forEach(clearTimeout);
    } else {
      setStep(0);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const currentNode = nodes[nodes.length - 1];
  const center = { x: 500, y: 400 };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0b] overflow-hidden">
      {/* Background Ambience */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)]"
      />

      <svg width="100%" height="100%" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" className="relative z-10">
          <defs>
              <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
              <radialGradient id="nodeGlow">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </radialGradient>
          </defs>

          {/* Step 2: Trace Extraction & Flow */}
          {step >= 2 && step < 4 && (
              <motion.path
                d={`M ${currentNode.x} ${currentNode.y} Q ${center.x} ${currentNode.y} ${center.x} ${center.y}`}
                fill="none"
                stroke="#d4af37"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
                filter="url(#glow)"
              />
          )}

          {/* Step 3 & 4: Civilization Formation (Geometric Pattern) */}
          {step >= 3 && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                  {/* Central Core */}
                  <motion.circle 
                    cx={center.x} cy={center.y} r="4" fill="#d4af37" 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                  
                  {/* Geometric Lines connecting nodes */}
                  {nodes.map((node, i) => (
                      <React.Fragment key={`formation-${node.id}`}>
                          <motion.line 
                            x1={center.x} y1={center.y} 
                            x2={node.x} y2={node.y} 
                            stroke="#d4af37" 
                            strokeWidth="0.5" 
                            strokeOpacity="0.2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                          />
                          <motion.circle 
                            cx={node.x} cy={node.y} r="2" fill="#d4af37" 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5 + (i * 0.1) }}
                          />
                      </React.Fragment>
                  ))}

                  {/* Concentric Geometric Rings */}
                  {[40, 80, 120].map((r, i) => (
                      <motion.circle
                        key={`ring-${i}`}
                        cx={center.x} cy={center.y} r={r}
                        fill="none"
                        stroke="#d4af37"
                        strokeWidth="0.5"
                        strokeOpacity="0.1"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 + (i * 0.3), duration: 2 }}
                      />
                  ))}
              </motion.g>
          )}

          {/* Step 4: Resonance Pulse */}
          {step >= 4 && (
              <motion.circle
                cx={center.x} cy={center.y}
                initial={{ r: 0, opacity: 0.5 }}
                animate={{ r: 400, opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
              />
          )}

          {/* Step 5: New Directional Line */}
          {step >= 5 && (
              <motion.g>
                  <motion.line
                    x1={center.x} y1={center.y}
                    x2={center.x + 150} y2={center.y - 100}
                    stroke="#d4af37"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    filter="url(#glow)"
                  />
                  <motion.circle
                    cx={center.x + 150} cy={center.y - 100}
                    r="4"
                    fill="#d4af37"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  />
              </motion.g>
          )}
      </svg>

      {/* Text Overlay (Subtle) */}
      <AnimatePresence>
          {step >= 3 && step < 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 text-center pointer-events-none"
              >
                  <p className="text-[#d4af37] text-xs tracking-[0.5em] uppercase opacity-40 mb-2">Civilization Pattern Synchronized</p>
                  <h2 className="text-xl font-serif text-white/80 tracking-widest">文明印跡已歸位</h2>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
