
import React, { useState, useEffect, useRef } from 'react';
import { GameModule } from '../types';
import { Button } from './Button';
import { ArrowLeft, RefreshCw, Home, Trophy, Scan, X, CheckCircle, Camera, Loader2, Image as ImageIcon, Video, Mic, MessageSquare, AlertCircle, Eye, MapPin, Lock, HelpCircle, Send, Play, Pause, ChevronRight, Unlock, XCircle, Shuffle, ChevronUp, ChevronDown, Puzzle, Upload, RefreshCcw, Check, Lightbulb, Clock, Triangle, Volume2, Edit, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';

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

export const FeedbackModal = ({ isCorrect, data, onClose }: { isCorrect: boolean, data: any, onClose: () => void }) => {
    const title = isCorrect ? (data.correctFeedbackTitle || "回答正確！") : (data.incorrectFeedbackTitle || "答案錯誤");
    const text = isCorrect ? (data.correctFeedbackContent || "恭喜你答對了！") : (data.incorrectFeedbackContent || "答案不正確，請再試一次。");
    const image = isCorrect ? data.correctFeedbackImage : data.incorrectFeedbackImage;
    const color = isCorrect ? "text-green-600" : "text-red-500";
    const icon = isCorrect ? <CheckCircle size={48} className="text-green-500" /> : <XCircle size={48} className="text-red-500" />;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300 p-6">
            <div className="relative p-[1px] bg-gradient-to-b from-[#8A7339]/50 via-[#3A3220]/30 to-[#8A7339]/40 shadow-2xl w-full max-w-sm" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                <div className="relative bg-[#0F1115] p-8 text-center" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                    {/* Textured stone overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2A2D35] to-[#0F1115] pointer-events-none"></div>
                    
                    {/* Warm ember glow at the bottom */}
                    <div className="absolute -bottom-16 left-1/2 h-32 w-4/5 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-center mb-6">
                            {icon}
                        </div>
                        <h3 className={`text-2xl font-black mb-3 tracking-[0.2em] uppercase ${isCorrect ? 'text-[#D4AF37]' : 'text-red-400'}`} style={{ fontFamily: '"Noto Serif TC", serif' }}>{title}</h3>
                        <p className="text-slate-300 mb-8 whitespace-pre-wrap leading-relaxed">{text}</p>
                        {image && (
                            <div className="mb-8 p-1 bg-[#D4AF37]/20 rounded-xl overflow-hidden border border-[#D4AF37]/10">
                                <img src={image} className="w-full h-40 object-cover" alt="Feedback" />
                            </div>
                        )}
                        <Button onClick={onClose} variant="neo-chinese" className="w-full py-4 text-sm">
                            {isCorrect ? '繼續前行' : '重新嘗試'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HintModal = ({ hints, onClose, baseTime }: { hints: any[], onClose: () => void, baseTime: number }) => {
    const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

    const handleHintClick = (index: number, delaySeconds: number | string) => {
        const delay = typeof delaySeconds === 'string' ? parseInt(delaySeconds) : delaySeconds;
        
        const now = Date.now();
        const elapsedSeconds = (now - baseTime) / 1000;
        const remaining = delay - elapsedSeconds;

        if (remaining > 0) {
            alert(`此提示尚未解鎖！\n還剩 ${Math.ceil(remaining)} 秒。`);
        } else {
             if (!revealedIndices.includes(index)) {
                setRevealedIndices([...revealedIndices, index]);
             }
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative p-[1px] bg-gradient-to-b from-[#8A7339]/50 via-[#3A3220]/30 to-[#8A7339]/40 shadow-2xl w-full max-w-sm" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                <div className="relative bg-[#0F1115] p-8 flex flex-col max-h-[80vh]" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                    {/* Textured stone overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2A2D35] to-[#0F1115] pointer-events-none"></div>
                    
                    <button onClick={onClose} className="absolute top-6 right-6 text-[#D4AF37]/50 hover:text-[#D4AF37] p-2 bg-white/5 rounded-full transition-all z-20">
                        <X size={20} />
                    </button>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 text-[#D4AF37] font-bold text-xl px-2 tracking-[0.2em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                            <Lightbulb size={24} className="fill-[#D4AF37]/20" />
                            <h3>機密提示</h3>
                        </div>
                        
                        <div className="space-y-4 overflow-y-auto px-2 pb-4 scrollbar-hide">
                            {hints.map((hint, idx) => {
                                const isRevealed = revealedIndices.includes(idx);
                                const delay = hint.delay || 0;
                                
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
                                                {isRevealed ? "已解密" : "點擊解密"}
                                            </div>
                                            {!isRevealed && (
                                                <div className="flex items-center text-[10px] text-[#D4AF37]/60 bg-white/5 px-3 py-1 rounded-full border border-[#D4AF37]/10">
                                                    <Clock size={12} className="mr-2" /> {delay}s
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isRevealed ? (
                                            <div className="text-sm leading-relaxed mt-3 animate-in fade-in duration-500 font-medium tracking-wide relative z-10">
                                                {hint.text}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4 relative z-10">
                                                <Lock size={24} className="opacity-20 text-[#D4AF37]" />
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
        </div>
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
            setSelectedIndices(selectedIndices.filter(i => i !== idx));
        } else {
            setSelectedIndices([...selectedIndices, idx]);
        }
    };

    const handleCheck = () => {
        if (selectedIndices.length === 0) return alert("請至少選擇一個選項");
        const options = module.data.options || [];
        const correctIndices = options.map((o: any, i: number) => o.isCorrect ? i : -1).filter((i: number) => i !== -1);
        
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
    const length = parseInt(module.data.length) || 4;
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
    
    const [slots, setSlots] = useState<number[]>(new Array(length).fill(0));

    const cycleSlot = (slotIdx: number) => {
        if (images.length === 0) return;
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
            <div className="flex gap-3 mb-8 p-4 bg-[#0F1115] border border-[#D4AF37]/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-x-auto max-w-full scrollbar-hide" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                {slots.map((currentImgIdx, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div 
                            className="w-20 h-28 bg-[#1A1C23] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden cursor-pointer active:scale-95 transition-all group"
                            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                            onClick={() => cycleSlot(i)}
                        >
                             <div className="absolute inset-0 flex flex-col transition-all duration-500 group-hover:brightness-125">
                                 <img src={images[currentImgIdx]} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                             <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]/30"></div>
                        </div>
                        <div className="mt-2 text-[8px] text-[#D4AF37]/40 uppercase tracking-widest font-bold">圖騰 {i+1}</div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-500 mb-6 tracking-widest uppercase">點擊圖騰以切換排列</p>
            <Button onClick={handleUnlock} variant="neo-chinese" className="w-full py-4 text-lg">
                <Unlock className="mr-3" /> 開啟秘寶
            </Button>
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
                        <img src={preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
             setTimeout(() => validateAnswer(transcript), 500); 
        } else if (isListening) {
             setIsListening(false);
             const mockText = "芝麻開門";
             setTranscript(mockText);
             validateAnswer(mockText);
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
                 <div className="mt-6 p-4 bg-[#0F1115] border border-[#D4AF37]/20 text-center w-full" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                     <p className="text-[10px] text-[#D4AF37]/40 mb-2 tracking-widest uppercase">辨識結果:</p>
                     <p className="text-[#D4AF37] font-bold tracking-wide">"{transcript}"</p>
                 </div>
             )}
        </div>
    );
};

export const ARTaskAnswer = ({ module, onResolve }: any) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanState, setScanState] = useState<'scanning' | 'success'>('scanning');
    const videoRef = useRef<HTMLVideoElement>(null);

    const startScan = async () => {
        setIsScanning(true);
        setScanState('scanning');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("無法存取相機，請確認權限。");
        }
        
        setTimeout(() => {
            setScanState('success');
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            setTimeout(() => {
                setIsScanning(false);
                onResolve(true);
            }, 3000);
        }, 3000);
    };

    const stopScan = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsScanning(false);
    };

    if (isScanning) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0F1115] flex flex-col items-center">
                 <div className="absolute inset-0">
                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60 grayscale-[0.5] contrast-125" />
                     <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                 </div>
                 
                 {scanState === 'scanning' ? (
                     <>
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
                        <div className="absolute bottom-24 bg-[#0F1115]/80 px-8 py-4 border border-[#D4AF37]/30 text-[#D4AF37] font-bold backdrop-blur-md tracking-[0.3em] uppercase text-sm" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                            尋找目標: {module.data.hintName || "掃描目標物"}
                        </div>
                     </>
                 ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-[#0F1115]/90 animate-in fade-in duration-700 backdrop-blur-sm">
                         <div className="flex flex-col items-center">
                             <div className="w-72 h-72 relative mb-8 p-1 bg-gradient-to-b from-[#D4AF37] to-transparent" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                                 {module.data.successImage ? (
                                    <img src={module.data.successImage} className="w-full h-full object-cover" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }} />
                                 ) : (
                                     <div className="w-full h-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/40" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                                         <CheckCircle size={80} className="text-[#D4AF37] opacity-80" />
                                     </div>
                                 )}
                             </div>
                             <h3 className="text-3xl font-black text-[#D4AF37] mb-3 tracking-[0.3em] uppercase" style={{ fontFamily: '"Noto Serif TC", serif' }}>辨識成功</h3>
                             <p className="text-slate-300 text-sm tracking-widest">{module.data.hintContent || "目標已確認"}</p>
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

    const handleDrop = (e: React.DragEvent, targetPos: number) => {
        e.preventDefault();
        const sourcePos = parseInt(e.dataTransfer.getData("text/plain"));
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

    return (
        <div className="flex flex-col items-center">
            <div 
                className="grid gap-1 bg-[#0F1115] border border-[#D4AF37]/30 p-1 mb-6 shadow-2xl"
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    width: '300px',
                    height: '300px',
                    clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
                }}
            >
                {Array.from({ length: gridSize * gridSize }).map((_, slotIdx) => {
                    const tile = tiles.find(t => t.currentPos === slotIdx);
                    if (!tile) return <div key={slotIdx}></div>;

                    const row = Math.floor(tile.correctPos / gridSize);
                    const col = tile.correctPos % gridSize;
                    const percentX = (col / (gridSize - 1)) * 100;
                    const percentY = (row / (gridSize - 1)) * 100;

                    return (
                        <div
                            key={tile.id}
                            draggable={!isComplete}
                            onDragStart={(e) => handleDragStart(e, slotIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, slotIdx)}
                            className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 ${isComplete ? 'border-none' : 'border border-[#D4AF37]/20 hover:border-[#D4AF37]/60'}`}
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

const NeoChineseContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative mb-6 p-[1px] bg-gradient-to-b from-[#8A7339]/50 via-[#3A3220]/30 to-[#8A7339]/40 shadow-2xl ${className}`} style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
        <div className="relative bg-[#0F1115] p-6" style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
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

export const AnswerModuleWrapper = ({ module, onResolve, isResolved }: any) => {
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastResult, setLastResult] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [startTime] = useState(Date.now());

    const hasHints = module.data.hints && module.data.hints.length > 0;

    const handleResolve = (result: boolean) => {
        setLastResult(result);
        setShowFeedback(true);
    };

    const handleFeedbackClose = () => {
        setShowFeedback(false);
        if (lastResult) {
            onResolve(module.id);
        }
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
        <NeoChineseContainer>
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
                {module.type === 'ANS_TEXT' && <TextAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_SINGLE' && <SingleChoiceAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_MULTI' && <MultiChoiceAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_NUMBER' && <NumberLockAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_IMAGE' && <ImageLockAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_PHOTO' && <PhotoTaskAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_VOICE' && <VoiceAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'ANS_AR' && <ARTaskAnswer module={module} onResolve={handleResolve} />}
                {module.type === 'PUZZLE_JIGSAW' && <JigsawPuzzleAnswer module={module} onResolve={handleResolve} />}
            </div>

            {showFeedback && (
                <FeedbackModal 
                    isCorrect={lastResult} 
                    data={module.data} 
                    onClose={handleFeedbackClose} 
                />
            )}

            {showHint && (
                <HintModal 
                    hints={module.data.hints} 
                    baseTime={startTime}
                    onClose={() => setShowHint(false)} 
                />
            )}
        </NeoChineseContainer>
    );
};

export const LocationModule = ({ module, onResolve }: any) => (
    <NeoChineseContainer>
        <div className="flex items-center gap-3 text-[#D4AF37]">
            <MapPin size={22} className="drop-shadow-md opacity-90" />
            <div className="text-lg font-medium tracking-widest" style={{ fontFamily: '"Noto Serif TC", serif' }}>{module.data.actionText || "前往指定地點"}</div>
        </div>
        
        <div className="mt-3 text-sm text-[#8A8D95] font-mono tracking-wider pl-9 opacity-80">
            {module.data.location}
        </div>
        
        <Button 
            onClick={() => onResolve(module.id)} 
            variant="neo-chinese"
            className="mt-8 w-full py-4 text-sm tracking-[0.3em]"
        >
            打卡確認
        </Button>
    </NeoChineseContainer>
);

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
    if (module.type === 'IMAGE') {
        return (
            <NeoChineseContainer className="!p-1">
                <img src={module.data.url || module.data.file} className="w-full h-auto" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} alt="Scene Asset" />
            </NeoChineseContainer>
        );
    }
    if (module.type === 'VIDEO') {
        return (
             <NeoChineseContainer className="!p-1 bg-black">
                 <video controls src={module.data.url || module.data.file} className="w-full h-auto" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} />
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
                    <audio controls controlsList="nodownload" src={module.data.file || module.data.url} className="flex-1 h-8 bg-transparent" style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(10deg)' }} />
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
                     <img src={module.data.image} className="w-full h-auto object-cover" alt="Illustration" />
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

    const replayAudio = (audioUrl: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(err => console.log("Replay blocked", err));
        }
    };

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
            <div className="w-full max-w-md mx-auto relative z-20 flex flex-col flex-1 bg-transparent" onClick={handleNext}>
                <audio ref={audioRef} className="hidden" />
                <audio ref={bgmRef} className="hidden" />
                <audio ref={sfxRef} className="hidden" />
                <div className="flex-1 overflow-y-auto space-y-6 pb-24 pt-6 px-4 scrollbar-hide">
                     {lines.slice(0, currentLineIdx + 1).map((line: any, idx: number) => {
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

                         return (
                             <div key={idx} className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isPlayer ? 'flex-row-reverse' : ''}`}>
                                 <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-[#1A1C23] border border-[#D4AF37]/30 shadow-lg relative" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                                     {isPlayer ? (
                                         <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.avatarId || 99}`} className="w-full h-full object-cover" />
                                     ) : (
                                         characters?.find((c: any) => c.name === line.char)?.avatarUrl ? (
                                             <img src={characters.find((c: any) => c.name === line.char).avatarUrl} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#3A3220] to-[#0F1115] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                                                {line.char[0]}
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
                                        onClick={(e) => line.audio && replayAudio(line.audio, e)}
                                     >
                                         {hasAudioOnly ? (
                                             <div className="flex items-center gap-3 opacity-90 py-1">
                                                 <div className="flex items-center gap-1">
                                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                         <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                                                         <path d="M9 8a5 5 0 0 1 0 8" />
                                                         <path d="M14 5a9 9 0 0 1 0 14" />
                                                     </svg>
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
                {!isFinished ? (
                    <div className="absolute bottom-6 left-0 right-0 text-center text-[#D4AF37]/40 text-[10px] font-bold tracking-[0.4em] animate-pulse bg-gradient-to-t from-[#0F1115]/20 pt-12 pb-4 pointer-events-none uppercase">
                        點擊螢幕繼續
                    </div>
                ) : (
                    <div className="absolute bottom-10 left-0 right-0 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Button 
                            variant="neo-chinese" 
                            className="w-full py-4 text-sm tracking-[0.3em]"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onResolve && !isResolved) onResolve(module.id);
                            }}
                        >
                            進入下一關
                        </Button>
                    </div>
                )}
            </div>
        );
    } else {
        const line = lines[currentLineIdx];
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
                         <img src={backgroundUrl} className="w-full h-full object-cover" alt="Background" />
                         <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                     </div>
                 )}

                 {/* Character Layer */}
                 {!isPlayer && line.char !== '旁白' && avatarUrl && (
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg h-[90%] pointer-events-none animate-in fade-in slide-in-from-bottom-12 duration-700 flex items-end justify-center">
                         <img 
                            src={avatarUrl} 
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
                                    <div 
                                        className="absolute top-8 right-10 text-[#D4AF37]/60 animate-pulse flex items-center gap-2 cursor-pointer hover:text-[#D4AF37] transition-colors"
                                        onClick={(e) => replayAudio(line.audio, e)}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                                            <path d="M9 8a5 5 0 0 1 0 8" />
                                            <path d="M14 5a9 9 0 0 1 0 14" />
                                        </svg>
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
                                    <div className="absolute bottom-8 right-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <Button 
                                            variant="neo-chinese" 
                                            className="px-8 py-3 text-xs tracking-[0.2em]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onResolve && !isResolved) onResolve(module.id);
                                            }}
                                        >
                                            進入下一關
                                        </Button>
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

export const ModuleRenderer = ({ module, onResolve, isResolved, user, characters }: any) => {
    const content = (
        <>
            {module.type === 'TEXT' && (
                <NeoChineseContainer>
                    <div className="text-lg leading-relaxed tracking-wide text-slate-100" style={{ fontFamily: '"Noto Serif TC", serif' }}>
                        {module.data.text}
                    </div>
                </NeoChineseContainer>
            )}
            {module.type === 'LOCATION' && <LocationModule module={module} onResolve={onResolve}/>}
            {(module.type.startsWith('ANS_') || module.type === 'PUZZLE_JIGSAW') && <AnswerModuleWrapper module={module} onResolve={onResolve} isResolved={isResolved}/>}
            {module.type === 'HINT' && <HintModule module={module} />}
            {module.type === 'STORY_NARRATION' && <NarrationModule module={module} />}
            {module.type === 'STORY_DIALOGUE' && <DialogueModule module={module} user={user} characters={characters} onResolve={onResolve} isResolved={isResolved} />}
            {(module.type === 'IMAGE' || module.type === 'VIDEO' || module.type === 'AUDIO') && <MediaModule module={module} />}
            {module.type === 'AR_RECOGNIZE' && <ARTaskAnswer module={module} onResolve={onResolve} />}
        </>
    );
    return content;
};
