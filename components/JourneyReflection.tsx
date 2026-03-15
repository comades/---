import React, { useEffect, useState, useRef } from 'react';
import { GameStats } from '../types';
import { determineArchetype, calculateRadarData, ExplorationArchetype, RadarData } from '../utils/explorationArchetypes';
import { generateJourneyReflection, getCityCoordinates } from '../services/geminiService';
import { Button } from './Button';
import { MatchstickRitual } from './MatchstickRitual';
import { Home, RefreshCw, Star, Flame, Share2, Download, Loader2, Camera } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';

interface JourneyReflectionProps {
    gameTitle: string;
    stats: GameStats;
    onRestart: () => void;
    onExit: () => void;
    onReview: () => void;
}

export const JourneyReflection: React.FC<JourneyReflectionProps> = ({ gameTitle, stats, onRestart, onExit, onReview }) => {
    const [archetype, setArchetype] = useState<ExplorationArchetype | null>(null);
    const [radarData, setRadarData] = useState<RadarData[]>([]);
    const [reflection, setReflection] = useState<{ title: string, narrative: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFireLit, setIsFireLit] = useState(false);
    const [litCount, setLitCount] = useState<number | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    
    const captureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLitCount = async () => {
            try {
                const res = await fetch('/api/stats/lit');
                const data = await res.json();
                setLitCount(data.litCount);
            } catch (e) {
                setLitCount(1234);
            }
        };

        const loadReflection = async () => {
            const selectedArchetype = determineArchetype(stats);
            setArchetype(selectedArchetype);
            setRadarData(calculateRadarData(stats));

            // If stats are empty (e.g. immediate finish), provide defaults to avoid API errors or weird output
            const safeStats = {
                ...stats,
                interactionCount: Math.max(stats.interactionCount, 1),
                hintCount: Math.max(stats.hintCount, 0),
                puzzleFailures: Math.max(stats.puzzleFailures, 0),
                visitedSceneCount: Math.max(stats.visitedSceneCount, 1),
                totalSceneCount: Math.max(stats.totalSceneCount, 1)
            };

            const result = await generateJourneyReflection(
                gameTitle, 
                [selectedArchetype.name], 
                safeStats
            );
            setReflection(result);
            setLoading(false);
        };

        fetchLitCount();
        loadReflection();
    }, [gameTitle, stats]);

    const handleFireLit = async () => {
        setIsFireLit(true);
        try {
            // Get city coordinates for the star map
            const coords = await getCityCoordinates(gameTitle);
            
            const res = await fetch('/api/stats/lit/increment', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city: gameTitle,
                    lat: coords.lat,
                    lng: coords.lng,
                    userId: 'user_' + Math.random().toString(36).substr(2, 5) // Mock user ID for now
                })
            });
            const data = await res.json();
            setLitCount(data.litCount);
        } catch (e) {
            console.error("Failed to record lit fire:", e);
            setLitCount(prev => prev ? prev + 1 : 1235);
        }
    };

    const handleCapture = async () => {
        if (!captureRef.current) return;
        setIsCapturing(true);
        try {
            // Give a tiny delay for any animations to settle
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(captureRef.current, {
                backgroundColor: '#0F1115',
                scale: 2, // Higher quality
                logging: false,
                useCORS: true,
            });
            
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `city-fire-reflection-${Date.now()}.png`;
            link.click();
        } catch (error) {
            console.error('Capture failed:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white space-y-6 animate-pulse bg-black/90 absolute inset-0 z-50">
                <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#D4AF37] tracking-[0.3em] text-sm uppercase font-bold">正在讀取城市回聲...</p>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center pt-[13px] px-4 pb-10 overflow-y-auto animate-in fade-in duration-1000">
            <AnimatePresence>
                {!isFireLit && (
                    <MatchstickRitual onComplete={handleFireLit} />
                )}
            </AnimatePresence>

            <div className="max-w-md w-full relative flex flex-col">
                <AnimatePresence>
                    {isFireLit && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div 
                                ref={captureRef}
                                className="bg-[#0F1115] border border-[#D4AF37]/30 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center w-full" 
                                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/5 to-transparent pointer-events-none"></div>
                                
                                <div className="mb-6 text-center">
                                    <h3 className="text-[#D4AF37]/60 text-xs tracking-[0.4em] uppercase mb-2">城市探索檔案</h3>
                                    <h2 className="text-[#D4AF37] text-2xl font-bold tracking-[0.3em] uppercase drop-shadow-lg" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                                        {archetype?.name}
                                    </h2>
                                    <p className="text-[#D4AF37]/80 text-xs mt-2 italic tracking-widest">{reflection?.title}</p>
                                </div>

                                <motion.div 
                                    key="profile"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="w-full flex flex-col items-center"
                                >
                                    {/* Radar Chart */}
                                    <div className="w-full h-56 mb-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                <PolarGrid stroke="#D4AF37" strokeOpacity={0.2} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#D4AF37', fontSize: 10, opacity: 0.6 }} />
                                                <Radar
                                                    name="探索能力"
                                                    dataKey="value"
                                                    stroke="#D4AF37"
                                                    fill="#D4AF37"
                                                    fillOpacity={0.4}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                                        {archetype?.tags.map((tag, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-widest uppercase rounded-full shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="w-12 h-[1px] bg-[#D4AF37]/30 mx-auto mb-6"></div>

                                    <p className="text-slate-300 leading-relaxed text-sm tracking-wide mb-8 font-light text-justify px-2" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                                        {reflection?.narrative}
                                    </p>

                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
                                        <p className="text-[#D4AF37] text-[10px] tracking-[0.2em] font-bold uppercase">城市之火已點燃</p>
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
                                    </div>

                                    <div className="text-center mb-8">
                                        <p className="text-[#D4AF37]/80 text-xs tracking-widest mb-1">你是第</p>
                                        <p className="text-[#D4AF37] text-3xl font-bold tracking-tighter mb-1">
                                            {litCount?.toLocaleString() || '...'}
                                        </p>
                                        <p className="text-[#D4AF37]/80 text-xs tracking-widest">位點亮「{gameTitle}」的探索者</p>
                                    </div>

                                    <p className="text-[#D4AF37]/60 text-[10px] tracking-[0.2em] mb-10 italic text-center">
                                        「每一位探索者，都會在城市留下不同的回聲。」
                                    </p>
                                </motion.div>
                            </div>

                            {/* Actions - Outside the capture area */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 space-y-3 w-full"
                            >
                                <div className="grid grid-cols-1 gap-3">
                                    <Button 
                                        variant="neo-chinese" 
                                        onClick={handleCapture}
                                        disabled={isCapturing}
                                        className="py-3 text-sm flex items-center justify-center gap-2"
                                    >
                                        {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                        保存回憶卡
                                    </Button>
                                </div>

                                <div className="w-full h-[1px] bg-[#D4AF37]/20 my-4"></div>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <Button variant="outline" onClick={onReview} className="py-3 text-sm border-slate-800 text-slate-500 hover:bg-slate-900 w-full">
                                        <Star size={16} className="mr-2" /> 評價旅程
                                    </Button>
                                    <Button variant="outline" onClick={onExit} className="py-3 text-sm border-slate-800 text-slate-500 hover:bg-slate-900 w-full">
                                        <Home size={16} className="mr-2" /> 返回大廳
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
