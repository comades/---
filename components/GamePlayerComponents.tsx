
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from "motion/react";
import { GameModule } from '../types';
import { Button } from './Button';
import { ArrowLeft, RefreshCw, Home, Trophy, Scan, X, CheckCircle, Camera, Loader2, Image as ImageIcon, Video, Mic, MessageSquare, AlertCircle, Eye, MapPin, Lock, HelpCircle, Send, Play, Pause, ChevronRight, Unlock, XCircle, Shuffle, ChevronUp, ChevronDown, Puzzle, Upload, RefreshCcw, Check, Lightbulb, Clock, Triangle, Volume2, Edit, Music, AudioLines, ZoomIn, ZoomOut, Smartphone } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';
import { verifyARImage } from '../services/geminiService';
import { PasswordLockModule } from './PasswordLockModule';
import { RhythmModule } from './RhythmModule';
import { PatternLockModule } from './PatternLockModule';
import { SerialNumberModule } from './SerialNumberModule';

// --- Utils ---

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export const FeedbackModal = ({ isCorrect, data, onClose, stage = 1 }: { isCorrect: boolean, data: any, onClose: () => void, stage?: number }) => {
    const title = isCorrect ? (data.correctFeedbackTitle || "回答正確！") : (data.incorrectFeedbackTitle || "答案錯誤");
    const text = isCorrect ? (data.correctFeedbackContent || "恭喜你答對了！") : (data.incorrectFeedbackContent || "答案不正確，請再試一次。");
    const image = isCorrect ? data.correctFeedbackImage : data.incorrectFeedbackImage;

    if (isCorrect) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 z-[9999] bg-[#0F1115] flex flex-col items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent opacity-50"></div>
                </div>

                {/* City Fire Fragment Animation Layer */}
                <div className="relative w-full h-64 flex items-center justify-center mb-8">
                    {/* Stage 1: Single Spark */}
                    {stage >= 1 && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute"
                        >
                            <div className="w-4 h-4 bg-[#D4AF37] rounded-full blur-[2px] shadow-[0_0_20px_#D4AF37]"></div>
                            <div className="absolute inset-0 w-4 h-4 bg-white rounded-full blur-[4px] opacity-50"></div>
                        </motion.div>
                    )}

                    {/* Stage 2: Two Sparks Rotating */}
                    {stage >= 2 && (
                        <div className="absolute w-24 h-24">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#D4AF37] rounded-full blur-[1px] shadow-[0_0_15px_#D4AF37]"></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#D4AF37] rounded-full blur-[1px] shadow-[0_0_15px_#D4AF37]"></div>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.2 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#D4AF37] fill-current">
                                    <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
                                </svg>
                            </motion.div>
                        </div>
                    )}

                    {/* Stage 3: Triangular Energy Pattern */}
                    {stage >= 3 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute w-32 h-32"
                        >
                            {[0, 120, 240].map((deg) => (
                                <div 
                                    key={deg}
                                    className="absolute w-2 h-2 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"
                                    style={{ 
                                        top: '50%', 
                                        left: '50%', 
                                        transform: `rotate(${deg}deg) translateY(-40px)` 
                                    }}
                                ></div>
                            ))}
                            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                                <motion.path 
                                    d="M50 10 L90 80 L10 80 Z" 
                                    fill="none" 
                                    stroke="#D4AF37" 
                                    strokeWidth="0.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2 }}
                                />
                            </svg>
                        </motion.div>
                    )}

                    {/* Stage 4: Bronze Patterns Glow */}
                    {stage >= 4 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.4, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-64 h-64 border-2 border-[#D4AF37]/20 rounded-full relative">
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                                    <div 
                                        key={deg}
                                        className="absolute w-8 h-[1px] bg-[#D4AF37]/40"
                                        style={{ 
                                            top: '50%', 
                                            left: '50%', 
                                            transform: `rotate(${deg}deg) translateX(110px)` 
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Stage 5: Circular Ring of Fire */}
                    {stage >= 5 && (
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute w-48 h-48 rounded-full border border-[#D4AF37]/40 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                        >
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-[#D4AF37]/60 rounded-full blur-[1px]"
                            ></motion.div>
                        </motion.div>
                    )}

                    {/* Stage 6: Nine-Palace Grid */}
                    {stage >= 6 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.2 }}
                            className="absolute w-40 h-40 grid grid-cols-3 grid-rows-3 gap-0 border border-[#D4AF37]/30"
                        >
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="border-[0.5px] border-[#D4AF37]/20 flex items-center justify-center">
                                    <div className="w-1 h-1 bg-[#D4AF37]/20 rounded-full"></div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Stage 7: Bronze Mechanism Rotation */}
                    {stage >= 7 && (
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute w-64 h-64 opacity-10"
                        >
                             <div className="absolute inset-0 border-[8px] border-double border-[#D4AF37] rounded-full"></div>
                             <div className="absolute inset-4 border border-[#D4AF37]/40 rounded-full"></div>
                             {[0, 90, 180, 270].map(deg => (
                                 <div key={deg} className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-[#D4AF37]/20" style={{ transform: `rotate(${deg}deg)` }}></div>
                             ))}
                        </motion.div>
                    )}

                    {/* Final Stage: Convergence */}
                    {stage >= 8 && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 2, times: [0, 0.7, 1] }}
                            className="absolute w-12 h-12 bg-[#D4AF37] rounded-full blur-[8px] shadow-[0_0_50px_#D4AF37]"
                        >
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-white rounded-full blur-[12px]"
                            ></motion.div>
                        </motion.div>
                    )}
                </div>

                {/* Main Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg p-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-light tracking-[0.5em] text-[#E8E0CF] mb-2" style={{ fontFamily: '"Noto Serif TC", serif', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
                            薪火相傳
                        </h2>
                        <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-8 opacity-60">City Fire Fragment Collected</p>
                    </motion.div>
                    
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent my-8"></div>

                    <div className="flex flex-col items-center">
                         <h3 className="text-[#D4AF37] text-lg mb-4 tracking-widest font-medium">{title}</h3>
                         {image && (
                            <div className="mb-6 w-48 p-[1px] bg-gradient-to-b from-[#D4AF37]/30 to-transparent rounded-sm overflow-hidden">
                                <img src={image || undefined} className="w-full h-auto object-cover opacity-90" alt="Feedback" referrerPolicy="no-referrer" />
                            </div>
                        )}
                         <p className="text-[#8A8D95] text-sm leading-loose tracking-wide mb-8 max-w-xs">{text}</p>
                         
                         <button 
                            onClick={onClose}
                            className="px-12 py-3 border border-[#D4AF37]/30 text-[#D4AF37] text-xs tracking-[0.3em] hover:bg-[#D4AF37]/10 transition-all uppercase bg-black/20 backdrop-blur-sm"
                        >
                            繼續前行
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]/95 backdrop-blur-sm animate-in fade-in duration-1000 p-6">
            <div className="relative w-full max-w-md transition-all duration-1000 opacity-90">
                {/* The bronze frame */}
                <div className="relative p-[1px] bg-gradient-to-b from-[#4A3D20]/20 via-[#1A1610]/30 to-[#4A3D20]/10 shadow-2xl transition-all duration-1000" style={{ clipPath: 'polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)' }}>
                    <div className="relative bg-[#0A0A0A] p-10 text-center flex flex-col items-center justify-center min-h-[300px] max-h-[80vh] overflow-y-auto custom-scrollbar" style={{ clipPath: 'polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)' }}>
                        
                        {/* Background texture */}
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A] to-[#050505] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center w-full animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
                            <h3 className="text-2xl font-light mb-6 tracking-[0.3em] uppercase text-[#5A5D65]" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                                {title}
                            </h3>
                            
                            {image && (
                                <div className="mb-8 w-full max-w-[240px] p-[1px] bg-gradient-to-b from-[#8A8D95]/10 to-transparent rounded-sm overflow-hidden">
                                    <img src={image || undefined} className="w-full h-auto object-cover opacity-90" alt="Feedback" />
                                </div>
                            )}
                            
                            <p className="text-sm mb-10 whitespace-pre-wrap leading-loose tracking-wider font-light text-[#8A8D95]/50" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                                {text}
                            </p>
                            
                            <button 
                                onClick={onClose} 
                                className="px-10 py-3 text-xs tracking-[0.4em] uppercase transition-all duration-500 border-b text-[#5A5D65] border-[#5A5D65]/30 hover:border-[#5A5D65] hover:bg-[#5A5D65]/5"
                            >
                                重新嘗試
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animation Effects - Moved outside to prevent clipping */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {/* Small light flickers and fades */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent blur-xl animate-[flickerDie_3s_ease-out_forwards]"></div>
                    {/* Subtle darkening */}
                    <div className="absolute inset-0 bg-black/60 animate-[darken_2s_ease-out_forwards]"></div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes flickerDie {
                    0% { opacity: 0; }
                    20% { opacity: 0.5; }
                    40% { opacity: 0.2; }
                    60% { opacity: 0.4; }
                    100% { opacity: 0; }
                }
                @keyframes darken {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}} />
        </div>,
        document.body
    );
};

