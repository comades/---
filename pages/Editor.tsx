

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ViewProps, Game, Scene, Choice, NodeGroup, GameType, GameModule, ModuleType, Character, GameAsset, GameStatus } from '../types';
import { Button } from '../components/Button';
import { generateGameFromIdea } from '../services/geminiService';
import { Sparkles, Wand2, AlertCircle, Coins, Lock, PenTool, Save, Plus, Trash2, ArrowLeft, Image as ImageIcon, Layout, ArrowRight, ArrowUp, ArrowDown, Edit, Calendar, X, AlertTriangle, MapPin, Globe, Star, Upload, Map as MapIcon, ExternalLink, LogOut, Check, Search, ChevronDown, GitBranch, MousePointer2, Link as LinkIcon, BoxSelect, Settings, GripVertical, MoreHorizontal, Ungroup, Hand, Undo, Redo, Grab, Copy, Scissors, Clipboard, Headphones, FileText, Video, Mic, Scan, Key, Camera, MessageSquare, Lightbulb, MoveUp, MoveDown, HelpCircle, GripHorizontal, UploadCloud, ThumbsUp, ThumbsDown, User, Play, Eye, List, Clock, Smartphone, ChevronRight, XCircle, Puzzle, Triangle, Volume2, PlusCircle, CheckCircle, Circle, Music, Speaker, Minus, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';


type EditorViewMode = 'LIST' | 'SELECT_MODE' | 'AI' | 'MANUAL';
type ToolType = 'POINTER' | 'ADD' | 'CONNECT' | 'GROUP';

interface HistoryState {
  scenes: Scene[];
  groups: NodeGroup[];
}

interface GameInfoData {
  title: string;
  desc: string;
  cover: string;
  tags: string[];
  language: string;
  difficulty: number;
  location: string;
  latitude: string;
  longitude: string;
  type: GameType;
}

import { ModuleRenderer as PlayerModuleRenderer, ARTaskAnswer as ARScanner } from '../components/GamePlayerComponents';

// ... (existing imports)

// ... (keep compressImage and other utils if they are not removed yet, but I moved compressImage to utils.ts. 
// However, Editor.tsx defines it locally. I should probably remove the local definition and import it, 
// OR just leave it to avoid breaking if I didn't update imports everywhere. 
// To be safe, I will leave the local compressImage for now or replace it with import if I am sure.)
// Actually, I'll just leave the local one to minimize diff, or better, use the one from utils to be clean.
import { compressImage } from '../utils/imageUtils';

// ...

const MobileSimulator = ({ scenes, groups, activeSceneId, gameInfo, characters = [], startSceneId }: { scenes: Scene[], groups: NodeGroup[], activeSceneId: string | null, gameInfo: GameInfoData, characters?: Character[], startSceneId?: string }) => {
    const [currentSceneId, setCurrentSceneId] = useState<string | null>(activeSceneId);
    const [history, setHistory] = useState<string[]>([]);
    const [resolvedModules, setResolvedModules] = useState<Set<string>>(new Set());
    
    // Sync with external selection, but only if it changes
    useEffect(() => {
        if (activeSceneId) {
            setCurrentSceneId(activeSceneId);
            setResolvedModules(new Set());
        }
    }, [activeSceneId]);

    const currentScene = scenes.find(s => s.id === currentSceneId);
    
    const handleStart = () => {
        if (startSceneId) {
            setCurrentSceneId(startSceneId);
        } else if (scenes.length > 0) {
            setCurrentSceneId(scenes[0].id);
        }
        setResolvedModules(new Set());
        setHistory([]);
    };
    
    // Mock user for preview
    const mockUser = { name: '預覽玩家', avatarId: 1 };

    const handleNavigate = (nextSceneId: string) => {
        let targetId = nextSceneId;
        
        // Handle Random Group Logic
        if (nextSceneId.startsWith("RANDOM_IN_GROUP_")) {
             const groupId = nextSceneId.split("RANDOM_IN_GROUP_")[1];
             const group = groups.find(g => g.id === groupId);
             if (group) {
                 const randomId = group.sceneIds[Math.floor(Math.random() * group.sceneIds.length)];
                 targetId = randomId;
             }
        } else {
             // Check if target is a group
             const group = groups.find(g => g.id === nextSceneId);
             if (group && group.sceneIds.length > 0) {
                 targetId = group.sceneIds[0];
             }
        }

        if (currentSceneId) setHistory([...history, currentSceneId]);
        setCurrentSceneId(targetId);
        setResolvedModules(new Set());
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentSceneId(prev);
        }
    };

    const handleModuleResolve = (moduleId: string) => {
        setResolvedModules(prev => {
            const newSet = new Set(prev);
            newSet.add(moduleId);
            return newSet;
        });
    };

    // Calculate choices (logic copied from Player.tsx)
    const getAvailableChoices = () => {
        if (!currentScene) return [];
        const choices = [...currentScene.choices];
        const parentGroup = groups.find(g => g.sceneIds.includes(currentScene.id));
        if (parentGroup) {
            if (parentGroup.type === 'ALL') {
                 // Simplified for preview: just show group choices if any
                 if (parentGroup.choices) return [...choices, ...parentGroup.choices];
            } else {
                 if (parentGroup.choices) return [...choices, ...parentGroup.choices];
            }
        }
        return choices;
    };

    const availableChoices = getAvailableChoices();

    return (
        <div className="w-[340px] h-[680px] bg-[#4b5563] rounded-[50px] border-[3px] border-[#374151] shadow-2xl relative overflow-hidden flex flex-col shrink-0 select-none ring-4 ring-slate-200/50">
            <div className="absolute inset-0 rounded-[46px] border-[6px] border-black pointer-events-none z-50"></div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-[28px] w-[100px] bg-black rounded-full z-50 flex items-center justify-center gap-3 transition-all duration-300">
               <div className="w-2 h-2 rounded-full bg-[#1c1c1e]"></div>
            </div>
            <div className="h-10 w-full bg-transparent flex justify-between items-center px-8 pt-3 text-[12px] font-bold text-white z-40">
                <span className="pl-2">9:41</span>
                <div className="flex gap-1.5 items-center pr-2">
                    <div className="w-4 h-2.5 bg-white rounded-[2px]"></div>
                    <div className="w-3 h-2.5 bg-white rounded-[2px] opacity-50"></div>
                    <div className="w-5 h-2.5 border border-white rounded-[3px] relative"><div className="absolute inset-[1px] bg-white rounded-[1px] w-[60%]"></div></div>
                </div>
            </div>
            <div className="flex-1 bg-slate-950 overflow-y-auto scrollbar-hide relative text-white rounded-[44px]">
                {currentScene ? (
                    <>
                       <div className="h-full w-full absolute inset-0 z-0">
                           <img 
                                src={currentScene.imageKeyword ? (currentScene.imageKeyword.startsWith('data:') || currentScene.imageKeyword.startsWith('http') ? currentScene.imageKeyword : `https://picsum.photos/seed/${currentScene.imageKeyword}/600/1200`) : `https://picsum.photos/seed/${currentScene.id}/600/1200`}
                                className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                       </div>
                       <div className="relative z-10 flex flex-col min-h-full">
                           <div className="pt-12 px-4 pb-24 space-y-4 flex-1">
                                <h2 className="text-xl font-bold drop-shadow-lg leading-tight text-center">{currentScene.title}</h2>
                                {(!currentScene.modules || currentScene.modules.length === 0) && (
                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap text-center bg-black/30 p-4 rounded-xl backdrop-blur-md">{currentScene.text || "（此場景尚無文字內容）"}</p>
                                )}
                                {currentScene.modules?.map(m => (
                                    <PlayerModuleRenderer 
                                        key={m.id} 
                                        module={m} 
                                        user={mockUser}
                                        characters={characters} 
                                        onResolve={handleModuleResolve}
                                        isResolved={resolvedModules.has(m.id)}
                                    />
                                ))}
                           </div>
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent pt-12 z-20">
                           <div className="space-y-2.5">
                               {availableChoices.length > 0 ? (
                                   availableChoices.map((c, i) => (
                                       <button 
                                          key={i} 
                                          onClick={(e) => { e.stopPropagation(); handleNavigate(c.nextSceneId); }}
                                          className="w-full py-3 px-4 bg-white/10 backdrop-blur-md active:scale-95 transition-transform rounded-xl text-sm font-bold text-center flex items-center justify-between shadow-lg border border-white/20 hover:bg-white/20"
                                       >
                                           <span>{c.text}</span>
                                           <ChevronRight size={14} className="opacity-70"/>
                                       </button>
                                   ))
                               ) : (
                                   currentScene.isEnding ? (
                                       <div className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-sm font-bold text-center shadow-lg">
                                           結局 / 重新開始
                                       </div>
                                   ) : (
                                       <div className="w-full py-3 px-4 bg-black/50 rounded-xl text-sm font-bold text-center text-slate-400 border border-white/10">
                                           無選項...
                                       </div>
                                   )
                               )}
                           </div>
                       </div>
                       <div className="absolute top-12 left-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur flex items-center justify-center z-30 cursor-pointer" onClick={handleBack}>
                           <ArrowLeft size={16} className="text-white"/>
                       </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col relative">
                        <img 
                            src={gameInfo.cover ? (gameInfo.cover.startsWith('data:') || gameInfo.cover.startsWith('http') ? gameInfo.cover : `https://picsum.photos/seed/${gameInfo.cover}/600/1200`) : `https://picsum.photos/seed/cover/600/1200`}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                        <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-12">
                            <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-bold text-white w-fit mb-3 uppercase tracking-wider shadow-lg">
                                {gameInfo.type === 'guide' ? 'Smart Guide' : 'Adventure'}
                            </span>
                            <h1 className="text-4xl font-black mb-3 text-white drop-shadow-2xl">{gameInfo.title || "未命名遊戲"}</h1>
                            <p className="text-sm text-slate-200 line-clamp-3 mb-8 opacity-90 leading-relaxed">{gameInfo.desc || "暫無簡介..."}</p>
                            <button 
                                onClick={handleStart}
                                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black shadow-xl hover:bg-slate-200 transition-colors active:scale-95 transition-transform"
                            >
                                開始體驗
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full z-50 pointer-events-none"></div>
        </div>
    );
};

const ModuleInput = ({ label, value, field, placeholder, onChange }: { label: React.ReactNode, value: any, field: string, placeholder?: string, onChange: (d: any) => void }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <input 
            type="text" 
            className="w-full p-2 rounded border border-slate-300 text-sm bg-white text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
            value={value || ''} 
            onChange={e => onChange({ [field]: e.target.value })} 
            placeholder={placeholder} 
        />
    </div>
);

const ModuleTextArea = ({ label, value, field, placeholder, onChange }: { label: React.ReactNode, value: any, field: string, placeholder?: string, onChange: (d: any) => void }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <textarea 
            rows={3} 
            className="w-full p-2 rounded border border-slate-300 text-sm resize-none bg-white text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
            value={value || ''} 
            onChange={e => onChange({ [field]: e.target.value })} 
            placeholder={placeholder} 
        />
    </div>
);

const ModuleFileUpload = ({ label, field, data, accept = "image/*", onChange }: { label: React.ReactNode, field: string, data: any, accept?: string, onChange: (d: any) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => { 
        const file = e.target.files?.[0]; 
        if (file) { 
            if (accept.startsWith('image')) {
                try {
                    const result = await compressImage(file);
                    onChange({ [field]: result });
                } catch (error) {
                    console.error("Image upload failed", error);
                    alert("圖片處理失敗，請重試");
                }
            } else {
                if (file.size > 50 * 1024 * 1024) {
                    alert("檔案過大！為確保效能，請上傳小於 50MB 的影片/音訊檔案。");
                    return;
                }
                const reader = new FileReader(); 
                reader.onload = (ev) => {
                    const result = ev.target?.result;
                    if (result) {
                        onChange({ [field]: result });
                    }
                }; 
                reader.readAsDataURL(file); 
            }
        } 
    }; 
    const hasFile = data[field] && (data[field].startsWith('data:') || data[field].startsWith('http')); 
    
    return ( 
        <div className="mb-4"> 
            <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label> 
            <div className={`border-2 border-dashed ${hasFile ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50'} rounded-xl p-4 text-center cursor-pointer overflow-hidden relative group transition-all`} onClick={() => inputRef.current?.click()}> 
                {hasFile ? ( 
                    <> 
                        {accept.startsWith('image') && <img src={data[field]} className="h-32 w-full object-cover mx-auto rounded" />} 
                        {accept.startsWith('video') && <div className="text-indigo-600 font-bold flex flex-col items-center justify-center h-20"><Video className="mb-2"/> 已上傳影片</div>} 
                        {accept.startsWith('audio') && <div className="text-indigo-600 font-bold flex flex-col items-center justify-center h-20"><Mic className="mb-2"/> 已上傳音訊</div>} 
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">點擊更換</div> 
                    </> 
                ) : ( 
                    <> 
                        <Upload size={20} className="mx-auto text-slate-400 mb-2" /> 
                        <span className="text-xs text-slate-500">點擊上傳檔案</span> 
                    </> 
                )} 
            </div> 
            <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={handleFile} /> 
        </div> 
    );
};

const MapPickerModal = ({ isOpen, onClose, onConfirm, initialLocation = '' }: { isOpen: boolean; onClose: () => void; onConfirm: (data: { lat: number, lng: number, address: string }) => void; initialLocation?: string; }) => {
    const [mapSearch, setMapSearch] = useState(initialLocation);
    const [tempCoords, setTempCoords] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        if(isOpen && initialLocation) setMapSearch(initialLocation);
    }, [isOpen, initialLocation]);

    const handleMockMapInteraction = () => {
        const lat = 25.0330 + (Math.random() - 0.5) * 0.01;
        const lng = 121.5654 + (Math.random() - 0.5) * 0.01;
        setTempCoords({ lat, lng });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center"><MapPin className="mr-2 text-orange-500" />地圖位置選擇 (模擬)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"><X size={24} /></button>
                </div>
                <div className="flex-1 relative bg-slate-100 flex flex-col">
                    <div className="absolute top-4 left-4 right-4 z-10 max-w-md bg-white rounded-lg shadow-md flex items-center p-2">
                        <Search className="text-slate-400 ml-2" size={20} />
                        <input type="text" value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} placeholder="搜尋地點..." className="flex-1 p-2 outline-none text-slate-700 bg-white" />
                        <button onClick={handleMockMapInteraction} className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-indigo-700">搜尋</button>
                    </div>
                    <div className="flex-1 bg-[#e4e9ec] relative cursor-crosshair group overflow-hidden" onClick={handleMockMapInteraction} style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>  
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><span className="text-6xl font-black text-slate-400">MAP MOCK</span></div>
                        {tempCoords && (
                            <div className="absolute transform -translate-x-1/2 -translate-y-full" style={{ left: '50%', top: '50%' }}><MapPin size={48} className="text-red-500 fill-red-500 drop-shadow-xl animate-bounce" /></div>
                        )}
                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs text-slate-500 pointer-events-none">點擊地圖任意處以抓取座標</div>
                    </div>
                    <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-800">{mapSearch || '未選擇地點'}</p>
                            <p className="text-xs text-slate-500 font-mono">{tempCoords ? `${tempCoords.lat.toFixed(6)}, ${tempCoords.lng.toFixed(6)}` : '尚未選擇座標'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">取消</button>
                            <button onClick={() => { if(tempCoords) onConfirm({ ...tempCoords, address: mapSearch }) }} disabled={!tempCoords} className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/30 flex items-center"><Check size={18} className="mr-2" />確認座標</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MosaicModal = ({ isOpen, onClose, onConfirm, imageUrl, initialRect }: { isOpen: boolean, onClose: () => void, onConfirm: (rect: { x: number, y: number, w: number, h: number }) => void, imageUrl: string, initialRect?: { x: number, y: number, w: number, h: number } }) => {
    const [rect, setRect] = useState(initialRect || { x: 0, y: 0, w: 0, h: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && initialRect) setRect(initialRect);
        else if (isOpen) setRect({ x: 0, y: 0, w: 0, h: 0 });
    }, [isOpen, initialRect]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const bounds = containerRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        setStartPos({ x, y });
        setRect({ x, y, w: 0, h: 0 });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !containerRef.current) return;
        const bounds = containerRef.current.getBoundingClientRect();
        const currentX = e.clientX - bounds.left;
        const currentY = e.clientY - bounds.top;
        
        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const w = Math.abs(currentX - startPos.x);
        const h = Math.abs(currentY - startPos.y);
        
        setRect({ x, y, w, h });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center"><BoxSelect className="mr-2 text-indigo-500" /> 設定馬賽克區域</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"><X size={24} /></button>
                </div>
                <div className="p-6 bg-slate-100 flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <p className="text-sm text-slate-500 mb-4">請在圖片上拖曳滑鼠，圈選出要打馬賽克的區域。</p>
                    <div 
                        ref={containerRef}
                        className="relative cursor-crosshair select-none bg-black rounded-lg overflow-hidden shadow-lg"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img src={imageUrl} className="max-w-full max-h-[60vh] block pointer-events-none" />
                        {rect.w > 0 && rect.h > 0 && (
                            <div 
                                className="absolute border-2 border-indigo-500 bg-indigo-500/30 backdrop-blur-[8px]"
                                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                            >
                                <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">馬賽克區域</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">取消</button>
                    <button onClick={() => onConfirm(rect)} className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">確認設定</button>
                </div>
            </div>
        </div>
    );
};

const FileTextIcon = () => (
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

const ToolBtn = ({ label, icon: Icon, onClick, color }: any) => ( <button onClick={onClick} className="w-full flex items-center p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"> <div className={`mr-3 p-1.5 rounded-lg bg-slate-50 group-hover:bg-white ${color}`}> <Icon size={16} /> </div> <span className="text-sm font-medium text-slate-700">{label}</span> </button> );
const getModuleName = (type: ModuleType) => { switch(type) { case 'LOCATION': return '📍 關卡位置'; case 'STORY_NARRATION': return '📖 純旁白'; case 'STORY_DIALOGUE': return '💬 角色對話'; case 'TEXT': return '📝 純文字'; case 'IMAGE': return '🖼️ 圖片'; case 'VIDEO': return '🎬 影片'; case 'AUDIO': return '🔊 語音'; case 'AR_RECOGNIZE': return '📷 AR 辨識'; case 'AR_TRANSPARENT': return '👻 AR 透圖'; case 'ANS_TEXT': return '✍️ 文字答題'; case 'ANS_SINGLE': return '🔘 單選題'; case 'ANS_MULTI': return '☑️ 多選題'; case 'ANS_NUMBER': return '🔢 數字鎖密碼'; case 'ANS_IMAGE': return '🖼️ 圖片密碼鎖'; case 'ANS_PHOTO': return '📸 拍照任務'; case 'ANS_VOICE': return '🎤 語音回答'; case 'ANS_AR': return '🧊 AR 答題'; case 'HINT': return '💡 提示系統'; case 'PUZZLE_JIGSAW': return '🧩 拼圖解謎'; default: return '模組'; } };

const AssetPickerModal = ({ isOpen, onClose, onSelect, assets, onDeleteAsset }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void, assets: GameAsset[], onDeleteAsset?: (id: string) => void }) => {
    if (!isOpen) return null;
    const imageAssets = assets.filter(a => a.type === 'image');
    return (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                     <h3 className="font-bold text-lg">選擇場景素材</h3>
                     <div className="flex items-center gap-2">
                         <button onClick={() => onSelect('')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                             取消選取
                         </button>
                         <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                             <X size={20} className="text-slate-400"/>
                         </button>
                     </div>
                 </div>
                 <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
                     {imageAssets.length > 0 ? imageAssets.map(asset => (
                         <div key={asset.id} onClick={() => onSelect(asset.url)} className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-200 transition-all aspect-video bg-slate-100">
                             <img src={asset.url} className="w-full h-full object-cover" />
                             <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">{asset.name}</div>
                             <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                 <CheckCircle className="text-white drop-shadow-md" />
                             </div>
                             {onDeleteAsset && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset.id); }}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20 hover:bg-red-600"
                                    title="刪除素材"
                                >
                                    <Minus size={14} strokeWidth={3} />
                                </button>
                             )}
                         </div>
                     )) : (
                         <div className="col-span-full text-center py-10 text-slate-400 text-sm">暫無圖片素材，請先新增場景素材</div>
                     )}
                 </div>
             </div>
        </div>
    );
};

