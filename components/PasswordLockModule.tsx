import React, { useState } from 'react';
import { Button } from './Button';
import { Lock, Unlock } from 'lucide-react';

export const PasswordLockModule = ({ module, onResolve }: any) => {
    const [input, setInput] = useState('');
    const [isWrong, setIsWrong] = useState(false);
    const { answer, hint } = module.data;

    const handleDigit = (digit: string) => {
        if (input.length < 4) {
            setInput(prev => prev + digit);
        }
    };

    const handleBackspace = () => {
        setInput(prev => prev.slice(0, -1));
    };

    const handleConfirm = () => {
        if (input === answer) {
            onResolve(module.id);
        } else {
            setIsWrong(true);
            setInput('');
            setTimeout(() => setIsWrong(false), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-[#0F1115] rounded-2xl border border-[#D4AF37]/20 shadow-xl">
            <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                <Lock size={24} />
                <h3 className="font-bold tracking-widest uppercase">密碼鎖</h3>
            </div>
            
            <div className={`text-3xl font-mono tracking-[0.5em] mb-8 p-4 bg-black/50 rounded-lg w-full text-center ${isWrong ? 'text-red-500 animate-pulse' : 'text-[#D4AF37]'}`}>
                {input.padEnd(4, '_')}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-[240px] mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                    <button 
                        key={digit}
                        onClick={() => handleDigit(digit.toString())}
                        className="w-16 h-16 rounded-full bg-[#1A1C23] border border-[#D4AF37]/20 text-[#D4AF37] font-bold hover:bg-[#D4AF37]/10 transition-colors"
                    >
                        {digit}
                    </button>
                ))}
                <button onClick={handleBackspace} className="w-16 h-16 rounded-full bg-[#1A1C23] border border-[#D4AF37]/20 text-red-400 font-bold">←</button>
                <button onClick={() => handleDigit('0')} className="w-16 h-16 rounded-full bg-[#1A1C23] border border-[#D4AF37]/20 text-[#D4AF37] font-bold">0</button>
                <button onClick={handleConfirm} className="w-16 h-16 rounded-full bg-[#D4AF37] text-[#0F1115] font-bold">OK</button>
            </div>

            {hint && <p className="text-xs text-[#D4AF37]/60 tracking-widest italic">{hint}</p>}
        </div>
    );
};