export const HintModal = ({ hints, onClose, baseTime, onHintUsed }: { hints: any[], onClose: () => void, baseTime: number, onHintUsed?: () => void }) => {
    const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleHintClick = (index: number, delaySeconds: number | string) => {
        const delay = typeof delaySeconds === 'string' ? parseInt(delaySeconds) : delaySeconds;
        
        const elapsedSeconds = (currentTime - baseTime) / 1000;
        const remaining = delay - elapsedSeconds;

        if (remaining > 0) {
            alert(`此提示尚未解鎖！\n還剩 ${Math.ceil(remaining)} 秒。`);
        } else {
             if (!revealedIndices.includes(index)) {
                setRevealedIndices([...revealedIndices, index]);
                if (onHintUsed) onHintUsed();
             }
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative p-[1px] bg-gradient-to-b from-[#8A7339]/50 via-[#3A3220]/30 to-[#8A7339]/40 shadow-2xl w-full max-w-sm" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                <div className="relative bg-[#0F1115] p-8 flex flex-col max-h-[80vh]" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                    {/* Textured stone overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2A2D35] to-[#0F1115] pointer-events-none"></div>
                    
                    <button onClick={onClose} className="absolute top-6 right-6 text-[#D4AF37]/50 hover:text-[#D4AF37] p-2 bg-white/5 rounded-full transition-all z-20">
                        <X size={20} />
                    </button>
                    
                    <div className="relative z-10 flex flex-col min-h-0 flex-1">
                        <div className="flex items-center gap-3 mb-6 text-[#D4AF37] font-bold text-xl px-2 tracking-[0.2em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                            <Lightbulb size={24} className="fill-[#D4AF37]/20" />
                            <h3>機密提示</h3>
                        </div>
                        
                        <div className="space-y-4 overflow-y-auto px-2 pb-4 scrollbar-hide flex-1">
                            {hints.map((hint, idx) => {
                                const isRevealed = revealedIndices.includes(idx);
                                const delay = typeof hint.delay === 'string' ? parseInt(hint.delay) : (hint.delay || 0);
                                const elapsedSeconds = (currentTime - baseTime) / 1000;
                                const remaining = Math.max(0, Math.ceil(delay - elapsedSeconds));
                                
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => handleHintClick(idx, delay)}
                                        className={`p-5 relative transition-all cursor-pointer group overflow-hidden ${
                                            isRevealed 
                                                ? 'bg-[#1A1C23] border border-[#D4AF37]/30 text-slate-200' 
                                                : 'bg-[#0F1115] border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 text-slate-500 active:scale-[0.98]'
                                        }`}
                                        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                                    >
                                        <div className="font-bold mb-2 text-[10px] uppercase tracking-[0.2em] flex items-center justify-between relative z-10">
                                            <div className={`flex items-center ${isRevealed ? 'text-[#D4AF37]' : 'text-slate-600'}`}>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mr-3 border ${isRevealed ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                                                    {idx + 1}
                                                </span>
                                                {isRevealed ? "已解密" : (remaining > 0 ? "鎖定中" : "點擊解密")}
                                            </div>
                                            {!isRevealed && (
                                                <div className="flex items-center text-[10px] text-[#D4AF37]/60 bg-white/5 px-3 py-1 rounded-full border border-[#D4AF37]/10">
                                                    <Clock size={12} className="mr-2" /> {remaining > 0 ? `${remaining}s` : "可解鎖"}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isRevealed ? (
                                            <div className="text-sm leading-relaxed mt-3 animate-in fade-in duration-500 font-medium tracking-wide relative z-10">
                                                {hint.text}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4 relative z-10">
                                                <Lock size={24} className={`opacity-20 text-[#D4AF37] ${remaining > 0 ? 'animate-pulse' : ''}`} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 pt-2">
                            <Button onClick={onClose} variant="neo-chinese" className="w-full py-4 text-sm">
                                關閉卷軸
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Specific Answer Components ---

export const TextAnswer = ({ module, onResolve }: any) => {
    const [val, setVal] = useState('');
    const handleCheck = () => {
        const correct = module.data.answer || '';
        if (val.trim().toLowerCase() === correct.trim().toLowerCase()) {
            onResolve(true);
        } else {
            onResolve(false);
        }
    };
    return (
        <div className="space-y-4">
            <input 
                className="bg-[#0F1115] text-[#D4AF37] p-4 w-full my-2 text-sm border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none transition-all placeholder:text-[#D4AF37]/30 font-medium tracking-wide" 
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                placeholder="在此輸入答案..." 
                value={val} 
                onChange={e=>setVal(e.target.value)}
            />
            <Button onClick={handleCheck} variant="neo-chinese" className="w-full py-4">確認答案</Button>
        </div>
    );
};

export const SingleChoiceAnswer = ({ module, onResolve }: any) => {
    const [selected, setSelected] = useState<number | null>(null);
    const handleCheck = () => {
        if (selected === null) return alert("請選擇一個選項");
        const options = module.data.options || [];
        const isCorrect = options[selected]?.isCorrect;
        onResolve(isCorrect);
    };
    return (
        <div className="space-y-3 mb-2">
            {(module.data.options || []).map((opt: any, idx: number) => (
                <button 
                    key={idx} 
                    onClick={() => setSelected(idx)} 
                    className={`w-full p-4 text-left text-sm transition-all border relative group overflow-hidden ${selected === idx ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F1115] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-[#1A1C23] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 text-slate-300'}`}
                    style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                    <div className="flex items-center relative z-10">
                        <div className={`w-4 h-4 rounded-full border mr-4 flex items-center justify-center transition-colors ${selected === idx ? 'border-[#0F1115]' : 'border-[#D4AF37]/40'}`}>
                            {selected === idx && <div className="w-2 h-2 rounded-full bg-[#0F1115]"></div>}
                        </div>
                        <span className="tracking-wide">{opt.text}</span>
                    </div>
                </button>
            ))}
            <Button onClick={handleCheck} variant="neo-chinese" className="w-full mt-6 py-4" disabled={selected === null}>確認抉擇</Button>
        </div>
    );
};

export const MultiChoiceAnswer = ({ module, onResolve }: any) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    
    const toggle = (idx: number) => {
        if (selectedIndices.includes(idx)) {
            setSelectedIndices((selectedIndices || []).filter(i => i !== idx));
        } else {
            setSelectedIndices([...selectedIndices, idx]);
        }
    };

    const handleCheck = () => {
        if (selectedIndices.length === 0) return alert("請至少選擇一個選項");
        const options = module.data.options || [];
        const correctIndices = (options || []).map((o: any, i: number) => o.isCorrect ? i : -1).filter((i: number) => i !== -1);
        
        const isAllSelectedCorrect = selectedIndices.every(i => correctIndices.includes(i));
        const isAllCorrectSelected = correctIndices.every((i: number) => selectedIndices.includes(i));
        
        onResolve(isAllSelectedCorrect && isAllCorrectSelected);
    };

    return (
        <div className="space-y-3 mb-2">
            <p className="text-[10px] text-[#D4AF37]/50 mb-4 font-bold text-center tracking-[0.2em] uppercase">※ 請選出所有正確線索</p>
            {(module.data.options || []).map((opt: any, idx: number) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                    <button 
                        key={idx} 
                        onClick={() => toggle(idx)} 
                        className={`w-full p-4 text-left text-sm transition-all border relative group overflow-hidden ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F1115] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-[#1A1C23] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 text-slate-300'}`}
                        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                    >
                        <div className="flex items-center relative z-10">
                             <div className={`w-4 h-4 rounded border mr-4 flex items-center justify-center transition-colors ${isSelected ? 'border-[#0F1115] bg-[#0F1115]/10' : 'border-[#D4AF37]/40'}`}>
                                {isSelected && <Check size={12} className="text-[#0F1115]"/>}
                            </div>
                            <span className="tracking-wide">{opt.text}</span>
                        </div>
                    </button>
                );
            })}
            <Button onClick={handleCheck} variant="neo-chinese" className="w-full mt-6 py-4" disabled={selectedIndices.length === 0}>提交線索</Button>
        </div>
    );
};

export const NumberLockAnswer = ({ module, onResolve }: any) => {
    const correct = module.data.answer || "0000";
    const length = Math.min(parseInt(module.data.length) || 4, 5);
    const [digits, setDigits] = useState<number[]>(new Array(length).fill(0));

    const changeDigit = (idx: number, delta: number) => {
        const newDigits = [...digits];
        newDigits[idx] = (newDigits[idx] + delta + 10) % 10;
        setDigits(newDigits);
    };

    const handleUnlock = () => {
        const input = digits.join("");
        onResolve(input === correct);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex gap-3 mb-8 p-6 bg-[#0F1115] border border-[#D4AF37]/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                {digits.map((d, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <button onClick={() => changeDigit(i, 1)} className="p-2 text-[#D4AF37]/40 hover:text-[#D4AF37] hover:bg-white/5 rounded-full mb-2 transition-all"><ChevronUp size={20}/></button>
                        <div className="w-12 h-16 bg-gradient-to-b from-[#2A2D35] to-[#0F1115] text-[#D4AF37] font-mono text-3xl font-bold flex items-center justify-center border border-[#D4AF37]/40 shadow-xl relative overflow-hidden" style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                            <div className="absolute inset-x-0 h-[1px] bg-[#D4AF37]/20 top-1/2 -translate-y-1/2"></div>
                            {d}
                        </div>
                        <button onClick={() => changeDigit(i, -1)} className="p-2 text-[#D4AF37]/40 hover:text-[#D4AF37] hover:bg-white/5 rounded-full mt-2 transition-all"><ChevronDown size={20}/></button>
                    </div>
                ))}
            </div>
            <Button onClick={handleUnlock} variant="neo-chinese" className="w-full py-4 text-lg">
                <Unlock className="mr-3" /> 破解機關
            </Button>
        </div>
    );
};

export const ImageLockAnswer = ({ module, onResolve }: any) => {
    const correctSequence = (module.data.answer || "").split(",").map((s: string) => parseInt(s.trim()));
    const images = module.data.images || [];
    const length = correctSequence.length || 3;
    const isFlipMode = module.data.isFlipMode;
    
    const [slots, setSlots] = useState<number[]>(new Array(length).fill(0));
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const cycleSlot = (slotIdx: number) => {
        if (images.length === 0) return;

        if (isFlipMode) {
            if (slotIdx === 0) {
                // Flip logic: only flip if not already flipped
                if (!flippedIndices.includes(slotIdx)) {
                    setFlippedIndices([...flippedIndices, slotIdx]);
                }
                return;
            } else if (slotIdx === 1) {
                // Zoom logic - only if first card is flipped
                if (flippedIndices.includes(0)) {
                    setZoomImage(images[slots[slotIdx]]);
                }
                return;
            }
        }

        const newSlots = [...slots];
        newSlots[slotIdx] = (newSlots[slotIdx] + 1) % images.length;
        setSlots(newSlots);
    };

    const handleUnlock = () => {
        const currentOneBased = slots.map(s => s + 1);
        const isCorrect = currentOneBased.every((val, idx) => val === correctSequence[idx]);
        onResolve(isCorrect);
    };

    if (images.length === 0) return <div className="text-red-400 text-xs font-bold tracking-widest">錯誤：未設定圖騰線索</div>;

    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-[#0F1115] border border-[#D4AF37]/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                {slots.map((currentImgIdx, i) => {
                    const isFlipped = flippedIndices.includes(i);
                    const showFlipText = isFlipMode && i === 0 && !isFlipped;
                    
                    return (
                        <div key={i} className="flex flex-col items-center relative">
                            {showFlipText && (
                                <div className="absolute -top-6 text-[10px] text-[#D4AF37] animate-bounce font-bold tracking-widest whitespace-nowrap">
                                    點擊翻轉
                                </div>
                            )}
                            <div 
                                className={`w-20 h-28 bg-[#1A1C23] border border-[#D4AF37]/40 shadow-2xl relative cursor-pointer active:scale-95 transition-all duration-700 group perspective-1000`}
                                style={{ 
                                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                                    transformStyle: 'preserve-3d',
                                    transform: isFlipMode && i === 0 && isFlipped ? 'rotateY(180deg)' : 'none'
                                }}
                                onClick={() => cycleSlot(i)}
                            >
                                 <div className="absolute inset-0 flex flex-col transition-all duration-500 group-hover:brightness-125 backface-hidden">
                                     {images[currentImgIdx] && <img src={images[currentImgIdx] || undefined} className="w-full h-full object-cover" />}
                                     {isFlipMode && i === 1 && flippedIndices.includes(0) && (
                                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Scan size={24} className="text-white drop-shadow-md" />
                                         </div>
                                     )}
                                 </div>
                                 
                                 {/* Back face for flip card */}
                                 {isFlipMode && i === 0 && (
                                     <div 
                                        className="absolute inset-0 bg-[#0F1115] flex items-center justify-center backface-hidden"
                                        style={{ transform: 'rotateY(180deg)' }}
                                     >
                                         {(images[(currentImgIdx + 1) % images.length] || images[0]) && <img src={images[(currentImgIdx + 1) % images.length] || images[0] || undefined} className="w-full h-full object-cover" />}
                                     </div>
                                 )}

                                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]/30"></div>
                            </div>
                            <div className="mt-2 text-[8px] text-[#D4AF37]/40 uppercase tracking-widest font-bold">圖騰 {i+1}</div>
                        </div>
                    );
                })}
            </div>
            <p className="text-[10px] text-slate-500 mb-6 tracking-widest uppercase">點擊圖騰以切換排列</p>
            <Button onClick={handleUnlock} variant="neo-chinese" className="w-full py-4 text-lg">
                <Unlock className="mr-3" /> 開啟秘寶
            </Button>

            {/* Zoom Modal */}
            {zoomImage && ReactDOM.createPortal(
                <div 
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setZoomImage(null)}
                >
                    <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <TransformWrapper
                            initialScale={1}
                            minScale={1}
                            maxScale={4}
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                                        <button onClick={() => zoomIn()} className="text-white/80 hover:text-white bg-black/50 rounded-full p-2">
                                            <ZoomIn size={24} />
                                        </button>
                                        <button onClick={() => zoomOut()} className="text-white/80 hover:text-white bg-black/50 rounded-full p-2">
                                            <ZoomOut size={24} />
                                        </button>
                                        <button onClick={() => { resetTransform(); setZoomImage(null); }} className="text-white/80 hover:text-white bg-black/50 rounded-full p-2">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <TransformComponent wrapperClass="w-full h-full flex items-center justify-center" contentClass="w-full h-full flex items-center justify-center">
                                        <img src={zoomImage || undefined} className="max-w-full max-h-[90vh] object-contain shadow-2xl border border-[#D4AF37]/20" />
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export const PhotoTaskAnswer = ({ module, onResolve }: any) => {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (preview) {
            onResolve(true);
        }
    };

    return (
        <div className="space-y-6">
            <div 
                className="aspect-video bg-[#0F1115] border border-dashed border-[#D4AF37]/30 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative group"
                style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}
                onClick={() => inputRef.current?.click()}
            >
                {preview ? (
                    <>
                        {preview && <img src={preview || undefined} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <span className="text-[#D4AF37] font-bold flex items-center tracking-widest uppercase"><Camera className="mr-3"/> 重新取景</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-[#D4AF37]/40 group-hover:text-[#D4AF37]/60 transition-colors">
                        <Camera size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="text-sm font-bold tracking-[0.2em] uppercase">點擊開啟影像採集</p>
                    </div>
                )}
            </div>
            <input 
                ref={inputRef} 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleFile} 
            />
            <Button onClick={handleSubmit} variant="neo-chinese" disabled={!preview} className="w-full py-4">
                確認上傳影像
            </Button>
        </div>
    );
};

export const VoiceAnswer = ({ module, onResolve }: any) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'zh-TW';

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    }, []);

    const startListening = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setTranscript('');
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        } else {
            setIsListening(true);
        }
    };

    const stopListening = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (recognitionRef.current && isListening) {
             recognitionRef.current.stop();
             setIsListening(false);
             // Removed auto-validate to allow manual check
        } else if (isListening) {
             setIsListening(false);
             const mockText = "芝麻開門";
             setTranscript(mockText);
        }
    };

    const validateAnswer = (text: string) => {
        const checkText = text || transcript;
        const correct = module.data.answer || "";
        if (checkText && checkText.includes(correct)) {
            onResolve(true);
        } else if (checkText) {
            onResolve(false);
        }
    };

    return (
        <div className="flex flex-col items-center py-8 select-none">
             <div className="relative group">
                 {isListening && (
                     <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full animate-ping opacity-75"></div>
                 )}
                 <button
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onMouseLeave={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                        isListening 
                        ? 'bg-[#D4AF37] text-[#0F1115] border-[#D4AF37] scale-110 shadow-[0_0_30px_rgba(212,175,55,0.6)]' 
                        : 'bg-[#1A1C23] text-[#D4AF37]/60 border-[#D4AF37]/20 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-white/5'
                    }`}
                 >
                     <Mic size={48} className={isListening ? 'animate-pulse' : ''} />
                 </button>
             </div>
             <p className="mt-6 text-xs font-bold text-[#D4AF37]/50 tracking-[0.3em] uppercase">
                 {isListening ? "正在聆聽天機... 放開以結束" : "長按按鈕傳達心聲"}
             </p>
             {transcript && (
                 <div className="mt-6 w-full flex flex-col items-center space-y-4">
                     <div className="p-4 bg-[#0F1115] border border-[#D4AF37]/20 text-center w-full" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                         <p className="text-[10px] text-[#D4AF37]/40 mb-2 tracking-widest uppercase">辨識結果:</p>
                         <p className="text-[#D4AF37] font-bold tracking-wide">"{transcript}"</p>
                     </div>
                     <Button onClick={() => validateAnswer(transcript)} variant="neo-chinese" className="w-full py-4">
                        確認答案
                     </Button>
                 </div>
             )}
        </div>
    );
};

export const ARTaskAnswer = ({ module, onResolve }: any) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanState, setScanState] = useState<'scanning' | 'verifying' | 'success' | 'failure'>('scanning');
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [cameraError, setCameraError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isVerifyingRef = useRef(false);
    const scanStateRef = useRef(scanState);

    useEffect(() => {
        scanStateRef.current = scanState;
    }, [scanState]);

    const startScan = async () => {
        setIsScanning(true);
        setScanState('scanning');
        setCameraError(false);
        isVerifyingRef.current = false;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError(true);
        }
    };

    const stopScan = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsScanning(false);
    };

    const autoCaptureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current || isVerifyingRef.current || scanStateRef.current !== 'scanning') return;
        
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        isVerifyingRef.current = true;
        
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            isVerifyingRef.current = false;
            return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.5);
        
        try {
            const targetHint = module.data.hintName || module.data.hintContent || "目標物";
            const result = await verifyARImage(base64Image, targetHint);
            
            if (result.isMatch && scanStateRef.current === 'scanning') {
                setScanState('success');
                setFeedbackMsg(result.feedback);
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                }
                setTimeout(() => {
                    setIsScanning(false);
                    onResolve(true);
                }, 4000);
            }
        } catch (err) {
            console.error("Auto scan error:", err);
        } finally {
            isVerifyingRef.current = false;
        }
    };

    useEffect(() => {
        let isActive = true;
        let timeoutId: NodeJS.Timeout;

        const loop = async () => {
            if (!isActive) return;
            
            if (scanStateRef.current === 'scanning' && !cameraError && isScanning && videoRef.current?.readyState === 4) {
                await autoCaptureAndVerify();
            }
            
            if (isActive) {
                timeoutId = setTimeout(loop, 2000);
            }
        };

        if (isScanning) {
            loop();
        }

        return () => {
            isActive = false;
            clearTimeout(timeoutId);
        };
    }, [isScanning, cameraError]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64Image = ev.target?.result as string;
            setScanState('verifying');
            
            try {
                const targetHint = module.data.hintName || module.data.hintContent || "目標物";
                const result = await verifyARImage(base64Image, targetHint);
                
                if (result.isMatch) {
                    setScanState('success');
                    setFeedbackMsg(result.feedback);
                    if (videoRef.current && videoRef.current.srcObject) {
                        const stream = videoRef.current.srcObject as MediaStream;
                        stream.getTracks().forEach(track => track.stop());
                    }
                    setTimeout(() => {
                        setIsScanning(false);
                        onResolve(true);
                    }, 3000);
                } else {
                    setScanState('failure');
                    setFeedbackMsg(result.feedback);
                }
            } catch (err) {
                console.error(err);
                setScanState('failure');
                setFeedbackMsg("辨識過程發生錯誤，請重試。");
            }
        };
        reader.readAsDataURL(file);
    };

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current || isVerifyingRef.current) return;
        
        isVerifyingRef.current = true;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            isVerifyingRef.current = false;
            return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        setScanState('verifying');
        
        try {
            const targetHint = module.data.hintName || module.data.hintContent || "目標物";
            const result = await verifyARImage(base64Image, targetHint);
            
            if (result.isMatch) {
                setScanState('success');
                setFeedbackMsg(result.feedback);
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                }
                setTimeout(() => {
                    setIsScanning(false);
                    onResolve(true);
                }, 4000);
            } else {
                setScanState('failure');
                setFeedbackMsg(result.feedback);
                setTimeout(() => {
                    setIsScanning(false);
                    onResolve(false);
                }, 4000);
            }
        } catch (err) {
            console.error(err);
            setScanState('failure');
            setFeedbackMsg("辨識過程發生錯誤，請重試。");
            setTimeout(() => {
                setIsScanning(false);
                onResolve(false);
            }, 4000);
        } finally {
            isVerifyingRef.current = false;
        }
    };

    const retryScan = () => {
        setScanState('scanning');
    };

    if (isScanning) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0F1115] flex flex-col items-center">
                 <div className="absolute inset-0">
                     {cameraError ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F1115] p-6 text-center">
                             <AlertCircle size={48} className="text-[#D4AF37]/50 mb-4" />
                             <p className="text-slate-300 mb-6">無法存取相機，請使用拍照上傳功能。</p>
                             <Button onClick={() => fileInputRef.current?.click()} variant="neo-chinese" className="py-3 px-6">
                                 <Upload className="mr-2" size={18} /> 選擇照片
                             </Button>
                         </div>
                     ) : (
                         <>
                             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60 grayscale-[0.5] contrast-125" />
                             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                             {module.data.overlayImage && (
                                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                     <img src={module.data.overlayImage || undefined} style={{ width: '87vw' }} className="object-contain opacity-50" alt="AR Overlay" />
                                 </div>
                             )}
                         </>
                     )}
                 </div>
                 <canvas ref={canvasRef} className="hidden" />
                 <input 
                     ref={fileInputRef} 
                     type="file" 
                     accept="image/*" 
                     capture="environment" 
                     className="hidden" 
                     onChange={handleFileUpload} 
                 />
                 
                 {scanState === 'scanning' ? (
                     <>
                        {!cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-72 h-72 border border-[#D4AF37]/30 relative overflow-hidden" style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
                                    
                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 border-t-4 border-l-4 border-[#D4AF37] w-12 h-12"></div>
                                    <div className="absolute top-0 right-0 border-t-4 border-r-4 border-[#D4AF37] w-12 h-12"></div>
                                    <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-[#D4AF37] w-12 h-12"></div>
                                    <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-[#D4AF37] w-12 h-12"></div>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-32 bg-[#0F1115]/80 px-8 py-4 border border-[#D4AF37]/30 text-[#D4AF37] font-bold backdrop-blur-md tracking-[0.3em] uppercase text-sm" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                            尋找目標: {module.data.hintName || "掃描目標物"}
                        </div>
                        {!cameraError && (
                            <div className="absolute bottom-12 flex items-center gap-6">
                                <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-black/40 text-[#D4AF37]/70 hover:text-[#D4AF37] backdrop-blur-sm transition-colors">
                                    <ImageIcon size={24} />
                                </button>
                                <button onClick={captureAndVerify} className="w-16 h-16 rounded-full border-4 border-[#D4AF37] bg-white/20 flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]"></div>
                                </button>
                                <div className="w-12"></div> {/* Spacer for balance */}
                            </div>
                        )}
                     </>
                 ) : scanState === 'verifying' ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1115]/90 animate-in fade-in duration-300 backdrop-blur-sm">
                         <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={48} />
                         <p className="text-[#D4AF37] tracking-[0.3em] uppercase font-bold">正在分析影像...</p>
                     </div>
                 ) : scanState === 'success' ? (
                     <div className="absolute inset-0 flex items-center justify-center bg-[#0F1115]/90 animate-in fade-in duration-700 backdrop-blur-sm">
                         <div className="flex flex-col items-center">
                             <div className="w-72 h-72 relative mb-8 p-1 bg-gradient-to-b from-[#D4AF37] to-transparent" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                                 {module.data.successImage ? (
                                    <img src={module.data.successImage || undefined} className="w-full h-full object-cover" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }} />
                                 ) : (
                                     <div className="w-full h-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/40" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                                         <CheckCircle size={80} className="text-[#D4AF37] opacity-80" />
                                     </div>
                                 )}
                             </div>
                             <h3 className="text-3xl font-black text-[#D4AF37] mb-3 tracking-[0.3em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>辨識成功</h3>
                             <p className="text-slate-300 text-sm tracking-widest text-center px-6">{feedbackMsg || module.data.hintContent || "目標已確認"}</p>
                         </div>
                     </div>
                 ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-[#0F1115]/90 animate-in fade-in duration-300 backdrop-blur-sm">
                         <div className="flex flex-col items-center p-8 text-center">
                             <XCircle size={64} className="text-red-500 mb-6 opacity-80" />
                             <h3 className="text-2xl font-black text-red-500 mb-4 tracking-[0.2em] uppercase">辨識失敗</h3>
                             <p className="text-slate-300 text-sm tracking-widest mb-8 max-w-xs">{feedbackMsg}</p>
                             <Button onClick={retryScan} variant="neo-chinese" className="px-8 py-3">
                                 重新掃描
                             </Button>
                         </div>
                     </div>
                 )}
                 
                 <button onClick={stopScan} className="absolute top-6 right-6 text-[#D4AF37]/50 hover:text-[#D4AF37] p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all z-50">
                     <X size={24} />
                 </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-6 bg-[#0F1115] border border-[#D4AF37]/20" style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
            <Scan size={56} className="text-[#D4AF37] mb-6 opacity-80" />
            <h3 className="font-bold text-[#D4AF37] mb-3 tracking-[0.2em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>AR 影像辨識</h3>
            <p className="text-xs text-slate-400 text-center mb-8 leading-relaxed tracking-widest">{module.data.hintContent || "請點擊下方按鈕開啟相機"}</p>
            <Button onClick={startScan} variant="neo-chinese" className="w-full py-4">
                開啟 AR 相機
            </Button>
        </div>
    );
};

export const JigsawPuzzleAnswer = ({ module, onResolve }: any) => {
    const [tiles, setTiles] = useState<any[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [dragState, setDragState] = useState<{ id: number, startX: number, startY: number } | null>(null);
    const gridSize = module.data.gridSize || 3;
    const imageUrl = module.data.image || "https://picsum.photos/seed/puzzle/600/600";
    
    useEffect(() => {
        const total = gridSize * gridSize;
        const initialTiles = Array.from({ length: total }, (_, i) => ({
            id: i,
            currentPos: i,
            correctPos: i
        }));
        
        for (let i = initialTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialTiles[i].currentPos, initialTiles[j].currentPos] = [initialTiles[j].currentPos, initialTiles[i].currentPos];
        }
        
        setTiles(initialTiles);
    }, [gridSize]);

    const handleDragStart = (e: React.DragEvent, pos: number) => {
        e.dataTransfer.setData("text/plain", pos.toString());
    };

    const handleDrop = (e: React.DragEvent | null, targetPos: number, sourcePosOverride?: number) => {
        if (e) e.preventDefault();
        
        let sourcePos: number;
        if (sourcePosOverride !== undefined) {
            sourcePos = sourcePosOverride;
        } else if (e) {
            sourcePos = parseInt(e.dataTransfer.getData("text/plain"));
        } else {
            return;
        }

        if (isNaN(sourcePos)) return;

        const newTiles = [...tiles];
        const sourceTileIdx = newTiles.findIndex(t => t.currentPos === sourcePos);
        const targetTileIdx = newTiles.findIndex(t => t.currentPos === targetPos);
        
        if (sourceTileIdx > -1 && targetTileIdx > -1) {
            newTiles[sourceTileIdx].currentPos = targetPos;
            newTiles[targetTileIdx].currentPos = sourcePos;
            setTiles(newTiles);
            checkCompletion(newTiles);
        }
    };

    const checkCompletion = (currentTiles: any[]) => {
        const completed = currentTiles.every(t => t.currentPos === t.correctPos);
        if (completed) {
            setIsComplete(true);
            setTimeout(() => onResolve(true), 1000);
        }
    };

    const handleTouchStart = (e: React.TouchEvent, pos: number) => {
        if (isComplete) return;
        // Store the initial touch position and the tile index
        const touch = e.touches[0];
        setDragState({ id: pos, startX: touch.clientX, startY: touch.clientY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // Prevent scrolling while dragging
        if (dragState) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!dragState || isComplete) return;
        
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Find the closest parent with data-slot-idx
        const slotElement = target?.closest('[data-slot-idx]');
        if (slotElement) {
            const targetPos = parseInt(slotElement.getAttribute('data-slot-idx') || '-1');
            if (targetPos !== -1 && targetPos !== dragState.id) {
                handleDrop(null, targetPos, dragState.id);
            }
        }
        setDragState(null);
    };

    return (
        <div className="flex flex-col items-center">
            <div 
                className="grid gap-1 bg-[#0F1115] border border-[#D4AF37]/30 p-1 mb-6 shadow-2xl touch-none"
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    width: '300px',
                    height: '300px',
                    clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
                }}
            >
                {Array.from({ length: gridSize * gridSize }).map((_, slotIdx) => {
                    const tile = (tiles || []).find(t => t.currentPos === slotIdx);
                    if (!tile) return <div key={slotIdx} data-slot-idx={slotIdx}></div>;

                    const row = Math.floor(tile.correctPos / gridSize);
                    const col = tile.correctPos % gridSize;
                    const percentX = (col / (gridSize - 1)) * 100;
                    const percentY = (row / (gridSize - 1)) * 100;
                    const isDragging = dragState?.id === slotIdx;

                    return (
                        <div
                            key={tile.id}
                            data-slot-idx={slotIdx}
                            draggable={!isComplete}
                            onDragStart={(e) => handleDragStart(e, slotIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, slotIdx)}
                            onTouchStart={(e) => handleTouchStart(e, slotIdx)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 ${isComplete ? 'border-none' : 'border border-[#D4AF37]/20 hover:border-[#D4AF37]/60'} ${isDragging ? 'z-50 scale-110 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.6)] brightness-125' : ''}`}
                            style={{
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: '300px 300px',
                                backgroundPosition: `${percentX}% ${percentY}%`
                            }}
                        />
                    );
                })}
            </div>
            {isComplete ? (
                 <div className="text-[#D4AF37] font-bold flex items-center animate-bounce tracking-[0.2em] uppercase"><CheckCircle className="mr-3"/> 拼圖歸位</div>
            ) : (
                 <p className="text-[10px] text-slate-500 tracking-widest uppercase">拖曳殘片以還原真相</p>
            )}
        </div>
    );
};

