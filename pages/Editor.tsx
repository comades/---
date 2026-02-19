
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ViewProps, Game, Scene, Choice, NodeGroup, GameType, GameModule, ModuleType, Character, GameAsset, GameStatus } from '../types';
import { Button } from '../components/Button';
import { generateGameFromIdea } from '../services/geminiService';
import { Sparkles, Wand2, AlertCircle, Coins, Lock, PenTool, Save, Plus, Trash2, ArrowLeft, Image as ImageIcon, Layout, ArrowRight, Edit, Calendar, X, AlertTriangle, MapPin, Globe, Star, Upload, Map as MapIcon, ExternalLink, LogOut, Check, Search, ChevronDown, GitBranch, MousePointer2, Link as LinkIcon, BoxSelect, Settings, GripVertical, MoreHorizontal, Ungroup, Hand, Undo, Redo, Grab, Copy, Scissors, Clipboard, Headphones, FileText, Video, Mic, Scan, Key, Camera, MessageSquare, Lightbulb, MoveUp, MoveDown, HelpCircle, GripHorizontal, UploadCloud, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ARScanner } from './Player';

type EditorViewMode = 'LIST' | 'SELECT_MODE' | 'AI' | 'MANUAL';
type ToolType = 'POINTER' | 'ADD' | 'CONNECT' | 'GROUP';

// Helper for history
interface HistoryState {
  scenes: Scene[];
  groups: NodeGroup[];
}

// --- Independent Sub-Components (Fixed Focus Issue) ---

