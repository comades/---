import React, { useState, useEffect } from 'react';
import { Music, Play, Square } from 'lucide-react';

export const RhythmModule = ({ module, onResolve }: any) => {
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { targetScore } = module.data;

    const handleTap = () => {
        if (!isPlaying) return;
        setScore(prev => prev + 1);
    };

    useEffect(() => {
        if (score >= targetScore) {
            setIsPlaying(false);
            onResolve(module.id);
        }
    }, [score, targetScore, module.id, onResolve]);

    return (
        <div className="flex flex-col items-center p-6 bg-[#0F1115] rounded-2xl border border-[#D4AF37]/20 shadow-xl">
            <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                <Music size={24} />
                <h3 className="font-bold tracking-widest uppercase">節奏挑戰</h3>
            </div>

            <div className="text-4xl font-bold text-[#D4AF37] mb-8">
                {score} / {targetScore}
            </div>

            <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500' : 'bg-[#D4AF37]'}`}
            >
                {isPlaying ? <Square size={40} className="text-white" /> : <Play size={40} className="text-[#0F1115]" />}
            </button>

            {isPlaying && (
                <button 
                    onClick={handleTap}
                    className="mt-8 w-full py-6 bg-[#1A1C23] border border-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37]/10 transition-colors"
                >
                    點擊節奏！
                </button>
            )}
        </div>
    );
};