const ModuleRenderer = ({ module, onChange, onOpenMap, onOpenMosaic, onOpenCharModal, onOpenAssetModal, characters = [], assets = [], onPreviewAR, onEditCharacter, onEditAsset, onDeleteCharacter, onDeleteAsset }: any) => { 
    const { data } = module; 
    const [showAssetPicker, setShowAssetPicker] = useState(false);
    
    // File upload handler for audio in Dialogue
    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, lineIndex: number, type: 'audio' | 'sfx') => {
        const file = e.target.files?.[0];
        if(file) {
             const reader = new FileReader();
             reader.onload = (ev) => {
                 const result = ev.target?.result;
                 if(result) {
                      const newLines = [...(data.lines || [])];
                      if (!newLines[lineIndex]) newLines[lineIndex] = {};
                      newLines[lineIndex][type] = result;
                      onChange({ lines: newLines });
                 }
             };
             reader.readAsDataURL(file);
        }
    }

    const renderFeedbackFields = () => (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h5 className="font-bold text-xs text-slate-500 mb-3 flex items-center"><ThumbsUp size={14} className="mr-1"/> 答題反饋設定</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <span className="text-xs font-bold text-green-600 block border-b border-slate-200 pb-1">答對情境</span>
                    <ModuleInput label="標題" value={data.correctFeedbackTitle} field="correctFeedbackTitle" onChange={onChange} placeholder="例如: 恭喜答對！" />
                    <ModuleTextArea label="內文" value={data.correctFeedbackContent} field="correctFeedbackContent" onChange={onChange} placeholder="詳細說明..." />
                    <ModuleFileUpload label="圖片反饋" field="correctFeedbackImage" data={data} onChange={onChange} />
                </div>
                <div className="space-y-3">
                    <span className="text-xs font-bold text-red-500 block border-b border-slate-200 pb-1">答錯情境</span>
                    <ModuleInput label="標題" value={data.incorrectFeedbackTitle} field="incorrectFeedbackTitle" onChange={onChange} placeholder="例如: 再試一次..." />
                    <ModuleTextArea label="內文" value={data.incorrectFeedbackContent} field="incorrectFeedbackContent" onChange={onChange} placeholder="提示..." />
                    <ModuleFileUpload label="圖片反饋" field="incorrectFeedbackImage" data={data} onChange={onChange} />
                </div>
            </div>
        </div>
    );

    const renderHintFields = () => (
        <div className="mt-4 p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
            <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center"><Lightbulb size={14} className="mr-1 text-yellow-500"/> 提示系統設定</label>
            {(data.hints || []).map((hint: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded mb-2 border border-yellow-200 shadow-sm">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-yellow-700">提示 {idx+1}</span>
                        <button onClick={() => { const newHints = (data.hints || []).filter((_:any, i:number) => i !== idx); onChange({ hints: newHints }); }} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-slate-50 px-2 rounded border border-slate-200">
                            <Clock size={12} className="text-slate-400"/>
                            <input type="number" className="w-12 p-1 bg-transparent text-xs text-slate-600 outline-none text-center" placeholder="60" value={hint.delay} onChange={(e) => { const newHints = [...(data.hints || [])]; newHints[idx].delay = e.target.value; onChange({ hints: newHints }); }} />
                            <span className="text-xs text-slate-400">秒</span>
                        </div>
                        <input className="flex-1 p-1.5 border border-slate-300 rounded text-sm bg-white text-slate-600" placeholder="輸入提示內容..." value={hint.text} onChange={(e) => { const newHints = [...(data.hints || [])]; newHints[idx].text = e.target.value; onChange({ hints: newHints }); }} />
                    </div>
                </div>
            ))}
            <button onClick={() => onChange({ hints: [...(data.hints || []), { text: '', delay: 60 }] })} className="w-full py-2 border-2 border-dashed border-yellow-300 text-yellow-600 rounded-lg text-xs font-bold hover:bg-yellow-50 transition-colors flex items-center justify-center">
                <Plus size={14} className="mr-1"/> 新增提示
            </button>
        </div>
    );

    switch (module.type) {
        case 'LOCATION': return ( 
            <div className="space-y-4 mb-4"> 
                <ModuleInput label="動作提示文字 (預設: 前往指定地點)" value={data.actionText} field="actionText" placeholder="例如: 前往指定地點" onChange={onChange} /> 
                <div> 
                    <label className="block text-xs font-bold text-slate-500 mb-1">地點名稱 / 座標 <span className="text-red-500">*</span></label> 
                    <div className="relative"> 
                        <input type="text" className="w-full p-2 pr-10 rounded border border-slate-300 text-sm bg-white text-slate-600" value={data.location || ''} onChange={e => onChange({ location: e.target.value })} placeholder="例如: 25.0330, 121.5654" /> 
                        <button onClick={onOpenMap} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><MapIcon size={18} /></button> 
                    </div> 
                </div> 
                <div className="border-t border-slate-200 pt-4 mt-4">
                    <h5 className="text-xs font-bold text-slate-500 mb-3 flex items-center"><ImageIcon size={14} className="mr-1"/> 實地驗證設定 (可選)</h5>
                    <ModuleFileUpload label="上傳現場照片 (用於比對或提示)" field="photo" data={data} onChange={onChange} />
                    {data.photo && (
                        <div className="space-y-3">
                            <button 
                                onClick={() => onOpenMosaic(data.photo, data.mosaicRect, (rect: any) => onChange({ mosaicRect: rect }))}
                                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center"
                            >
                                <BoxSelect size={14} className="mr-1"/> {data.mosaicRect ? '編輯馬賽克區域' : '設定馬賽克區域'}
                            </button>
                            {data.mosaicRect && (
                                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
                                    <span>已設定馬賽克區域</span>
                                    <button onClick={() => onChange({ mosaicRect: null })} className="text-red-500 hover:underline">清除</button>
                                </div>
                            )}
                            <ModuleInput label="驗證答案 (玩家需輸入此答案才能過關)" value={data.answer} field="answer" placeholder="例如: 門牌號碼、招牌文字..." onChange={onChange} />
                        </div>
                    )}
                </div>
            </div> 
        );
        case 'STORY_NARRATION': return ( 
            <> 
                <ModuleInput label="標題 (可選)" value={data.title} field="title" onChange={onChange} /> 
                <ModuleTextArea label={<>旁白內容 (純文字、置中) <span className="text-red-500">*</span></>} value={data.content} field="content" onChange={onChange} /> 
                
                {/* Modified Image Upload with Delete Button */}
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">插圖 (可選)</label>
                    {data.image ? (
                        <div className="relative group">
                            <img src={data.image} className="w-full h-32 object-cover rounded border border-slate-200" alt="Preview"/>
                            <button 
                                onClick={() => onChange({ image: '' })}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                title="刪除圖片"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ) : (
                        <ModuleFileUpload label="" field="image" data={data} onChange={onChange} />
                    )}
                </div>
            </> 
        );
        case 'STORY_DIALOGUE': return ( 
            <div className="space-y-4"> 
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2">顯示模式</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`style_${module.id}`} checked={data.style !== 'CHAT'} onChange={() => onChange({ style: 'RPG' })} />
                            <span className="text-sm font-bold text-slate-700">RPG 模式 (復古對話框)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`style_${module.id}`} checked={data.style === 'CHAT'} onChange={() => onChange({ style: 'CHAT' })} />
                            <span className="text-sm font-bold text-slate-700">聊天模式 (WeChat 風格)</span>
                        </label>
                    </div>
                    {data.style !== 'CHAT' && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                             <ModuleFileUpload label="上傳自訂對話框圖片 (RPG模式)" field="dialogueBoxImage" data={data} onChange={onChange} />
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-2">
                    <ModuleFileUpload label="背景音樂 (BGM - 循環播放)" field="bgm" data={data} accept="audio/*" onChange={onChange} />
                </div>

                {/* Character List Manager */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                         <label className="block text-xs font-bold text-slate-500">角色列表</label>
                         <button onClick={onOpenCharModal} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"><PlusCircle size={12} className="mr-1"/>新增角色</button>
                    </div>
                    {characters.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {characters.map((c: Character) => (
                                <div key={c.id} onClick={() => onEditCharacter(c)} className="flex flex-col items-center cursor-pointer group/char w-16 relative">
                                    <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-transparent group-hover/char:border-indigo-400 transition-all relative">
                                        <img src={c.avatarUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/char:opacity-100 flex items-center justify-center text-white"><Edit size={12} /></div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(onDeleteCharacter) onDeleteCharacter(c.id); }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/char:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                                        title="刪除角色"
                                    >
                                        <Minus size={12} strokeWidth={3} />
                                    </button>
                                    <span className="text-[10px] text-slate-600 mt-1 truncate w-full text-center font-bold">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-xs text-slate-400 border border-dashed rounded bg-slate-100">尚未新增角色</div>
                    )}
                </div>

                {/* Asset/Scene List Manager (Now acting as global resource pool) */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-2">
                         <label className="block text-xs font-bold text-slate-500">場景/背景素材庫</label>
                         <button onClick={onOpenAssetModal} className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center"><PlusCircle size={12} className="mr-1"/>新增素材</button>
                    </div>
                    {assets.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {assets.map((a: GameAsset) => (
                                <div key={a.id} onClick={() => onEditAsset(a)} className="flex flex-col items-center cursor-pointer group/asset w-20 relative">
                                    <div className="w-20 h-14 rounded-lg bg-slate-200 overflow-hidden border-2 border-transparent group-hover/asset:border-pink-400 transition-all relative">
                                        <img src={a.url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 flex items-center justify-center text-white"><Edit size={12} /></div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(onDeleteAsset) onDeleteAsset(a.id); }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/asset:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                                        title="刪除素材"
                                    >
                                        <Minus size={12} strokeWidth={3} />
                                    </button>
                                    <span className="text-[10px] text-slate-600 mt-1 truncate w-full text-center font-bold">{a.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-xs text-slate-400 border border-dashed rounded bg-slate-100">尚未新增場景素材</div>
                    )}
                </div>

                <div className="border-t border-slate-100 pt-4"> 
                    <label className="block text-xs font-bold text-slate-500 mb-2">對話內容 (Dialogues) <span className="text-red-500">*</span></label> 
                    {(data.lines || []).map((line: any, idx: number) => ( 
                        <React.Fragment key={idx}>
                             {/* Line Item */}
                            <div className="flex flex-col bg-white border border-slate-200 rounded-lg p-3 mb-2 shadow-sm relative group"> 
                                <div className="flex gap-2 mb-2">
                                    <select className="w-1/3 p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" value={line.char || ''} onChange={e => { const newLines = [...(data.lines || [])]; newLines[idx].char = e.target.value; onChange({ lines: newLines }); }}> <option value="">選擇角色...</option> {characters.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)} <option value="旁白">旁白</option> <option value="玩家">玩家</option> </select> 
                                    <input className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" placeholder="說了什麼..." value={line.text || ''} onChange={e => { const newLines = [...(data.lines || [])]; newLines[idx].text = e.target.value; onChange({ lines: newLines }); }} /> 
                                    <button onClick={() => { const newLines = (data.lines || []).filter((_:any, i:number) => i !== idx); onChange({ lines: newLines }); }} className="text-red-400 p-2 hover:bg-red-50 rounded"><Trash2 size={14}/></button> 
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                                    {/* Voice Audio */}
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 transition-colors">
                                            {line.audio ? <Volume2 size={14} className="text-green-600"/> : <Mic size={14} className="text-slate-400"/>}
                                            <span className="text-xs text-slate-600">{line.audio ? "已上傳語音" : "上傳語音"}</span>
                                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleAudioUpload(e, idx, 'audio')}/>
                                        </label>
                                    </div>

                                    {/* SFX */}
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 transition-colors">
                                            {line.sfx ? <Speaker size={14} className="text-indigo-600"/> : <Music size={14} className="text-slate-400"/>}
                                            <span className="text-xs text-slate-600">{line.sfx ? "已上傳音效" : "上傳音效"}</span>
                                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleAudioUpload(e, idx, 'sfx')}/>
                                        </label>
                                    </div>

                                    {/* SFX Timing */}
                                    <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                        <span className="text-xs text-slate-500 font-bold">音效時機:</span>
                                        <select 
                                            className="bg-transparent text-xs text-slate-700 outline-none border-none"
                                            value={line.sfxTiming || 'start'} 
                                            onChange={(e) => { const newLines = [...(data.lines || [])]; newLines[idx].sfxTiming = e.target.value; onChange({ lines: newLines }); }}
                                        >
                                            <option value="after_voice">接續前一句話</option>
                                            <option value="start">隨著前一句話</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hover Insert Button */}
                            <div className="h-2 hover:h-8 transition-all opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer group/insert"
                                onClick={() => {
                                    const newLines = [...(data.lines || [])];
                                    newLines.splice(idx + 1, 0, { char: '', text: '' });
                                    onChange({ lines: newLines });
                                }}
                            >
                                <div className="h-[1px] bg-indigo-200 w-full relative group-hover/insert:bg-indigo-300">
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-indigo-300 text-indigo-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))} 
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => onChange({ lines: [...(data.lines || []), { char: '', text: '' }] })} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center flex-1 justify-center"><Plus size={14} className="mr-1"/> 新增對話</button> 
                        <button onClick={() => setShowAssetPicker(true)} className="text-xs font-bold text-pink-600 bg-pink-50 px-4 py-2 rounded-lg hover:bg-pink-100 transition-colors flex items-center flex-1 justify-center relative overflow-hidden">
                           {data.backgroundImage ? (
                               <>
                                <img src={data.backgroundImage} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                <span className="relative z-10 flex items-center"><ImageIcon size={14} className="mr-1"/> 更換場景背景</span>
                               </>
                           ) : (
                                <span className="flex items-center"><ImageIcon size={14} className="mr-1"/> 選擇場景 (背景)</span>
                           )}
                        </button> 
                    </div>
                </div>
                <AssetPickerModal isOpen={showAssetPicker} onClose={() => setShowAssetPicker(false)} assets={assets} onSelect={(url) => { onChange({ backgroundImage: url }); setShowAssetPicker(false); }} />
            </div> 
        );
        case 'TEXT': return <ModuleTextArea label={<>文字內容 <span className="text-red-500">*</span></>} value={data.text} field="text" onChange={onChange} />;
        case 'IMAGE': return ( <> <ModuleInput label={<>圖片連結 (或留空上傳) <span className="text-red-500">*</span></>} value={data.url} field="url" onChange={onChange} /> <ModuleFileUpload label="或 上傳圖片" field="file" data={data} onChange={onChange} /> </> );
        case 'VIDEO': return ( <> <ModuleInput label={<>影片連結 (YouTube/MP4) <span className="text-red-500">*</span></>} value={data.url} field="url" onChange={onChange} /> <ModuleFileUpload label="或 上傳影片" field="file" data={data} accept="video/*" onChange={onChange} /> </> );
        case 'AUDIO': return <ModuleFileUpload label={<>上傳音訊檔 (MP3/WAV) <span className="text-red-500">*</span></>} field="file" data={data} accept="audio/*" onChange={onChange} />;
        case 'AR_RECOGNIZE': return ( <div className="space-y-4"> <div className="grid grid-cols-2 gap-4"> <ModuleFileUpload label={<>1. 上傳辨識目標圖 (Target) <span className="text-red-500">*</span></>} field="target" data={data} onChange={onChange} /> <ModuleFileUpload label={<>2. 上傳出現內容 (Content) <span className="text-red-500">*</span></>} field="content" data={data} onChange={onChange} /> </div> <button onClick={() => onPreviewAR(data)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors"> <Scan size={18} className="mr-2" /> 預覽 AR 效果 </button> </div> );
        case 'AR_TRANSPARENT': return <ModuleFileUpload label={<>上傳透明 PNG <span className="text-red-500">*</span></>} field="file" data={data} onChange={onChange} />;
        case 'ANS_TEXT': return (<> <ModuleInput label={<>正確答案 <span className="text-red-500">*</span></>} value={data.answer} field="answer" placeholder="輸入正確解答..." onChange={onChange} /> {renderFeedbackFields()} {renderHintFields()} </>);
        case 'ANS_VOICE': return (<> <ModuleInput label={<>正確語音內容 <span className="text-red-500">*</span></>} value={data.answer} field="answer" placeholder="玩家說出的內容必須包含此文字..." onChange={onChange} /> <p className="text-xs text-slate-500 mb-2">玩家將使用麥克風說出答案，系統會辨識其內容是否包含上方關鍵字。</p> {renderFeedbackFields()} {renderHintFields()} </>);
        case 'ANS_SINGLE': 
        case 'ANS_MULTI': return ( <div> <label className="block text-xs font-bold text-slate-500 mb-2">選項設定 (勾選為正確答案) <span className="text-red-500">*</span></label> {(data.options || []).map((opt: any, idx: number) => ( <div key={idx} className="flex items-center gap-2 mb-2"> <input type={module.type === 'ANS_SINGLE' ? 'radio' : 'checkbox'} name={`ans_${module.id}`} checked={opt.isCorrect} onChange={() => { const newOpts = [...(data.options || [])]; if (module.type === 'ANS_SINGLE') newOpts.forEach(o => o.isCorrect = false); newOpts[idx].isCorrect = !opt.isCorrect; onChange({ options: newOpts }); }} /> <input className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" value={opt.text} onChange={e => { const newOpts = [...(data.options || [])]; newOpts[idx].text = e.target.value; onChange({ options: newOpts }); }} placeholder="選項文字" /> <button onClick={() => { const newOpts = (data.options || []).filter((_:any, i:number) => i !== idx); onChange({ options: newOpts }); }} className="text-red-400"><Trash2 size={14}/></button> </div> ))} <button onClick={() => onChange({ options: [...(data.options || []), { text: '新選項', isCorrect: false }] })} className="text-xs font-bold text-indigo-600">+ 新增選項</button> {renderFeedbackFields()} {renderHintFields()} </div> );
        case 'ANS_NUMBER': return ( <> <ModuleInput label={<>密碼長度 <span className="text-red-500">*</span></>} value={data.length} field="length" placeholder="4" onChange={onChange} /> <ModuleInput label={<>正確密碼 (數字) <span className="text-red-500">*</span></>} value={data.answer} field="answer" placeholder="例如: 1234" onChange={onChange} /> <p className="text-xs text-slate-500 mb-2">玩家端將顯示為可撥動的數字密碼鎖。</p> {renderFeedbackFields()} {renderHintFields()} </> );
        case 'ANS_IMAGE': return ( <div> <label className="block text-xs font-bold text-slate-500 mb-2">圖片密碼鎖設定 <span className="text-red-500">*</span></label> <p className="text-xs text-slate-500 mb-2">請上傳所有可選的圖案，並設定正確順序的索引 (從 1 開始)。</p> <div className="grid grid-cols-4 gap-2 mb-2"> {(data.images || []).map((img: string, i: number) => ( <div key={i} className="aspect-square bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 relative overflow-hidden group cursor-move"> <img src={img} className="w-full h-full object-cover" /> <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">{i + 1}</div> <button onClick={() => { const newImgs = [...(data.images || [])]; newImgs.splice(i, 1); onChange({ images: newImgs }); }} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button> </div> ))} <div className="aspect-square bg-slate-50 rounded border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors" onClick={() => document.getElementById(`ans_img_add_${module.id}`)?.click()}> <Plus size={20} className="text-slate-400 mb-1"/> <span className="text-[10px] text-slate-500">新增圖案</span> <input id={`ans_img_add_${module.id}`} type="file" multiple className="hidden" accept="image/*" onChange={async (e) => { const files = e.target.files; if (files && files.length > 0) { const newImages = []; for(let i=0; i<files.length; i++) { try { const result = await compressImage(files[i]); newImages.push(result); } catch(err) {} } onChange({ images: [...(data.images || []), ...newImages] }); } }}/> </div> </div> <ModuleInput label={<>正確順序 (索引, 逗號分隔) <span className="text-red-500">*</span></>} value={data.answer} field="answer" placeholder="例如: 1,3,2" onChange={onChange} /> {renderFeedbackFields()} {renderHintFields()} </div> );
        case 'ANS_PHOTO': return ( <> <div className="text-sm text-slate-500 italic p-2 bg-slate-50 rounded mb-4">此模組會要求玩家拍攝照片或上傳圖片。</div> {renderFeedbackFields()} {renderHintFields()} </> );
        case 'ANS_AR': return ( <div className="space-y-4"> <ModuleFileUpload label={<>辨識目標圖 <span className="text-red-500">*</span></>} field="target" data={data} onChange={onChange} /> <ModuleFileUpload label={<>辨識成功顯示圖 <span className="text-red-500">*</span></>} field="successImage" data={data} onChange={onChange} /> <ModuleInput label="辨識物提示名稱" value={data.hintName} field="hintName" onChange={onChange} /> <ModuleInput label="辨識物提示內容" value={data.hintContent} field="hintContent" onChange={onChange} /> {renderFeedbackFields()} {renderHintFields()} </div> );
        case 'PUZZLE_JIGSAW': return ( <div className="space-y-4"> <ModuleFileUpload label={<>拼圖原圖 <span className="text-red-500">*</span></>} field="image" data={data} onChange={onChange} /> <div> <label className="block text-xs font-bold text-slate-500 mb-1">切片數量 (Grid Size)</label> <select className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" value={data.gridSize || 3} onChange={e => onChange({ gridSize: parseInt(e.target.value) })}> <option value={2}>2 x 2 (4片)</option> <option value={3}>3 x 3 (9片)</option> <option value={4}>4 x 4 (16片)</option> </select> </div> {renderFeedbackFields()} </div> );
        case 'HINT': return ( <div> <label className="block text-xs font-bold text-slate-500 mb-2">提示列表 (獨立)</label> {(data.hints || []).map((hint: any, idx: number) => ( <div key={idx} className="bg-yellow-50 p-3 rounded mb-2 border border-yellow-100"> <div className="flex justify-between mb-2"> <span className="text-xs font-bold text-yellow-700">提示 {idx+1}</span> <button onClick={() => { const newHints = (data.hints || []).filter((_:any, i:number) => i !== idx); onChange({ hints: newHints }); }} className="text-red-400"><X size={14}/></button> </div> <div className="flex gap-2 mb-2"> <input type="number" className="w-20 p-2 border border-slate-300 rounded text-xs bg-white text-slate-600" placeholder="秒數" value={hint.delay} onChange={(e) => { const newHints = [...(data.hints || [])]; newHints[idx].delay = e.target.value; onChange({ hints: newHints }); }} /> <span className="text-xs text-slate-500 self-center">秒後顯示</span> </div> <textarea rows={2} className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" placeholder="提示內容..." value={hint.text} onChange={(e) => { const newHints = [...(data.hints || [])]; newHints[idx].text = e.target.value; onChange({ hints: newHints }); }} /> </div> ))} <button onClick={() => onChange({ hints: [...(data.hints || []), { text: '', delay: 60 }] })} className="text-xs font-bold text-yellow-600">+ 新增提示</button> </div> );
        default: return <div className="text-sm text-slate-400">此模組暫無設定選項</div>;
    }
};

const VisualNodeEditor = ({ scenes, groups, activeSceneId, setActiveSceneId, activeGroupId, setActiveGroupId, onAddScene, onAddRelativeScene, onUpdateScene, onUpdateGroup, onAddGroup, onDeleteGroup, onDeleteScene, onBatchAddScenes, onHistoryAction, canUndo, canRedo, commitSceneUpdate, onBatchUpdateScenes, commitBatchSceneUpdate, onEditSceneModules, onPreviewAR, gameInfo, characters, assets, startSceneId, onSetStartScene, onDeleteCharacter, onDeleteAsset }: any) => {
  const [tool, setTool] = useState<ToolType>('POINTER');
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [groupDragState, setGroupDragState] = useState<{ id: string, startX: number, startY: number, initialPositions: { [key: string]: { x: number, y: number } } } | null>(null);
  const [connectSource, setConnectSource] = useState<{ id: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' } | null>(null);
  const connectSourceId = connectSource?.id || null;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imageEditingSceneId, setImageEditingSceneId] = useState<string | null>(null);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, currentX: number, currentY: number} | null>(null);
  const [clipboard, setClipboard] = useState<Scene[]>([]);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panInitialOffset, setPanInitialOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef(scenes);
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);
  const selectionBoxRef = useRef(selectionBox);
  useEffect(() => { selectionBoxRef.current = selectionBox; }, [selectionBox]);
  
  useEffect(() => { scenes.forEach((s: Scene, idx: number) => { if (s.x === undefined || s.y === undefined) { onUpdateScene(s.id, { x: 100 + (idx * 150), y: 100 + (idx * 50) }); } }); }, [scenes.length]);
  const getSceneGroup = (sceneId: string): NodeGroup | undefined => groups?.find((g: NodeGroup) => g.sceneIds.includes(sceneId));
  const getGroupBounds = (group: NodeGroup) => { const groupScenes = scenes?.filter((s: Scene) => group.sceneIds.includes(s.id)) || []; if (groupScenes.length === 0) return null; const minX = Math.min(...groupScenes.map((s: Scene) => s.x || 0)); const minY = Math.min(...groupScenes.map((s: Scene) => s.y || 0)); const maxX = Math.max(...groupScenes.map((s: Scene) => (s.x || 0) + 160)); const maxY = Math.max(...groupScenes.map((s: Scene) => (s.y || 0) + 80)); const padding = 20; return { x: minX - padding, y: minY - padding - 40, w: maxX - minX + (padding * 2), h: maxY - minY + (padding * 2) + 40, centerX: (minX + maxX)/2, centerY: (minY + maxY)/2 }; };
  const isTargetValid = (targetId: string, isTargetGroup: boolean) => { 
    if (!connectSourceId) return false; 
    if (targetId === connectSourceId) return false; 
    
    const sourceIsGroup = groups?.some((g: NodeGroup) => g.id === connectSourceId); 
    const sourceGroup = getSceneGroup(connectSourceId);
    
    if (sourceIsGroup) {
      // Rule: Group frame can only connect to cards NOT in a group OR to other group frames.
      // It CANNOT connect to cards INSIDE any group.
      if (isTargetGroup) return true; 
      const targetGroup = getSceneGroup(targetId);
      return !targetGroup; 
    }
    
    if (sourceGroup) {
      // Rule: Card in a group can ONLY connect to other cards in the SAME group.
      if (isTargetGroup) return false; 
      const targetGroup = getSceneGroup(targetId);
      return targetGroup && targetGroup.id === sourceGroup.id;
    } else {
      // Rule: Card NOT in a group can connect to other cards NOT in a group OR to a group frame.
      // It CANNOT connect to cards INSIDE a group.
      if (isTargetGroup) return true;
      const targetGroup = getSceneGroup(targetId);
      return !targetGroup;
    }
  };
  const handleCopy = () => { if (selectedNodeIds.length === 0) return; const nodesToCopy = scenes.filter((s: Scene) => selectedNodeIds.includes(s.id)); setClipboard(nodesToCopy); };
  const handleCut = () => { if (selectedNodeIds.length === 0) return; handleCopy(); selectedNodeIds.forEach(id => onDeleteScene(id)); setSelectedNodeIds([]); };
  const handlePaste = () => { if (clipboard.length === 0) return; const idMap = new Map<string, string>(); const newScenes = clipboard.map((node, index) => { const newId = `scene_${Date.now()}_${index}`; idMap.set(node.id, newId); return { ...node, id: newId, x: (node.x || 0) + 50, y: (node.y || 0) + 50 }; }); newScenes.forEach(scene => { scene.choices = scene.choices.map(c => ({ ...c, nextSceneId: idMap.get(c.nextSceneId) || c.nextSceneId })); }); if (onBatchAddScenes) { onBatchAddScenes(newScenes); setSelectedNodeIds(newScenes.map(s => s.id)); } };
  const handleDeleteSelected = () => { if (selectedNodeIds.length > 0) { selectedNodeIds.forEach(id => onDeleteScene(id)); setSelectedNodeIds([]); } if (selectedGroupId) { onDeleteGroup(selectedGroupId); setSelectedGroupId(null); if (activeGroupId === selectedGroupId) setActiveGroupId(null); } };
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { const isCmdOrCtrl = e.metaKey || e.ctrlKey; if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setIsSpacePressed(true); } 
      if (e.key === 'Escape') {
        e.preventDefault();
        setTool('POINTER');
        setConnectSource(null);
        setSelectedNodeIds([]);
        setSelectedGroupId(null);
        setActiveSceneId(null);
        setActiveGroupId(null);
      }
      if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); if(canUndo) onHistoryAction('undo'); } if ((isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (isCmdOrCtrl && e.key.toLowerCase() === 'y')) { e.preventDefault(); if(canRedo) onHistoryAction('redo'); } if (isCmdOrCtrl && e.key.toLowerCase() === 'c') { e.preventDefault(); handleCopy(); } if (isCmdOrCtrl && e.key.toLowerCase() === 'x') { e.preventDefault(); handleCut(); } if (isCmdOrCtrl && e.key.toLowerCase() === 'v') { e.preventDefault(); handlePaste(); } if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleDeleteSelected(); } if (isCmdOrCtrl && e.key === 'g' && !e.shiftKey) { e.preventDefault(); if (selectedNodeIds.length > 1) { onAddGroup(selectedNodeIds); setSelectedNodeIds([]); setTool('POINTER'); } } if (isCmdOrCtrl && e.shiftKey && e.key === 'g') { e.preventDefault(); if (selectedNodeIds.length > 0) { const groupsToRemove = new Set<string>(); selectedNodeIds.forEach(id => { const group = groups.find((g: NodeGroup) => g.sceneIds.includes(id)); if (group) groupsToRemove.add(group.id); }); groupsToRemove.forEach(gid => onDeleteGroup(gid)); } if (selectedGroupId) { onDeleteGroup(selectedGroupId); setSelectedGroupId(null); } } } }; const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') { setIsSpacePressed(false); setIsPanning(false); } }; window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp); return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); }; }, [selectedNodeIds, selectedGroupId, groups, onAddGroup, onDeleteGroup, onDeleteScene, onHistoryAction, canUndo, canRedo, clipboard, scenes]); 
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setCanvasOffset({ x: panInitialOffset.x + dx, y: panInitialOffset.y + dy });
        return;
      }
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollTop = canvasRef.current.scrollTop;
      
      if (selectionBoxRef.current) {
        setSelectionBox(prev => prev ? {
          ...prev,
          currentX: e.clientX - rect.left - canvasOffset.x,
          currentY: e.clientY - rect.top + scrollTop - canvasOffset.y
        } : null);
      }
      
      if (dragState) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        onUpdateScene(dragState.id, { x: dragState.initialX + dx, y: dragState.initialY + dy });
      }
      
      if (groupDragState) {
        const dx = e.clientX - groupDragState.startX;
        const dy = e.clientY - groupDragState.startY;
        const updates = Object.keys(groupDragState.initialPositions).map(sceneId => {
          const initial = groupDragState.initialPositions[sceneId];
          return { id: sceneId, x: initial.x + dx, y: initial.y + dy };
        });
        if (onBatchUpdateScenes) {
          onBatchUpdateScenes(updates);
        } else {
          updates.forEach(u => onUpdateScene(u.id, { x: u.x, y: u.y }));
        }
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }
      
      if (selectionBoxRef.current) {
        const sb = selectionBoxRef.current;
        const x1 = Math.min(sb.startX, sb.currentX);
        const x2 = Math.max(sb.startX, sb.currentX);
        const y1 = Math.min(sb.startY, sb.currentY);
        const y2 = Math.max(sb.startY, sb.currentY);
        
        const selected = scenesRef.current.filter((s: Scene) => {
          const sx = s.x || 0;
          const sy = s.y || 0;
          return sx < x2 && (sx + 160) > x1 && sy < y2 && (sy + 80) > y1;
        }).map((s: Scene) => s.id);
        
        if (tool === 'GROUP') {
          if (selected.length > 0) {
            onAddGroup(selected);
            setTool('POINTER');
          }
          setSelectedNodeIds([]);
        } else {
          setSelectedNodeIds(selected);
        }
        setSelectionBox(null);
      }
      
      if (groupDragState && commitBatchSceneUpdate) {
        const dx = e.clientX - groupDragState.startX;
        const dy = e.clientY - groupDragState.startY;
        const updates = Object.keys(groupDragState.initialPositions).map(sceneId => {
          const initial = groupDragState.initialPositions[sceneId];
          return { id: sceneId, x: initial.x + dx, y: initial.y + dy };
        });
        commitBatchSceneUpdate(updates);
      }
      
      setDragState(null);
      setGroupDragState(null);
    };

    if (isPanning || selectionBox || dragState || groupDragState) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning, dragState, groupDragState, panStart, panInitialOffset, canvasOffset, tool, onAddGroup, onUpdateScene, onBatchUpdateScenes, commitBatchSceneUpdate]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => { if (e.target === canvasRef.current) { if (isSpacePressed) { setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY }); setPanInitialOffset({ ...canvasOffset }); return; } if (tool === 'POINTER' || tool === 'GROUP') { const rect = canvasRef.current.getBoundingClientRect(); setSelectionBox({ startX: e.clientX - rect.left - canvasOffset.x, startY: e.clientY - rect.top + canvasRef.current.scrollTop - canvasOffset.y, currentX: e.clientX - rect.left - canvasOffset.x, currentY: e.clientY - rect.top + canvasRef.current.scrollTop - canvasOffset.y }); setSelectedNodeIds([]); setSelectedGroupId(null); setActiveSceneId(null); setActiveGroupId(null); } } };
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left - canvasOffset.x,
        y: e.clientY - rect.top + canvasRef.current.scrollTop - canvasOffset.y
      });
    }
  };
  const handleCanvasClick = (e: React.MouseEvent) => { if (e.target === canvasRef.current) { if (isSpacePressed) return; if (tool === 'ADD') { const rect = canvasRef.current.getBoundingClientRect(); const x = e.clientX - rect.left - 80 - canvasOffset.x; const y = e.clientY - rect.top - 40 - canvasOffset.y; onAddScene(x, y); } else if (!selectionBox) { setSelectedNodeIds([]); setSelectedGroupId(null); setActiveSceneId(null); setActiveGroupId(null); setConnectSource(null); } } };
  const handleNodeClick = (e: React.MouseEvent, sceneId: string, targetDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => { 
    if (isSpacePressed) return; 
    e.stopPropagation(); 
    if (tool === 'CONNECT') { 
      if (!connectSource) { 
        setConnectSource({ id: sceneId, direction: 'RIGHT' }); 
      } else { 
        if (connectSource.id !== sceneId) { 
          if (!isTargetValid(sceneId, false)) { 
            alert("連接無效：群組內的卡片只能連線到同群組內的卡片，群組外的卡片只能連線到群組外的卡片或群組本體。"); 
            return; 
          } 
          const sourceGroup = groups.find((g: NodeGroup) => g.id === connectSource.id); 
          const sourceScene = scenes.find((s: Scene) => s.id === connectSource.id); 
          const targetScene = scenes.find((s: Scene) => s.id === sceneId);
          const targetName = targetScene?.title || '...'; 
          const newChoice = { text: '前往 ' + targetName, nextSceneId: sceneId, sourceDirection: connectSource.direction, targetDirection: targetDirection || 'LEFT' }; 
          
          if (sourceGroup) { 
            // Auto-align scene to group frame
            const sourceBounds = getGroupBounds(sourceGroup);
            if (targetScene && sourceBounds) {
              const HORIZONTAL_OFFSET = 260;
              const VERTICAL_OFFSET = 180;
              let newX = targetScene.x || 0;
              let newY = targetScene.y || 0;
              const dir = connectSource.direction;
              const threshold = 100;

              if (dir === 'RIGHT' || dir === 'LEFT') {
                newY = sourceBounds.centerY - 40; // 40 is half scene height
                if (dir === 'RIGHT') newX = Math.max(newX, (sourceBounds.x + sourceBounds.w) + 60);
                if (dir === 'LEFT') newX = Math.min(newX, sourceBounds.x - HORIZONTAL_OFFSET);
              } else {
                newX = sourceBounds.centerX - 80; // 80 is half scene width
                if (dir === 'DOWN') newY = Math.max(newY, (sourceBounds.y + sourceBounds.h) + 60);
                if (dir === 'UP') newY = Math.min(newY, sourceBounds.y - VERTICAL_OFFSET);
              }

              const updates = scenes.map(s => {
                if (s.id === sceneId) return { id: s.id, x: newX, y: newY };
                const sx = s.x || 0;
                const sy = s.y || 0;
                if (dir === 'RIGHT' && sx >= newX && Math.abs(sy - newY) < threshold) return { id: s.id, x: sx + HORIZONTAL_OFFSET };
                if (dir === 'LEFT' && sx <= newX && Math.abs(sy - newY) < threshold) return { id: s.id, x: sx - HORIZONTAL_OFFSET };
                if (dir === 'DOWN' && sy >= newY && Math.abs(sx - newX) < threshold) return { id: s.id, y: sy + VERTICAL_OFFSET };
                if (dir === 'UP' && sy <= newY && Math.abs(sx - newX) < threshold) return { id: s.id, y: sy - VERTICAL_OFFSET };
                return null;
              }).filter(Boolean) as {id: string, x?: number, y?: number}[];

              if (onBatchUpdateScenes) onBatchUpdateScenes(updates);
              else updates.forEach(u => onUpdateScene(u.id, u));
            }
            onUpdateGroup(sourceGroup.id, { choices: [...(sourceGroup.choices || []), newChoice] }); 
          } else if (sourceScene) { 
            // Auto-align and push target scene
            if (targetScene && !sourceGroup) {
              const HORIZONTAL_OFFSET = 260;
              const VERTICAL_OFFSET = 180;
              let newX = targetScene.x || 0;
              let newY = targetScene.y || 0;
              const dir = connectSource.direction;
              const threshold = 100;
              
              if (dir === 'RIGHT' || dir === 'LEFT') {
                newY = sourceScene.y || 0;
                if (dir === 'RIGHT') newX = Math.max(newX, (sourceScene.x || 0) + HORIZONTAL_OFFSET);
                if (dir === 'LEFT') newX = Math.min(newX, (sourceScene.x || 0) - HORIZONTAL_OFFSET);
              } else {
                newX = sourceScene.x || 0;
                if (dir === 'DOWN') newY = Math.max(newY, (sourceScene.y || 0) + VERTICAL_OFFSET);
                if (dir === 'UP') newY = Math.min(newY, (sourceScene.y || 0) - VERTICAL_OFFSET);
              }

              // Apply push logic to all other scenes
              const updates = scenes.map(s => {
                if (s.id === sourceScene.id) return null;
                if (s.id === sceneId) return { id: s.id, x: newX, y: newY };
                
                const sx = s.x || 0;
                const sy = s.y || 0;
                
                if (dir === 'RIGHT' && sx >= newX && Math.abs(sy - newY) < threshold) return { id: s.id, x: sx + HORIZONTAL_OFFSET };
                if (dir === 'LEFT' && sx <= newX && Math.abs(sy - newY) < threshold) return { id: s.id, x: sx - HORIZONTAL_OFFSET };
                if (dir === 'DOWN' && sy >= newY && Math.abs(sx - newX) < threshold) return { id: s.id, y: sy + VERTICAL_OFFSET };
                if (dir === 'UP' && sy <= newY && Math.abs(sx - newX) < threshold) return { id: s.id, y: sy - VERTICAL_OFFSET };
                return null;
              }).filter(Boolean) as {id: string, x?: number, y?: number}[];

              if (onBatchUpdateScenes) {
                onBatchUpdateScenes(updates);
              } else {
                updates.forEach(u => onUpdateScene(u.id, u));
              }
            }

            if(commitSceneUpdate) { 
              commitSceneUpdate(connectSource.id, { choices: [...sourceScene.choices, newChoice] }); 
            } else { 
              onUpdateScene(connectSource.id, { choices: [...sourceScene.choices, newChoice] }); 
            } 
          } 
          setConnectSource(null); 
        } 
      } 
    } 
else if (tool === 'GROUP') { 
      if (selectedNodeIds.includes(sceneId)) { 
        setSelectedNodeIds(selectedNodeIds.filter(id => id !== sceneId)); 
      } else { 
        setSelectedNodeIds([...selectedNodeIds, sceneId]); 
      } 
    } else { 
      setActiveSceneId(sceneId); 
      setActiveGroupId(null); 
      if (e.shiftKey) { 
        if (selectedNodeIds.includes(sceneId)) { 
          setSelectedNodeIds(selectedNodeIds.filter(id => id !== sceneId)); 
        } else { 
          setSelectedNodeIds([...selectedNodeIds, sceneId]); 
        } 
      } else { 
        if (!dragState) setSelectedNodeIds([sceneId]); 
      } 
    } 
  };
  const handleGroupClick = (e: React.MouseEvent, group: NodeGroup, targetDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (isSpacePressed) return;
    e.stopPropagation();
    if (tool === 'CONNECT') {
      if (!connectSource) {
        setConnectSource({ id: group.id, direction: 'RIGHT' });
      } else if (connectSource.id !== group.id) {
        if (!isTargetValid(group.id, true)) {
          alert("連接無效：群組內的卡片只能連線到同群組內的卡片。");
          return;
        }
        const sourceScene = scenes.find((s: Scene) => s.id === connectSource.id);
        const sourceGroup = groups.find((g: NodeGroup) => g.id === connectSource.id);
        const targetName = group.title;
        const newChoice = { text: '前往 ' + targetName, nextSceneId: group.id, sourceDirection: connectSource.direction, targetDirection: targetDirection || 'LEFT' };
        
        if (sourceGroup) {
          // Auto-align group to group
          const sourceBounds = getGroupBounds(sourceGroup);
          const targetBounds = getGroupBounds(group);
          if (sourceBounds && targetBounds) {
             const HORIZONTAL_OFFSET = 300;
             const VERTICAL_OFFSET = 220;
             const dir = connectSource.direction;
             let deltaX = 0;
             let deltaY = 0;

             if (dir === 'RIGHT' || dir === 'LEFT') {
               deltaY = sourceBounds.centerY - targetBounds.centerY;
               if (dir === 'RIGHT') deltaX = Math.max(0, (sourceBounds.x + sourceBounds.w + 100) - targetBounds.x);
               if (dir === 'LEFT') deltaX = Math.min(0, (sourceBounds.x - 100) - (targetBounds.x + targetBounds.w));
             } else {
               deltaX = sourceBounds.centerX - targetBounds.centerX;
               if (dir === 'DOWN') deltaY = Math.max(0, (sourceBounds.y + sourceBounds.h + 100) - targetBounds.y);
               if (dir === 'UP') deltaY = Math.min(0, (sourceBounds.y - 100) - (targetBounds.y + targetBounds.h));
             }

             if (deltaX !== 0 || deltaY !== 0) {
               const updates = scenes.filter(s => group.sceneIds.includes(s.id)).map(s => ({
                 id: s.id,
                 x: (s.x || 0) + deltaX,
                 y: (s.y || 0) + deltaY
               }));
               if (onBatchUpdateScenes) onBatchUpdateScenes(updates);
               else updates.forEach(u => onUpdateScene(u.id, u));
             }
          }
          onUpdateGroup(sourceGroup.id, { choices: [...(sourceGroup.choices || []), newChoice] });
        } else if (sourceScene) {
          // Auto-align group to scene
          const targetBounds = getGroupBounds(group);
          if (targetBounds) {
            const HORIZONTAL_OFFSET = 300;
            const VERTICAL_OFFSET = 220;
            const dir = connectSource.direction;
            let deltaX = 0;
            let deltaY = 0;

            if (dir === 'RIGHT' || dir === 'LEFT') {
              deltaY = sourceScene.y - targetBounds.centerY + 40;
              if (dir === 'RIGHT') deltaX = Math.max(0, (sourceScene.x + HORIZONTAL_OFFSET) - targetBounds.x);
              if (dir === 'LEFT') deltaX = Math.min(0, (sourceScene.x - HORIZONTAL_OFFSET) - (targetBounds.x + targetBounds.w));
            } else {
              deltaX = sourceScene.x - targetBounds.centerX + 80;
              if (dir === 'DOWN') deltaY = Math.max(0, (sourceScene.y + VERTICAL_OFFSET) - targetBounds.y);
              if (dir === 'UP') deltaY = Math.min(0, (sourceScene.y - VERTICAL_OFFSET) - (targetBounds.y + targetBounds.h));
            }

            if (deltaX !== 0 || deltaY !== 0) {
              const updates = scenes.filter(s => group.sceneIds.includes(s.id)).map(s => ({
                id: s.id,
                x: (s.x || 0) + deltaX,
                y: (s.y || 0) + deltaY
              }));
              if (onBatchUpdateScenes) onBatchUpdateScenes(updates);
              else updates.forEach(u => onUpdateScene(u.id, u));
            }
          }
          if (commitSceneUpdate) {
            commitSceneUpdate(connectSource.id, { choices: [...sourceScene.choices, newChoice] });
          } else {
            onUpdateScene(connectSource.id, { choices: [...sourceScene.choices, newChoice] });
          }
        }
        setConnectSource(null);
      }
    } else if (tool === 'POINTER') {
      setActiveGroupId(group.id);
      setActiveSceneId(null);
      setSelectedGroupId(group.id);
    }
  };
  const handleMouseDown = (e: React.MouseEvent, sceneId: string) => { if (isSpacePressed) return; if (tool === 'POINTER' || tool === 'ADD') { setDragState({ id: sceneId, startX: e.clientX, startY: e.clientY, initialX: scenes.find((s: Scene) => s.id === sceneId)?.x || 0, initialY: scenes.find((s: Scene) => s.id === sceneId)?.y || 0 }); } };
  const handleCreateGroup = () => { if (selectedNodeIds.length > 0) { onAddGroup(selectedNodeIds); setTool('POINTER'); setSelectedNodeIds([]); } };
  const handleGroupMouseDown = (e: React.MouseEvent, group: NodeGroup) => { if (isSpacePressed || tool !== 'POINTER') return; e.stopPropagation(); setSelectedGroupId(group.id); const groupScenes = scenes.filter((s: Scene) => group.sceneIds.includes(s.id)); const initialPositions: { [key: string]: { x: number, y: number } } = {}; groupScenes.forEach((s: Scene) => { initialPositions[s.id] = { x: s.x || 0, y: s.y || 0 }; }); setGroupDragState({ id: group.id, startX: e.clientX, startY: e.clientY, initialPositions }); };
  const handleDeleteConnection = (sourceId: string, choiceIndex: number) => { const sourceScene = scenes.find((s: Scene) => s.id === sourceId); const sourceGroup = groups.find((g: NodeGroup) => g.id === sourceId); if (sourceScene && commitSceneUpdate) { const newChoices = sourceScene.choices.filter((_: any, i: number) => i !== choiceIndex); commitSceneUpdate(sourceId, { choices: newChoices }); } else if (sourceGroup) { const newChoices = (sourceGroup.choices || []).filter((_: any, i: number) => i !== choiceIndex); onUpdateGroup(sourceId, { choices: newChoices }); } };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sceneId: string) => { const file = e.target.files?.[0]; if (file && commitSceneUpdate) { try { const result = await compressImage(file); commitSceneUpdate(sceneId, { imageKeyword: result }); } catch(e) { console.error(e); } } }
  const renderConnections = () => {
    const allNodes = [...scenes, ...groups.map(g => ({...g, isGroup: true}))];
    const connections = allNodes.map((node: any) => {
      if (!node.choices) return null;
      return node.choices.map((choice: Choice, idx: number) => {
        const target = scenes.find((s: Scene) => s.id === choice.nextSceneId);
        const targetGroup = !target ? groups.find((g: NodeGroup) => g.id === choice.nextSceneId) : null;
        if (!target && !targetGroup) return null;
        let x1, y1, x2, y2;
        if (node.isGroup) {
          const bounds = getGroupBounds(node);
          if (bounds) {
            const dir = choice.sourceDirection || 'RIGHT';
            switch(dir) {
              case 'UP': x1 = bounds.x + bounds.w/2; y1 = bounds.y; break;
              case 'DOWN': x1 = bounds.x + bounds.w/2; y1 = bounds.y + bounds.h; break;
              case 'LEFT': x1 = bounds.x; y1 = bounds.y + bounds.h/2; break;
              case 'RIGHT': x1 = bounds.x + bounds.w; y1 = bounds.y + bounds.h/2; break;
              default: x1 = bounds.x + bounds.w; y1 = bounds.y + bounds.h/2;
            }
          } else return null;
        } else {
          const sx = node.x || 0;
          const sy = node.y || 0;
          const dir = choice.sourceDirection || 'RIGHT';
          switch(dir) {
            case 'UP': x1 = sx + 80; y1 = sy; break;
            case 'DOWN': x1 = sx + 80; y1 = sy + 80; break;
            case 'LEFT': x1 = sx; y1 = sy + 40; break;
            case 'RIGHT': x1 = sx + 160; y1 = sy + 40; break;
            default: x1 = sx + 160; y1 = sy + 40;
          }
        }
        if (targetGroup) {
          const bounds = getGroupBounds(targetGroup);
          if (bounds) {
            const dir = choice.targetDirection || 'LEFT';
            switch(dir) {
              case 'UP': x2 = bounds.x + bounds.w/2; y2 = bounds.y; break;
              case 'DOWN': x2 = bounds.x + bounds.w/2; y2 = bounds.y + bounds.h; break;
              case 'LEFT': x2 = bounds.x; y2 = bounds.y + bounds.h/2; break;
              case 'RIGHT': x2 = bounds.x + bounds.w; y2 = bounds.y + bounds.h/2; break;
              default: x2 = bounds.x; y2 = bounds.y + bounds.h/2;
            }
          } else return null;
        } else if (target) {
          const tx = target.x || 0;
          const ty = target.y || 0;
          const dir = choice.targetDirection || 'LEFT';
          switch(dir) {
            case 'UP': x2 = tx + 80; y2 = ty; break;
            case 'DOWN': x2 = tx + 80; y2 = ty + 80; break;
            case 'LEFT': x2 = tx; y2 = ty + 40; break;
            case 'RIGHT': x2 = tx + 160; y2 = ty + 40; break;
            default: x2 = tx; y2 = ty + 40;
          }
        } else return null;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        return (
          <g key={`${node.id}-${idx}`} className="group pointer-events-auto">
            <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer"/>
            <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={targetGroup ? "#818cf8" : node.isGroup ? "#f472b6" : "#cbd5e1"} strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="transition-colors duration-200 group-hover:stroke-red-400 group-hover:stroke-[3px]"/>
            <g transform={`translate(${midX}, ${midY})`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteConnection(node.id, idx); }}>
              <circle r="10" fill="#ef4444" className="shadow-sm" />
              <rect x="-6" y="-1" width="12" height="2" fill="white" rx="1" />
            </g>
          </g>
        );
      });
    });

    // Active connection preview
    if (tool === 'CONNECT' && connectSource) {
      const sourceNode = scenes.find((s: Scene) => s.id === connectSource.id) || groups.find((g: NodeGroup) => g.id === connectSource.id);
      if (sourceNode) {
        let x1, y1;
        if (sourceNode.sceneIds) { // Group
          const bounds = getGroupBounds(sourceNode as NodeGroup);
          if (bounds) {
            const sx = bounds.x;
            const sy = bounds.y;
            const sw = bounds.w;
            const sh = bounds.h;
            switch(connectSource.direction) {
              case 'UP': x1 = sx + sw/2; y1 = sy; break;
              case 'DOWN': x1 = sx + sw/2; y1 = sy + sh; break;
              case 'LEFT': x1 = sx; y1 = sy + sh/2; break;
              case 'RIGHT': x1 = sx + sw; y1 = sy + sh/2; break;
              default: x1 = sx + sw; y1 = sy + sh/2;
            }
          } else { x1 = 0; y1 = 0; }
        } else { // Scene
          const sx = sourceNode.x || 0;
          const sy = sourceNode.y || 0;
          switch(connectSource.direction) {
            case 'UP': x1 = sx + 80; y1 = sy; break;
            case 'DOWN': x1 = sx + 80; y1 = sy + 80; break;
            case 'LEFT': x1 = sx; y1 = sy + 40; break;
            case 'RIGHT': x1 = sx + 160; y1 = sy + 40; break;
            default: x1 = sx + 160; y1 = sy + 40;
          }
        }
        connections.push(
          <line key="preview-line" x1={x1} y1={y1} x2={mousePos.x} y2={mousePos.y} stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-active)" />
        );
      }
    }

    return connections;
  };
  const renderGroups = () => { 
    return groups?.map((group: NodeGroup) => { 
      const bounds = getGroupBounds(group); 
      if (!bounds) return null; 
      const isSelected = selectedGroupId === group.id || activeGroupId === group.id; 
      const isValidConnectTarget = tool === 'CONNECT' && isTargetValid(group.id, true); 
      const isConnectSource = connectSourceId === group.id; 
      
      return ( 
        <div 
          key={group.id} 
          onMouseDown={(e) => handleGroupMouseDown(e, group)} 
          onClick={(e) => handleGroupClick(e, group)} 
          className={`absolute rounded-xl shadow-lg transition-all hover:shadow-xl ${groupDragState?.id === group.id ? 'cursor-grabbing scale-[1.01]' : 'cursor-grab'} pointer-events-auto flex flex-col overflow-visible ${isSelected ? 'ring-2 ring-indigo-500 shadow-indigo-100' : 'border border-slate-200'} ${isValidConnectTarget ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/50' : ''} ${isConnectSource ? 'ring-2 ring-orange-400 border-orange-400' : ''}`} 
          style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h, zIndex: 0, backgroundColor: isSelected ? '#993333' : '#ffffff' }}
        > 
          <div className={`h-10 flex items-center justify-between px-3 bg-slate-50 text-slate-600 border-b border-slate-100 transition-colors`}> 
            <div className="flex items-center">
              <GripVertical size={16} className={`mr-2 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{group.title}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateGroup(group.id, { type: group.type === 'ALL' ? 'ANY' : 'ALL' });
                }}
                className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 ${group.type === 'ALL' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
              >
                {group.type === 'ALL' ? <CheckCircle size={10} /> : <Circle size={10} />}
                {group.type === 'ALL' ? '全部完成' : '擇一即可'}
              </button>
            </div> 
          </div> 
          <div className="flex-1 bg-slate-50/30 relative"> 
            {isValidConnectTarget && (<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm animate-pulse z-10"></div>)} 
            {isConnectSource && (<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm z-10"></div>)} 
            {renderGroupConnectButtons(group)}
          </div> 
        </div> 
      ); 
    }); 
  };
  const renderSelectionBox = () => { if (!selectionBox) return null; const x = Math.min(selectionBox.startX, selectionBox.currentX); const y = Math.min(selectionBox.startY, selectionBox.currentY); const width = Math.abs(selectionBox.currentX - selectionBox.startX); const height = Math.abs(selectionBox.currentY - selectionBox.startY); return (<div className="absolute border border-indigo-500 bg-indigo-200/30 pointer-events-none z-50" style={{ left: x, top: y, width, height }} />); };
  const renderAddButtons = (scene: Scene) => { if (tool !== 'ADD') return null; const handleAdd = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => { onAddRelativeScene(scene.id, direction); }; return ( <> <button onClick={(e) => { e.stopPropagation(); handleAdd('RIGHT'); }} className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> <button onClick={(e) => { e.stopPropagation(); handleAdd('DOWN'); }} className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> <button onClick={(e) => { e.stopPropagation(); handleAdd('LEFT'); }} className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> <button onClick={(e) => { e.stopPropagation(); handleAdd('UP'); }} className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> </> ); };
  const renderGroupConnectButtons = (group: NodeGroup) => {
    if (tool !== 'CONNECT') return null;
    const isSource = connectSource?.id === group.id;
    const hasSource = !!connectSource;

    const handleStartConnect = (e: React.MouseEvent, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
      e.stopPropagation();
      setConnectSource({ id: group.id, direction });
    };

    const handleTargetClick = (e: React.MouseEvent, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
      e.stopPropagation();
      handleGroupClick(e, group, direction);
    };

    if (hasSource && !isSource) {
      if (!isTargetValid(group.id, true)) return null;
      return (
        <>
          <button onClick={(e) => handleTargetClick(e, 'RIGHT')} className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border-2 border-white"></button>
          <button onClick={(e) => handleTargetClick(e, 'DOWN')} className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border-2 border-white"></button>
          <button onClick={(e) => handleTargetClick(e, 'LEFT')} className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border-2 border-white"></button>
          <button onClick={(e) => handleTargetClick(e, 'UP')} className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border-2 border-white"></button>
        </>
      );
    }

    if (isSource) return null;

    return (
      <>
        <button onClick={(e) => handleStartConnect(e, 'RIGHT')} className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowRight size={16}/></button>
        <button onClick={(e) => handleStartConnect(e, 'DOWN')} className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowDown size={16}/></button>
        <button onClick={(e) => handleStartConnect(e, 'LEFT')} className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowLeft size={16}/></button>
        <button onClick={(e) => handleStartConnect(e, 'UP')} className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowUp size={16}/></button>
      </>
    );
  };
  const renderConnectButtons = (scene: Scene) => {
    if (tool !== 'CONNECT') return null;
    
    // Rule: Cards inside a group should not have connection buttons.
    if (getSceneGroup(scene.id)) return null;

    const isSource = connectSource?.id === scene.id;
    const hasSource = !!connectSource;

    const handleStartConnect = (e: React.MouseEvent, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
      e.stopPropagation();
      setConnectSource({ id: scene.id, direction });
    };

    const handleTargetClick = (e: React.MouseEvent, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
      e.stopPropagation();
      handleNodeClick(e, scene.id, direction);
    };

    if (hasSource && !isSource) {
      if (!isTargetValid(scene.id, false)) return null;
      return (
        <>
          <button onClick={(e) => handleTargetClick(e, 'RIGHT')} className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border border-white"></button>
          <button onClick={(e) => handleTargetClick(e, 'DOWN')} className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border border-white"></button>
          <button onClick={(e) => handleTargetClick(e, 'LEFT')} className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border border-white"></button>
          <button onClick={(e) => handleTargetClick(e, 'UP')} className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full hover:scale-125 transition-transform z-10 shadow-sm border border-white"></button>
        </>
      );
    }

    if (isSource) return null;

    return (
      <>
        <button onClick={(e) => handleStartConnect(e, 'RIGHT')} className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowRight size={14}/></button>
        <button onClick={(e) => handleStartConnect(e, 'DOWN')} className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowDown size={14}/></button>
        <button onClick={(e) => handleStartConnect(e, 'LEFT')} className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowLeft size={14}/></button>
        <button onClick={(e) => handleStartConnect(e, 'UP')} className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><ArrowUp size={14}/></button>
      </>
    );
  };

  return (
    <>
     <div className="flex-1 flex h-full bg-[#f8fafc] overflow-hidden overscroll-none">
         <div className="flex-1 relative overflow-hidden bg-[#f8fafc]">
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-white shadow-lg border border-slate-200 rounded-xl p-1.5 gap-1">
               <button onClick={() => { setTool('POINTER'); setConnectSource(null); setSelectedNodeIds([]); setSelectedGroupId(null); setActiveGroupId(null); }} className={`p-2 rounded-lg text-slate-600 transition-all ${tool === 'POINTER' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'hover:bg-slate-50'}`} title="選取 / 移動 (Esc)"><MousePointer2 size={18} /></button>
               <div className="w-px bg-slate-200 my-1"></div>
               <button onClick={() => onHistoryAction('undo')} disabled={!canUndo} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"><Undo size={18} /></button>
               <button onClick={() => onHistoryAction('redo')} disabled={!canRedo} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"><Redo size={18} /></button>
               <div className="w-px bg-slate-200 my-1"></div>
               <button onClick={handleCopy} disabled={selectedNodeIds.length === 0} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"><Copy size={18} /></button>
               <button onClick={handleCut} disabled={selectedNodeIds.length === 0} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"><Scissors size={18} /></button>
               <button onClick={handlePaste} disabled={clipboard.length === 0} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"><Clipboard size={18} /></button>
               <button onClick={handleDeleteSelected} disabled={selectedNodeIds.length === 0 && !selectedGroupId} className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"><Trash2 size={18} /></button>
               <div className="w-px bg-slate-200 my-1"></div>
               <button onClick={() => setTool(tool === 'ADD' ? 'POINTER' : 'ADD')} className={`p-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] transition-all ${tool === 'ADD' ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200' : 'hover:bg-slate-50 text-slate-600'}`} title="新增關卡"><Plus size={24} /><span className="text-[10px] font-bold">新增關卡</span></button>
               <div className="w-px bg-slate-200 my-1"></div>
               <button onClick={() => { if (tool === 'CONNECT') { setTool('POINTER'); setConnectSource(null); } else { setTool('CONNECT'); setConnectSource(null); } }} className={`p-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] transition-all ${tool === 'CONNECT' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`} title="連線"><LinkIcon size={24} /><span className="text-[10px] font-bold">連線</span></button>
               <div className="w-px bg-slate-200 my-1"></div>
               <div className="relative">
                 <button onClick={() => { if (selectedNodeIds.length > 1) { onAddGroup(selectedNodeIds); setSelectedNodeIds([]); return; } if (tool !== 'GROUP') { setTool('GROUP'); } else { handleCreateGroup(); } }} className={`p-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] transition-all ${tool === 'GROUP' ? 'bg-pink-100 text-pink-600' : 'hover:bg-slate-50 text-slate-600'}`} title="群組 (Cmd+G)"><BoxSelect size={24} /><span className="text-[10px] font-bold">{tool === 'GROUP' && selectedNodeIds.length > 1 ? '確認群組' : '群組'}</span></button>
                 {selectedNodeIds.length > 1 && (<div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{selectedNodeIds.length}</div>)}
               </div>
            </div>
            <div ref={canvasRef} className={`w-full h-full relative overflow-hidden ${isSpacePressed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`} onMouseDown={handleCanvasMouseDown} onClick={handleCanvasClick} onMouseMove={handleCanvasMouseMove} style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px` }}>
               <div style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: '5000px', minHeight: '5000px', transform: 'translate(-1000px, -1000px)' }}> 
                        <g transform="translate(1000, 1000)">
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" /></marker>
                                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" /></marker>
                            </defs>
                            {renderConnections()}
                        </g>
                    </svg>
                    {renderGroups()}
                    {renderSelectionBox()}
                    {scenes?.map((scene: Scene) => {
                        const isValidConnectTarget = tool === 'CONNECT' && isTargetValid(scene.id, false);
                        const isStart = startSceneId === scene.id;
                        const isEnd = scene.isEnding;
                        return (
                            <div key={scene.id} className={`absolute w-40 h-20 rounded-lg shadow-sm border-2 transition-all cursor-move flex flex-col overflow-visible pointer-events-auto group/node ${selectedNodeIds.includes(scene.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : (activeSceneId === scene.id || connectSourceId === scene.id) ? 'border-orange-400' : isValidConnectTarget ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`} style={{ left: scene.x, top: scene.y, backgroundColor: selectedNodeIds.includes(scene.id) ? '#993333' : '#ffffff' }} onMouseDown={(e) => handleMouseDown(e, scene.id)} onClick={(e) => handleNodeClick(e, scene.id)}>
                                <div className="bg-slate-50 p-1.5 border-b border-slate-100 flex items-center justify-between cursor-grab active:cursor-grabbing">
                                    <div className="flex items-center gap-1 truncate max-w-[120px]">
                                        {isStart && <div className="bg-green-500 text-white text-[8px] px-1 rounded font-bold">起點</div>}
                                        {isEnd && <div className="bg-red-500 text-white text-[8px] px-1 rounded font-bold">終點</div>}
                                        <span className="text-xs font-bold text-slate-700 truncate">{scene.title}</span>
                                    </div>
                                    {activeSceneId === scene.id && <GripVertical size={12} className="text-slate-400" />}
                                </div>
                                <div className="p-2 text-[10px] text-slate-500 leading-tight line-clamp-2 select-none relative group/image">
                                    {scene.imageKeyword && (scene.imageKeyword.startsWith('data:') || scene.imageKeyword.startsWith('http')) ? <img src={scene.imageKeyword} className="w-full h-10 object-cover rounded opacity-80 hover:opacity-100 transition-opacity" /> : <span>{scene.text || '無內容...'}</span>}
                                    <button onClick={(e) => { e.stopPropagation(); setImageEditingSceneId(scene.id); }} className="absolute bottom-0 right-0 p-1 bg-white/80 hover:bg-white rounded-full cursor-pointer shadow-sm z-10 opacity-0 group-hover/node:opacity-100 transition-opacity"><ImageIcon size={12} className="text-slate-600" /></button>
                                </div>
                                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity z-20">
                                    <button onClick={(e) => { e.stopPropagation(); onEditSceneModules(scene); }} className="w-7 h-7 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-orange-500 hover:border-orange-400" title="編輯模組內容"><Edit size={14} /></button>
                                    <div className="relative group/menu">
                                        <button onClick={(e) => { e.stopPropagation(); }} className="w-7 h-7 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-500 hover:border-indigo-400"><MoreHorizontal size={14} /></button>
                                        <div className="absolute top-full right-0 mt-1 bg-white shadow-xl border border-slate-200 rounded-lg py-1 w-32 hidden group-hover/menu:block">
                                            <button onClick={(e) => { e.stopPropagation(); onSetStartScene(scene.id); }} className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                                <Play size={12} className={isStart ? "text-green-500" : ""} /> {isStart ? "取消起點" : "設為起點"}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onUpdateScene(scene.id, { isEnding: !scene.isEnding }); }} className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                                <XCircle size={12} className={isEnd ? "text-red-500" : ""} /> {isEnd ? "取消終點" : "設為終點"}
                                            </button>
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }} className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 size={12} /> 刪除場景
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {tool === 'CONNECT' && (<>{(connectSourceId === scene.id) && (<><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full translate-x-1.5 bg-orange-500"></div><div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full -translate-x-1.5 bg-orange-500"></div></>)}{isValidConnectTarget && (<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 animate-pulse border border-white"></div>)}</>)}
                                {renderAddButtons(scene)}
                                {renderConnectButtons(scene)}
                            </div>
                        );
                    })}
               </div>
            </div>
         </div>
          <div className="w-[420px] bg-slate-100 border-l border-slate-200 p-6 flex flex-col relative shadow-inner overflow-y-auto">
              {activeGroupId ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                      <BoxSelect size={20} className="mr-2 text-pink-500" /> 群組設定
                    </h3>
                    <button onClick={() => setActiveGroupId(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
                  </div>
                  
                  {(() => {
                    const group = groups.find((g: NodeGroup) => g.id === activeGroupId);
                    if (!group) return <div className="text-slate-400 text-center py-10">找不到該群組</div>;
                    
                    return (
                      <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <label className="block text-sm font-bold text-slate-700 mb-2">群組名稱</label>
                          <input 
                            type="text" 
                            value={group.title} 
                            onChange={(e) => onUpdateGroup(group.id, { title: e.target.value })}
                            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                          />
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <label className="block text-sm font-bold text-slate-700 mb-3">前往下一個節點的條件</label>
                          <div className="grid grid-cols-1 gap-3">
                            <button 
                              onClick={() => onUpdateGroup(group.id, { type: 'ALL' })}
                              className={`flex items-center p-3 rounded-lg border-2 transition-all ${group.type === 'ALL' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 hover:border-pink-200 text-slate-600'}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${group.type === 'ALL' ? 'border-pink-500 bg-pink-500' : 'border-slate-300'}`}>
                                {group.type === 'ALL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-sm">全部完成</div>
                                <div className="text-[10px] opacity-70">需完成群組內所有卡片內容</div>
                              </div>
                            </button>

                            <button 
                              onClick={() => onUpdateGroup(group.id, { type: 'ANY' })}
                              className={`flex items-center p-3 rounded-lg border-2 transition-all ${group.type === 'ANY' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-100 hover:border-orange-200 text-slate-600'}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${group.type === 'ANY' ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                                {group.type === 'ANY' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-sm">擇一即可</div>
                                <div className="text-[10px] opacity-70">僅需完成其中任一卡片即可前往</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-700">包含的卡片</label>
                            <span className="text-xs text-slate-400">{group.sceneIds.length} 張</span>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {group.sceneIds.map(sid => {
                              const s = scenes.find((scene: Scene) => scene.id === sid);
                              return (
                                <div key={sid} className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
                                  {s?.title || '未命名卡片'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="absolute top-4 left-6 text-xs font-bold text-slate-400 uppercase flex items-center"><Smartphone size={14} className="mr-1"/> 即時預覽 (互動式)</div>
                  <MobileSimulator 
                      scenes={scenes} 
                      groups={groups} 
                      activeSceneId={activeSceneId} 
                      gameInfo={gameInfo} 
                      characters={characters} 
                      startSceneId={startSceneId}
                  />
                  <div className="mt-6 text-center"><p className="text-xs text-slate-400 mb-2">點擊模擬器中的按鈕可跳轉對應場景</p></div>
                </div>
              )}
          </div>

     </div>

     {/* Image Modal */}
     {imageEditingSceneId && (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-800">編輯關卡圖片</h3>
             <button onClick={() => setImageEditingSceneId(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
           </div>
           <div className="p-6 space-y-4">
             <button 
               onClick={() => {
                 document.getElementById('scene-image-upload')?.click();
               }}
               className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
             >
               <Upload size={24} className="text-slate-400 group-hover:text-indigo-500 mb-2"/>
               <span className="text-sm font-bold text-slate-600">上傳新圖片</span>
               <input 
                 id="scene-image-upload" 
                 type="file" 
                 className="hidden" 
                 accept="image/*" 
                 onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     handleImageUpload(e, imageEditingSceneId);
                     setImageEditingSceneId(null);
                   }
                 }}
               />
             </button>
             
             <button 
               onClick={() => {
                 setIsAssetPickerOpen(true);
               }}
               className="w-full p-4 border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-all"
             >
               <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                 <ImageIcon size={20} className="text-indigo-500"/>
               </div>
               <div className="text-left">
                 <div className="text-sm font-bold text-slate-700">從素材庫選擇</div>
                 <div className="text-xs text-slate-500">選擇已上傳的背景或角色圖片</div>
               </div>
             </button>

             <button 
               onClick={() => {
                 if (commitSceneUpdate) {
                   commitSceneUpdate(imageEditingSceneId, { imageKeyword: '' });
                 }
                 setImageEditingSceneId(null);
               }}
               className="w-full p-4 border border-red-100 rounded-xl flex items-center gap-3 hover:bg-red-50 transition-all text-red-600"
             >
               <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                 <Trash2 size={20}/>
               </div>
               <div className="text-left">
                 <div className="text-sm font-bold">移除圖片</div>
                 <div className="text-xs opacity-80">取消使用圖片，恢復顯示文字</div>
               </div>
             </button>
           </div>
         </div>
       </div>
     )}

     {/* Asset Picker for Scene Image */}
     <AssetPickerModal
       isOpen={isAssetPickerOpen}
       onClose={() => setIsAssetPickerOpen(false)}
       onSelect={(url) => {
         if (commitSceneUpdate) {
           commitSceneUpdate(imageEditingSceneId!, { imageKeyword: url });
         }
         setIsAssetPickerOpen(false);
         setImageEditingSceneId(null);
       }}
       assets={assets}
       onDeleteAsset={onDeleteAsset}
     />
    </>
  );
};

const CharacterCreationModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: (c: Character) => void, initialData?: Character }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [desc, setDesc] = useState(initialData?.description || '');
    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
    const handleSave = () => { if(!name) return alert("請輸入角色名稱"); onSave({ id: initialData?.id || `char_${Date.now()}`, name, description: desc, avatarUrl }); };
    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
             <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                 <h3 className="text-xl font-bold mb-4">{initialData ? "編輯角色" : "新增角色"}</h3>
                 <div className="space-y-4">
                     <ModuleInput label={<>角色名稱 <span className="text-red-500">*</span></>} value={name} field="name" onChange={(d:any) => setName(d.name)} />
                     <ModuleInput label="描述" value={desc} field="desc" onChange={(d:any) => setDesc(d.desc)} />
                     <ModuleFileUpload label={<>角色頭像 <span className="text-red-500">*</span></>} field="avatarUrl" data={{avatarUrl}} onChange={(d:any) => setAvatarUrl(d.avatarUrl)} />
                     <div className="flex gap-2 justify-end mt-4">
                         <Button variant="outline" onClick={onClose}>取消</Button>
                         <Button onClick={handleSave}>儲存設定</Button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const BackgroundCreationModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: (a: GameAsset) => void, initialData?: GameAsset }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const handleSave = () => { if(!name || !url) return alert("請完整填寫資訊"); onSave({ id: initialData?.id || `asset_${Date.now()}`, name, url, type: 'image' }); }
    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
             <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                 <h3 className="text-xl font-bold mb-4">{initialData ? "編輯場景" : "新增場景/素材"}</h3>
                 <div className="space-y-4">
                     <ModuleInput label={<>素材名稱 <span className="text-red-500">*</span></>} value={name} field="name" onChange={(d:any) => setName(d.name)} />
                     <ModuleFileUpload label={<>圖片檔案 <span className="text-red-500">*</span></>} field="url" data={{url}} onChange={(d:any) => setUrl(d.url)} />
                     <div className="flex gap-2 justify-end mt-4">
                         <Button variant="outline" onClick={onClose}>取消</Button>
                         <Button onClick={handleSave}>儲存素材</Button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const SceneBuilderModal = ({ scene, onClose, onSave, characters = [], assets = [], onAddCharacter, onAddAsset, onPreviewAR, onUpdateCharacter, onUpdateAsset, onDeleteCharacter, onDeleteAsset }: any) => {
    const [title, setTitle] = useState(scene.title);
    const [modules, setModules] = useState<GameModule[]>(scene.modules || []);
    const [showMapModal, setShowMapModal] = useState(false);
    const [activeLocationModuleId, setActiveLocationModuleId] = useState<string | null>(null);
    const [showCharModal, setShowCharModal] = useState(false);
    const [showAssetModal, setShowAssetModal] = useState(false);
    
    // Edit tracking state
    const [editingChar, setEditingChar] = useState<Character | null>(null);
    const [editingAsset, setEditingAsset] = useState<GameAsset | null>(null);

    const addModule = (type: ModuleType) => { const newModule: GameModule = { id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type, data: {} }; if (type === 'STORY_DIALOGUE') newModule.data = { lines: [], style: 'RPG' }; if (type === 'ANS_SINGLE' || type === 'ANS_MULTI') newModule.data = { options: [{id: 'opt1', text: '選項 1', isCorrect: false}] }; if (type === 'ANS_NUMBER') newModule.data = { length: 4, answer: '1234' }; if (type === 'HINT') newModule.data = { hints: [{ text: '提示 1', delay: 60 }] }; if (type === 'PUZZLE_JIGSAW') newModule.data = { gridSize: 3 }; setModules([...modules, newModule]); };
    const updateModuleData = (id: string, data: any) => { setModules(prev => prev.map(m => m.id === id ? { ...m, data: { ...m.data, ...data } } : m)); };
    const deleteModule = (id: string) => { setModules(prev => prev.filter(m => m.id !== id)); };
    const moveModule = (index: number, direction: 'up' | 'down') => { const newModules = [...modules]; if (direction === 'up' && index > 0) { [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]]; } else if (direction === 'down' && index < newModules.length - 1) { [newModules[index + 1], newModules[index]] = [newModules[index], newModules[index + 1]]; } setModules(newModules); };
    const handleSave = () => { try { onSave({ ...scene, title, modules }); onClose(); } catch (e) { console.error("Save error:", e); alert("儲存失敗"); } };
    const handleOpenMap = (moduleId: string) => { setActiveLocationModuleId(moduleId); setShowMapModal(true); };

    // Handlers for edit actions
    const handleEditCharacter = (char: Character) => {
        setEditingChar(char);
        setShowCharModal(true);
    };

    const handleEditAsset = (asset: GameAsset) => {
        setEditingAsset(asset);
        setShowAssetModal(true);
    };

    const handleCharSave = (char: Character) => {
        if (editingChar) {
            onUpdateCharacter(char);
        } else {
            onAddCharacter(char);
        }
        setShowCharModal(false);
        setEditingChar(null);
    };

    const handleAssetSave = (asset: GameAsset) => {
         if (editingAsset) {
            onUpdateAsset(asset);
        } else {
            onAddAsset(asset);
        }
        setShowAssetModal(false);
        setEditingAsset(null);
    }

    const handleCharModalClose = () => {
        setShowCharModal(false);
        setEditingChar(null);
    }

    const handleAssetModalClose = () => {
        setShowAssetModal(false);
        setEditingAsset(null);
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                       <h2 className="text-xl font-bold text-slate-800 flex items-center"><Edit className="mr-2 text-indigo-600"/> 編輯場景</h2>
                       <div className="flex items-center">
                         <input type="text" className="text-lg font-bold border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-2 py-1 text-slate-700 bg-transparent transition-all" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="場景標題"/>
                         <span className="text-red-500 ml-1 font-bold">*</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>取消</Button>
                        <Button onClick={handleSave}>儲存變更</Button>
                    </div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">內容模組</h4>
                        <div className="space-y-2">
                            <ToolBtn label="📍 關卡位置" icon={MapPin} color="text-red-500" onClick={() => addModule('LOCATION')} />
                            <ToolBtn label="📖 純旁白" icon={FileText} color="text-slate-600" onClick={() => addModule('STORY_NARRATION')} />
                            <ToolBtn label="💬 角色對話" icon={MessageSquare} color="text-indigo-600" onClick={() => addModule('STORY_DIALOGUE')} />
                            <ToolBtn label="📝 純文字" icon={FileTextIcon} color="text-slate-600" onClick={() => addModule('TEXT')} />
                            <ToolBtn label="🖼️ 圖片" icon={ImageIcon} color="text-pink-500" onClick={() => addModule('IMAGE')} />
                            <ToolBtn label="🎬 影片" icon={Video} color="text-red-600" onClick={() => addModule('VIDEO')} />
                            <ToolBtn label="🔊 語音" icon={Mic} color="text-purple-500" onClick={() => addModule('AUDIO')} />
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-4">AR 互動</h4>
                            <ToolBtn label="📷 AR 辨識" icon={Scan} color="text-blue-500" onClick={() => addModule('AR_RECOGNIZE')} />
                            <ToolBtn label="👻 AR 透圖" icon={Eye} color="text-green-500" onClick={() => addModule('AR_TRANSPARENT')} />
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-4">解謎與互動</h4>
                            <ToolBtn label="✍️ 文字答題" icon={Edit} color="text-orange-500" onClick={() => addModule('ANS_TEXT')} />
                            <ToolBtn label="🔘 單選題" icon={Check} color="text-orange-500" onClick={() => addModule('ANS_SINGLE')} />
                            <ToolBtn label="☑️ 多選題" icon={List} color="text-orange-500" onClick={() => addModule('ANS_MULTI')} />
                            <ToolBtn label="🔢 數字鎖" icon={Lock} color="text-orange-500" onClick={() => addModule('ANS_NUMBER')} />
                            <ToolBtn label="🖼️ 圖片鎖" icon={ImageIcon} color="text-orange-500" onClick={() => addModule('ANS_IMAGE')} />
                            <ToolBtn label="📸 拍照任務" icon={Camera} color="text-orange-500" onClick={() => addModule('ANS_PHOTO')} />
                            <ToolBtn label="🎤 語音回答" icon={Mic} color="text-orange-500" onClick={() => addModule('ANS_VOICE')} />
                            <ToolBtn label="🧊 AR 答題" icon={BoxSelect} color="text-orange-500" onClick={() => addModule('ANS_AR')} />
                            <ToolBtn label="🧩 拼圖解謎" icon={Puzzle} color="text-purple-500" onClick={() => addModule('PUZZLE_JIGSAW')} />
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-4">輔助功能</h4>
                            <ToolBtn label="💡 提示系統" icon={HelpCircle} color="text-yellow-500" onClick={() => addModule('HINT')} />
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
                        <div className="max-w-2xl mx-auto space-y-4">
                            {modules.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl"><p className="text-slate-400 mb-2">此場景尚無內容</p><p className="text-sm text-slate-400">請從左側選擇模組加入</p></div>
                            ) : (
                                modules.map((module, index) => (
                                    <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center gap-2"><span className="font-bold text-sm text-slate-700">{getModuleName(module.type)}</span></div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => moveModule(index, 'up')} className="p-1 hover:bg-slate-200 rounded text-slate-500" disabled={index === 0}><MoveUp size={14}/></button>
                                                <button onClick={() => moveModule(index, 'down')} className="p-1 hover:bg-slate-200 rounded text-slate-500" disabled={index === modules.length-1}><MoveDown size={14}/></button>
                                                <button onClick={() => deleteModule(module.id)} className="p-1 hover:bg-red-50 text-red-400 rounded"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                        <div className="p-4"><ModuleRenderer module={module} onChange={(newData: any) => updateModuleData(module.id, newData)} onOpenMap={() => handleOpenMap(module.id)} onOpenCharModal={() => setShowCharModal(true)} onOpenAssetModal={() => setShowAssetModal(true)} characters={characters} assets={assets} onPreviewAR={onPreviewAR} onEditCharacter={handleEditCharacter} onEditAsset={handleEditAsset} onDeleteCharacter={onDeleteCharacter} onDeleteAsset={onDeleteAsset} /></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <MapPickerModal isOpen={showMapModal} onClose={() => setShowMapModal(false)} onConfirm={(data) => { if (activeLocationModuleId) { updateModuleData(activeLocationModuleId, { location: `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}` }); setShowMapModal(false); } }} />
                {showCharModal && (<CharacterCreationModal onClose={handleCharModalClose} onSave={handleCharSave} initialData={editingChar} />)}
                {showAssetModal && (<BackgroundCreationModal onClose={handleAssetModalClose} onSave={handleAssetSave} initialData={editingAsset} />)}
            </div>
        </div>
    );
};

const GameIntroForm = ({ info, setInfo, markDirty }: { info: GameInfoData, setInfo: (v: GameInfoData) => void, markDirty: () => void }) => {
    const [tagInput, setTagInput] = useState('');
    const [showMapModal, setShowMapModal] = useState(false);
    const fileInputId = "cover-upload-input";
    const handleChange = (field: keyof GameInfoData, value: any) => { setInfo({ ...info, [field]: value }); markDirty(); };
    const handleAddTag = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!info.tags.includes(tagInput.trim())) { handleChange('tags', [...info.tags, tagInput.trim()]); } setTagInput(''); } };
    const removeTag = (tag: string) => { handleChange('tags', info.tags.filter(t => t !== tag)); };
    const handleCoverClick = () => { const el = document.getElementById(fileInputId); if (el) el.click(); };
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { try { const result = await compressImage(file); handleChange('cover', result); } catch(e) { alert("圖片上傳失敗"); } } };
    return (
        <div className="max-w-3xl mx-auto p-8 animate-in fade-in duration-300">
          <div className="space-y-8">
            <div><label className="block text-lg font-bold text-slate-800 mb-2">遊戲標題 <span className="text-red-500">*</span></label><input type="text" value={info.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-lg" placeholder="輸入遊戲標題"/></div>
            <div>
               <label className="block text-lg font-bold text-slate-800 mb-2">遊戲類型 <span className="text-red-500">*</span></label>
               <div className="grid grid-cols-2 gap-4"><button onClick={() => handleChange('type', 'adventure')} className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${info.type === 'adventure' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-200 text-slate-600'}`}><MapIcon size={24} className="mr-2" /><span className="font-bold">實境遊戲 (Adventure)</span></button><button onClick={() => handleChange('type', 'guide')} className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${info.type === 'guide' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-200 text-slate-600'}`}><Headphones size={24} className="mr-2" /><span className="font-bold">智慧導覽 (Smart Guide)</span></button></div>
            </div>
            <div><label className="block text-lg font-bold text-slate-800 mb-2">遊戲簡介 <span className="text-red-500">*</span></label><textarea rows={5} value={info.desc} onChange={(e) => handleChange('desc', e.target.value)} className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all resize-none text-base" placeholder="輸入遊戲簡介"/></div>
            <div><label className="block text-lg font-bold text-slate-800 mb-2">遊戲封面圖 <span className="text-red-500">*</span></label><div onClick={handleCoverClick} className={`w-full max-w-md aspect-video ${info.cover && !info.cover.startsWith('http') && info.cover.length > 20 ? 'border-0' : 'border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50'} rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-all overflow-hidden relative group`}>{info.cover && (info.cover.startsWith('data:') || info.cover.startsWith('http')) ? (<><img src={info.cover} alt="Cover Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white font-bold flex items-center"><Edit size={16} className="mr-2"/>更換圖片</span></div></>) : (<><Upload size={32} className="mb-2" /><span className="text-sm text-center px-4 font-bold">點擊上傳封面圖</span><span className="text-xs mt-1">支援 JPG, PNG</span></>)}</div><input id={fileInputId} type="file" onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" /></div>
             <div><label className="block text-lg font-bold text-slate-800 mb-2">類別標籤</label><div className="w-full p-2 pl-4 rounded-xl border border-slate-300 bg-white flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition-all">{info.tags.map(tag => (<span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">{tag}<button onClick={() => removeTag(tag)} className="ml-2 hover:text-red-500"><X size={14} /></button></span>))}<input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="flex-1 outline-none min-w-[120px] py-2 bg-transparent text-slate-600 placeholder:text-slate-400" placeholder="輸入文字後按下ENTER即可新增" /></div></div>
            <MapPickerModal isOpen={showMapModal} onClose={() => setShowMapModal(false)} onConfirm={(data) => { const newInfo = { ...info, latitude: data.lat.toFixed(6), longitude: data.lng.toFixed(6) }; if (data.address) newInfo.location = data.address; setInfo(newInfo); markDirty(); setShowMapModal(false); }} initialLocation={info.location} />
          </div>
        </div>
      );
};

const ManualEditor = ({ setCurrentGame, setView, onBack, targetGameId, initialTab = 'INTRO' }: ViewProps & { onBack: () => void, targetGameId: string | null, initialTab?: 'INTRO' | 'NODES' | 'SETTINGS' }) => {
    const { user } = useAuth();
    const { games, saveGame } = useGame();
    const [gameInfo, setGameInfo] = useState<GameInfoData>({ title: '', desc: '', cover: '', tags: [], language: 'zh-TW', difficulty: 1, location: '', latitude: '', longitude: '', type: 'adventure' });
    const [isRecommended, setIsRecommended] = useState<boolean>(false);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [groups, setGroups] = useState<NodeGroup[]>([]);
    const [startSceneId, setStartSceneId] = useState<string>('');
    const [characters, setCharacters] = useState<Character[]>([]);
    const [assets, setAssets] = useState<GameAsset[]>([]);
    const [gameId, setGameId] = useState<string>(targetGameId || crypto.randomUUID());
    const [activeTab, setActiveTab] = useState<'INTRO' | 'NODES' | 'SETTINGS'>(initialTab);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [mosaicModal, setMosaicModal] = useState<{ isOpen: boolean, imageUrl: string, initialRect?: any, onConfirm: (rect: any) => void } | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;

        if(targetGameId) {
            const existing = games.find(g => g.id === targetGameId);
            if(existing) {
                setGameId(existing.id);
                setGameInfo({ title: existing.title, desc: existing.description, cover: existing.coverImageKeyword, tags: existing.tags || [], language: existing.language || 'zh-TW', difficulty: existing.difficulty || 1, location: existing.location || '', latitude: existing.latitude?.toString() || '', longitude: existing.longitude?.toString() || '', type: existing.type || 'adventure' });
                setScenes(existing.scenes);
                setGroups(existing.groups || []);
                setStartSceneId(existing.startSceneId);
                setIsRecommended(existing.isRecommended || false);
                setCharacters(existing.characters || []);
                setAssets(existing.assets || []);
                initializedRef.current = true;
            }
        } else {
             const initialSceneId = `scene_${Date.now()}`;
             const initialScene: Scene = { id: initialSceneId, title: '起點', text: '遊戲開始...', choices: [], x: 100, y: 100 };
             setScenes([initialScene]);
             setStartSceneId(initialSceneId);
             initializedRef.current = true;
        }
    }, [targetGameId, games]);

    const pushHistory = useCallback((newScenes: Scene[], newGroups: NodeGroup[]) => { const newState = { scenes: newScenes, groups: newGroups }; const newHistory = history.slice(0, historyIndex + 1); newHistory.push(newState); setHistory(newHistory); setHistoryIndex(newHistory.length - 1); }, [history, historyIndex]);
    const handleUndo = () => { if (historyIndex > 0) { const prevState = history[historyIndex - 1]; setScenes(prevState.scenes); setGroups(prevState.groups); setHistoryIndex(historyIndex - 1); } };
    const handleRedo = () => { if (historyIndex < history.length - 1) { const nextState = history[historyIndex + 1]; setScenes(nextState.scenes); setGroups(nextState.groups); setHistoryIndex(historyIndex + 1); } };
    
    const handleSaveGame = async (silent = false) => { 
        if (!gameInfo.title) { alert("請輸入遊戲標題"); return null; }
        if (!gameInfo.desc) { alert("請輸入遊戲簡介"); return null; }
        if (!gameInfo.cover) { alert("請上傳遊戲封面圖"); return null; }
        if (!gameInfo.type) { alert("請選擇遊戲類型"); return null; }

        setIsSaving(true);
        try {
            const gameData: Game = { 
                id: gameId, 
                title: gameInfo.title, 
                description: gameInfo.desc, 
                coverImageKeyword: gameInfo.cover, 
                author: user?.name || 'Anonymous', 
                authorId: user?.id, 
                startSceneId: startSceneId || scenes[0]?.id, 
                scenes, 
                groups, 
                type: gameInfo.type, 
                status: 'draft', 
                tags: gameInfo.tags, 
                language: gameInfo.language, 
                difficulty: gameInfo.difficulty, 
                location: gameInfo.location, 
                latitude: parseFloat(gameInfo.latitude) || 0, 
                longitude: parseFloat(gameInfo.longitude) || 0, 
                characters, 
                assets, 
                createdAt: new Date().toISOString(), 
                playCount: 0, 
                rating: 0, 
                isRecommended 
            }; 
            await saveGame(gameData); 
            
            if (!silent) {
                setShowSaveToast(true);
                setTimeout(() => setShowSaveToast(false), 3000);
            }
            return gameData;
        } catch (error) {
            console.error("Save error:", error);
            alert("儲存失敗，請檢查網路連線");
            return null;
        } finally {
            setIsSaving(false);
        }
    };
    const handleAddRelativeScene = (sourceId: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        const source = scenes.find(s => s.id === sourceId);
        if (!source) return;
        let x = source.x || 0;
        let y = source.y || 0;
        const HORIZONTAL_OFFSET = 260;
        const VERTICAL_OFFSET = 180;
        switch(direction) {
            case 'UP': y -= VERTICAL_OFFSET; break;
            case 'DOWN': y += VERTICAL_OFFSET; break;
            case 'LEFT': x -= HORIZONTAL_OFFSET; break;
            case 'RIGHT': x += HORIZONTAL_OFFSET; break;
        }

        // Push existing scenes to maintain consistency
        const updatedScenes = scenes.map(s => {
            if (s.id === sourceId) return s;
            const sx = s.x || 0;
            const sy = s.y || 0;
            const threshold = 100;
            
            if (direction === 'RIGHT' && sx >= x && Math.abs(sy - y) < threshold) return { ...s, x: sx + HORIZONTAL_OFFSET };
            if (direction === 'LEFT' && sx <= x && Math.abs(sy - y) < threshold) return { ...s, x: sx - HORIZONTAL_OFFSET };
            if (direction === 'DOWN' && sy >= y && Math.abs(sx - x) < threshold) return { ...s, y: sy + VERTICAL_OFFSET };
            if (direction === 'UP' && sy <= y && Math.abs(sx - x) < threshold) return { ...s, y: sy - VERTICAL_OFFSET };
            return s;
        });

        const newSceneId = `scene_${Date.now()}`;
        const newScene: Scene = { id: newSceneId, title: '新場景', text: '', choices: [], x, y };
        const finalScenes = [...updatedScenes, newScene];
        setScenes(finalScenes);
        pushHistory(finalScenes, groups);
        setActiveSceneId(newSceneId);
    };
    const handleAddGroup = (sceneIds: string[]) => { const newGroup: NodeGroup = { id: `group_${Date.now()}`, title: '新群組', type: 'ALL', sceneIds: sceneIds, choices: [] }; const newGroups = [...groups, newGroup]; setGroups(newGroups); pushHistory(scenes, newGroups); };
    const handleDeleteGroup = (groupId: string) => { const newGroups = groups.filter(g => g.id !== groupId); setGroups(newGroups); pushHistory(scenes, newGroups); }
    const handleBatchAddScenes = (newScenes: Scene[]) => { const updatedScenes = [...scenes, ...newScenes]; setScenes(updatedScenes); pushHistory(updatedScenes, groups); }
    const handleBatchUpdateScenes = (updates: {id: string, x?: number, y?: number}[]) => { const updatedScenes = scenes.map(s => { const update = updates.find(u => u.id === s.id); return update ? { ...s, ...update } : s; }); setScenes(updatedScenes); }
    const [editingScene, setEditingScene] = useState<Scene | null>(null);
    const [arPreviewData, setArPreviewData] = useState<any>(null);

    // Update handlers for child components
    const handleUpdateCharacter = (updatedChar: Character) => {
        setCharacters(prev => {
            const index = prev.findIndex(c => c.id === updatedChar.id);
            if (index !== -1) {
                const newChars = [...prev];
                newChars[index] = updatedChar;
                return newChars;
            }
            return [...prev, updatedChar];
        });
    };

    const handleUpdateAsset = (updatedAsset: GameAsset) => {
        setAssets(prev => {
            const index = prev.findIndex(a => a.id === updatedAsset.id);
            if (index !== -1) {
                const newAssets = [...prev];
                newAssets[index] = updatedAsset;
                return newAssets;
            }
            return [...prev, updatedAsset];
        });
    }

    const handleDeleteCharacter = (id: string) => {
        console.log("正在刪除 ID:", id);
        if (confirm("確定要刪除此角色嗎？")) {
            setCharacters(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleDeleteAsset = (id: string) => {
        console.log("正在刪除 ID:", id);
        if (confirm("確定要刪除此素材嗎？")) {
            setAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100">
             <div className="bg-white border-b border-slate-200 px-4 py-2 flex justify-between items-center shadow-sm z-20">
                 <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20}/></button>
                     <h2 className="font-bold text-lg text-slate-800">{gameInfo.title || "未命名遊戲"}</h2>
                     <div className="flex bg-slate-100 p-1 rounded-lg">
                         <button onClick={() => setActiveTab('INTRO')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'INTRO' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>基本資訊</button>
                         <button onClick={() => setActiveTab('NODES')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'NODES' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>遊戲編輯</button>
                         <button onClick={() => setActiveTab('SETTINGS')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'SETTINGS' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>進階設定</button>
                     </div>
                 </div>
                 <div className="flex gap-2">
                     <Button variant="outline" onClick={() => handleSaveGame()} isLoading={isSaving}><Save size={16} className="mr-2"/> 儲存草稿</Button>
                     <Button isLoading={isSaving} onClick={async () => { 
                         const savedGame = await handleSaveGame(true); 
                         if (savedGame) { 
                             setCurrentGame(savedGame); 
                             setView('PLAY'); 
                         } 
                     }}><Play size={16} className="mr-2"/> 試玩</Button>
                     <Button variant="outline" isLoading={isSaving} onClick={async () => { if(await handleSaveGame(true)) setShowShareModal(true); }} className="ml-2"><Share2 size={16} className="mr-2"/> 分享</Button>
                 </div>
             </div>
             <div className="flex-1 overflow-hidden relative">
                 {activeTab === 'INTRO' && (<div className="h-full overflow-y-auto"><GameIntroForm info={gameInfo} setInfo={setGameInfo} markDirty={() => {}} /></div>)}
                  {activeTab === 'NODES' && (<VisualNodeEditor scenes={scenes} groups={groups} activeSceneId={activeSceneId} setActiveSceneId={setActiveSceneId} activeGroupId={activeGroupId} setActiveGroupId={setActiveGroupId} onAddScene={(x: number, y: number) => { 
                    const HORIZONTAL_OFFSET = 260;
                    const threshold = 100;
                    
                    // Check if dropped on a connection line
                    let brokenConnection = false;
                    let updatedScenes = scenes.map(s => {
                        const newChoices = s.choices.filter(c => {
                            const targetScene = scenes.find(ts => ts.id === c.nextSceneId);
                            if (!targetScene) return true;
                            
                            // Simple line segment distance check
                            const x1 = (s.x || 0) + 100; // Source bottom center
                            const y1 = (s.y || 0) + 150;
                            const x2 = (targetScene.x || 0) + 100; // Target top center
                            const y2 = targetScene.y || 0;
                            
                            // Distance from point (x+100, y+75) to line segment (x1,y1)-(x2,y2)
                            const px = x + 100;
                            const py = y + 75;
                            
                            const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
                            if (l2 === 0) return true;
                            
                            let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
                            t = Math.max(0, Math.min(1, t));
                            const projX = x1 + t * (x2 - x1);
                            const projY = y1 + t * (y2 - y1);
                            
                            const dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
                            
                            if (dist < 40) { // If dropped within 40px of a line
                                brokenConnection = true;
                                return false; // Remove this connection
                            }
                            return true;
                        });
                        return { ...s, choices: newChoices };
                    });

                    const colliding = updatedScenes.some(s => Math.abs((s.x || 0) - x) < threshold && Math.abs((s.y || 0) - y) < threshold);
                    if (colliding && !brokenConnection) {
                        updatedScenes = updatedScenes.map(s => ((s.x || 0) >= x && Math.abs((s.y || 0) - y) < threshold) ? { ...s, x: (s.x || 0) + HORIZONTAL_OFFSET } : s);
                    }
                    const newScene: Scene = { id: `scene_${Date.now()}`, title: '新場景', text: '', choices: [], x, y }; 
                    const finalScenes = [...updatedScenes, newScene]; 
                    setScenes(finalScenes); 
                    pushHistory(finalScenes, groups); 
                  }} onAddRelativeScene={handleAddRelativeScene} onUpdateScene={(id: string, updates: Partial<Scene>) => { const newScenes = scenes.map(s => s.id === id ? { ...s, ...updates } : s); setScenes(newScenes); }} commitSceneUpdate={(id: string, updates: Partial<Scene>) => { const newScenes = scenes.map(s => s.id === id ? { ...s, ...updates } : s); setScenes(newScenes); pushHistory(newScenes, groups); }} onUpdateGroup={(id: string, updates: Partial<NodeGroup>) => { const newGroups = groups.map(g => g.id === id ? { ...g, ...updates } : g); setGroups(newGroups); pushHistory(scenes, newGroups); }} onAddGroup={handleAddGroup} onDeleteGroup={handleDeleteGroup} onDeleteScene={(id: string) => { const newScenes = scenes.filter(s => s.id !== id); const cleanedScenes = newScenes.map(s => ({ ...s, choices: s.choices.filter(c => c.nextSceneId !== id) })); setScenes(cleanedScenes); pushHistory(cleanedScenes, groups); }} onBatchAddScenes={handleBatchAddScenes} onBatchUpdateScenes={handleBatchUpdateScenes} commitBatchSceneUpdate={(updates: {id: string, x?: number, y?: number}[]) => { const updatedScenes = scenes.map(s => { const update = updates.find(u => u.id === s.id); return update ? { ...s, ...update } : s; }); setScenes(updatedScenes); pushHistory(updatedScenes, groups); }} onHistoryAction={(action: 'undo' | 'redo') => action === 'undo' ? handleUndo() : handleRedo()} canUndo={historyIndex > 0} canRedo={historyIndex < history.length - 1} onEditSceneModules={(scene: Scene) => setEditingScene(scene)} onPreviewAR={(data: any) => setArPreviewData(data)} gameInfo={gameInfo} characters={characters} assets={assets} startSceneId={startSceneId} onSetStartScene={(id: string) => setStartSceneId(id === startSceneId ? '' : id)} />)}
             </div>
             {editingScene && (<SceneBuilderModal scene={editingScene} onClose={() => setEditingScene(null)} onSave={(updatedScene: Scene) => { const newScenes = scenes.map(s => s.id === updatedScene.id ? { ...s, ...updatedScene } : s); setScenes(newScenes); pushHistory(newScenes, groups); }} characters={characters} assets={assets} onAddCharacter={(c: Character) => setCharacters([...characters, c])} onAddAsset={(a: GameAsset) => setAssets([...assets, a])} onPreviewAR={(data: any) => setArPreviewData(data)} onUpdateCharacter={handleUpdateCharacter} onUpdateAsset={handleUpdateAsset} onDeleteCharacter={handleDeleteCharacter} onDeleteAsset={handleDeleteAsset} />)}
             {arPreviewData && (<div className="fixed inset-0 z-[200] bg-black"><ARScanner module={{ type: 'AR_RECOGNIZE', data: arPreviewData, id: 'preview' }} onResolve={() => setArPreviewData(null)} /><button onClick={() => setArPreviewData(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white"><X/></button></div>)}
             
             {/* Share Modal */}
             {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">掃描二維碼體驗</h3>
                        <div className="bg-white p-2 rounded-lg inline-block mb-4 border border-slate-200">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}?view=PLAY&gameId=${gameId}`)}`} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-sm text-slate-500 mb-6">請使用手機相機掃描上方二維碼，即可在手機上體驗操作效果。</p>
                        <Button onClick={() => setShowShareModal(false)} className="w-full">關閉</Button>
                    </div>
                </div>
             )}

             {/* Save Toast */}
             {showSaveToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle className="text-green-400" size={20} />
                    <span className="font-bold">遊戲草稿已儲存</span>
                </div>
             )}

             {mosaicModal?.isOpen && (
                <MosaicModal 
                    isOpen={mosaicModal.isOpen}
                    imageUrl={mosaicModal.imageUrl}
                    initialRect={mosaicModal.initialRect}
                    onClose={() => setMosaicModal(null)}
                    onConfirm={(rect) => {
                        mosaicModal.onConfirm(rect);
                        setMosaicModal(null);
                    }}
                />
             )}
        </div>
    );
};

const GameList = ({ setViewMode, setTargetGameId, setView }: { setViewMode: (m: EditorViewMode) => void, setTargetGameId: (id: string | null) => void, setView: (v: any) => void }) => {
    const { user } = useAuth();
    const { getUserGames, deleteGame, updateGameStatus } = useGame();
    const myGames = getUserGames(user?.name || '');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
    const [gameToPublish, setGameToPublish] = useState<Game | null>(null);

    const handleCreateNew = () => { setTargetGameId(null); setViewMode('SELECT_MODE'); };
    const handleEdit = (game: Game) => { if (game.status === 'published' || game.status === 'review') { alert('此遊戲已發佈或審核中，暫時無法編輯。'); return; } setTargetGameId(game.id); setViewMode('MANUAL'); };
    const handlePublishClick = (game: Game, e: React.MouseEvent) => { e.stopPropagation(); setGameToPublish(game); setIsPublishModalOpen(true); };
    const confirmPublish = () => { if (gameToPublish) { updateGameStatus(gameToPublish.id, 'review'); setIsPublishModalOpen(false); setGameToPublish(null); } };
    const StatusBadge = ({ status }: { status?: GameStatus }) => { switch(status) { case 'published': return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">已發佈</span>; case 'review': return <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold border border-yellow-200">待審核</span>; case 'rejected': return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200">退回</span>; default: return <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold border border-slate-200">草稿</span>; } };
    const RecommendedBadge = () => <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border border-yellow-500 animate-pulse"><Star size={10} fill="currentColor" /> 官方推薦</div>;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col animate-in fade-in duration-300 relative">
           <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between mb-8"><h1 className="text-3xl font-black text-slate-800">{user?.name}的遊戲庫</h1><button onClick={handleCreateNew} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-1">創建遊戲 <Plus size={24} strokeWidth={3} /></button></div>
              {myGames.length === 0 ? (<div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"><p className="text-slate-500 mb-4">還沒有任何遊戲，開始你的創作之旅吧！</p><Button onClick={handleCreateNew}>立即開始</Button></div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{myGames.map(game => (<div key={game.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all relative"><div className="h-40 bg-slate-100 relative overflow-hidden">{game.isRecommended && <RecommendedBadge />}<img src={game.coverImageKeyword && game.coverImageKeyword.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/400/300`} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute top-2 right-2"><StatusBadge status={game.status} /></div></div><div className="p-4 flex-1"><h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{game.title || '未命名遊戲'}</h3><p className="text-xs text-slate-500 line-clamp-2">{game.description || '無描述'}</p></div><div className="p-3 border-t border-slate-100 flex gap-2"><button onClick={() => handleEdit(game)} className={`flex-1 flex items-center justify-center py-2 text-sm font-bold rounded-lg transition-colors ${game.status === 'draft' || game.status === 'rejected' ? 'text-slate-600 bg-slate-50 hover:bg-slate-100' : 'text-slate-400 bg-slate-50 cursor-not-allowed'}`}><Edit size={14} className="mr-1.5" /> 編輯</button>{game.status === 'draft' && (<button onClick={(e) => handlePublishClick(game, e)} className="flex-1 flex items-center justify-center py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><UploadCloud size={14} className="mr-1.5" /> 發佈</button>)}<button onClick={(e) => { e.stopPropagation(); setGameToDelete(game); setIsDeleteModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button></div></div>))}</div>)}
           </div>
           {isPublishModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"><div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center"><div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><UploadCloud size={32} /></div><h3 className="text-xl font-bold text-slate-900 mb-2">確認送審</h3><p className="text-slate-600 mb-6 text-sm leading-relaxed">將把你的大作送審，送審期間無法修改內容，請確認內容都已完善，按下確認後送審。</p><div className="flex gap-3"><button onClick={() => setIsPublishModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button><button onClick={confirmPublish} className="flex-1 py-3 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">確認送審</button></div></div></div>)}
           {isDeleteModalOpen && gameToDelete && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"><div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full"><div className="flex items-center text-red-600 font-bold text-lg mb-4"><AlertTriangle className="mr-2" /> 確認刪除</div><p className="text-slate-600 mb-4 text-sm">您確定要刪除 <span className="font-bold text-slate-900">{gameToDelete.title || '此遊戲'}</span> 嗎？此動作無法復原。</p><div className="flex gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button><button onClick={() => { deleteGame(gameToDelete.id); setIsDeleteModalOpen(false); }} className="flex-1 py-2.5 rounded-lg bg-red-500 font-bold text-white hover:bg-red-600 transition-colors">確認刪除</button></div></div></div>)}
        </div>
    );
};

const ModeSelection = ({ setViewMode }: { setViewMode: (mode: EditorViewMode) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 animate-in fade-in zoom-in duration-300 relative">
    <button onClick={() => setViewMode('LIST')} className="absolute top-4 left-4 flex items-center text-slate-500 hover:text-slate-800 transition-colors"><ArrowLeft size={20} className="mr-2" /> <span className="font-bold">返回列表</span></button>
    <div className="text-center mb-10"><h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">選擇創作方式</h1><p className="text-slate-500 text-lg">你想要如何打造你的冒險故事？</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
      <button onClick={() => setViewMode('AI')} className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-2 border-slate-100 hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300 text-left overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wand2 size={120} className="text-indigo-600" /></div><div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Sparkles size={32} /></div><h3 className="text-2xl font-bold text-slate-900 mb-2">AI 快速生成</h3><p className="text-slate-500 mb-6 text-center">只要輸入一個簡單的想法或主題，AI 助手將在幾秒鐘內為你生成完整的劇本、選項與結局。</p><div className="mt-auto flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200"><Coins size={12} className="mr-1" /> 消耗點數</div></button>
      <button onClick={() => setViewMode('MANUAL')} className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-2 border-slate-100 hover:border-pink-500 hover:shadow-pink-100 transition-all duration-300 text-left overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><PenTool size={120} className="text-pink-600" /></div><div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><PenTool size={32} /></div><h3 className="text-2xl font-bold text-slate-900 mb-2">手動編輯創作</h3><p className="text-slate-500 mb-6 text-center">從零開始打造你的世界。完全自定義每一個場景、對話與分歧選項，適合有具體劇本的創作者。</p><div className="mt-auto flex items-center text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">完全免費</div></button>
    </div>
  </div>
);

const AIEditor = ({ setCurrentGame, setView, onBack }: ViewProps & { onBack: () => void }) => {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, deductPoints } = useAuth();
  const GENERATION_COST = 50;

  const handleGenerate = async () => {
    if (!user || !idea.trim()) return;
    if (user.points < GENERATION_COST) { setError(`點數不足！需要 ${GENERATION_COST} 點，目前擁有 ${user.points} 點。`); return; }
    setIsGenerating(true);
    setError(null);
    const success = deductPoints(GENERATION_COST);
    if (!success) { setIsGenerating(false); setError("交易失敗"); return; }
    try { const newGame = await generateGameFromIdea(idea); newGame.author = user.name; setCurrentGame(newGame); setView('PLAY'); } catch (err) { setError("生成失敗，請稍後再試。（點數已返還）"); } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative">
          <button onClick={onBack} className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors"><ArrowLeft size={24} /></button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white shadow-inner"><Wand2 size={32} /></div>
          <h2 className="text-3xl font-bold text-white mb-2">AI 遊戲製作大師</h2>
          <p className="text-indigo-100 text-sm sm:text-base">輸入簡單想法，AI 為你生成完整冒險。</p>
          {user && (<div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center text-white text-xs font-bold border border-white/10"><Coins size={12} className="mr-1 text-yellow-300" />擁有: {user.points}</div>)}
        </div>
        <div className="p-8 sm:p-10">
          <div className="mb-8"><label htmlFor="idea" className="block text-sm font-bold text-slate-700 mb-2">你想做什麼樣的遊戲？</label><textarea id="idea" rows={4} className="block w-full rounded-xl border border-slate-300 py-3 px-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base resize-none transition-colors" placeholder="例如：一個關於在台北101迷路的鬼故事，或者是在台南尋找失落食譜的美食冒險..." value={idea} onChange={(e) => setIdea(e.target.value)} disabled={isGenerating}/></div>
          {error && (<div className="mb-6 rounded-lg bg-red-50 p-4 flex items-center text-red-700 text-sm"><AlertTriangle size={16} className="mr-2 flex-shrink-0" />{error}</div>)}
          <div className="flex flex-col gap-4"><Button size="lg" onClick={handleGenerate} disabled={!idea.trim() || isGenerating || (user ? user.points < GENERATION_COST : true)} isLoading={isGenerating} className="w-full">{!isGenerating && <Sparkles size={18} className="mr-2" />}{isGenerating ? 'AI 正在編寫劇本中...' : `開始生成 (消耗 ${GENERATION_COST} 點)`}</Button></div>
        </div>
      </div>
    </div>
  );
};

export const Editor: React.FC<ViewProps> = ({ setCurrentGame, setView, currentGame }) => {
  const [viewMode, setViewMode] = useState<EditorViewMode>('LIST');
  const [targetGameId, setTargetGameId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Auto-open editor if returning from Player with a draft
  useEffect(() => {
    if (currentGame && currentGame.status === 'draft') {
        setTargetGameId(currentGame.id);
        setViewMode('MANUAL');
    }
  }, []);

  if (!user) {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
            <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Lock size={32} /></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">需要登入</h2>
                <p className="text-slate-500 mb-6">您需要登入帳號才能開始創作遊戲。</p>
                <Button onClick={() => setView('LOGIN')} className="w-full">前往登入</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      {viewMode === 'LIST' && <GameList setViewMode={setViewMode} setTargetGameId={setTargetGameId} setView={setView} />}
      {viewMode === 'SELECT_MODE' && <ModeSelection setViewMode={setViewMode} />}
      {viewMode === 'AI' && <AIEditor setCurrentGame={setCurrentGame} setView={setView} onBack={() => setViewMode('SELECT_MODE')} />}
      {viewMode === 'MANUAL' && (
        <ManualEditor 
            setCurrentGame={setCurrentGame} 
            setView={setView} 
            onBack={() => {
                setViewMode('LIST');
                // Clear the global current game so it doesn't auto-reopen if we explicitly backed out
                setCurrentGame(null);
            }} 
            targetGameId={targetGameId} 
            initialTab={currentGame?.status === 'draft' ? 'NODES' : 'INTRO'}
        />
      )}
    </div>
  );
};
