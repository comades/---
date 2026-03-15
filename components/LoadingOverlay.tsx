import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const LoadingOverlay = ({ message = "載入中...", subMessage }: { message?: string, subMessage?: string }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                <div className="relative bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl">
                    <Loader2 size={48} className="text-indigo-500 animate-spin" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Sparkles size={24} className="text-white/80 animate-pulse" />
                    </div>
                </div>
            </div>
            <h2 className="text-2xl font-bold tracking-widest mb-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {message}
            </h2>
            {subMessage && (
                <p className="text-slate-500 text-sm tracking-wide animate-pulse">{subMessage}</p>
            )}
            
            <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-1/2 animate-[shimmer_1.5s_infinite] rounded-full" style={{
                    animation: 'shimmer 1.5s infinite linear',
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                }}></div>
            </div>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};
