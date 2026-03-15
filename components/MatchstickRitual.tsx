import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';

interface MatchstickRitualProps {
    onComplete: () => void;
}

const Spark: React.FC<{ delay: number }> = ({ delay }) => (
    <motion.div
        initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
        animate={{ 
            y: [-20, -60], 
            x: [0, (Math.random() - 0.5) * 30],
            opacity: [1, 0],
            scale: [1, 0.5]
        }}
        transition={{ repeat: Infinity, duration: 0.8 + Math.random() * 0.5, delay, ease: "easeOut" }}
        className="absolute w-1 h-1 bg-yellow-500 rounded-full blur-[0.5px]"
    />
);

const RealisticFlame = ({ size = 48, intensity = 1 }) => (
    <motion.div 
        animate={{ 
            rotate: [-1, 1, -0.5, 0.5, 0],
            scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
        className="relative flex items-center justify-center" 
        style={{ width: size, height: size }}
    >
        {/* Outer Glow */}
        <motion.div
            animate={{ 
                scale: [1 * intensity, 1.3 * intensity, 1 * intensity],
                opacity: [0.4, 0.7, 0.4] 
            }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            className="absolute w-[150%] h-[150%] bg-orange-600 rounded-full blur-2xl"
        />
        {/* Outer Flame Layer */}
        <motion.div
            animate={{ 
                scale: [1, 1.1, 0.9, 1.05, 1],
                y: [0, -size * 0.15, 0],
                skewX: [-2, 2, -1, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
            className="absolute w-[90%] h-[120%] bg-gradient-to-t from-red-600 via-orange-500 to-transparent blur-[6px]"
            style={{ borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%' }}
        />
        {/* Inner Flame Layer */}
        <motion.div
            animate={{ 
                scale: [1, 1.2, 0.95, 1.1, 1],
                y: [0, -size * 0.08, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut", delay: 0.1 }}
            className="absolute w-[60%] h-[80%] bg-gradient-to-t from-orange-400 via-yellow-300 to-transparent blur-[3px]"
            style={{ borderRadius: '50% 50% 20% 20% / 80% 80% 20% 20%' }}
        />
        {/* Core */}
        <motion.div
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.9, 1, 0.9]
            }}
            transition={{ repeat: Infinity, duration: 0.2, ease: "linear" }}
            className="absolute w-[30%] h-[50%] bg-white rounded-full blur-[2px]"
        />
        
        {/* Rising Sparks */}
        {[...Array(5)].map((_, i) => (
            <Spark key={i} delay={i * 0.2} />
        ))}
    </motion.div>
);

export const MatchstickRitual: React.FC<MatchstickRitualProps> = ({ onComplete }) => {
    const [swipeCount, setSwipeCount] = useState(0);
    const [message, setMessage] = useState("");
    const [showFinalMessage, setShowFinalMessage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const controls = useAnimation();
    const ritualControls = useAnimation();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    useEffect(() => {
        // Pre-load audio files with stable Mixkit preview links
        const sounds = [
            'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Realistic burning
            'https://assets.mixkit.co/active_storage/sfx/1339/1339-preview.mp3', // Whoosh
            'https://assets.mixkit.co/active_storage/sfx/1337/1337-preview.mp3', // Fire crackle
            'https://assets.mixkit.co/active_storage/sfx/3006/3006-preview.mp3'    // Cosmic chime
        ];
        sounds.forEach(url => {
            const audio = new Audio();
            audio.src = url;
            audio.load();
            audioRefs.current[url] = audio;
        });
    }, []);

    const playSound = (url: string) => {
        try {
            // Try to use preloaded audio
            let audio = audioRefs.current[url];
            
            if (audio) {
                // If already playing or ended, reset and play
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0.8;
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("Preloaded playback failed, attempting fresh load:", error);
                        // Fallback: create a new instance
                        const freshAudio = new Audio(url);
                        freshAudio.volume = 0.8;
                        freshAudio.play().catch(e => console.error("Fresh playback failed:", e));
                    });
                }
            } else {
                // Fallback if not preloaded
                const freshAudio = new Audio(url);
                freshAudio.volume = 0.8;
                freshAudio.play().catch(e => console.error("Direct playback failed:", e));
            }
        } catch (err) {
            console.error("Error in playSound:", err);
        }
    };

    useEffect(() => {
        if (swipeCount < 3) {
            controls.start({ 
                y: 0, 
                x: -120, 
                rotate: -15,
                transition: { type: 'spring', stiffness: 1000, damping: 40, restDelta: 0.001 }
            });
        } else {
            // Cinematic moment: Rotate and center the ignited tip
            let targetY = 670;
            let targetX = 145;
            
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                const originX = rect.left + rect.width / 2;
                const originY = rect.top;
                
                // The tip is 244px below the origin (top center of the stick).
                // After 180deg rotation and 2.5x scale, it is 244 * 2.5 = 610px ABOVE the origin.
                targetX = (window.innerWidth / 2) - originX;
                targetY = (window.innerHeight / 2) - originY + 610;
            }

            controls.start({ 
                y: targetY, 
                x: targetX, 
                rotate: 180, 
                scale: 2.5,
                transition: { 
                    duration: 2.5,
                    ease: [0.22, 1, 0.36, 1],
                }
            });
            
            // Camera shake effect
            ritualControls.start({
                x: [0, -2, 2, -1, 1, 0],
                y: [0, 1, -1, 2, -2, 0],
                transition: { duration: 0.5, repeat: 2 }
            });

            // Add a slight "breathing" or "pulsing" effect after it centers
            setTimeout(() => {
                controls.start({
                    scale: [2.5, 2.6, 2.5],
                    transition: { 
                        repeat: Infinity, 
                        duration: 4, 
                        ease: "easeInOut" 
                    }
                });
            }, 2500);
        }
    }, [swipeCount, controls, ritualControls]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0D12] overflow-y-auto py-8">
            <AnimatePresence mode="wait">
                {!showFinalMessage ? (
                    <motion.div 
                        key="ritual"
                        animate={ritualControls}
                        className="flex flex-col items-center justify-center w-full min-h-full relative px-4"
                        exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                        transition={{ duration: 1 }}
                    >
                        {/* Messages */}
                        <div className="h-20 flex items-center justify-center mb-4">
                            <motion.p 
                                key={message}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[#D4AF37] text-xl tracking-[0.4em] font-bold text-center drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                            >
                                {message}
                            </motion.p>
                        </div>

                        {/* Interactive Area */}
                        <div className="relative flex items-center justify-center w-full max-w-md aspect-[3/4] max-h-[500px]" style={{ perspective: '1200px' }}>
                            
                            {/* Matchbox Container with Fade Out */}
                            <motion.div 
                                animate={{ 
                                    opacity: swipeCount >= 3 ? 0 : 1,
                                    scale: swipeCount >= 3 ? 0.9 : 1,
                                    filter: swipeCount >= 3 ? 'blur(10px)' : 'blur(0px)',
                                    rotateX: 20,
                                    rotateY: -20 // "向左轉"
                                }}
                                transition={{ 
                                    opacity: { duration: 1.5, ease: "easeInOut" },
                                    rotateX: { duration: 0.5, ease: "easeOut" },
                                    rotateY: { duration: 0.5, ease: "easeOut" }
                                }}
                                className="relative z-10"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Matchbox - Vertical (Vintage Relic Style) */}
                                <div className="relative w-48 h-72 rounded-md border-[6px] border-[#8b5a2b] flex flex-col items-center justify-between p-2 shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-visible"
                                     style={{ 
                                         background: 'linear-gradient(135deg, #4a0808 0%, #2a0404 100%)',
                                         boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.7), 0 0 0 2px #3a0808',
                                         transformStyle: 'preserve-3d'
                                     }}>
                                    
                                    {/* 2.5D Right Side */}
                                    <div className="absolute top-[4px] bottom-[4px] -right-[20px] w-[20px] bg-[#2a0404] border-r border-y border-[#8b5a2b]/40"
                                         style={{ 
                                             transform: 'rotateY(90deg)',
                                             transformOrigin: 'left',
                                             boxShadow: 'inset 5px 0 20px rgba(0,0,0,0.6)'
                                         }}></div>

                                    {/* 2.5D Top Side */}
                                    <div className="absolute -top-[20px] left-[4px] right-[4px] h-[20px] bg-[#3a0808] border-t border-x border-[#8b5a2b]/40"
                                         style={{ 
                                             transform: 'rotateX(90deg)',
                                             transformOrigin: 'bottom',
                                             boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.6)'
                                         }}></div>

                                    {/* Inner White Border (as seen in screenshot) */}
                                    <div className="absolute inset-1 border-[1px] border-white/20 rounded-sm pointer-events-none"></div>

                                    {/* Striker strip on the left edge (Aged grittier texture) */}
                                    <div className="absolute top-4 bottom-4 -left-[14px] w-7 rounded-l-sm border-y border-l border-[#5d4037] shadow-2xl" 
                                         style={{ 
                                             backgroundColor: '#1a0f0d',
                                             backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)',
                                             boxShadow: 'inset 2px 0 15px rgba(0,0,0,1), -5px 0 15px rgba(0,0,0,0.5)'
                                         }}>
                                        {/* Wear and tear on striker */}
                                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]"></div>
                                    </div>
                                    
                                    {/* Inner Border / Label Area */}
                                    <div className="w-full h-full border border-[#d4af37]/30 flex flex-col items-center justify-center px-2 relative bg-black/40 overflow-visible">
                                        {/* Vintage Paper/Texture Overlay */}
                                        <div className="absolute inset-0 opacity-20 pointer-events-none" 
                                             style={{ 
                                                 backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-map.png")',
                                                 mixBlendMode: 'multiply'
                                             }}></div>
                                        
                                        {/* Action Prompt */}
                                        <div className="z-10 flex flex-col items-center gap-2 opacity-90 h-full justify-center py-4">
                                            {swipeCount < 3 && (
                                                <motion.div
                                                    animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                                    className="flex flex-col items-center mb-2"
                                                >
                                                    <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent"></div>
                                                    <motion.svg 
                                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"
                                                    >
                                                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                                    </motion.svg>
                                                </motion.div>
                                            )}
                                            <span className="font-serif font-bold tracking-[0.7em] text-lg text-[#d4af37] uppercase" 
                                                  style={{ 
                                                      textShadow: '0 0 15px rgba(212,175,55,0.5)', 
                                                      writingMode: 'vertical-rl',
                                                      filter: 'contrast(1.3) sepia(0.2)',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      whiteSpace: 'nowrap',
                                                      flex: 1
                                                  }}>
                                                {swipeCount === 0 ? "往下摩擦生火" : (swipeCount < 3 ? "再摩擦一次" : "")}
                                            </span>
                                        </div>
                                        
                                        {/* Ornate Corner Accents */}
                                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]/40 rounded-tl-sm"></div>
                                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]/40 rounded-tr-sm"></div>
                                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]/40 rounded-bl-sm"></div>
                                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]/40 rounded-br-sm"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Matchstick (Aged Wood Style) */}
                            <div 
                                ref={wrapperRef}
                                className="absolute left-1/2 -translate-x-1/2 -top-[60px] h-80 flex justify-center z-30 pointer-events-none"
                            >
                                <motion.div
                                    drag={swipeCount < 3 ? "y" : false}
                                    dragConstraints={{ top: 0, bottom: 220 }}
                                    dragElastic={0.05}
                                    onDrag={(e, info) => {
                                        // Auto-trigger return if swiped to the bottom
                                        if (swipeCount < 3 && info.point.y > window.innerHeight * 0.8) {
                                            // We can't easily force end drag, but we can trigger the logic
                                        }
                                    }}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={(e, info) => {
                                        setIsDragging(false);
                                        if (swipeCount >= 3) return;

                                        // Check if the swipe was downwards and long enough
                                        if (info.offset.y > 100) {
                                            const newCount = swipeCount + 1;
                                            setSwipeCount(newCount);

                                            if (newCount === 1) {
                                                setMessage("火種被喚醒。");
                                                playSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
                                            } else if (newCount === 2) {
                                                setMessage("火焰正在形成。");
                                                playSound('https://assets.mixkit.co/active_storage/sfx/1339/1339-preview.mp3');
                                            } else if (newCount === 3) {
                                                setMessage("");
                                                playSound('https://assets.mixkit.co/active_storage/sfx/1337/1337-preview.mp3');
                                                setTimeout(() => {
                                                    setShowFinalMessage(true);
                                                    playSound('https://assets.mixkit.co/active_storage/sfx/3006/3006-preview.mp3');
                                                    setTimeout(() => {
                                                        onComplete();
                                                    }, 7000); 
                                                }, 4500); 
                                            }
                                        }
                                    }}
                                    whileDrag={{ scale: 1.03, rotate: -5 }}
                                    className="cursor-grab active:cursor-grabbing touch-none relative pointer-events-auto"
                                    style={{ transformOrigin: 'top center' }}
                                    animate={controls}
                                >
                                    {/* Stick Container (Hand-carved Wood Texture) */}
                                    <div className="relative w-4 h-56 rounded-sm shadow-[10px_20px_40px_rgba(0,0,0,0.7)] flex flex-col items-center border-r border-black/40"
                                         style={{ 
                                             background: 'linear-gradient(to right, #c19a6b, #7b4a2b)',
                                             backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
                                             boxShadow: '5px 15px 30px rgba(0,0,0,0.5), inset -1px 0 5px rgba(0,0,0,0.3)'
                                         }}>
                                        
                                        {/* Match Head (Large Phosphorus Bulb) */}
                                        <div className={`absolute -bottom-5 w-8 h-12 rounded-[40%_40%_50%_50%] transition-colors duration-1000 shadow-2xl border border-black/30 ${swipeCount >= 3 ? 'bg-[#111]' : 'bg-[#3d2314]'}`}
                                             style={{
                                                 boxShadow: swipeCount < 3 
                                                    ? 'inset -4px -4px 15px rgba(0,0,0,0.7), 0 10px 25px rgba(0,0,0,0.6)' 
                                                    : '0 0 50px rgba(0,0,0,1), 0 0 100px rgba(212,175,55,0.2)'
                                             }}>
                                            
                                            {/* Sparks / Flame */}
                                            <AnimatePresence>
                                                {swipeCount === 1 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0, rotate: 20 }}
                                                        animate={{ opacity: 1, scale: 1.2, rotate: 20 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute -bottom-6 -left-2 text-[#FFD700]"
                                                    >
                                                        <Sparkles size={20} />
                                                    </motion.div>
                                                )}
                                                {swipeCount === 2 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0, rotate: 20 }}
                                                        animate={{ opacity: 1, scale: 1.5, rotate: 20 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute bottom-0 -left-4"
                                                    >
                                                        <RealisticFlame size={32} intensity={0.8} />
                                                    </motion.div>
                                                )}
                                                {swipeCount >= 3 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                                                        animate={{ 
                                                            opacity: 1, 
                                                            scale: 1,
                                                            rotate: 180 
                                                        }}
                                                        transition={{ 
                                                            opacity: { duration: 0.8 }
                                                        }}
                                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                                                    >
                                                        <RealisticFlame size={120} intensity={2} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                        
                        <div className="h-16 flex items-center justify-center mt-8">
                            <p className="text-[#D4AF37]/40 text-sm tracking-[0.4em] uppercase font-medium">
                                {swipeCount === 0 ? "向下滑動火柴" : (swipeCount < 3 ? "再次向下滑動火柴" : "")}
                            </p>
                        </div>
                    </motion.div>

                ) : (
                    <motion.div
                        key="final"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center overflow-hidden z-50 pointer-events-none"
                    >
                        {/* Expanding Light Effect */}
                        <motion.div 
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 150, opacity: 0 }}
                            transition={{ duration: 6, ease: "easeOut" }}
                            className="absolute w-32 h-32 bg-[#FFD700] rounded-full blur-[50px]"
                        />
                        <motion.div 
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 100, opacity: 0 }}
                            transition={{ duration: 5, ease: "easeOut", delay: 0.2 }}
                            className="absolute w-32 h-32 bg-white rounded-full blur-[30px]"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="relative z-10 text-center px-4 max-w-lg"
                        >
                            <p className="text-[#D4AF37] text-3xl tracking-[0.4em] font-bold drop-shadow-[0_0_30px_#FFD700] leading-relaxed mb-4">
                                你的火種已加入<br/>這座城市。
                            </p>
                            <p className="text-[#D4AF37]/60 text-sm tracking-widest italic">
                                溫暖正在蔓延...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

