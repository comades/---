import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';

interface NinePointedStarRitualProps {
    onComplete: () => void;
    progress?: number; // 0 to 1, how many points are lit
}

export const NinePointedStarRitual: React.FC<NinePointedStarRitualProps> = ({ onComplete, progress = 1 }) => {
    const [litPoints, setLitPoints] = useState(0);
    const [isCoreIgnited, setIsCoreIgnited] = useState(false);
    const [isTransformed, setIsTransformed] = useState(false);
    const [showFinalText, setShowFinalText] = useState(false);

    const totalPoints = 9;
    const targetLitPoints = Math.ceil(progress * totalPoints);

    useEffect(() => {
        // Sequentially light up points
        const interval = setInterval(() => {
            setLitPoints(prev => {
                if (prev < targetLitPoints) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 400);

        return () => clearInterval(interval);
    }, [targetLitPoints]);

    useEffect(() => {
        if (litPoints === totalPoints) {
            // All points lit, ignite core
            const timer = setTimeout(() => setIsCoreIgnited(true), 800);
            return () => clearTimeout(timer);
        }
    }, [litPoints]);

    useEffect(() => {
        if (isCoreIgnited) {
            // Transform after core is fully ignited
            const timer = setTimeout(() => setIsTransformed(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCoreIgnited]);

    useEffect(() => {
        if (isTransformed) {
            const timer = setTimeout(() => setShowFinalText(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isTransformed]);

    useEffect(() => {
        if (showFinalText) {
            const timer = setTimeout(() => onComplete(), 4000);
            return () => clearTimeout(timer);
        }
    }, [showFinalText, onComplete]);

    // Calculate star points
    const starPoints = useMemo(() => {
        const outerR = 120;
        const innerR = 55;
        const cx = 150;
        const cy = 150;
        const points = [];
        for (let i = 0; i < 18; i++) {
            const angle = (i * 20 * Math.PI) / 180;
            const radius = i % 2 === 0 ? outerR : innerR;
            points.push(`${cx + radius * Math.sin(angle)},${cy - radius * Math.cos(angle)}`);
        }
        return points.join(' ');
    }, []);

    // Inner star lines for complexity
    const innerLines = useMemo(() => {
        const outerR = 120;
        const cx = 150;
        const cy = 150;
        const lines = [];
        for (let i = 0; i < 9; i++) {
            const angle1 = (i * 40 * Math.PI) / 180;
            const angle2 = ((i + 4) * 40 * Math.PI) / 180; // Connect to a distant point
            lines.push({
                x1: cx + outerR * Math.sin(angle1),
                y1: cy - outerR * Math.cos(angle1),
                x2: cx + outerR * Math.sin(angle2),
                y2: cy - outerR * Math.cos(angle2),
            });
        }
        return lines;
    }, []);

    // Individual point coordinates for lighting up
    const pointCoords = useMemo(() => {
        const outerR = 120;
        const cx = 150;
        const cy = 150;
        return Array.from({ length: 9 }).map((_, i) => {
            const angle = (i * 40 * Math.PI) / 180;
            return {
                x: cx + outerR * Math.sin(angle),
                y: cy - outerR * Math.cos(angle)
            };
        });
    }, []);

    return (
        <div className="absolute inset-0 z-[200] bg-[#050505] flex items-center justify-center overflow-hidden font-serif">
            {/* Ancient Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
                
                {/* Background Glow */}
                <motion.div 
                    animate={{ 
                        opacity: [0.1, 0.25, 0.1],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]"
                />

                <AnimatePresence mode="wait">
                    {!isTransformed ? (
                        <motion.div 
                            key="star-ritual"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5, filter: 'blur(30px)' }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="relative"
                        >
                            {/* Orbit Ring */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-60px] border border-[#D4AF37]/20 rounded-full"
                            >
                                {/* Golden Energy on Ring */}
                                <motion.div 
                                    animate={{ 
                                        opacity: [0.6, 1, 0.6],
                                        scale: [1, 1.5, 1],
                                        boxShadow: ['0 0 10px #D4AF37', '0 0 30px #D4AF37', '0 0 10px #D4AF37']
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#D4AF37] rounded-full"
                                />
                                
                                {/* Trailing Energy */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gradient-to-r from-[#D4AF37]/0 to-[#D4AF37]/40 blur-md -rotate-90 origin-left"></div>
                            </motion.div>

                            {/* The Nine-Pointed Star */}
                            <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                <defs>
                                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8B0000" />
                                        <stop offset="50%" stopColor="#600000" />
                                        <stop offset="100%" stopColor="#300000" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                
                                {/* Inner Complexity Lines */}
                                {innerLines.map((line, i) => (
                                    <motion.line
                                        key={i}
                                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                                        stroke="#D4AF37"
                                        strokeWidth="0.5"
                                        strokeOpacity="0.1"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: 0.5 }}
                                    />
                                ))}

                                {/* Base Star Shape */}
                                <polygon 
                                    points={starPoints} 
                                    fill="url(#starGradient)" 
                                    stroke="#D4AF37" 
                                    strokeWidth="1.5"
                                    strokeOpacity="0.4"
                                />

                                {/* Lit Points Glow */}
                                {pointCoords.map((coord, i) => (
                                    <React.Fragment key={i}>
                                        <motion.circle
                                            cx={coord.x}
                                            cy={coord.y}
                                            r="6"
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={litPoints > i ? { 
                                                opacity: [0.4, 0.8, 0.4], 
                                                scale: [1, 1.5, 1],
                                            } : {}}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            fill="#D4AF37"
                                            className="blur-sm"
                                        />
                                        <motion.circle
                                            cx={coord.x}
                                            cy={coord.y}
                                            r="3"
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={litPoints > i ? { 
                                                opacity: 1, 
                                                scale: 1,
                                            } : {}}
                                            fill="#D4AF37"
                                        />
                                    </React.Fragment>
                                ))}

                                {/* Connecting Lines for Lit Points */}
                                <motion.polygon
                                    points={starPoints}
                                    fill="transparent"
                                    stroke="#D4AF37"
                                    strokeWidth="2.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ 
                                        pathLength: litPoints / totalPoints, 
                                        opacity: litPoints > 0 ? 1 : 0,
                                        filter: 'drop-shadow(0 0 5px #D4AF37)'
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </svg>

                            {/* Central Core Flame */}
                            <AnimatePresence>
                                {isCoreIgnited && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <motion.div 
                                                animate={{ 
                                                    scale: [1, 1.4, 1],
                                                    opacity: [0.6, 0.9, 0.6]
                                                }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className="w-16 h-16 bg-orange-600 rounded-full blur-2xl"
                                            />
                                            <motion.div 
                                                animate={{ 
                                                    y: [0, -5, 0],
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{ duration: 0.4, repeat: Infinity }}
                                                className="relative z-10"
                                            >
                                                <Flame size={40} className="text-[#D4AF37] drop-shadow-[0_0_10px_#D4AF37]" />
                                            </motion.div>
                                            
                                            {/* Sparkles around core */}
                                            <div className="absolute inset-0">
                                                {[...Array(4)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ 
                                                            scale: [0, 1, 0],
                                                            opacity: [0, 1, 0],
                                                            rotate: [0, 90]
                                                        }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                                                        className="absolute top-1/2 left-1/2"
                                                        style={{ transform: `rotate(${i * 90}deg) translateY(-20px)` }}
                                                    >
                                                        <Sparkles size={12} className="text-yellow-200" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="fire-symbol"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            {/* Stylized "City Fire" Symbol (Ancient Chinese Style) */}
                            <div className="relative w-72 h-72 flex items-center justify-center">
                                {/* Outer Glow Ring */}
                                <motion.div 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border border-[#D4AF37]/10 rounded-full"
                                />
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border border-[#D4AF37]/5 rounded-full"
                                />
                                
                                {/* The Symbol: A stylized "火" or a unique icon */}
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                                    className="relative z-10"
                                >
                                    <svg width="140" height="140" viewBox="0 0 100 100" className="text-[#D4AF37]">
                                        <defs>
                                            <filter id="fireGlow">
                                                <feGaussianBlur stdDeviation="2" result="blur" />
                                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                            </filter>
                                        </defs>
                                        {/* Stylized "火" (Fire) character in seal script style */}
                                        <motion.path 
                                            d="M50 15 C50 15 35 45 35 70 C35 82 42 90 50 90 C58 90 65 82 65 70 C65 45 50 15 50 15 Z" 
                                            fill="currentColor"
                                            fillOpacity="0.2"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 2.5 }}
                                        />
                                        <motion.path 
                                            d="M50 25 C50 25 40 50 40 70 C40 78 45 82 50 82 C55 82 60 78 60 70 C60 50 50 25 50 25 Z" 
                                            fill="currentColor"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 1.5, delay: 1 }}
                                            filter="url(#fireGlow)"
                                        />
                                        <motion.path 
                                            d="M38 55 C25 65 20 80 30 90" 
                                            stroke="currentColor" 
                                            strokeWidth="3" 
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.8, delay: 0.8 }}
                                        />
                                        <motion.path 
                                            d="M62 55 C75 65 80 80 70 90" 
                                            stroke="currentColor" 
                                            strokeWidth="3" 
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.8, delay: 0.8 }}
                                        />
                                    </svg>
                                    
                                    {/* Particle effects around the symbol */}
                                    <div className="absolute inset-0 -z-10">
                                        {[...Array(10)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ 
                                                    y: [-10, -120],
                                                    x: [0, (i % 2 === 0 ? 30 : -30) * Math.random()],
                                                    opacity: [0, 0.8, 0],
                                                    scale: [0, 1.2, 0]
                                                }}
                                                transition={{ 
                                                    duration: 2.5 + Math.random() * 2, 
                                                    repeat: Infinity,
                                                    delay: i * 0.4
                                                }}
                                                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full blur-[1px]"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {showFinalText && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1.5 }}
                                    className="text-center mt-10"
                                >
                                    <h2 className="text-[#D4AF37] text-4xl font-black tracking-[0.6em] mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                                        城火永傳
                                    </h2>
                                    <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mb-4"></div>
                                    <p className="text-[#D4AF37]/50 text-[10px] tracking-[0.4em] uppercase font-light">
                                        The Eternal Flame of the Ancient City
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress Indicators */}
            {!isTransformed && (
                <div className="absolute bottom-16 flex gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={litPoints > i ? { 
                                backgroundColor: '#D4AF37',
                                boxShadow: '0 0 15px #D4AF37',
                                scale: 1.3
                            } : { 
                                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                                scale: 1
                            }}
                            transition={{ duration: 0.5 }}
                            className="w-2.5 h-2.5 rounded-full border border-[#D4AF37]/20"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