const NeoChineseContainer = ({ children, className = "", innerClassName = "", onClick }: { children: React.ReactNode, className?: string, innerClassName?: string, onClick?: () => void }) => (
    <div className={`relative mb-6 p-[1px] bg-gradient-to-b from-[#8A7339]/50 via-[#3A3220]/30 to-[#8A7339]/40 shadow-2xl flex flex-col ${className}`} style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }} onClick={onClick}>
        <div className={`relative bg-[#0F1115] p-6 flex-1 ${innerClassName}`} style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
            {/* Textured stone overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2A2D35] to-[#0F1115] pointer-events-none"></div>
            
            {/* Warm ember glow at the bottom */}
            <div className="absolute -bottom-16 left-1/2 h-32 w-4/5 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>
            
            {/* Metallic precision lines */}
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent pointer-events-none"></div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    </div>
);

export const AnswerModuleWrapper = ({ module, onResolve, isResolved, globalResolvedCount, onHintUsed, onAnswerAttempt }: any) => {
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastResult, setLastResult] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [startTime] = useState(Date.now());

    const hasHints = module.data.hints && module.data.hints.length > 0;

    const handleResolve = (result: boolean) => {
        setLastResult(result);
        setShowFeedback(true);
        if (onAnswerAttempt) onAnswerAttempt(result);
    };

    const handleFeedbackClose = () => {
        setShowFeedback(false);
        onResolve(module.id);
    };

    if (isResolved) {
        return (
            <NeoChineseContainer className="opacity-80">
                <div className="text-[#D4AF37] font-bold flex items-center justify-center py-2 tracking-widest">
                    <CheckCircle className="inline mr-2"/> 任務已完成
                </div>
            </NeoChineseContainer>
        );
    }

    return (
        <NeoChineseContainer className="flex-1 !mb-[6.5px]" innerClassName="pb-24">
            <div className="flex justify-between items-center mb-6">
                <div className="font-bold flex items-center text-[#D4AF37] tracking-[0.2em] text-lg uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                    {module.type === 'PUZZLE_JIGSAW' ? <Puzzle size={20} className="mr-3"/> : <Lock size={20} className="mr-3" />}
                    {module.type === 'PUZZLE_JIGSAW' ? '解謎拼圖' : '請回答問題'}
                </div>
                {hasHints && (
                    <button 
                        onClick={() => setShowHint(true)} 
                        className="text-[#D4AF37]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all px-4 py-1.5 flex items-center gap-2 border border-[#D4AF37]/30 bg-[#1A1C23]" 
                        style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                        title="查看提示"
                    >
                        <HelpCircle size={14} />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">提示</span>
                    </button>
                )}
            </div>
            
            <div className="neo-chinese-content">
                {module.data.text && (
                    <div className="text-lg leading-relaxed tracking-wide text-slate-100 mb-6" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                        {module.data.text}
                    </div>
                )}
                {module.type === 'ANS_TEXT' && <TextAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_SINGLE' && <SingleChoiceAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_MULTI' && <MultiChoiceAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_NUMBER' && <NumberLockAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_IMAGE' && <ImageLockAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_PHOTO' && <PhotoTaskAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_VOICE' && <VoiceAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_AR' && <ARTaskAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_GYRO' && <GyroTaskAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'PUZZLE_JIGSAW' && <JigsawPuzzleAnswer module={module} onResolve={handleResolve} />}
            </div>

            {showFeedback && (
                <FeedbackModal 
                    isCorrect={lastResult} 
                    data={module.data} 
                    onClose={handleFeedbackClose} 
                    stage={globalResolvedCount}
                />
            )}

            {showHint && (
                <HintModal 
                    hints={module.data.hints} 
                    baseTime={startTime}
                    onClose={() => setShowHint(false)} 
                    onHintUsed={onHintUsed}
                />
            )}
        </NeoChineseContainer>
    );
};