const ModuleInput = ({ label, value, field, placeholder, onChange }: { label: string, value: any, field: string, placeholder?: string, onChange: (d: any) => void }) => (
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

const ModuleTextArea = ({ label, value, field, placeholder, onChange }: { label: string, value: any, field: string, placeholder?: string, onChange: (d: any) => void }) => (
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

const ModuleFileUpload = ({ label, field, data, accept = "image/*", onChange }: { label: string, field: string, data: any, accept?: string, onChange: (d: any) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { 
        const file = e.target.files?.[0]; 
        if (file) { 
            const reader = new FileReader(); 
            reader.onload = (ev) => onChange({ [field]: ev.target?.result }); 
            reader.readAsDataURL(file); 
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

// Reusable Map Picker Modal
const MapPickerModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    initialLocation = '' 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: (data: { lat: number, lng: number, address: string }) => void;
    initialLocation?: string;
}) => {
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

export const Editor: React.FC<ViewProps> = ({ setCurrentGame, setView }) => {
  const [viewMode, setViewMode] = useState<EditorViewMode>('LIST');
  const { user } = useAuth();
  
  if (!user) {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
            <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">需要登入</h2>
                <p className="text-slate-500 mb-6">您需要登入帳號才能開始創作遊戲。</p>
                <Button onClick={() => setView('LOGIN')} className="w-full">前往登入</Button>
            </div>
        </div>
    );
  }

  // State to hold the game we are currently editing
  const [targetGameId, setTargetGameId] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      {viewMode === 'LIST' && (
        <GameList 
            setViewMode={setViewMode} 
            setTargetGameId={setTargetGameId} 
            setView={setView} 
        />
      )}
      {viewMode === 'SELECT_MODE' && (
        <ModeSelection 
            setViewMode={setViewMode} 
        />
      )}
      {viewMode === 'AI' && (
        <AIEditor 
            setCurrentGame={setCurrentGame} 
            setView={setView} 
            onBack={() => setViewMode('SELECT_MODE')} 
        />
      )}
      {viewMode === 'MANUAL' && (
        <ManualEditor 
            setCurrentGame={setCurrentGame} 
            setView={setView} 
            onBack={() => setViewMode('LIST')} 
            targetGameId={targetGameId}
        />
      )}
    </div>
  );
};

// --- Sub-Component: Game List (Default View) ---
const GameList = ({ setViewMode, setTargetGameId, setView }: { setViewMode: (m: EditorViewMode) => void, setTargetGameId: (id: string | null) => void, setView: (v: any) => void }) => {
    const { user } = useAuth();
    const { getUserGames, deleteGame, updateGameStatus } = useGame();
    const myGames = getUserGames(user?.name || '');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
    const [gameToPublish, setGameToPublish] = useState<Game | null>(null);

    const handleCreateNew = () => {
        setTargetGameId(null);
        setViewMode('SELECT_MODE');
    };

    const handleEdit = (game: Game) => {
        if (game.status === 'published' || game.status === 'review') {
            alert('此遊戲已發佈或審核中，暫時無法編輯。');
            return;
        }
        setTargetGameId(game.id);
        setViewMode('MANUAL');
    };

    const handlePublishClick = (game: Game, e: React.MouseEvent) => {
        e.stopPropagation();
        setGameToPublish(game);
        setIsPublishModalOpen(true);
    };

    const confirmPublish = () => {
        if (gameToPublish) {
            updateGameStatus(gameToPublish.id, 'review');
            setIsPublishModalOpen(false);
            setGameToPublish(null);
        }
    };

    const StatusBadge = ({ status }: { status?: GameStatus }) => {
        switch(status) {
            case 'published': return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">已發佈</span>;
            case 'review': return <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold border border-yellow-200">待審核</span>;
            case 'rejected': return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200">退回</span>;
            default: return <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold border border-slate-200">草稿</span>;
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col animate-in fade-in duration-300 relative">
           <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-800">{user?.name}的遊戲庫</h1>
                <button onClick={handleCreateNew} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-1">
                   創建遊戲 <Plus size={24} strokeWidth={3} />
                </button>
              </div>
              
              {myGames.length === 0 ? (
                   <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                       <p className="text-slate-500 mb-4">還沒有任何遊戲，開始你的創作之旅吧！</p>
                       <Button onClick={handleCreateNew}>立即開始</Button>
                   </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {myGames.map(game => (
                         <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                               <img src={game.coverImageKeyword.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/400/300`} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                               <div className="absolute top-2 right-2">
                                   <StatusBadge status={game.status} />
                               </div>
                            </div>
                            <div className="p-4 flex-1">
                               <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{game.title || '未命名遊戲'}</h3>
                               <p className="text-xs text-slate-500 line-clamp-2">{game.description || '無描述'}</p>
                            </div>
                            <div className="p-3 border-t border-slate-100 flex gap-2">
                               <button onClick={() => handleEdit(game)} className={`flex-1 flex items-center justify-center py-2 text-sm font-bold rounded-lg transition-colors ${game.status === 'draft' || game.status === 'rejected' ? 'text-slate-600 bg-slate-50 hover:bg-slate-100' : 'text-slate-400 bg-slate-50 cursor-not-allowed'}`}>
                                   <Edit size={14} className="mr-1.5" /> 編輯
                               </button>
                               {game.status === 'draft' && (
                                   <button onClick={(e) => handlePublishClick(game, e)} className="flex-1 flex items-center justify-center py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                       <UploadCloud size={14} className="mr-1.5" /> 發佈
                                   </button>
                               )}
                               <button onClick={(e) => { e.stopPropagation(); setGameToDelete(game); setIsDeleteModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                   <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                     ))}
                  </div>
              )}
           </div>
           
           {/* Publish Confirmation Modal */}
           {isPublishModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                   <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center">
                       <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <UploadCloud size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 mb-2">確認送審</h3>
                       <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                           將把你的大作送審，送審期間無法修改內容，請確認內容都已完善，按下確認後送審。
                       </p>
                       <div className="flex gap-3">
                           <button onClick={() => setIsPublishModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button>
                           <button onClick={confirmPublish} className="flex-1 py-3 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">確認送審</button>
                       </div>
                   </div>
               </div>
           )}

           {/* Delete Modal */}
           {isDeleteModalOpen && gameToDelete && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
                  <div className="flex items-center text-red-600 font-bold text-lg mb-4">
                      <AlertTriangle className="mr-2" /> 確認刪除
                  </div>
                  <p className="text-slate-600 mb-4 text-sm">
                      您確定要刪除 <span className="font-bold text-slate-900">{gameToDelete.title || '此遊戲'}</span> 嗎？此動作無法復原。
                  </p>
                  <div className="flex gap-3">
                     <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button>
                     <button onClick={() => { deleteGame(gameToDelete.id); setIsDeleteModalOpen(false); }} className="flex-1 py-2.5 rounded-lg bg-red-500 font-bold text-white hover:bg-red-600 transition-colors">確認刪除</button>
                  </div>
               </div>
             </div>
           )}
        </div>
    );
};

// --- Sub-Component: Mode Selection ---
const ModeSelection = ({ setViewMode }: { setViewMode: (mode: EditorViewMode) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 animate-in fade-in zoom-in duration-300 relative">
    <button onClick={() => setViewMode('LIST')} className="absolute top-4 left-4 flex items-center text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> <span className="font-bold">返回列表</span>
    </button>

    <div className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">選擇創作方式</h1>
      <p className="text-slate-500 text-lg">你想要如何打造你的冒險故事？</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
      {/* AI Mode Card */}
      <button 
        onClick={() => setViewMode('AI')}
        className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-2 border-slate-100 hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300 text-left overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wand2 size={120} className="text-indigo-600" />
        </div>
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Sparkles size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">AI 快速生成</h3>
        <p className="text-slate-500 mb-6 text-center">
          只要輸入一個簡單的想法或主題，AI 助手將在幾秒鐘內為你生成完整的劇本、選項與結局。
        </p>
        <div className="mt-auto flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
           <Coins size={12} className="mr-1" /> 消耗點數
        </div>
      </button>

      {/* Manual Mode Card */}
      <button 
        onClick={() => setViewMode('MANUAL')}
        className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-2 border-slate-100 hover:border-pink-500 hover:shadow-pink-100 transition-all duration-300 text-left overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PenTool size={120} className="text-pink-600" />
        </div>
        <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <PenTool size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">手動編輯創作</h3>
        <p className="text-slate-500 mb-6 text-center">
          從零開始打造你的世界。完全自定義每一個場景、對話與分歧選項，適合有具體劇本的創作者。
        </p>
        <div className="mt-auto flex items-center text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
           完全免費
        </div>
      </button>
    </div>
  </div>
);

// --- Sub-Component: AI Editor ---
const AIEditor = ({ setCurrentGame, setView, onBack }: ViewProps & { onBack: () => void }) => {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, deductPoints } = useAuth();
  const GENERATION_COST = 50;

  const handleGenerate = async () => {
    if (!user || !idea.trim()) return;

    if (user.points < GENERATION_COST) {
        setError(`點數不足！需要 ${GENERATION_COST} 點，目前擁有 ${user.points} 點。`);
        return;
    }
    
    setIsGenerating(true);
    setError(null);

    const success = deductPoints(GENERATION_COST);
    if (!success) {
         setIsGenerating(false);
         setError("交易失敗");
         return;
    }

    try {
      const newGame = await generateGameFromIdea(idea);
      newGame.author = user.name;
      setCurrentGame(newGame);
      setView('PLAY');
    } catch (err) {
      setError("生成失敗，請稍後再試。（點數已返還）");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative">
          <button onClick={onBack} className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white shadow-inner">
            <Wand2 size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">AI 遊戲製作大師</h2>
          <p className="text-indigo-100 text-sm sm:text-base">
            輸入簡單想法，AI 為你生成完整冒險。
          </p>
          {user && (
            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center text-white text-xs font-bold border border-white/10">
                <Coins size={12} className="mr-1 text-yellow-300" />
                擁有: {user.points}
            </div>
          )}
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <label htmlFor="idea" className="block text-sm font-bold text-slate-700 mb-2">
              你想做什麼樣的遊戲？
            </label>
            <textarea
              id="idea"
              rows={4}
              className="block w-full rounded-xl border border-slate-300 py-3 px-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base resize-none transition-colors"
              placeholder="例如：一個關於在台北101迷路的鬼故事，或者是在台南尋找失落食譜的美食冒險..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 flex items-center text-red-700 text-sm">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button 
              size="lg" 
              onClick={handleGenerate} 
              disabled={!idea.trim() || isGenerating || (user ? user.points < GENERATION_COST : true)}
              isLoading={isGenerating}
              className="w-full"
            >
              {!isGenerating && <Sparkles size={18} className="mr-2" />}
              {isGenerating ? 'AI 正在編寫劇本中...' : `開始生成 (消耗 ${GENERATION_COST} 點)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const GameIntroForm = ({ info, setInfo, markDirty }: { info: GameInfoData, setInfo: (v: GameInfoData) => void, markDirty: () => void }) => {
    // ... (Same content, kept concise for output limit, ensure full logic in actual file)
    const [tagInput, setTagInput] = useState('');
    const [showMapModal, setShowMapModal] = useState(false);
    const fileInputId = "cover-upload-input";

    const handleChange = (field: keyof GameInfoData, value: any) => {
        setInfo({ ...info, [field]: value });
        markDirty();
    };
    
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        if (!info.tags.includes(tagInput.trim())) {
            handleChange('tags', [...info.tags, tagInput.trim()]);
        }
        setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        handleChange('tags', info.tags.filter(t => t !== tag));
    };

    const handleCoverClick = () => {
        const el = document.getElementById(fileInputId);
        if (el) el.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert("檔案過大，請上傳小於 10MB 的圖片");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            handleChange('cover', result);
        };
        reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="max-w-3xl mx-auto p-8 animate-in fade-in duration-300">
          <div className="space-y-8">
            <div>
               <label className="block text-lg font-bold text-slate-800 mb-2">遊戲標題 <span className="text-red-500">*</span></label>
               <input 
                 type="text" 
                 value={info.title}
                 onChange={(e) => handleChange('title', e.target.value)}
                 className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-lg"
                 placeholder="輸入遊戲標題"
               />
            </div>
            
            {/* Game Type Selection */}
            <div>
               <label className="block text-lg font-bold text-slate-800 mb-2">遊戲類型 <span className="text-red-500">*</span></label>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleChange('type', 'adventure')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${info.type === 'adventure' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-200 text-slate-600'}`}
                  >
                     <MapIcon size={24} className="mr-2" />
                     <span className="font-bold">實境遊戲 (Adventure)</span>
                  </button>
                  <button 
                    onClick={() => handleChange('type', 'guide')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${info.type === 'guide' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-200 text-slate-600'}`}
                  >
                     <Headphones size={24} className="mr-2" />
                     <span className="font-bold">智慧導覽 (Smart Guide)</span>
                  </button>
               </div>
            </div>

            <div>
               <label className="block text-lg font-bold text-slate-800 mb-2">遊戲簡介 <span className="text-red-500">*</span></label>
               <textarea 
                 rows={5}
                 value={info.desc}
                 onChange={(e) => handleChange('desc', e.target.value)}
                 className="w-full p-4 rounded-xl border border-slate-300 bg-white text-slate-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all resize-none text-base"
                 placeholder="輸入遊戲簡介"
               />
            </div>
            {/* ... other fields like cover, tags, location ... */}
            <div>
               <label className="block text-lg font-bold text-slate-800 mb-2">遊戲封面圖 <span className="text-red-500">*</span></label>
               <div 
                 onClick={handleCoverClick}
                 className={`w-full max-w-md aspect-video ${info.cover && !info.cover.startsWith('http') && info.cover.length > 20 ? 'border-0' : 'border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50'} rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-all overflow-hidden relative group`}
               >
                  {info.cover && (info.cover.startsWith('data:') || info.cover.startsWith('http')) ? (
                     <>
                       <img src={info.cover} alt="Cover Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white font-bold flex items-center"><Edit size={16} className="mr-2"/>更換圖片</span>
                       </div>
                     </>
                  ) : (
                     <>
                       <Upload size={32} className="mb-2" />
                       <span className="text-sm text-center px-4 font-bold">點擊上傳封面圖</span>
                       <span className="text-xs mt-1">支援 JPG, PNG (Max 10MB)</span>
                     </>
                  )}
               </div>
               <input id={fileInputId} type="file" onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
            </div>
             <div>
               <label className="block text-lg font-bold text-slate-800 mb-2">類別標籤</label>
               <div className="w-full p-2 pl-4 rounded-xl border border-slate-300 bg-white flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition-all">
                  {info.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 hover:text-red-500"><X size={14} /></button>
                    </span>
                  ))}
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="flex-1 outline-none min-w-[120px] py-2 bg-transparent text-slate-600 placeholder:text-slate-400" placeholder="輸入文字後按下ENTER即可新增" />
               </div>
            </div>
            
            <MapPickerModal 
                isOpen={showMapModal}
                onClose={() => setShowMapModal(false)}
                onConfirm={(data) => {
                    const newInfo = { 
                        ...info, 
                        latitude: data.lat.toFixed(6), 
                        longitude: data.lng.toFixed(6) 
                    };
                    if (data.address) newInfo.location = data.address;
                    setInfo(newInfo);
                    markDirty();
                    setShowMapModal(false);
                }}
                initialLocation={info.location}
            />
          </div>
        </div>
      );
};

const VisualNodeEditor = ({ 
  scenes, 
  groups,
  activeSceneId, 
  setActiveSceneId, 
  activeGroupId,
  setActiveGroupId,
  onAddScene, 
  onAddRelativeScene,
  onUpdateScene, 
  onUpdateGroup,
  onAddGroup,
  onDeleteGroup,
  onDeleteScene, 
  onBatchAddScenes,
  onHistoryAction,
  canUndo,
  canRedo,
  markDirty,
  commitSceneUpdate, 
  onBatchUpdateScenes, 
  commitBatchSceneUpdate,
  onEditSceneModules,
  onPreviewAR
}: any) => {
  // ... (Code for VisualNodeEditor - Keep logic same as before, reducing code for this output block, assume standard node editor logic from previous file)
  const [tool, setTool] = useState<ToolType>('POINTER');
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [groupDragState, setGroupDragState] = useState<{ id: string, startX: number, startY: number, initialPositions: { [key: string]: { x: number, y: number } } } | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
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
  
  useEffect(() => {
    scenes.forEach((s: Scene, idx: number) => {
      if (s.x === undefined || s.y === undefined) {
        onUpdateScene(s.id, { x: 100 + (idx * 150), y: 100 + (idx * 50) });
      }
    });
  }, [scenes.length]);

  const getSceneGroup = (sceneId: string): NodeGroup | undefined => {
      return groups.find((g: NodeGroup) => g.sceneIds.includes(sceneId));
  };
  const getGroupBounds = (group: NodeGroup) => {
      const groupScenes = scenes.filter((s: Scene) => group.sceneIds.includes(s.id));
      if (groupScenes.length === 0) return null;

      const minX = Math.min(...groupScenes.map((s: Scene) => s.x || 0));
      const minY = Math.min(...groupScenes.map((s: Scene) => s.y || 0));
      const maxX = Math.max(...groupScenes.map((s: Scene) => (s.x || 0) + 160)); 
      const maxY = Math.max(...groupScenes.map((s: Scene) => (s.y || 0) + 80)); 
      const padding = 20;

      return { x: minX - padding, y: minY - padding - 40, w: maxX - minX + (padding * 2), h: maxY - minY + (padding * 2) + 40, centerX: (minX + maxX)/2, centerY: (minY + maxY)/2 };
  };
  const isTargetValid = (targetId: string, isTargetGroup: boolean) => {
    if (!connectSourceId) return false;
    if (targetId === connectSourceId) return false;
    const sourceIsGroup = groups.some((g: NodeGroup) => g.id === connectSourceId);
    if (sourceIsGroup) return true; 
    const sourceGroup = getSceneGroup(connectSourceId);
    if (isTargetGroup) { return !sourceGroup; } else { const targetGroup = getSceneGroup(targetId); if (sourceGroup) { return targetGroup && targetGroup.id === sourceGroup.id; } else { return !targetGroup; } }
  };
  const handleCopy = () => { if (selectedNodeIds.length === 0) return; const nodesToCopy = scenes.filter((s: Scene) => selectedNodeIds.includes(s.id)); setClipboard(nodesToCopy); };
    const handleCut = () => { if (selectedNodeIds.length === 0) return; handleCopy(); selectedNodeIds.forEach(id => onDeleteScene(id)); setSelectedNodeIds([]); };
    const handlePaste = () => { if (clipboard.length === 0) return; const idMap = new Map<string, string>(); const newScenes = clipboard.map((node, index) => { const newId = `scene_${Date.now()}_${index}`; idMap.set(node.id, newId); return { ...node, id: newId, x: (node.x || 0) + 50, y: (node.y || 0) + 50 }; }); newScenes.forEach(scene => { scene.choices = scene.choices.map(c => ({ ...c, nextSceneId: idMap.get(c.nextSceneId) || c.nextSceneId })); }); if (onBatchAddScenes) { onBatchAddScenes(newScenes); setSelectedNodeIds(newScenes.map(s => s.id)); } };
    const handleDeleteSelected = () => { if (selectedNodeIds.length > 0) { selectedNodeIds.forEach(id => onDeleteScene(id)); setSelectedNodeIds([]); } if (selectedGroupId) { onDeleteGroup(selectedGroupId); setSelectedGroupId(null); if (activeGroupId === selectedGroupId) setActiveGroupId(null); } };
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setIsSpacePressed(true); }
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
            if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); if(canUndo) onHistoryAction('undo'); }
            if ((isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (isCmdOrCtrl && e.key.toLowerCase() === 'y')) { e.preventDefault(); if(canRedo) onHistoryAction('redo'); }
            if (isCmdOrCtrl && e.key.toLowerCase() === 'c') { e.preventDefault(); handleCopy(); }
            if (isCmdOrCtrl && e.key.toLowerCase() === 'x') { e.preventDefault(); handleCut(); }
            if (isCmdOrCtrl && e.key.toLowerCase() === 'v') { e.preventDefault(); handlePaste(); }
            if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleDeleteSelected(); }
            if (isCmdOrCtrl && e.key === 'g' && !e.shiftKey) { e.preventDefault(); if (selectedNodeIds.length > 1) { onAddGroup(selectedNodeIds); setSelectedNodeIds([]); setTool('POINTER'); } }
            if (isCmdOrCtrl && e.shiftKey && e.key === 'g') { e.preventDefault(); if (selectedNodeIds.length > 0) { const groupsToRemove = new Set<string>(); selectedNodeIds.forEach(id => { const group = groups.find((g: NodeGroup) => g.sceneIds.includes(id)); if (group) groupsToRemove.add(group.id); }); groupsToRemove.forEach(gid => onDeleteGroup(gid)); } if (selectedGroupId) { onDeleteGroup(selectedGroupId); setSelectedGroupId(null); } }
        }
        };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') { setIsSpacePressed(false); setIsPanning(false); } };
        window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
        return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, [selectedNodeIds, selectedGroupId, groups, onAddGroup, onDeleteGroup, onDeleteScene, onHistoryAction, canUndo, canRedo, clipboard, scenes]); 

  const handleCanvasMouseDown = (e: React.MouseEvent) => { if (e.target === canvasRef.current) { if (isSpacePressed) { setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY }); setPanInitialOffset({ ...canvasOffset }); return; } if (tool === 'POINTER' || tool === 'GROUP') { const rect = canvasRef.current.getBoundingClientRect(); setSelectionBox({ startX: e.clientX - rect.left - canvasOffset.x, startY: e.clientY - rect.top + canvasRef.current.scrollTop - canvasOffset.y, currentX: e.clientX - rect.left - canvasOffset.x, currentY: e.clientY - rect.top + canvasRef.current.scrollTop - canvasOffset.y }); setSelectedNodeIds([]); setSelectedGroupId(null); setActiveSceneId(null); setActiveGroupId(null); } } };
  const handleCanvasMouseMove = (e: React.MouseEvent) => { if (isPanning) { const dx = e.clientX - panStart.x; const dy = e.clientY - panStart.y; setCanvasOffset({ x: panInitialOffset.x + dx, y: panInitialOffset.y + dy }); return; } if (selectionBox && canvasRef.current) { const rect = canvasRef.current.getBoundingClientRect(); setSelectionBox({ ...selectionBox, currentX: e.clientX - rect.left - canvasOffset.x, currentY: e.clientY - rect.top + canvasRef.current.scrollTop - canvasOffset.y }); } if (dragState) { const dx = e.clientX - dragState.startX; const dy = e.clientY - dragState.startY; onUpdateScene(dragState.id, { x: dragState.initialX + dx, y: dragState.initialY + dy }); } if (groupDragState) { const dx = e.clientX - groupDragState.startX; const dy = e.clientY - groupDragState.startY; const updates = Object.keys(groupDragState.initialPositions).map(sceneId => { const initial = groupDragState.initialPositions[sceneId]; return { id: sceneId, x: initial.x + dx, y: initial.y + dy }; }); if (onBatchUpdateScenes) { onBatchUpdateScenes(updates); } else { updates.forEach(u => onUpdateScene(u.id, { x: u.x, y: u.y })); } } };
  const handleCanvasMouseUp = (e: React.MouseEvent) => { if (isPanning) { setIsPanning(false); return; } if (selectionBox) { const x1 = Math.min(selectionBox.startX, selectionBox.currentX); const x2 = Math.max(selectionBox.startX, selectionBox.currentX); const y1 = Math.min(selectionBox.startY, selectionBox.currentY); const y2 = Math.max(selectionBox.startY, selectionBox.currentY); const selected = scenes.filter((s: Scene) => { const sx = s.x || 0; const sy = s.y || 0; return sx < x2 && (sx + 160) > x1 && sy < y2 && (sy + 80) > y1; }).map((s: Scene) => s.id); if (tool === 'GROUP') { if (selected.length > 0) { onAddGroup(selected); setTool('POINTER'); } setSelectedNodeIds([]); } else { setSelectedNodeIds(selected); } setSelectionBox(null); } if (groupDragState && commitBatchSceneUpdate) { const dx = e.clientX - groupDragState.startX; const dy = e.clientY - groupDragState.startY; const updates = Object.keys(groupDragState.initialPositions).map(sceneId => { const initial = groupDragState.initialPositions[sceneId]; return { id: sceneId, x: initial.x + dx, y: initial.y + dy }; }); commitBatchSceneUpdate(updates); } setDragState(null); setGroupDragState(null); };
  const handleCanvasClick = (e: React.MouseEvent) => { if (e.target === canvasRef.current) { if (isSpacePressed) return; if (tool === 'ADD') { const rect = canvasRef.current.getBoundingClientRect(); const x = e.clientX - rect.left - 80 - canvasOffset.x; const y = e.clientY - rect.top - 40 - canvasOffset.y; onAddScene(x, y); } else if (!selectionBox) { setSelectedNodeIds([]); setSelectedGroupId(null); setActiveSceneId(null); setActiveGroupId(null); setConnectSourceId(null); } } };
  const handleNodeClick = (e: React.MouseEvent, sceneId: string) => { if (isSpacePressed) return; e.stopPropagation(); if (tool === 'CONNECT') { if (!connectSourceId) { setConnectSourceId(sceneId); } else { if (connectSourceId !== sceneId) { if (!isTargetValid(sceneId, false)) { alert("連接無效：群組內的卡片只能連線到同群組內的卡片，群組外的卡片只能連線到群組外的卡片或群組本體。"); return; } const sourceGroup = groups.find((g: NodeGroup) => g.id === connectSourceId); const sourceScene = scenes.find((s: Scene) => s.id === connectSourceId); const targetName = scenes.find((s: Scene) => s.id === sceneId)?.title || '...'; if (sourceGroup) { const newChoice = { text: '前往 ' + targetName, nextSceneId: sceneId }; onUpdateGroup(sourceGroup.id, { choices: [...(sourceGroup.choices || []), newChoice] }); } else if (sourceScene) { const newChoice = { text: '前往 ' + targetName, nextSceneId: sceneId }; if(commitSceneUpdate) { commitSceneUpdate(connectSourceId, { choices: [...sourceScene.choices, newChoice] }); } else { onUpdateScene(connectSourceId, { choices: [...sourceScene.choices, newChoice] }); } } setConnectSourceId(null); setTool('POINTER'); } } } else if (tool === 'GROUP') { if (selectedNodeIds.includes(sceneId)) { setSelectedNodeIds(selectedNodeIds.filter(id => id !== sceneId)); } else { setSelectedNodeIds([...selectedNodeIds, sceneId]); } } else { setActiveSceneId(sceneId); setActiveGroupId(null); if (e.shiftKey) { if (selectedNodeIds.includes(sceneId)) { setSelectedNodeIds(selectedNodeIds.filter(id => id !== sceneId)); } else { setSelectedNodeIds([...selectedNodeIds, sceneId]); } } else { if (!dragState) setSelectedNodeIds([sceneId]); } } };
  const handleGroupClick = (e: React.MouseEvent, group: NodeGroup) => { if (isSpacePressed) return; e.stopPropagation(); if (tool === 'CONNECT') { if (!connectSourceId) { setConnectSourceId(group.id); } else if (connectSourceId !== group.id) { if (!isTargetValid(group.id, true)) { alert("連接無效：群組內的卡片只能連線到同群組內的卡片。"); return; } const sourceScene = scenes.find((s: Scene) => s.id === connectSourceId); const sourceGroup = groups.find((g: NodeGroup) => g.id === connectSourceId); const targetName = group.title; if (sourceGroup) { const newChoice = { text: '前往 ' + targetName, nextSceneId: group.id }; onUpdateGroup(sourceGroup.id, { choices: [...(sourceGroup.choices || []), newChoice] }); } else if (sourceScene) { const newChoice = { text: '前往 ' + targetName, nextSceneId: group.id }; if(commitSceneUpdate) { commitSceneUpdate(connectSourceId, { choices: [...sourceScene.choices, newChoice] }); } else { onUpdateScene(connectSourceId, { choices: [...sourceScene.choices, newChoice] }); } } setConnectSourceId(null); setTool('POINTER'); } } else if (tool === 'POINTER') { setActiveGroupId(group.id); setActiveSceneId(null); setSelectedGroupId(group.id); } };
  const handleMouseDown = (e: React.MouseEvent, sceneId: string) => { if (isSpacePressed) return; if (tool === 'POINTER' || tool === 'ADD') { setDragState({ id: sceneId, startX: e.clientX, startY: e.clientY, initialX: scenes.find((s: Scene) => s.id === sceneId)?.x || 0, initialY: scenes.find((s: Scene) => s.id === sceneId)?.y || 0 }); } };
  const handleCreateGroup = () => { if (selectedNodeIds.length > 0) { onAddGroup(selectedNodeIds); setTool('POINTER'); setSelectedNodeIds([]); } };
  const handleGroupMouseDown = (e: React.MouseEvent, group: NodeGroup) => { if (isSpacePressed || tool !== 'POINTER') return; e.stopPropagation(); setSelectedGroupId(group.id); const groupScenes = scenes.filter((s: Scene) => group.sceneIds.includes(s.id)); const initialPositions: { [key: string]: { x: number, y: number } } = {}; groupScenes.forEach((s: Scene) => { initialPositions[s.id] = { x: s.x || 0, y: s.y || 0 }; }); setGroupDragState({ id: group.id, startX: e.clientX, startY: e.clientY, initialPositions }); };
  const handleDeleteConnection = (sourceId: string, choiceIndex: number) => { const sourceScene = scenes.find((s: Scene) => s.id === sourceId); const sourceGroup = groups.find((g: NodeGroup) => g.id === sourceId); if (sourceScene && commitSceneUpdate) { const newChoices = sourceScene.choices.filter((_: any, i: number) => i !== choiceIndex); commitSceneUpdate(sourceId, { choices: newChoices }); } else if (sourceGroup) { const newChoices = (sourceGroup.choices || []).filter((_: any, i: number) => i !== choiceIndex); onUpdateGroup(sourceId, { choices: newChoices }); } };

  // Render helpers (simplified connection lines and group boxes)
  const renderConnections = () => {
    const allNodes = [...scenes, ...groups.map(g => ({...g, isGroup: true}))];
    return allNodes.map((node: any) => { if (!node.choices) return null; return node.choices.map((choice: Choice, idx: number) => { const target = scenes.find((s: Scene) => s.id === choice.nextSceneId); const targetGroup = !target ? groups.find((g: NodeGroup) => g.id === choice.nextSceneId) : null; if (!target && !targetGroup) return null; let x1, y1, x2, y2; if (node.isGroup) { const bounds = getGroupBounds(node); if (bounds) { x1 = bounds.x + bounds.w; y1 = bounds.y + (bounds.h / 2); } else return null; } else { x1 = (node.x || 0) + 160; y1 = (node.y || 0) + 40; } if (targetGroup) { const bounds = getGroupBounds(targetGroup); if (bounds) { x2 = bounds.x; y2 = bounds.y + (bounds.h / 2); } else return null; } else if (target) { x2 = (target.x || 0); y2 = (target.y || 0) + 40; } else return null; const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2; return ( <g key={`${node.id}-${idx}`} className="group pointer-events-auto"> <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer"/> <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={targetGroup ? "#818cf8" : node.isGroup ? "#f472b6" : "#cbd5e1"} strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="transition-colors duration-200 group-hover:stroke-red-400 group-hover:stroke-[3px]"/> <g transform={`translate(${midX}, ${midY})`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteConnection(node.id, idx); }}> <circle r="10" fill="#ef4444" className="shadow-sm" /> <rect x="-6" y="-1" width="12" height="2" fill="white" rx="1" /> </g> </g> ); }); });
  };
  const renderGroups = () => { return groups?.map((group: NodeGroup) => { const bounds = getGroupBounds(group); if (!bounds) return null; const isSelected = selectedGroupId === group.id || activeGroupId === group.id; const isValidConnectTarget = tool === 'CONNECT' && isTargetValid(group.id, true); const isConnectSource = connectSourceId === group.id; return ( <div key={group.id} onMouseDown={(e) => handleGroupMouseDown(e, group)} onClick={(e) => handleGroupClick(e, group)} className={`absolute rounded-xl bg-white shadow-lg transition-all hover:shadow-xl ${groupDragState?.id === group.id ? 'cursor-grabbing scale-[1.01]' : 'cursor-grab'} pointer-events-auto flex flex-col overflow-visible ${isSelected ? 'ring-2 ring-indigo-500 shadow-indigo-100' : 'border border-slate-200'} ${isValidConnectTarget ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/50' : ''} ${isConnectSource ? 'ring-2 ring-orange-400 border-orange-400' : ''}`} style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h, zIndex: 0 }}> <div className={`h-10 flex items-center justify-between px-3 bg-slate-50 text-slate-600 border-b border-slate-100 transition-colors`}> <div className="flex items-center"><GripVertical size={16} className={`mr-2 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} /><span className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{group.title} ({group.type === 'ALL' ? '全部' : '其一'})</span></div> </div> <div className="flex-1 bg-slate-50/30 relative"> {isValidConnectTarget && (<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm animate-pulse z-10"></div>)} {isConnectSource && (<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm z-10"></div>)} </div> </div> ); }); };
  const renderSelectionBox = () => { if (!selectionBox) return null; const x = Math.min(selectionBox.startX, selectionBox.currentX); const y = Math.min(selectionBox.startY, selectionBox.currentY); const width = Math.abs(selectionBox.currentX - selectionBox.startX); const height = Math.abs(selectionBox.currentY - selectionBox.startY); return (<div className="absolute border border-indigo-500 bg-indigo-200/30 pointer-events-none z-50" style={{ left: x, top: y, width, height }} />); };
  const renderAddButtons = (scene: Scene) => { if (tool !== 'ADD') return null; const handleAdd = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => { onAddRelativeScene(scene.id, direction); }; return ( <> <button onClick={(e) => { e.stopPropagation(); handleAdd('RIGHT'); }} className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> <button onClick={(e) => { e.stopPropagation(); handleAdd('DOWN'); }} className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> <button onClick={(e) => { e.stopPropagation(); handleAdd('LEFT'); }} className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> <button onClick={(e) => { e.stopPropagation(); handleAdd('UP'); }} className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full text-white flex items-center justify-center hover:scale-125 transition-transform z-10 shadow-sm"><Plus size={14}/></button> </> ); };

  return (
     <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-white shadow-lg border border-slate-200 rounded-xl p-1.5 gap-1">
           <button onClick={() => { setTool('POINTER'); setConnectSourceId(null); setSelectedNodeIds([]); setSelectedGroupId(null); setActiveGroupId(null); }} className={`p-2 rounded-lg text-slate-600 transition-all ${tool === 'POINTER' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'hover:bg-slate-50'}`} title="選取 / 移動 (Esc)"><MousePointer2 size={18} /></button>
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
           <button onClick={() => { if (tool === 'CONNECT') { setTool('POINTER'); setConnectSourceId(null); } else { setTool('CONNECT'); setConnectSourceId(null); } }} className={`p-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] transition-all ${tool === 'CONNECT' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`} title="連線"><LinkIcon size={24} /><span className="text-[10px] font-bold">連線</span></button>
           <div className="w-px bg-slate-200 my-1"></div>
           <div className="relative">
             <button onClick={() => { if (selectedNodeIds.length > 1) { onAddGroup(selectedNodeIds); setSelectedNodeIds([]); return; } if (tool !== 'GROUP') { setTool('GROUP'); } else { handleCreateGroup(); } }} className={`p-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] transition-all ${tool === 'GROUP' ? 'bg-pink-100 text-pink-600' : 'hover:bg-slate-50 text-slate-600'}`} title="群組 (Cmd+G)"><BoxSelect size={24} /><span className="text-[10px] font-bold">{tool === 'GROUP' && selectedNodeIds.length > 1 ? '確認群組' : '群組'}</span></button>
             {selectedNodeIds.length > 1 && (<div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{selectedNodeIds.length}</div>)}
           </div>
        </div>
        <div ref={canvasRef} className={`flex-1 relative overflow-hidden ${isSpacePressed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`} onMouseDown={handleCanvasMouseDown} onClick={handleCanvasClick} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px` }}>
           <div style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: '5000px', minHeight: '5000px', transform: 'translate(-1000px, -1000px)' }}> 
                    <g transform="translate(1000, 1000)">
                        <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" /></marker></defs>
                        {renderConnections()}
                    </g>
                </svg>
                {renderGroups()}
                {renderSelectionBox()}
                {scenes.map((scene: Scene) => {
                    const isValidConnectTarget = tool === 'CONNECT' && isTargetValid(scene.id, false);
                    return (
                        <div key={scene.id} className={`absolute w-40 h-20 bg-white rounded-lg shadow-sm border-2 transition-all cursor-move flex flex-col overflow-visible pointer-events-auto group/node ${selectedNodeIds.includes(scene.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : (activeSceneId === scene.id || connectSourceId === scene.id) ? 'border-orange-400' : isValidConnectTarget ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`} style={{ left: scene.x, top: scene.y }} onMouseDown={(e) => handleMouseDown(e, scene.id)} onClick={(e) => handleNodeClick(e, scene.id)}>
                            <div className="bg-slate-50 p-1.5 border-b border-slate-100 flex items-center justify-between cursor-grab active:cursor-grabbing"><span className="text-xs font-bold text-slate-700 truncate px-1">{scene.title}</span>{activeSceneId === scene.id && <GripVertical size={12} className="text-slate-400" />}</div>
                            <div className="p-2 text-[10px] text-slate-500 leading-tight line-clamp-2 select-none">{scene.text || '無內容...'}</div>
                            <button onClick={(e) => { e.stopPropagation(); onEditSceneModules(scene); }} className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-orange-500 hover:border-orange-400 opacity-0 group-hover/node:opacity-100 transition-opacity z-20" title="編輯模組內容"><Edit size={14} /></button>
                            {tool === 'CONNECT' && (<>{(connectSourceId === scene.id) && (<><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full translate-x-1.5 bg-orange-500"></div><div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full -translate-x-1.5 bg-orange-500"></div></>)}{isValidConnectTarget && (<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 animate-pulse border border-white"></div>)}</>)}
                            {renderAddButtons(scene)}
                        </div>
                    );
                })}
           </div>
        </div>
     </div>
  );
};

const SceneBuilderModal = ({ scene, onClose, onSave, characters = [], assets = [], onAddCharacter, onAddAsset, onPreviewAR }: any) => {
    // ... (Implementation same as previous Editor.tsx, ensuring import correctness)
    const [title, setTitle] = useState(scene.title);
    const [modules, setModules] = useState<GameModule[]>(scene.modules || []);
    const [showMapModal, setShowMapModal] = useState(false);
    const [activeLocationModuleId, setActiveLocationModuleId] = useState<string | null>(null);
    const [showCharModal, setShowCharModal] = useState(false);
    const [showAssetModal, setShowAssetModal] = useState(false);

    const addModule = (type: ModuleType) => { const newModule: GameModule = { id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type, data: {} }; if (type === 'STORY_DIALOGUE') newModule.data = { lines: [] }; if (type === 'ANS_SINGLE' || type === 'ANS_MULTI') newModule.data = { options: [{id: 'opt1', text: '選項 1', isCorrect: false}] }; if (type === 'ANS_NUMBER') newModule.data = { length: 4, answer: '1234' }; if (type === 'HINT') newModule.data = { hints: [{ text: '提示 1', delay: 60 }] }; setModules([...modules, newModule]); };
    const updateModuleData = (id: string, data: any) => { setModules(prev => prev.map(m => m.id === id ? { ...m, data: { ...m.data, ...data } } : m)); };
    const deleteModule = (id: string) => { setModules(prev => prev.filter(m => m.id !== id)); };
    const moveModule = (index: number, direction: 'up' | 'down') => { const newModules = [...modules]; if (direction === 'up' && index > 0) { [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]]; } else if (direction === 'down' && index < newModules.length - 1) { [newModules[index + 1], newModules[index]] = [newModules[index], newModules[index + 1]]; } setModules(newModules); };
    const handleSave = () => { onSave({ ...scene, title, modules }); onClose(); };
    const handleOpenMap = (moduleId: string) => { setActiveLocationModuleId(moduleId); setShowMapModal(true); };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white">
                    <div className="flex items-center space-x-4"><button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ArrowLeft className="text-slate-500" /></button><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded px-2"/></div>
                    <Button onClick={handleSave} className="shadow-lg shadow-indigo-500/30"><Save size={18} className="mr-2" /> 儲存關卡</Button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto p-4 flex-shrink-0">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">模組工具箱</h3>
                        <div className="space-y-6">
                            <div><h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center"><MapPin size={12} className="mr-1"/> 基礎設定</h4><div className="space-y-2"><ToolBtn label="關卡位置" icon={MapPin} onClick={() => addModule('LOCATION')} color="text-red-500" /></div></div>
                            <div><h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center"><FileText size={12} className="mr-1"/> 故事模組</h4><div className="space-y-2"><ToolBtn label="純旁白" icon={FileText} onClick={() => addModule('STORY_NARRATION')} color="text-indigo-500" /><ToolBtn label="角色對話" icon={MessageSquare} onClick={() => addModule('STORY_DIALOGUE')} color="text-indigo-500" /></div></div>
                            <div><h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center"><ImageIcon size={12} className="mr-1"/> 媒體模組</h4><div className="space-y-2"><ToolBtn label="純文字" icon={FileText} onClick={() => addModule('TEXT')} color="text-slate-600" /><ToolBtn label="圖片" icon={ImageIcon} onClick={() => addModule('IMAGE')} color="text-pink-500" /><ToolBtn label="影片" icon={Video} onClick={() => addModule('VIDEO')} color="text-pink-500" /><ToolBtn label="語音" icon={Mic} onClick={() => addModule('AUDIO')} color="text-pink-500" /></div></div>
                            <div><h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center"><Scan size={12} className="mr-1"/> AR 模組</h4><div className="space-y-2"><ToolBtn label="AR 辨識" icon={Scan} onClick={() => addModule('AR_RECOGNIZE')} color="text-blue-500" /><ToolBtn label="AR 透圖" icon={ImageIcon} onClick={() => addModule('AR_TRANSPARENT')} color="text-blue-500" /></div></div>
                            <div><h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center"><Key size={12} className="mr-1"/> 答案模組</h4><div className="space-y-2"><ToolBtn label="文字輸入" icon={FileText} onClick={() => addModule('ANS_TEXT')} color="text-green-600" /><ToolBtn label="單選題" icon={Check} onClick={() => addModule('ANS_SINGLE')} color="text-green-600" /><ToolBtn label="多選題" icon={Check} onClick={() => addModule('ANS_MULTI')} color="text-green-600" /><ToolBtn label="數字密碼" icon={Lock} onClick={() => addModule('ANS_NUMBER')} color="text-green-600" /><ToolBtn label="圖片密碼" icon={ImageIcon} onClick={() => addModule('ANS_IMAGE')} color="text-green-600" /><ToolBtn label="拍照任務" icon={Camera} onClick={() => addModule('ANS_PHOTO')} color="text-green-600" /><ToolBtn label="語音回答" icon={Mic} onClick={() => addModule('ANS_VOICE')} color="text-green-600" /><ToolBtn label="AR 辨識答題" icon={Scan} onClick={() => addModule('ANS_AR')} color="text-green-600" /></div></div>
                            <div><h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center"><Lightbulb size={12} className="mr-1"/> 輔助模組</h4><div className="space-y-2"><ToolBtn label="提示系統" icon={HelpCircle} onClick={() => addModule('HINT')} color="text-yellow-500" /></div></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-100 overflow-y-auto p-8">
                        <div className="max-w-3xl mx-auto space-y-6 pb-20">
                            {modules.length === 0 && (<div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400"><Layout size={48} className="mx-auto mb-4 opacity-50" /><p className="font-bold">暫無模組</p><p className="text-sm mt-2">請從左側工具箱點擊新增內容</p></div>)}
                            {modules.map((module, index) => (
                                <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between handle cursor-grab active:cursor-grabbing"><div className="flex items-center space-x-3"><GripHorizontal size={16} className="text-slate-400" /><span className="text-sm font-bold text-slate-700 flex items-center">{getModuleName(module.type)}</span></div><div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => moveModule(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"><MoveUp size={14}/></button><button onClick={() => moveModule(index, 'down')} disabled={index === modules.length-1} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"><MoveDown size={14}/></button><div className="w-px h-4 bg-slate-300 mx-1"></div><button onClick={() => deleteModule(module.id)} className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded"><Trash2 size={14}/></button></div></div>
                                    <div className="p-6"><ModuleRenderer module={module} onChange={(data: any) => updateModuleData(module.id, data)} onOpenMap={() => handleOpenMap(module.id)} onOpenCharModal={() => setShowCharModal(true)} onOpenAssetModal={() => setShowAssetModal(true)} characters={characters} assets={assets} onPreviewAR={onPreviewAR} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <MapPickerModal isOpen={showMapModal} onClose={() => setShowMapModal(false)} onConfirm={(data) => { if (activeLocationModuleId) { updateModuleData(activeLocationModuleId, { location: `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}` }); } setShowMapModal(false); }} />
            {showCharModal && (<CharacterCreationModal onClose={() => setShowCharModal(false)} onSave={(char: Character) => { if (onAddCharacter) onAddCharacter(char); setShowCharModal(false); }} />)}
            {showAssetModal && (<BackgroundCreationModal onClose={() => setShowAssetModal(false)} onSave={(asset: GameAsset) => { if (onAddAsset) onAddAsset(asset); setShowAssetModal(false); }} />)}
        </div>
    );
};
const CharacterCreationModal = ({ onClose, onSave }: any) => { const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [img, setImg] = useState(''); const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => setImg(e.target?.result as string); reader.readAsDataURL(file); } }; return ( <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"> <h3 className="text-xl font-bold mb-4">新增角色</h3> <div className="space-y-4"> <div className="flex justify-center"> <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-indigo-500" onClick={() => document.getElementById('char-upload')?.click()}> {img ? <img src={img} className="w-full h-full object-cover" /> : <Upload className="text-slate-400" />} </div> <input id="char-upload" type="file" className="hidden" accept="image/*" onChange={handleFile} /> </div> <div> <label className="block text-xs font-bold text-slate-500 mb-1">角色名稱</label> <input className="w-full p-2 border border-slate-300 rounded bg-white text-slate-600" value={name} onChange={e => setName(e.target.value)} /> </div> <div> <label className="block text-xs font-bold text-slate-500 mb-1">角色介紹</label> <textarea className="w-full p-2 border border-slate-300 rounded resize-none bg-white text-slate-600" rows={3} value={desc} onChange={e => setDesc(e.target.value)} /> </div> <div className="flex gap-2 pt-2"> <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button> <Button onClick={() => onSave({ id: `char_${Date.now()}`, name, description: desc, avatarUrl: img })} disabled={!name || !img} className="flex-1">儲存</Button> </div> </div> </div> </div> ); };
const BackgroundCreationModal = ({ onClose, onSave }: any) => { const [name, setName] = useState(''); const [img, setImg] = useState(''); const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => setImg(e.target?.result as string); reader.readAsDataURL(file); } }; return ( <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"> <h3 className="text-xl font-bold mb-4">新增場景背景</h3> <div className="space-y-4"> <div className="aspect-video bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-indigo-500" onClick={() => document.getElementById('bg-upload')?.click()}> {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-2" /><span className="text-xs">點擊上傳</span></div>} </div> <input id="bg-upload" type="file" className="hidden" accept="image/*" onChange={handleFile} /> <div> <label className="block text-xs font-bold text-slate-500 mb-1">場景名稱</label> <input className="w-full p-2 border border-slate-300 rounded bg-white text-slate-600" value={name} onChange={e => setName(e.target.value)} /> </div> <div className="flex gap-2 pt-2"> <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button> <Button onClick={() => onSave({ id: `bg_${Date.now()}`, name, url: img, type: 'image' })} disabled={!name || !img} className="flex-1">儲存</Button> </div> </div> </div> </div> ); };
const ToolBtn = ({ label, icon: Icon, onClick, color }: any) => ( <button onClick={onClick} className="w-full flex items-center p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"> <div className={`mr-3 p-1.5 rounded-lg bg-slate-50 group-hover:bg-white ${color}`}> <Icon size={16} /> </div> <span className="text-sm font-medium text-slate-700">{label}</span> </button> );
const getModuleName = (type: ModuleType) => { switch(type) { case 'LOCATION': return '📍 關卡位置'; case 'STORY_NARRATION': return '📖 純旁白'; case 'STORY_DIALOGUE': return '💬 角色對話'; case 'TEXT': return '📝 純文字'; case 'IMAGE': return '🖼️ 圖片'; case 'VIDEO': return '🎬 影片'; case 'AUDIO': return '🔊 語音'; case 'AR_RECOGNIZE': return '📷 AR 辨識'; case 'AR_TRANSPARENT': return '👻 AR 透圖'; case 'ANS_TEXT': return '✍️ 文字答題'; case 'ANS_SINGLE': return '🔘 單選題'; case 'ANS_MULTI': return '☑️ 多選題'; case 'ANS_NUMBER': return '🔢 數字密碼'; case 'ANS_IMAGE': return '🖼️ 圖片密碼'; case 'ANS_PHOTO': return '📸 拍照任務'; case 'ANS_VOICE': return '🎤 語音回答'; case 'ANS_AR': return '🧊 AR 答題'; case 'HINT': return '💡 提示系統'; default: return '模組'; } };

const ModuleRenderer = ({ module, onChange, onOpenMap, onOpenCharModal, onOpenAssetModal, characters = [], assets = [], onPreviewAR }: any) => { 
    const { data } = module; 
    
    // Check if it's an answer module to show feedback fields
    const isAnswerModule = module.type.startsWith('ANS_');

    const renderFeedbackFields = () => (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h5 className="font-bold text-xs text-slate-500 mb-3 flex items-center"><ThumbsUp size={14} className="mr-1"/> 答題反饋設定</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <ModuleInput label="答對文字反饋" value={data.correctFeedbackText} field="correctFeedbackText" onChange={onChange} placeholder="例如: 恭喜答對！" />
                    <ModuleFileUpload label="答對圖片反饋" field="correctFeedbackImage" data={data} onChange={onChange} />
                </div>
                <div>
                    <ModuleInput label="答錯文字反饋" value={data.incorrectFeedbackText} field="incorrectFeedbackText" onChange={onChange} placeholder="例如: 再試一次..." />
                    <ModuleFileUpload label="答錯圖片反饋" field="incorrectFeedbackImage" data={data} onChange={onChange} />
                </div>
            </div>
        </div>
    );

    switch (module.type) {
        case 'LOCATION': return ( <div className="mb-4"> <label className="block text-xs font-bold text-slate-500 mb-1">地點名稱 / 座標</label> <div className="relative"> <input type="text" className="w-full p-2 pr-10 rounded border border-slate-300 text-sm bg-white text-slate-600" value={data.location || ''} onChange={e => onChange({ location: e.target.value })} placeholder="例如: 25.0330, 121.5654" /> <button onClick={onOpenMap} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><MapIcon size={18} /></button> </div> </div> );
        case 'STORY_NARRATION': return ( <> <ModuleInput label="標題" value={data.title} field="title" onChange={onChange} /> <ModuleTextArea label="內容" value={data.content} field="content" onChange={onChange} /> <ModuleFileUpload label="圖片上傳" field="image" data={data} onChange={onChange} /> </> );
        case 'STORY_DIALOGUE': return ( <div className="space-y-4"> <div className="grid grid-cols-2 gap-4"> <button onClick={onOpenCharModal} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 transition-all"> <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2"><Plus size={20}/></div> <span className="text-xs font-bold">上傳角色圖片</span> </button> <button onClick={onOpenAssetModal} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-pink-400 text-slate-500 hover:text-pink-600 transition-all"> <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2"><Plus size={20}/></div> <span className="text-xs font-bold">上傳場景圖片</span> </button> </div> <div className="border-t border-slate-100 pt-4"> <label className="block text-xs font-bold text-slate-500 mb-2">對話內容 (Dialogues)</label> {(data.lines || []).map((line: any, idx: number) => ( <div key={idx} className="flex gap-2 mb-2"> <select className="w-1/3 p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" value={line.char || ''} onChange={e => { const newLines = [...(data.lines || [])]; newLines[idx].char = e.target.value; onChange({ lines: newLines }); }}> <option value="">選擇角色...</option> {characters.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)} <option value="旁白">旁白</option> <option value="玩家">玩家</option> </select> <input className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" placeholder="說了什麼..." value={line.text || ''} onChange={e => { const newLines = [...(data.lines || [])]; newLines[idx].text = e.target.value; onChange({ lines: newLines }); }} /> <button onClick={() => { const newLines = (data.lines || []).filter((_:any, i:number) => i !== idx); onChange({ lines: newLines }); }} className="text-red-400 p-2"><Trash2 size={14}/></button> </div> ))} <button onClick={() => onChange({ lines: [...(data.lines || []), { char: '', text: '' }] })} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded">+ 新增對話</button> </div> </div> );
        case 'TEXT': return <ModuleTextArea label="文字內容" value={data.text} field="text" onChange={onChange} />;
        case 'IMAGE': return ( <> <ModuleInput label="圖片連結 (或留空上傳)" value={data.url} field="url" onChange={onChange} /> <ModuleFileUpload label="或 上傳圖片" field="file" data={data} onChange={onChange} /> </> );
        case 'VIDEO': return ( <> <ModuleInput label="影片連結 (YouTube/MP4)" value={data.url} field="url" onChange={onChange} /> <ModuleFileUpload label="或 上傳影片" field="file" data={data} accept="video/*" onChange={onChange} /> </> );
        case 'AUDIO': return <ModuleFileUpload label="上傳音訊檔 (MP3/WAV)" field="file" data={data} accept="audio/*" onChange={onChange} />;
        case 'AR_RECOGNIZE': return ( <div className="space-y-4"> <div className="grid grid-cols-2 gap-4"> <ModuleFileUpload label="1. 上傳辨識目標圖 (Target)" field="target" data={data} onChange={onChange} /> <ModuleFileUpload label="2. 上傳出現內容 (Content)" field="content" data={data} onChange={onChange} /> </div> <button onClick={() => onPreviewAR(data)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors"> <Scan size={18} className="mr-2" /> 預覽 AR 效果 </button> </div> );
        case 'AR_TRANSPARENT': return <ModuleFileUpload label="上傳透明 PNG" field="file" data={data} onChange={onChange} />;
        
        // Answer Modules with Feedback
        case 'ANS_TEXT': 
        case 'ANS_VOICE': 
            return (
                <>
                    <ModuleInput label="正確答案" value={data.answer} field="answer" placeholder="輸入正確解答..." onChange={onChange} />
                    {renderFeedbackFields()}
                </>
            );
        case 'ANS_SINGLE': 
        case 'ANS_MULTI': 
            return ( 
                <div> 
                    <label className="block text-xs font-bold text-slate-500 mb-2">選項設定 (勾選為正確答案)</label> 
                    {(data.options || []).map((opt: any, idx: number) => ( 
                        <div key={idx} className="flex items-center gap-2 mb-2"> 
                            <input type={module.type === 'ANS_SINGLE' ? 'radio' : 'checkbox'} name={`ans_${module.id}`} checked={opt.isCorrect} onChange={() => { const newOpts = [...(data.options || [])]; if (module.type === 'ANS_SINGLE') newOpts.forEach(o => o.isCorrect = false); newOpts[idx].isCorrect = !opt.isCorrect; onChange({ options: newOpts }); }} /> 
                            <input className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" value={opt.text} onChange={e => { const newOpts = [...(data.options || [])]; newOpts[idx].text = e.target.value; onChange({ options: newOpts }); }} placeholder="選項文字" /> 
                            <button onClick={() => { const newOpts = (data.options || []).filter((_:any, i:number) => i !== idx); onChange({ options: newOpts }); }} className="text-red-400"><Trash2 size={14}/></button> 
                        </div> 
                    ))} 
                    <button onClick={() => onChange({ options: [...(data.options || []), { text: '新選項', isCorrect: false }] })} className="text-xs font-bold text-indigo-600">+ 新增選項</button> 
                    {renderFeedbackFields()}
                </div> 
            );
        case 'ANS_NUMBER': 
            return ( 
                <> 
                    <ModuleInput label="密碼長度" value={data.length} field="length" placeholder="4" onChange={onChange} /> 
                    <ModuleInput label="正確密碼" value={data.answer} field="answer" placeholder="例如: 1234" onChange={onChange} /> 
                    {renderFeedbackFields()}
                </> 
            );
        case 'ANS_IMAGE': 
            return ( 
                <div> 
                    <label className="block text-xs font-bold text-slate-500 mb-2">圖片密碼設定</label> 
                    <div className="grid grid-cols-3 gap-2 mb-2"> 
                        {[0,1,2,3,4,5,6,7,8].map(i => { 
                            const hasImg = data.images && data.images[i]; 
                            return ( 
                                <div key={i} className="aspect-square bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 relative overflow-hidden group cursor-pointer" onClick={() => document.getElementById(`ans_img_${i}`)?.click()}> 
                                    {hasImg ? <img src={hasImg} className="w-full h-full object-cover" /> : <Plus size={16} />} 
                                    <input id={`ans_img_${i}`} type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => { const newImgs = [...(data.images || [])]; newImgs[i] = ev.target?.result; onChange({ images: newImgs }); }; reader.readAsDataURL(file); } }}/> 
                                </div> 
                            ) 
                        })} 
                    </div> 
                    <ModuleInput label="正確圖片順序/ID" value={data.answer} field="answer" onChange={onChange} /> 
                    {renderFeedbackFields()}
                </div> 
            );
        case 'ANS_PHOTO': 
            return (
                <>
                    <div className="text-sm text-slate-500 italic p-2 bg-slate-50 rounded">無需設定答案，玩家拍攝任意照片即可通關。</div>
                    {renderFeedbackFields()}
                </>
            );
        case 'ANS_AR': 
            return ( 
                <div className="space-y-4"> 
                    <ModuleFileUpload label="辨識目標圖" field="target" data={data} onChange={onChange} /> 
                    <ModuleFileUpload label="辨識成功顯示圖" field="successImage" data={data} onChange={onChange} /> 
                    <ModuleInput label="辨識物提示名稱" value={data.hintName} field="hintName" onChange={onChange} /> 
                    <ModuleInput label="辨識物提示內容" value={data.hintContent} field="hintContent" onChange={onChange} /> 
                    {renderFeedbackFields()}
                </div> 
            );
        case 'HINT': 
            return ( 
                <div> 
                    <label className="block text-xs font-bold text-slate-500 mb-2">提示列表</label> 
                    {(data.hints || []).map((hint: any, idx: number) => ( 
                        <div key={idx} className="bg-yellow-50 p-3 rounded mb-2 border border-yellow-100"> 
                            <div className="flex justify-between mb-2"> 
                                <span className="text-xs font-bold text-yellow-700">提示 {idx+1}</span> 
                                <button onClick={() => { const newHints = (data.hints || []).filter((_:any, i:number) => i !== idx); onChange({ hints: newHints }); }} className="text-red-400"><X size={14}/></button> 
                            </div> 
                            <div className="flex gap-2 mb-2"> 
                                <input type="number" className="w-20 p-2 border border-slate-300 rounded text-xs bg-white text-slate-600" placeholder="秒數" value={hint.delay} onChange={(e) => { const newHints = [...(data.hints || [])]; newHints[idx].delay = e.target.value; onChange({ hints: newHints }); }} /> 
                                <span className="text-xs text-slate-500 self-center">秒後顯示</span> 
                            </div> 
                            <textarea rows={2} className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-600" placeholder="提示內容..." value={hint.text} onChange={(e) => { const newHints = [...(data.hints || [])]; newHints[idx].text = e.target.value; onChange({ hints: newHints }); }} /> 
                        </div> 
                    ))} 
                    <button onClick={() => onChange({ hints: [...(data.hints || []), { text: '', delay: 60 }] })} className="text-xs font-bold text-yellow-600">+ 新增提示</button> 
                </div> 
            );
        default: return <div className="text-sm text-slate-400">此模組暫無設定選項</div>;
    }
};

// --- Sub-Component: Manual Editor (Wrapper) ---
const ManualEditor = ({ setCurrentGame, setView, onBack, targetGameId }: ViewProps & { onBack: () => void, targetGameId: string | null }) => {
  const { user } = useAuth();
  const { games, saveGame } = useGame(); // Use GameContext
  const [editTab, setEditTab] = useState<'INTRO' | 'SCENES'>('INTRO');
  
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [arPreviewData, setArPreviewData] = useState<any | null>(null);

  // Initialize State
  const [gameInfo, setGameInfo] = useState<GameInfoData>({ title: '', desc: '', cover: 'adventure', tags: [], language: 'zh-TW', difficulty: 3, location: '', latitude: '', longitude: '', type: 'adventure' });
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [groups, setGroups] = useState<NodeGroup[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [assets, setAssets] = useState<GameAsset[]>([]);

  // History management
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (targetGameId) {
        // Load Existing Game
        const existingGame = games.find(g => g.id === targetGameId);
        if (existingGame) {
            setGameInfo({
                title: existingGame.title,
                desc: existingGame.description,
                cover: existingGame.coverImageKeyword,
                tags: existingGame.tags || [],
                language: existingGame.language || 'zh-TW',
                difficulty: existingGame.difficulty || 3,
                location: existingGame.location || '',
                latitude: existingGame.latitude ? existingGame.latitude.toString() : '',
                longitude: existingGame.longitude ? existingGame.longitude.toString() : '',
                type: existingGame.type || 'adventure'
            });
            const loadedScenes = existingGame.scenes.length > 0 ? existingGame.scenes : [{ id: 'start', title: '起始場景', text: '...', choices: [], x: 100, y: 100, modules: [] }];
            const loadedGroups = existingGame.groups || [];
            setScenes(loadedScenes);
            setGroups(loadedGroups);
            setCharacters(existingGame.characters || []);
            setAssets(existingGame.assets || []);
            setHistory([{ scenes: loadedScenes, groups: loadedGroups }]);
            setHistoryIndex(0);
        }
    } else {
        // New Game
        const initialScenes = [{ id: 'start', title: '起始場景', text: '這是故事的開始...', imageKeyword: 'start', choices: [], x: 100, y: 100, modules: [] }];
        const initialGroups: NodeGroup[] = [];
        setScenes(initialScenes);
        setGroups(initialGroups);
        setCharacters([]);
        setAssets([]);
        setHistory([{ scenes: initialScenes, groups: initialGroups }]);
        setHistoryIndex(0);
        setActiveSceneId('start');
    }
  }, [targetGameId]);

  const pushToHistory = (newScenes: Scene[], newGroups: NodeGroup[]) => { const newHistory = history.slice(0, historyIndex + 1); newHistory.push({ scenes: newScenes, groups: newGroups }); if (newHistory.length > 50) newHistory.shift(); setHistory(newHistory); setHistoryIndex(newHistory.length - 1); };
  const updateStateWithHistory = (newScenes: Scene[], newGroups: NodeGroup[]) => { markDirty(); if (history.length === 0) { setHistory([{ scenes, groups }]); setHistoryIndex(0); } pushToHistory(newScenes, newGroups); setScenes(newScenes); setGroups(newGroups); };
  const handleHistoryAction = (action: 'undo' | 'redo') => { if (action === 'undo' && historyIndex > 0) { const prev = history[historyIndex - 1]; setScenes(prev.scenes); setGroups(prev.groups); setHistoryIndex(historyIndex - 1); } else if (action === 'redo' && historyIndex < history.length - 1) { const next = history[historyIndex + 1]; setScenes(next.scenes); setGroups(next.groups); setHistoryIndex(historyIndex + 1); } };

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProtectedAction = (action: () => void) => { if (isDirty) { setPendingAction(() => action); setShowExitConfirm(true); } else { action(); } };
  const confirmExit = () => { setIsDirty(false); setShowExitConfirm(false); if (pendingAction) pendingAction(); };
  const cancelExit = () => { setShowExitConfirm(false); setPendingAction(null); };

  const markDirty = () => { if (!isDirty) setIsDirty(true); };
  
  // Scene manipulation (re-using previous logic logic with minor tweaks)
  const checkAndMoveOverlapping = (newNode: Scene, currentScenes: Scene[]) => { const W = 180; const H = 100; return currentScenes.map(scene => { if (scene.id === newNode.id) return scene; const overlaps = ( Math.abs((scene.x || 0) - (newNode.x || 0)) < W && Math.abs((scene.y || 0) - (newNode.y || 0)) < H ); if (overlaps) { let dx = (scene.x || 0) - (newNode.x || 0); let dy = (scene.y || 0) - (newNode.y || 0); if (dx === 0 && dy === 0) dx = 1; if (Math.abs(dx) > Math.abs(dy)) { const sign = dx > 0 ? 1 : -1; return { ...scene, x: (newNode.x || 0) + (sign * W) }; } else { const sign = dy > 0 ? 1 : -1; return { ...scene, y: (newNode.y || 0) + (sign * H) }; } } return scene; }); };
  const handleAddScene = (x?: number, y?: number) => { const newId = `scene_${Date.now()}`; const newScene: Scene = { id: newId, title: '新關卡', text: '在這裡輸入劇情內容...', imageKeyword: 'place', choices: [], x: x || 100, y: y || 100, modules: [] }; const updatedScenes = checkAndMoveOverlapping(newScene, scenes); updateStateWithHistory([...updatedScenes, newScene], groups); setActiveSceneId(newId); setActiveGroupId(null); };
  const handleAddRelativeScene = (sourceId: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => { const sourceScene = scenes.find(s => s.id === sourceId); if(!sourceScene) return; const sx = sourceScene.x || 0; const sy = sourceScene.y || 0; let nx = sx, ny = sy; if (direction === 'RIGHT') nx = sx + 250; if (direction === 'LEFT') nx = sx - 250; if (direction === 'DOWN') ny = sy + 150; if (direction === 'UP') ny = sy - 150; const newId = `scene_${Date.now()}`; const newScene: Scene = { id: newId, title: '新關卡', text: '...', choices: [], x: nx, y: ny, modules: [] }; const parentGroup = groups.find(g => g.sceneIds.includes(sourceId)); let nextGroups = groups; if (parentGroup) { nextGroups = groups.map(g => g.id === parentGroup.id ? { ...g, sceneIds: [...g.sceneIds, newId] } : g); } const updatedScenes = checkAndMoveOverlapping(newScene, scenes); updateStateWithHistory([...updatedScenes, newScene], nextGroups); setActiveSceneId(newId); setActiveGroupId(null); };
  const handleBatchAddScenes = (newScenes: Scene[]) => { updateStateWithHistory([...scenes, ...newScenes], groups); };
  const handleBatchUpdateScenes = (updates: { id: string; x: number; y: number }[]) => { setScenes(prev => prev.map(s => { const update = updates.find(u => u.id === s.id); return update ? { ...s, x: update.x, y: update.y } : s; })); };
  const commitBatchSceneUpdate = (updates: { id: string; x: number; y: number }[]) => { updateStateWithHistory( scenes.map(s => { const update = updates.find(u => u.id === s.id); return update ? { ...s, x: update.x, y: update.y } : s; }), groups ); };
  const handleDeleteScene = (id: string) => { if (scenes.length <= 1) { setError("至少需要一個場景"); return; } const newScenes = scenes.filter(s => s.id !== id); const newGroups = groups.map(g => ({ ...g, sceneIds: g.sceneIds.filter(sid => sid !== id) })).filter(g => g.sceneIds.length > 0); updateStateWithHistory(newScenes, newGroups); if (activeSceneId === id) setActiveSceneId(null); };
  const updateScene = (id: string, updates: Partial<Scene>) => { if (updates.x !== undefined || updates.y !== undefined) { setScenes(scenes.map(s => s.id === id ? { ...s, ...updates } : s)); return; } updateStateWithHistory( scenes.map(s => s.id === id ? { ...s, ...updates } : s), groups ); };
  const commitSceneUpdate = (id: string, updates: Partial<Scene>) => { updateStateWithHistory( scenes.map(s => s.id === id ? { ...s, ...updates } : s), groups ); };
  const handleAddGroup = (sceneIds: string[]) => { const newGroup: NodeGroup = { id: `group_${Date.now()}`, title: '新群組', type: 'ALL', sceneIds: sceneIds, choices: [] }; updateStateWithHistory(scenes, [...groups, newGroup]); };
  const updateGroup = (id: string, updates: Partial<NodeGroup>) => { updateStateWithHistory( scenes, groups.map(g => g.id === id ? { ...g, ...updates } : g) ); };
  const deleteGroup = (id: string) => { updateStateWithHistory(scenes, groups.filter(g => g.id !== id)); if (activeGroupId === id) setActiveGroupId(null); };

  const handleSave = () => {
    setValidationError(null);
    if (!gameInfo.title.trim()) { setValidationError("請填寫遊戲標題"); return; }
    
    const newGame: Game = {
      id: targetGameId || crypto.randomUUID(),
      title: gameInfo.title,
      description: gameInfo.desc,
      author: user?.name || 'Unknown',
      authorId: user?.id,
      coverImageKeyword: gameInfo.cover,
      startSceneId: 'start',
      scenes: scenes,
      groups: groups,
      type: gameInfo.type,
      playCount: 0, rating: 0, 
      createdAt: new Date().toISOString(),
      tags: gameInfo.tags, language: gameInfo.language, difficulty: gameInfo.difficulty, location: gameInfo.location, latitude: parseFloat(gameInfo.latitude) || 0, longitude: parseFloat(gameInfo.longitude) || 0,
      characters: characters,
      assets: assets,
      status: 'draft' // Default status
    };
    
    // Perform save
    saveGame(newGame); 
    
    // Reset dirty flag and navigate back
    // Use setTimeout to ensure context update propagates before switching views
    setTimeout(() => {
        setIsDirty(false);
        onBack();
    }, 50);
  };

  const activeScene = scenes.find(s => s.id === activeSceneId);
  const activeGroup = groups.find(g => g.id === activeGroupId);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden relative">
       <div className="w-16 md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 transition-all">
          <div className="p-2 md:p-4 space-y-2 mt-4">
             <button onClick={() => setEditTab('INTRO')} className={`w-full flex items-center md:px-4 px-2 py-3 rounded-xl font-bold transition-all ${editTab === 'INTRO' ? 'bg-white text-orange-500 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}><FileTextIcon /> <span className="hidden md:inline ml-2">介紹</span></button>
             <button onClick={() => setEditTab('SCENES')} className={`w-full flex items-center md:px-4 px-2 py-3 rounded-xl font-bold transition-all ${editTab === 'SCENES' ? 'bg-white text-orange-500 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}><Layout size={20} /> <span className="hidden md:inline ml-2">編輯</span></button>
          </div>
       </div>

       <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          <div className="flex items-center justify-between px-6 py-3 border-b border-orange-100 bg-white z-30">
             <div className="flex items-center">
               <button onClick={() => handleProtectedAction(onBack)} className="flex items-center text-slate-400 hover:text-red-500 mr-4 transition-colors" title="退出編輯"><LogOut size={20} /></button>
               <h2 className="text-xl font-bold text-slate-800">{editTab === 'INTRO' ? '遊戲介紹' : '遊戲編輯'}</h2>
             </div>
             <div className="flex items-center gap-4">
               {validationError && <span className="text-red-500 text-sm font-bold animate-pulse">{validationError}</span>}
               <button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center"><Save size={16} className="mr-2" /> 儲存</button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden relative flex">
             {editTab === 'INTRO' ? (
                <div className="h-full w-full overflow-y-auto">
                    <GameIntroForm info={gameInfo} setInfo={setGameInfo} markDirty={markDirty} />
                </div>
             ) : (
                <>
                   <VisualNodeEditor 
                      scenes={scenes}
                      groups={groups}
                      activeSceneId={activeSceneId}
                      setActiveSceneId={setActiveSceneId}
                      activeGroupId={activeGroupId}
                      setActiveGroupId={setActiveGroupId}
                      onAddScene={handleAddScene}
                      onAddRelativeScene={handleAddRelativeScene}
                      onUpdateScene={updateScene} 
                      onAddGroup={handleAddGroup}
                      onUpdateGroup={updateGroup}
                      onDeleteGroup={deleteGroup}
                      onDeleteScene={handleDeleteScene} 
                      onBatchAddScenes={handleBatchAddScenes} 
                      onHistoryAction={handleHistoryAction}
                      canUndo={historyIndex > 0}
                      canRedo={historyIndex < history.length - 1}
                      markDirty={markDirty}
                      commitSceneUpdate={commitSceneUpdate}
                      onBatchUpdateScenes={handleBatchUpdateScenes}
                      commitBatchSceneUpdate={commitBatchSceneUpdate}
                      onEditSceneModules={(scene: Scene) => setEditingScene(scene)}
                      onPreviewAR={(data: any) => setArPreviewData(data)}
                   />
                   
                   {(activeScene || activeGroup) && (
                      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-xl overflow-y-auto p-4 z-40 animate-in slide-in-from-right duration-200">
                         <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">關卡詳情</h3>
                            <button onClick={() => { setActiveSceneId(null); setActiveGroupId(null); }}><X size={18} className="text-slate-400"/></button>
                         </div>
                         {activeScene && (
                             <div className="space-y-4">
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700 font-bold flex items-center cursor-pointer hover:bg-indigo-100" onClick={() => setEditingScene(activeScene)}>
                                    <Edit size={16} className="mr-2" /> 編輯模組內容
                                </div>
                                <div><label className="text-xs font-bold text-slate-500 block mb-1">ID</label><input type="text" value={activeScene.id} disabled className="w-full p-2 bg-slate-100 text-slate-500 rounded text-xs"/></div>
                                <div><label className="text-xs font-bold text-slate-500 block mb-1">標題</label><input type="text" value={activeScene.title} onChange={(e) => commitSceneUpdate(activeScene.id, { title: e.target.value })} className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-600"/></div>
                                <div className="pt-2 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-slate-500">分歧選項</label><button onClick={() => { const newChoice = { text: '新選項', nextSceneId: activeScene.id }; commitSceneUpdate(activeScene.id, { choices: [...activeScene.choices, newChoice] }); }} className="text-xs text-indigo-600 font-bold">+ 新增</button></div>
                                <div className="space-y-2">
                                    {activeScene.choices.map((c, idx) => (
                                        <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200">
                                            <input className="w-full mb-1 p-1 border border-slate-300 rounded text-xs bg-white text-slate-600" value={c.text} onChange={(e) => { const newChoices = [...activeScene.choices]; newChoices[idx].text = e.target.value; commitSceneUpdate(activeScene.id, { choices: newChoices }); }} placeholder="按鈕文字"/>
                                            <div className="flex items-center gap-1"><ArrowRight size={10} className="text-slate-400"/>
                                            <select className="flex-1 p-1 border border-slate-300 rounded text-xs bg-white text-slate-600" value={c.nextSceneId} onChange={(e) => { const newChoices = [...activeScene.choices]; newChoices[idx].nextSceneId = e.target.value; commitSceneUpdate(activeScene.id, { choices: newChoices }); }}>
                                                <optgroup label="場景">{scenes.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</optgroup>
                                                <optgroup label="群組">{groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</optgroup>
                                            </select>
                                            <button onClick={() => { const newChoices = activeScene.choices.filter((_, i) => i !== idx); commitSceneUpdate(activeScene.id, { choices: newChoices }); }}><Trash2 size={12} className="text-red-400"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div></div>
                                <div className="pt-4"><button onClick={() => handleDeleteScene(activeScene.id)} className="w-full py-2 bg-red-50 text-red-600 rounded text-sm font-bold hover:bg-red-100">刪除節點</button></div>
                             </div>
                         )}
                         {activeGroup && (
                             <div className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-500 block mb-1">群組 ID</label><input type="text" value={activeGroup.id} disabled className="w-full p-2 bg-slate-100 text-slate-500 rounded text-xs"/></div>
                                <div><label className="text-xs font-bold text-slate-500 block mb-1">群組標題</label><input type="text" value={activeGroup.title} onChange={(e) => updateGroup(activeGroup.id, { title: e.target.value })} className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-600"/></div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">完成條件</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateGroup(activeGroup.id, { type: 'ALL' })} className={`flex-1 py-2 text-xs font-bold rounded border ${activeGroup.type === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}>全部完成 (ALL)</button>
                                        <button onClick={() => updateGroup(activeGroup.id, { type: 'ANY' })} className={`flex-1 py-2 text-xs font-bold rounded border ${activeGroup.type === 'ANY' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}>完成其一 (ANY)</button>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-slate-500">群組出口</label><button onClick={() => { const newChoice = { text: '前往...', nextSceneId: activeGroup.id }; updateGroup(activeGroup.id, { choices: [...(activeGroup.choices || []), newChoice] }); }} className="text-xs text-indigo-600 font-bold">+ 新增</button></div>
                                    <div className="space-y-2">{(activeGroup.choices || []).map((c, idx) => (
                                            <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200">
                                                <input className="w-full mb-1 p-1 border border-slate-300 rounded text-xs bg-white text-slate-600" value={c.text} onChange={(e) => { const newChoices = [...(activeGroup.choices || [])]; newChoices[idx].text = e.target.value; updateGroup(activeGroup.id, { choices: newChoices }); }} placeholder="按鈕文字"/>
                                                <div className="flex items-center gap-1"><ArrowRight size={10} className="text-slate-400"/>
                                                <select className="flex-1 p-1 border border-slate-300 rounded text-xs bg-white text-slate-600" value={c.nextSceneId} onChange={(e) => { const newChoices = [...(activeGroup.choices || [])]; newChoices[idx].nextSceneId = e.target.value; updateGroup(activeGroup.id, { choices: newChoices }); }}><optgroup label="場景">{scenes.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</optgroup><optgroup label="群組">{groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</optgroup></select>
                                                <button onClick={() => { const newChoices = (activeGroup.choices || []).filter((_, i) => i !== idx); updateGroup(activeGroup.id, { choices: newChoices }); }}><Trash2 size={12} className="text-red-400"/></button></div>
                                            </div>
                                    ))}</div>
                                </div>
                                <div className="pt-4"><button onClick={() => deleteGroup(activeGroup.id)} className="w-full py-2 bg-red-50 text-red-600 rounded text-sm font-bold hover:bg-red-100">刪除群組</button></div>
                             </div>
                         )}
                      </div>
                   )}
                </>
             )}
          </div>
       </div>
       {showExitConfirm && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
             <h3 className="font-bold mb-4">未儲存的變更</h3>
             <div className="flex gap-2">
               <button onClick={cancelExit} className="flex-1 py-2 bg-slate-100 rounded">取消</button>
               <button onClick={confirmExit} className="flex-1 py-2 bg-red-500 text-white rounded">離開</button>
             </div>
           </div>
         </div>
       )}
       {editingScene && (
           <SceneBuilderModal 
               scene={editingScene} 
               onClose={() => setEditingScene(null)} 
               onSave={(updatedScene: Scene) => commitSceneUpdate(updatedScene.id, updatedScene)} 
               characters={characters}
               assets={assets}
               onAddCharacter={(char: Character) => setCharacters([...characters, char])}
               onAddAsset={(asset: GameAsset) => setAssets([...assets, asset])}
               onPreviewAR={(data: any) => setArPreviewData(data)}
           />
       )}
       {arPreviewData && (
           <ARScanner 
               data={arPreviewData} 
               onClose={() => setArPreviewData(null)}
               isEditorMode={true}
           />
       )}
    </div>
  );
};

const FileTextIcon = () => (
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);