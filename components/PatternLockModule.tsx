import React, { useState, useRef } from 'react';
import { motion } from "motion/react";
import { Lock, Unlock, RefreshCcw } from 'lucide-react';

interface PatternLockModuleProps {
    module: any;
    onResolve: () => void;
}

export const PatternLockModule: React.FC<PatternLockModuleProps> = ({ module, onResolve }) => {
    const [path, setPath] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const containerRef = useRef<HTMLDivElement>(null);
    const dots = Array.from({ length: 9 }, (_, i) => i);
    
    const targetPattern = module.data.pattern || [0, 1, 2, 5, 8]; 

    const getDotCenter = (index: number) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const dotElement = containerRef.current.querySelector(`[data-dot-index="${index}"]`);
        if (!dotElement) return { x: 0, y: 0 };
        const rect = dotElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
    };

    const handleStart = (index: number) => {
        if (status === 'SUCCESS') return;
        setIsDrawing(true);
        setPath([index]);
        setStatus('IDLE');
    };

    const handleEnter = (index: number) => {
        if (!isDrawing || path.includes(index)) return;
        setPath(prev => [...prev, index]);
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        
        if (JSON.stringify(path) === JSON.stringify(targetPattern)) {
            setStatus('SUCCESS');
            setTimeout(onResolve, 1000);
        } else {
            setStatus('ERROR');
            setTimeout(() => {
                setPath([]);
                setStatus('IDLE');
            }, 1000);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDrawing) return;
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const dotIndex = element?.getAttribute('data-dot-index');
        if (dotIndex !== null && dotIndex !== undefined) {
            handleEnter(parseInt(dotIndex));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a1a] rounded-3xl border-4 border-[#D4AF37] shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(212,175,55,0.2)] relative overflow-hidden">
            {/* Decorative Gears Background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-[#D4AF37]/10 rounded-full animate-spin-slow pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 border-8 border-[#D4AF37]/5 rounded-full animate-spin-slow-reverse pointer-events-none" />
            
            <div className="mb-8 text-center relative z-10">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-500 border-4 shadow-lg ${status === 'SUCCESS' ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : status === 'ERROR' ? 'bg-red-500/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]'}`}>
                    {status === 'SUCCESS' ? <Unlock size={32} className="text-emerald-400" /> : <Lock size={32} className={status === 'ERROR' ? 'text-red-400' : 'text-[#D4AF37]'} />}
                </div>
                <h3 className="text-3xl font-serif text-[#D4AF37] mb-2 tracking-[0.2em] uppercase drop-shadow-md">{module.data.title || '圖形解鎖'}</h3>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-4" />
                <p className="text-[#D4AF37]/70 text-sm font-serif italic tracking-wider">{module.data.hint || '請繪製正確的連線路徑'}</p>
            </div>

            <div 
                ref={containerRef}
                className="relative grid grid-cols-3 gap-10 p-12 bg-[#0a0a0a] rounded-full border-8 border-[#2a2a2a] touch-none select-none shadow-[inset_0_0_30px_rgba(0,0,0,1),0_0_20px_rgba(212,175,55,0.1)] z-10"
                onMouseLeave={handleEnd}
                onMouseUp={handleEnd}
                onTouchEnd={handleEnd}
                onTouchMove={handleTouchMove}
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {path.length > 1 && path.map((dotIndex, i) => {
                        if (i === 0) return null;
                        const start = getDotCenter(path[i - 1]);
                        const end = getDotCenter(dotIndex);
                        return (
                            <motion.line 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                key={i}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke={status === 'SUCCESS' ? '#10b981' : status === 'ERROR' ? '#ef4444' : '#D4AF37'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                className="transition-colors duration-300 drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                            />
                        );
                    })}
                </svg>

                {dots.map(i => (
                    <div
                        key={i}
                        data-dot-index={i}
                        onMouseDown={() => handleStart(i)}
                        onMouseEnter={() => handleEnter(i)}
                        onTouchStart={() => handleStart(i)}
                        className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 cursor-pointer z-20
                            ${path.includes(i) 
                                ? (status === 'SUCCESS' ? 'border-emerald-500 bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.6)]' : status === 'ERROR' ? 'border-red-500 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border-[#D4AF37] bg-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.6)]') 
                                : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/60 bg-[#1a1a1a]'}`}
                    >
                        <div className={`w-5 h-5 rounded-full transition-all duration-300 shadow-inner
                            ${path.includes(i) 
                                ? (status === 'SUCCESS' ? 'bg-emerald-400 scale-125' : status === 'ERROR' ? 'bg-red-400 scale-125' : 'bg-[#FFD700] scale-125') 
                                : 'bg-[#D4AF37]/20'}`} 
                        />
                        {path.includes(i) && (
                            <motion.div 
                                layoutId="active-dot"
                                className={`absolute inset-0 rounded-full border-4 animate-ping opacity-30
                                    ${status === 'SUCCESS' ? 'border-emerald-500' : status === 'ERROR' ? 'border-red-500' : 'border-[#D4AF37]'}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-10 h-12 flex items-center justify-center">
                {status === 'ERROR' && (
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 font-serif italic flex items-center gap-2 text-lg"
                    >
                        <RefreshCcw size={20} className="animate-spin-slow" /> 路徑不正確，請重試
                    </motion.p>
                )}
                {status === 'SUCCESS' && (
                    <motion.p 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-emerald-400 font-serif italic tracking-[0.3em] text-xl font-bold uppercase"
                    >
                        解鎖成功
                    </motion.p>
                )}
                {status === 'IDLE' && isDrawing && (
                    <p className="text-[#D4AF37]/40 font-serif italic animate-pulse">繪製中...</p>
                )}
            </div>
        </div>
    );
};