export const ZoomableImage = ({ src, alt, className, style, children }: any) => {
    const [isZoomed, setIsZoomed] = useState(false);
    return (
        <>
            <div className={`relative cursor-pointer ${className}`} style={style} onClick={() => setIsZoomed(true)}>
                <img src={src || undefined} alt={alt} className="w-full h-auto block" />
                {children}
            </div>
            {isZoomed && (
                <div 
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50"
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                    >
                        <X size={32} />
                    </button>
                    <div className="relative max-w-full max-h-full">
                        <img 
                            src={src || undefined} 
                            alt={alt} 
                            className="max-w-full max-h-[90vh] object-contain" 
                            onClick={(e) => e.stopPropagation()}
                        />
                        {children && (
                            <div className="absolute inset-0 pointer-events-none">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export const LocationModule = ({ module, onResolve }: any) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [isWrong, setIsWrong] = useState(false);
    const data = module.data;

    const handleConfirm = () => {
        if (data.answer) {
            if (userAnswer.trim() === data.answer.trim()) {
                onResolve(module.id);
            } else {
                setIsWrong(true);
                setTimeout(() => {
                    setIsWrong(false);
                    onResolve(module.id);
                }, 2000);
            }
        } else {
            onResolve(module.id);
        }
    };

    return (
        <NeoChineseContainer>
            <div className="flex items-center gap-3 text-[#D4AF37]">
                <MapPin size={22} className="drop-shadow-md opacity-90" />
                <div className="text-lg font-medium tracking-widest" style={{ fontFamily: '"Noto Serif TC", serif' }}>{data.actionText || "前往指定地點"}</div>
            </div>
            
            <div className="mt-3 text-sm text-[#8A8D95] font-mono tracking-wider pl-9 opacity-80">
                {data.location}
            </div>

            {data.photo && (
                <div className="mt-6 rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-xl group">
                    <ZoomableImage src={data.photo || undefined} alt="Location target">
                        {data.mosaicRect && (
                            <div 
                                className="absolute backdrop-blur-[24px] bg-white/30 border border-white/20"
                                style={{ 
                                    left: `${(data.mosaicRect.x / 100) * 100}%`, 
                                    top: `${(data.mosaicRect.y / 100) * 100}%`, 
                                    width: `${(data.mosaicRect.w / 100) * 100}%`, 
                                    height: `${(data.mosaicRect.h / 100) * 100}%`,
                                    filter: 'blur(16px)'
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                            <span className="text-white text-xs font-bold tracking-widest">點擊放大查看</span>
                        </div>
                    </ZoomableImage>
                </div>
            )}

            {data.answer && (
                <div className="mt-6 space-y-3">
                    <label className="block text-xs font-bold text-[#8A8D95] tracking-widest uppercase">請輸入現場驗證答案</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="在此輸入答案..."
                            className={`w-full bg-[#0F1115] border ${isWrong ? 'border-red-500 animate-shake' : 'border-[#D4AF37]/30'} rounded-lg py-3 px-4 text-slate-200 text-sm outline-none focus:border-[#D4AF37] transition-all`}
                        />
                        {isWrong && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-bold">答案錯誤，請再試一次</span>}
                    </div>
                </div>
            )}
            
            <Button 
                onClick={handleConfirm} 
                variant="neo-chinese"
                className="mt-8 w-full py-4 text-sm tracking-[0.3em]"
            >
                {data.answer ? "提交驗證" : "打卡確認"}
            </Button>
        </NeoChineseContainer>
    );
};

export const HintModule = ({ module }: any) => (
    <NeoChineseContainer className="!mb-4">
        <div className="flex items-center gap-3 text-[#D4AF37]">
            <HelpCircle size={18} className="opacity-80" />
            <span className="text-sm font-bold tracking-widest">提示:</span>
        </div>
        <div className="mt-2 text-sm text-slate-300 leading-relaxed pl-7">
            {module.data.hints?.[0]?.text || "暫無提示"}
        </div>
    </NeoChineseContainer>
);

export const MediaModule = ({ module }: { module: GameModule }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (module.type === 'IMAGE') {
        const frontImage = module.data.url || module.data.file;
        const backImage = module.data.flipUrl || module.data.flipFile;
        const isFlipMode = module.data.isFlipMode && backImage;

        if (isFlipMode) {
            return (
                <NeoChineseContainer className="!p-1 cursor-pointer perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="backface-hidden w-full">
                            <img src={frontImage || undefined} className="w-full h-auto" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} alt="Scene Asset Front" />
                        </div>
                        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
                            <img src={backImage || undefined} className="w-full h-full object-cover" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} alt="Scene Asset Back" />
                        </div>
                    </div>
                </NeoChineseContainer>
            );
        }

        return (
            <NeoChineseContainer className="!p-1">
                <ZoomableImage 
                    src={frontImage || undefined} 
                    alt="Scene Asset" 
                    style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                />
            </NeoChineseContainer>
        );
    }
    if (module.type === 'VIDEO') {
        return (
             <NeoChineseContainer className="!p-1 bg-black">
                 <video controls src={module.data.url || module.data.file || undefined} className="w-full h-auto" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} />
             </NeoChineseContainer>
        );
    }
    if (module.type === 'AUDIO') {
        return (
            <NeoChineseContainer className="!p-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                        <Volume2 size={20} />
                    </div>
                    <audio controls controlsList="nodownload" src={module.data.file || module.data.url || undefined} className="flex-1 h-8 bg-transparent" style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(10deg)' }} />
                </div>
            </NeoChineseContainer>
        );
    }
    return null;
};

export const NarrationModule = ({ module }: { module: GameModule }) => {
    return (
        <div className="my-12 text-center px-8 animate-in fade-in duration-700 relative z-20">
             {module.data.image && (
                 <div className="mb-8 p-1 bg-gradient-to-b from-[#8A7339]/40 to-transparent rounded-2xl shadow-2xl mx-auto max-w-sm overflow-hidden" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                     <img src={module.data.image || undefined} className="w-full h-auto object-cover" alt="Illustration" />
                 </div>
             )}
             {module.data.title && <h3 className="text-3xl font-black text-[#D4AF37] mb-6 drop-shadow-2xl tracking-[0.3em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>{module.data.title}</h3>}
             <p className="text-xl text-slate-200 leading-relaxed italic font-medium whitespace-pre-wrap tracking-wide" style={{ fontFamily: '"Noto Serif TC", serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                 {module.data.content}
             </p>
             <div className="mt-10 flex justify-center opacity-30">
                 <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
             </div>
        </div>
    );
};

export const DialogueModule = ({ module, user, characters, onResolve, isResolved }: { module: GameModule, user: any, characters?: any[], onResolve?: (id: string) => void, isResolved?: boolean }) => {
    const isChat = module.data.style === 'CHAT';
    const lines = module.data.lines || [];
    const [currentLineIdx, setCurrentLineIdx] = useState(isChat ? -1 : 0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const sfxRef = useRef<HTMLAudioElement | null>(null);

    // Reset state when module changes
    useEffect(() => {
        setCurrentLineIdx(isChat ? -1 : 0);
    }, [module.id, isChat]);

    // BGM Management
    useEffect(() => {
        if (module.data.bgm && bgmRef.current) {
            bgmRef.current.src = module.data.bgm;
            bgmRef.current.loop = true;
            bgmRef.current.volume = 0;
            bgmRef.current.play().catch(e => console.log("BGM autoplay blocked", e));
            
            const fadeIn = setInterval(() => {
                if (bgmRef.current && bgmRef.current.volume < 0.5) {
                    bgmRef.current.volume = Math.min(0.5, bgmRef.current.volume + 0.05);
                } else {
                    clearInterval(fadeIn);
                }
            }, 200);

            return () => {
                clearInterval(fadeIn);
                const fadeOut = setInterval(() => {
                    if (bgmRef.current && bgmRef.current.volume > 0.05) {
                        bgmRef.current.volume -= 0.05;
                    } else if (bgmRef.current) {
                        bgmRef.current.pause();
                        clearInterval(fadeOut);
                    }
                }, 200);
            };
        }
    }, [module.data.bgm]);

    // Audio Playback Effect (Voice & SFX)
    useEffect(() => {
        const line = lines[currentLineIdx];
        if (line) {
            if (sfxRef.current) {
                sfxRef.current.pause();
                sfxRef.current.currentTime = 0;
            }

            const playVoice = () => {
                if(line.audio && audioRef.current) {
                    audioRef.current.src = line.audio;
                    audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
                }
            };

            const playSfx = (url: string) => {
                if(url && sfxRef.current) {
                    sfxRef.current.src = url;
                    sfxRef.current.play().catch(e => console.log("SFX autoplay blocked", e));
                }
            };

            // 1. Play Current Line SFX (if not 'after_previous' or 'with_previous')
            // Actually, 'with_previous' should have been played by the previous step.
            // But if we are just starting (idx=0), we should check if it's 'with_previous' (which implies with scene start?)
            // Let's assume 'with_previous' on first line means 'with scene start'.
            
            // Logic for Current Line SFX
            if (line.sfx) {
                if (line.sfxTiming === 'after_voice') {
                    if (line.audio && audioRef.current) {
                        audioRef.current.src = line.audio;
                        audioRef.current.onended = () => {
                            playSfx(line.sfx);
                            if(audioRef.current) audioRef.current.onended = null;
                        };
                        audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
                    } else {
                        playSfx(line.sfx);
                    }
                } else if (line.sfxTiming === 'after_previous') {
                    // Already played during transition, do nothing here.
                    // Unless we just loaded the scene and it's the first line?
                    // If it's the first line, 'after_previous' means 'after scene transition'.
                    // But we don't have a transition handler for scene start here easily.
                    // Let's just play it immediately for first line.
                    if (currentLineIdx === 0) {
                        playSfx(line.sfx);
                    }
                    playVoice();
                } else if (line.sfxTiming === 'with_previous') {
                    // Already played by previous step look-ahead.
                    // If first line, play now.
                    if (currentLineIdx === 0) {
                        playSfx(line.sfx);
                    }
                    playVoice();
                } else {
                    // Default or 'start' (Simultaneous with current)
                    playVoice();
                    playSfx(line.sfx);
                }
            } else {
                playVoice();
            }

            // 2. Look Ahead for Next Line's "With Previous" (Simultaneous with Current)
            const nextLine = lines[currentLineIdx + 1];
            if (nextLine && nextLine.sfx && nextLine.sfxTiming === 'with_previous') {
                // Play next line's SFX NOW (with current line)
                // We need a separate audio element or just reuse sfxRef?
                // If we reuse sfxRef, we might cut off current line's SFX.
                // Ideally we need multiple SFX channels.
                // For simplicity, let's try to create a temporary audio object.
                const nextSfx = new Audio(nextLine.sfx);
                nextSfx.play().catch(e => console.log("Next SFX autoplay blocked", e));
            }
        }
    }, [currentLineIdx, lines]);

    const handleNext = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.onended = null;
        }

        if (currentLineIdx < lines.length - 1) {
            const nextIdx = currentLineIdx + 1;
            const nextLine = lines[nextIdx];

            // Check for 'after_previous' (Sequential)
            if (nextLine && nextLine.sfx && nextLine.sfxTiming === 'after_previous') {
                // Play SFX, wait, then advance
                if (sfxRef.current) {
                    sfxRef.current.src = nextLine.sfx;
                    sfxRef.current.play().catch(e => {
                        console.log("SFX autoplay blocked", e);
                        setCurrentLineIdx(nextIdx); // Fallback
                    });
                    sfxRef.current.onended = () => {
                        setCurrentLineIdx(nextIdx);
                        if(sfxRef.current) sfxRef.current.onended = null;
                    };
                } else {
                    setCurrentLineIdx(nextIdx);
                }
            } else {
                setCurrentLineIdx(nextIdx);
            }
        } else {
             if (bgmRef.current) {
                const fadeOut = setInterval(() => {
                    if (bgmRef.current && bgmRef.current.volume > 0.05) {
                        bgmRef.current.volume -= 0.05;
                    } else if (bgmRef.current) {
                        bgmRef.current.pause();
                        clearInterval(fadeOut);
                    }
                }, 100);
             }
             if (onResolve && !isResolved) {
                 onResolve(module.id);
             }
        }
    };

    const isFinished = currentLineIdx >= lines.length - 1;

    if (lines.length === 0) return null;

    if (isChat) {
        return (
            <div className="w-full max-w-md mx-auto relative z-20 flex flex-col h-full bg-[#0F1115]/80 backdrop-blur-md border-x border-[#D4AF37]/10 shadow-2xl" onClick={handleNext}>
                <audio ref={audioRef} className="hidden" />
                <audio ref={bgmRef} className="hidden" />
                <audio ref={sfxRef} className="hidden" />
                <div className="flex-1 overflow-y-auto space-y-6 pb-24 pt-6 px-4 scrollbar-hide">
                     {lines.slice(0, currentLineIdx + 1).map((line: any, idx: number) => {
                         if (!line) return null;
                         const isPlayer = line.char === '玩家';
                         const isNarrator = line.char === '旁白';
                         
                         if (isNarrator) {
                             return (
                                 <div key={idx} className="flex justify-center my-6 animate-in fade-in zoom-in-95 duration-500">
                                     <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]/80 text-[10px] px-4 py-1.5 rounded-full shadow-inner tracking-[0.2em] uppercase">
                                         {line.text}
                                     </span>
                                 </div>
                             );
                         }

                         const hasAudioOnly = line.audio && !line.text;
                         const charData = characters?.find((c: any) => c.name === line.char);

                         return (
                             <div key={idx} className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isPlayer ? 'flex-row-reverse' : ''}`}>
                                 <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-[#1A1C23] border border-[#D4AF37]/30 shadow-lg relative" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                                     {isPlayer ? (
                                         <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.avatarId || 99}`} className="w-full h-full object-cover" />
                                     ) : (
                                         charData?.avatarUrl ? (
                                             <img src={charData.avatarUrl || undefined} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#3A3220] to-[#0F1115] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                                                {line.char?.[0] || '?'}
                                            </div>
                                         )
                                     )}
                                 </div>
                                 
                                 <div className={`flex flex-col max-w-[75%] ${isPlayer ? 'items-end' : 'items-start'}`}>
                                     <span className="text-[10px] text-[#D4AF37]/60 mb-1.5 px-1 font-bold tracking-widest uppercase">
                                         {isPlayer ? (user?.name || '玩家') : line.char}
                                     </span>
                                     <div 
                                        className={`p-4 text-sm rounded-2xl shadow-xl relative cursor-pointer transition-all active:scale-[0.98] ${
                                         isPlayer 
                                         ? 'bg-[#D4AF37] text-[#0F1115] font-bold rounded-tr-none border border-[#8A7339]' 
                                         : 'bg-[#1A1C23] text-slate-100 rounded-tl-none border border-[#D4AF37]/30'
                                        }`}
                                        style={{ clipPath: isPlayer ? 'polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))' : 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            if (hasAudioOnly) {
                                                alert("語音轉文字：\n" + (line.hiddenText || "（語音內容）"));
                                            }
                                        }}
                                     >
                                         {hasAudioOnly ? (
                                             <div className="flex items-center gap-3 opacity-90 py-1">
                                                 <div className="flex items-center gap-1">
                                                     <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                                     <AudioLines size={18} className="rotate-90" />
                                                 </div>
                                                 <span className="text-sm font-bold tracking-widest">{line.duration || 21}"</span>
                                             </div>
                                         ) : (
                                             <div className="leading-relaxed tracking-wide">
                                                {line.text}
                                                {line.audio && <Volume2 size={14} className="inline-block ml-2 text-current opacity-60 align-text-bottom"/>}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         )
                     })}
                </div>
                {!isFinished && (
                    <div className="absolute bottom-6 left-0 right-0 text-center text-[#D4AF37]/40 text-[10px] font-bold tracking-[0.4em] animate-pulse bg-gradient-to-t from-[#0F1115] pt-12 pb-4 pointer-events-none uppercase">
                        點擊螢幕繼續
                    </div>
                )}
            </div>
        );
    } else {
        const line = lines[currentLineIdx];
        if (!line) return null;
        const isPlayer = line.char === '玩家';
        const charData = characters?.find((c: any) => c.name === line.char);
        const avatarUrl = charData?.avatarUrl;
        const backgroundUrl = module.data.backgroundImage;

        return (
            <div className="absolute inset-0 flex flex-col h-full w-full overflow-hidden bg-[#0F1115]" onClick={handleNext}>
                 <audio ref={audioRef} className="hidden" />
                 <audio ref={bgmRef} className="hidden" />
                 <audio ref={sfxRef} className="hidden" />
                 
                 {/* Background Layer */}
                 {backgroundUrl && (
                     <div className="absolute inset-0 z-0">
                         <img src={backgroundUrl || undefined} className="w-full h-full object-cover" alt="Background" />
                         <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                     </div>
                 )}

                 {/* Character Layer */}
                 {!isPlayer && line.char !== '旁白' && avatarUrl && (
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg h-[90%] pointer-events-none animate-in fade-in slide-in-from-bottom-12 duration-700 flex items-end justify-center">
                         <img 
                            src={avatarUrl || undefined} 
                            className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] filter brightness-105 contrast-105" 
                            alt={line.char}
                         />
                     </div>
                 )}

                 {/* Image-based RPG Dialogue UI */}
                 <div className="absolute bottom-[-13px] left-0 right-0 z-30 px-4 md:px-8 flex justify-center pb-8">
                    <div className="relative w-full max-w-4xl group">
                        
                        {/* Main Text Box - Image Background */}
                        <div className="relative w-full min-h-[160px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                            
                            {/* Background Image */}
                            <img 
                                src={module.data.dialogueBoxImage || "/RPG.png"} 
                                alt="Dialogue Box Background" 
                                className="absolute inset-0 w-full h-full object-fill z-0 select-none pointer-events-none" 
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if(parent) {
                                        parent.classList.add('bg-[#0F1115]', 'border-2', 'border-[#D4AF37]/40');
                                        parent.style.clipPath = 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)';
                                    }
                                }}
                            />

                            {/* Warm ember glow at the bottom of the dialogue box */}
                            <div className="absolute -bottom-10 left-1/2 h-20 w-4/5 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none z-0"></div>

                            {/* Content Container */}
                            <div className="relative z-10 px-10 md:px-14 pb-8 pt-6 flex flex-col justify-start h-full">
                                {/* Character Name (Inside Box) */}
                                {line.char !== '旁白' && (
                                    <div className="mb-2">
                                        <span className={`text-[#D4AF37] font-serif font-bold text-2xl tracking-[0.2em] drop-shadow-lg ${isPlayer ? 'text-green-400' : ''}`} style={{ fontFamily: '"Noto Serif TC", serif' }}>
                                            {isPlayer ? (user?.name || '玩家') : line.char}
                                        </span>
                                        <div className="h-[2px] w-12 bg-gradient-to-r from-[#D4AF37] to-transparent mt-1 opacity-60"></div>
                                    </div>
                                )}

                                {/* Text Content - Noto Serif Font */}
                                <p className={`text-xl md:text-2xl text-slate-100 leading-relaxed tracking-wide drop-shadow-lg ${line.char === '旁白' ? 'text-center italic text-[#D4AF37]/80' : ''}`} style={{ fontFamily: '"Noto Serif TC", serif', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
                                    {line.text}
                                </p>

                                {/* Audio Indicator */}
                                {line.audio && (
                                    <div className="absolute top-8 right-10 text-[#D4AF37]/60 animate-pulse flex items-center gap-2">
                                        <AudioLines size={28} className="rotate-90" />
                                        {line.duration && <span className="text-lg font-bold">{line.duration}"</span>}
                                    </div>
                                )}

                                {/* Next Indicator */}
                                {!isFinished && (
                                    <div className="absolute bottom-8 right-10 flex items-center gap-2 animate-bounce">
                                        <div className="w-4 h-4 bg-[#D4AF37] rotate-45 shadow-[0_0_15px_#D4AF37] border border-white/20"></div>
                                    </div>
                                )}
                                
                                {/* End Indicator */}
                                {isFinished && (
                                    <div className="absolute bottom-8 right-10 text-[10px] text-[#D4AF37]/40 font-bold tracking-[0.4em] animate-pulse uppercase">
                                        結束對話
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }
}

export const GyroTaskAnswer = ({ module, onResolve }: any) => {
    const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    
    // Target from module data, default to flat (beta=0, gamma=0)
    const targetBeta = module.data.targetBeta || 0; // Front/Back tilt (-180 to 180)
    const targetGamma = module.data.targetGamma || 0; // Left/Right tilt (-90 to 90)
    const threshold = module.data.threshold || 10; // Tolerance in degrees
    const holdDuration = module.data.holdDuration || 2000; // Time to hold in ms

    const holdStartRef = useRef<number | null>(null);
    const requestRef = useRef<number>(0);

    const requestPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    setPermissionGranted(true);
                } else {
                    alert("需要陀螺儀權限才能進行此關卡");
                }
            } catch (e) {
                console.error(e);
                // Non-iOS 13+ devices might fail here but still work
                setPermissionGranted(true);
            }
        } else {
            // Non-iOS 13+ devices
            setPermissionGranted(true);
        }
    };

    useEffect(() => {
        if (!permissionGranted) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            setOrientation({
                alpha: event.alpha || 0,
                beta: event.beta || 0,
                gamma: event.gamma || 0
            });
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [permissionGranted]);

    useEffect(() => {
        if (!permissionGranted || isComplete) return;

        const checkOrientation = () => {
            const betaDiff = Math.abs((orientation.beta || 0) - targetBeta);
            const gammaDiff = Math.abs((orientation.gamma || 0) - targetGamma);

            if (betaDiff < threshold && gammaDiff < threshold) {
                if (!holdStartRef.current) {
                    holdStartRef.current = Date.now();
                } else {
                    const elapsed = Date.now() - holdStartRef.current;
                    const newProgress = Math.min(100, (elapsed / holdDuration) * 100);
                    setProgress(newProgress);
                    
                    if (elapsed >= holdDuration) {
                        setIsComplete(true);
                        onResolve(true);
                    }
                }
            } else {
                holdStartRef.current = null;
                setProgress(0);
            }
            requestRef.current = requestAnimationFrame(checkOrientation);
        };

        requestRef.current = requestAnimationFrame(checkOrientation);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [orientation, permissionGranted, isComplete, targetBeta, targetGamma, threshold, holdDuration, onResolve]);

    // Visuals
    const diffX = (orientation.gamma || 0) - targetGamma;
    const diffY = (orientation.beta || 0) - targetBeta;
    
    // Clamp for display inside the circle
    // Assuming circle radius ~80px for movement range
    const displayX = Math.max(-80, Math.min(80, diffX * 3));
    const displayY = Math.max(-80, Math.min(80, diffY * 3));

    if (!permissionGranted) {
        return (
            <div className="flex flex-col items-center p-8">
                <Smartphone size={48} className="text-[#D4AF37] mb-4 animate-pulse" />
                <p className="text-slate-300 mb-6 text-center text-sm tracking-wide">此謎題需要感應您的裝置方位</p>
                <Button onClick={requestPermission} variant="neo-chinese" className="w-full">
                    啟用陀螺儀感應
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4">
            <div className="relative w-64 h-64 rounded-full border-4 border-[#D4AF37]/30 bg-[#0F1115] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden mb-8">
                {/* Target Zone */}
                <div className={`absolute w-20 h-20 rounded-full border-2 ${progress > 0 ? 'border-[#D4AF37] bg-[#D4AF37]/20' : 'border-[#D4AF37]/50'} transition-all duration-300 flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                </div>

                {/* The Ball */}
                <div 
                    className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8A7339] shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10 transition-transform duration-100 ease-out flex items-center justify-center"
                    style={{ transform: `translate(${displayX}px, ${displayY}px)` }}
                >
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>
                </div>

                {/* Crosshairs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4AF37]/20"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#D4AF37]/20"></div>
                </div>
            </div>

            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs text-[#D4AF37] uppercase tracking-widest font-bold">
                    <span>穩定度</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-[#1A1C23] rounded-full overflow-hidden border border-[#D4AF37]/20">
                    <div 
                        className="h-full bg-[#D4AF37] transition-all duration-100 ease-linear shadow-[0_0_10px_#D4AF37]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
            
            <p className="mt-8 text-xs text-slate-400 tracking-widest text-center animate-pulse">
                {module.data.hintContent || "傾斜裝置，將金球保持在中心"}
            </p>
        </div>
    );
};

export const ARTransparentModule = ({ module }: any) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraError, setCameraError] = useState(false);

    const startCamera = async () => {
        setIsCameraOpen(true);
        setCameraError(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError(true);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    if (isCameraOpen) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0F1115] flex flex-col items-center">
                <div className="absolute inset-0">
                    {cameraError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F1115] p-6 text-center">
                            <AlertCircle size={48} className="text-[#D4AF37]/50 mb-4" />
                            <p className="text-slate-300 mb-6">無法存取相機，請確認權限設定。</p>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                            {module.data.file && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <img src={module.data.file || undefined} style={{ width: '87vw' }} className="object-contain" alt="AR Overlay" />
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                <button onClick={stopCamera} className="absolute top-6 left-6 text-white p-3 bg-black/40 rounded-full hover:bg-black/60 backdrop-blur-md transition-all z-50 flex items-center shadow-lg">
                    <ArrowLeft size={24} className="mr-2" />
                    <span className="font-bold tracking-widest">返回</span>
                </button>
            </div>
        );
    }

    return (
        <NeoChineseContainer>
            <div className="flex flex-col items-center p-4">
                <Scan size={56} className="text-[#D4AF37] mb-6 opacity-80" />
                <h3 className="font-bold text-[#D4AF37] mb-3 tracking-[0.2em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>AR 透圖互動</h3>
                <p className="text-xs text-slate-400 text-center mb-8 leading-relaxed tracking-widest">點擊下方按鈕開啟相機，體驗 AR 效果</p>
                <Button onClick={startCamera} variant="neo-chinese" className="w-full py-4">
                    開啟相機
                </Button>
            </div>
        </NeoChineseContainer>
    );
};

// --- Countdown Timer ---
const CountdownTimer = ({ seconds, onTimeout }: { seconds: number, onTimeout: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const hasTimedOut = useRef(false);
    const onTimeoutRef = useRef(onTimeout);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);
    
    useEffect(() => {
        if (seconds <= 0) {
            if (!hasTimedOut.current) {
                hasTimedOut.current = true;
                setTimeout(() => onTimeoutRef.current(), 0);
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (!hasTimedOut.current) {
                        hasTimedOut.current = true;
                        setTimeout(() => onTimeoutRef.current(), 0);
                    }
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [seconds]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md mb-4 w-fit mx-auto transition-colors ${timeLeft === 0 ? 'bg-slate-500/20 text-slate-500 border-slate-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse'}`}>
            <Clock size={16} />
            <span className="font-mono font-bold tracking-widest">
                {timeLeft === 0 ? '時間到' : formatTime(timeLeft)}
            </span>
        </div>
    );
};

export const ModuleRenderer = ({ module, onResolve, isResolved, globalResolvedCount, user, characters, onHintUsed, onAnswerAttempt, onTimeout }: any) => {
    const content = (
        <>
            {module.hasCountdown && !isResolved && (
                <CountdownTimer 
                    key={`timer-${module.id}`}
                    seconds={module.countdownSeconds || 60} 
                    onTimeout={() => onTimeout?.(module)} 
                />
            )}
            {module.type === 'TEXT' && (
                <NeoChineseContainer>
                    <div className="text-lg leading-relaxed tracking-wide text-slate-100" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                        {module.data.text}
                    </div>
                </NeoChineseContainer>
            )}
            {module.type === 'LOCATION' && <LocationModule module={module} onResolve={onResolve} onAnswerAttempt={onAnswerAttempt}/>}
            {(module.type.startsWith('ANS_') || module.type === 'PUZZLE_JIGSAW') && <AnswerModuleWrapper module={module} onResolve={onResolve} isResolved={isResolved} globalResolvedCount={globalResolvedCount} onHintUsed={onHintUsed} onAnswerAttempt={onAnswerAttempt}/>}
            {module.type === 'HINT' && <HintModule module={module} onHintUsed={onHintUsed} />}
            {module.type === 'STORY_NARRATION' && <NarrationModule module={module} />}
            {module.type === 'STORY_DIALOGUE' && <DialogueModule module={module} user={user} characters={characters} onResolve={onResolve} isResolved={isResolved} />}
            {(module.type === 'IMAGE' || module.type === 'VIDEO' || module.type === 'AUDIO') && <MediaModule module={module} />}
            {module.type === 'AR_RECOGNIZE' && <ARTaskAnswer module={module} onResolve={onResolve} />}
            {module.type === 'PUZZLE_PASSWORD_LOCK' && <PasswordLockModule module={module} onResolve={onResolve} />}
            {module.type === 'PUZZLE_RHYTHM' && <RhythmModule module={module} onResolve={onResolve} />}
            {module.type === 'PUZZLE_PATTERN_LOCK' && <PatternLockModule module={module} onResolve={onResolve} />}
            {module.type === 'PUZZLE_SERIAL_NUMBER' && <SerialNumberModule data={module.data} onComplete={() => onResolve(true)} />}
        </>
    );
    return content;
};
