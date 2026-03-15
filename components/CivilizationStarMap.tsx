import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Flame, Star, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

interface CityNode {
    id: string;
    x: number;
    y: number;
    name: string;
    fires: number;
    size: number;
}

interface Connection {
    source: string;
    target: string;
    strength: number;
}

export const CivilizationStarMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stars, setStars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'lit' | 'trails' | 'domains'>('lit');
    const { user } = useAuth();
    const { systemSettings, allUsers } = useGame();

    const myStars = (stars || []).filter(s => s.userId === user?.id);
    const myStarCount = myStars.length;

    const domains = systemSettings?.starSectors || [
        { id: 'central', name: '中原星域', requiredPoints: 10, color: '#FFD700' },
        { id: 'south', name: '江南星域', requiredPoints: 20, color: '#4ade80' },
        { id: 'north', name: '西北星域', requiredPoints: 30, color: '#f87171' },
        { id: 'west', name: '西南星域', requiredPoints: 40, color: '#c084fc' },
        { id: 'east', name: '嶺南星域', requiredPoints: 50, color: '#60a5fa' },
        { id: 'southwest', name: '東北星域', requiredPoints: 60, color: '#f472b6' }
    ];

    const getProfessionColor = (profession?: string) => {
        switch (profession) {
            case '星圖學者': return '#60a5fa'; // Blue
            case '城火守望者': return '#f87171'; // Red
            case '文明記錄者': return '#4ade80'; // Green
            case '星途引路人': return '#c084fc'; // Purple
            default: return '#D4AF37'; // Gold
        }
    };

    const getProfessionShape = (profession?: string) => {
        switch (profession) {
            case '星圖學者': return 'rounded-sm rotate-45'; // Diamond
            case '城火守望者': return 'rounded-sm'; // Square
            case '文明記錄者': return 'rounded-full'; // Circle
            case '星途引路人': return 'rounded-full border-2 border-white/50'; // Hollow Circle
            default: return 'rounded-full'; // Circle
        }
    };

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const res = await fetch(window.location.origin + '/api/v1/stars');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const text = await res.text();
                console.log("Response text:", text);
                const data = JSON.parse(text);
                setStars(data);
            } catch (e) {
                console.error("Failed to fetch stars:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStars();
    }, []);

    // Simple projection: Map Lat/Lng to X/Y
    // Lat: -90 to 90 -> Y: 100% to 0%
    // Lng: -180 to 180 -> X: 0% to 100%
    const project = (lat: number, lng: number) => {
        const x = ((lng + 180) / 360) * 100;
        const y = (1 - (lat + 90) / 180) * 100;
        return { x: `${x}%`, y: `${y}%` };
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#0B0D12] overflow-hidden font-sans">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1c23] via-[#0B0D12] to-[#0B0D12]"></div>
            
            {/* Starry Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 text-[#D4AF37]/70 hover:text-[#FFD700] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm tracking-widest uppercase font-bold">返回</span>
                </button>
                
                <div className="text-right">
                    <h1 className="text-[#FFD700] text-2xl font-bold tracking-[0.3em] mb-2" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                        文明星圖
                    </h1>
                    <div className="flex justify-end gap-4 mt-4">
                        <button 
                            onClick={() => setActiveView('lit')}
                            className={`text-[10px] tracking-widest uppercase font-bold transition-all ${activeView === 'lit' ? 'text-[#FFD700] border-b border-[#FFD700]' : 'text-[#D4AF37]/40 hover:text-[#D4AF37]'}`}
                        >
                            點亮文明
                        </button>
                        <button 
                            onClick={() => setActiveView('trails')}
                            className={`text-[10px] tracking-widest uppercase font-bold transition-all ${activeView === 'trails' ? 'text-[#FFD700] border-b border-[#FFD700]' : 'text-[#D4AF37]/40 hover:text-[#D4AF37]'}`}
                        >
                            我的星跡
                        </button>
                        <button 
                            onClick={() => setActiveView('domains')}
                            className={`text-[10px] tracking-widest uppercase font-bold transition-all ${activeView === 'domains' ? 'text-[#FFD700] border-b border-[#FFD700]' : 'text-[#D4AF37]/40 hover:text-[#D4AF37]'}`}
                        >
                            星域覺醒
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="absolute inset-0 flex items-center justify-center p-10 mt-10">
                <div className="relative w-full h-full max-w-5xl max-h-[70vh] border border-[#D4AF37]/10 rounded-3xl overflow-hidden bg-black/20 backdrop-blur-sm">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        {[...Array(10)].map((_, i) => (
                            <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-[#D4AF37]" style={{ left: `${(i + 1) * 10}%` }}></div>
                        ))}
                        {[...Array(10)].map((_, i) => (
                            <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-[#D4AF37]" style={{ top: `${(i + 1) * 10}%` }}></div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0">
                            {activeView === 'domains' ? (
                                <div className="absolute inset-0 flex items-center justify-center p-8 overflow-y-auto">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                                        {domains.map((domain: any) => {
                                            const threshold = domain.requiredPoints || 0;
                                            const userPoints = user?.points || 0;
                                            const progress = Math.min(100, threshold > 0 ? (userPoints / threshold) * 100 : 100);
                                            const isAwakened = userPoints >= threshold;

                                            return (
                                                <div key={domain.id} className={`bg-white/5 border ${isAwakened ? 'border-[#FFD700]/40 shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-[#D4AF37]/20'} rounded-2xl p-6 flex flex-col items-center justify-center text-center group hover:bg-[#D4AF37]/10 transition-all cursor-pointer`}>
                                                    <div className={`w-12 h-12 rounded-full ${isAwakened ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-white/5 text-[#D4AF37]/40'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`} style={isAwakened ? { backgroundColor: `${domain.color}33`, color: domain.color } : {}}>
                                                        {isAwakened ? <Star size={24} color={domain.color} /> : <Lock size={20} />}
                                                    </div>
                                                    <h4 className={`font-bold tracking-widest mb-2 ${isAwakened ? 'text-[#FFD700]' : 'text-slate-400'}`} style={isAwakened ? { color: domain.color } : {}}>{domain.name}</h4>
                                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            className={`h-full ${isAwakened ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]' : 'bg-slate-600'}`}
                                                            style={isAwakened ? { background: `linear-gradient(to right, ${domain.color}88, ${domain.color})` } : {}}
                                                        ></motion.div>
                                                    </div>
                                                    <p className="text-[#D4AF37]/60 text-[10px] uppercase tracking-tighter">
                                                        {isAwakened ? '星域已覺醒' : `覺醒進度: ${userPoints}/${threshold} 積分`}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                stars.filter(s => activeView === 'lit' || s.userId === user?.id).map((star, idx) => {
                                    const { x, y } = project(star.lat, star.lng);
                                    const isMine = star.userId === user?.id;
                                    const starUser = allUsers.find(u => u.id === star.userId);
                                    const professionColor = getProfessionColor(starUser?.profession);
                                    const professionShape = getProfessionShape(starUser?.profession);
                                    
                                    return (
                                        <motion.div
                                            key={star.id || idx}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.01 }}
                                            className="absolute group"
                                            style={{ left: x, top: y }}
                                        >
                                            <div className={`relative -translate-x-1/2 -translate-y-1/2`}>
                                                {/* Glow */}
                                                <div className={`absolute inset-0 blur-md rounded-full ${isMine ? 'scale-150' : 'opacity-40'} animate-pulse`} style={{ backgroundColor: professionColor }}></div>
                                                
                                                {/* Star */}
                                                <div className={`w-2 h-2 relative z-10 ${professionShape} ${isMine ? 'shadow-[0_0_15px_rgba(255,255,255,0.8)]' : ''}`} style={{ backgroundColor: professionColor }}></div>
                                                
                                                {/* Label on Hover */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                    <div className="bg-black/80 backdrop-blur-md border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                                        <p className="text-[#FFD700] text-[10px] font-bold tracking-widest uppercase mb-0.5">{star.city}</p>
                                                        <p className="text-white/40 text-[8px] font-mono">{star.lat.toFixed(2)}, {star.lng.toFixed(2)}</p>
                                                        {starUser?.profession && <p className="text-[8px] mt-1 font-bold" style={{ color: professionColor }}>{starUser.profession}</p>}
                                                        {isMine && <p className="text-[#D4AF37] text-[8px] mt-1 font-bold">這是你點亮的星</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-10 left-10 z-10 flex gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-[#D4AF37]/50 text-[10px] tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                        <Star size={12} /> 已點亮文明
                    </div>
                    <div className="text-[#FFD700] text-3xl font-light tracking-wider font-mono">
                        {stars.length}
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-[#D4AF37]/50 text-[10px] tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                        <Flame size={12} /> 我的星跡
                    </div>
                    <div className="text-[#FFD700] text-3xl font-light tracking-wider font-mono">
                        {(stars || []).filter(s => s.userId === user?.id).length}
                    </div>
                </motion.div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-10 right-10 z-10 text-right">
                <p className="text-[#D4AF37]/40 text-[10px] tracking-widest uppercase italic max-w-xs">
                    「每一顆閃耀的星，都是一段被喚醒的文明記憶。」
                </p>
            </div>
        </div>
    );
};
