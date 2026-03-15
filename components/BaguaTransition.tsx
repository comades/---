
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BaguaTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  nextLocationIcon?: string;
}

export const BaguaTransition: React.FC<BaguaTransitionProps> = ({ isActive, onComplete, nextLocationIcon }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isActive) {
      setStep(1);
      const timers = [
        setTimeout(() => setStep(2), 1000), // Spark starts moving
        setTimeout(() => setStep(3), 3000), // Trigram formed
        setTimeout(() => setStep(4), 4500), // Trigram rotates
        setTimeout(() => setStep(5), 5500), // Bronze patterns appear
        setTimeout(() => setStep(6), 7000), // Expansion
        setTimeout(() => {
          onComplete();
          setStep(0);
        }, 9000)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  // Trigram lines (Qian - ☰)
  const lineVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 1 + i * 0.6, duration: 0.8 },
        opacity: { delay: 1 + i * 0.6, duration: 0.2 }
      }
    })
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0f00_0%,_#000_100%)] opacity-90" />
      
      {/* Step 5: Bronze Patterns (Fading in late) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: step >= 5 ? 0.4 : 0, scale: step >= 5 ? 1 : 0.9 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[500px] h-[500px] border-[20px] border-[#5d4037] rounded-full opacity-20" />
        <div className="absolute w-[460px] h-[460px] border-2 border-[#8d6e63] rounded-full opacity-10" />
        {/* Decorative bronze "engravings" */}
        <svg className="absolute w-full h-full opacity-30">
          <circle cx="50%" cy="50%" r="220" fill="none" stroke="#5d4037" strokeWidth="2" strokeDasharray="5 15" />
        </svg>
      </motion.div>

      {/* The Drawing Area */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        
        {/* Step 2 & 3: Drawing the Trigram */}
        <svg width="200" height="120" viewBox="0 0 200 120" className="z-20">
          {/* Top Line */}
          <motion.line
            x1="20" y1="20" x2="180" y2="20"
            stroke="#FFD700" strokeWidth="8" strokeLinecap="round"
            variants={lineVariants}
            initial="hidden"
            animate={step >= 2 ? "visible" : "hidden"}
            custom={0}
            style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }}
          />
          {/* Middle Line */}
          <motion.line
            x1="20" y1="60" x2="180" y2="60"
            stroke="#FFD700" strokeWidth="8" strokeLinecap="round"
            variants={lineVariants}
            initial="hidden"
            animate={step >= 2 ? "visible" : "hidden"}
            custom={1}
            style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }}
          />
          {/* Bottom Line */}
          <motion.line
            x1="20" y1="100" x2="180" y2="100"
            stroke="#FFD700" strokeWidth="8" strokeLinecap="round"
            variants={lineVariants}
            initial="hidden"
            animate={step >= 2 ? "visible" : "hidden"}
            custom={2}
            style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }}
          />
        </svg>

        {/* Step 1 & 2: The Spark */}
        <AnimatePresence>
          {step >= 1 && step < 4 && (
            <motion.div
              key="spark"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1], 
                opacity: 1,
                // Moving to follow the lines being drawn
                x: step === 1 ? 0 : [0, -80, 80, -80, 80, -80, 80],
                y: step === 1 ? 0 : [-40, -40, -40, 0, 0, 40, 40],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                duration: step === 1 ? 1 : 2.5,
                times: step === 1 ? [0, 0.5, 1] : [0, 0.1, 0.3, 0.4, 0.6, 0.7, 1],
                ease: "easeInOut"
              }}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full z-30 shadow-[0_0_20px_#FFD700,0_0_40px_#FFA500]"
            >
              <motion.div 
                className="absolute inset-0 bg-white rounded-full blur-sm"
                animate={{ scale: [1, 2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Rotation Container */}
        <motion.div
          animate={{ rotate: step >= 4 ? 360 : 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* This container will hold the trigram once it's drawn, but we keep it simple by rotating the whole area if needed */}
        </motion.div>

        {/* Step 6: Expansion into Icon */}
        <AnimatePresence>
          {step >= 6 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 1 }}
              className="absolute z-50 flex items-center justify-center"
            >
              <div className="w-24 h-24 rounded-full border-4 border-yellow-500 overflow-hidden bg-black shadow-[0_0_50px_rgba(255,215,0,0.6)]">
                <img 
                  src={nextLocationIcon || "https://picsum.photos/seed/temple/200/200"} 
                  className="w-full h-full object-cover"
                  alt="Next Location"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calligraphic Glowing Lines (Background Accents) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg className="w-full h-full">
          <motion.path
            d="M -100 200 Q 300 50 700 300 T 1200 100"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M 1200 500 Q 800 700 400 400 S -100 600"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
        </svg>
      </div>

      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
        className="absolute bottom-24 text-yellow-600/60 font-serif tracking-[0.8em] text-sm uppercase"
      >
        {step < 6 ? "伏羲畫卦 · 萬象更新" : "天機已現 · 啟程新境"}
      </motion.div>
    </div>
  );
};
