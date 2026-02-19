
import React, { useState, useEffect, useRef } from 'react';
import { ViewProps, Scene, NodeGroup, GameModule } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, RefreshCw, Home, Trophy, Scan, X, CheckCircle, Camera, Loader2, Image as ImageIcon, Video, Mic, MessageSquare, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// --- AR Scanner Component ---
export const ARScanner = ({ 
    data, 
    onComplete, 
    onClose,
    isEditorMode = false 
}: { 
    data: any, 
    onComplete?: () => void,
    onClose?: () => void,
    isEditorMode?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(isEditorMode);
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
    const [showGhost, setShowGhost] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Auto-start if in editor mode
    useEffect(() => {
        if (isEditorMode && isOpen && scanState === 'idle') {
            startAR();
        }
    }, [isEditorMode, isOpen]);

    const startAR = async () => {
        setIsOpen(true);
        setScanState('scanning');
        setShowHelp(false);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            
            // Simulate recognition delay (3.5 seconds)
            // In a real app, this would be triggered by computer vision
            setTimeout(() => {
                // If the user hasn't cancelled or force-quit
                if (streamRef.current) { 
                    setScanState('success');
                    if (onComplete && !isEditorMode) onComplete();
                }
            }, 3500);

            // Show help/skip option after 5 seconds if still scanning
            setTimeout(() => {
                if (streamRef.current) {
                    setShowHelp(true);
                }
            }, 6000);

        } catch (err) {
            console.error("AR Camera Error:", err);
            // Fallback for devices without camera or permission denied
            setScanState('scanning');
            setTimeout(() => {
                setScanState('success');
                if (onComplete && !isEditorMode) onComplete();
            }, 2000);
        }
    };

    const closeAR = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsOpen(false);
        setScanState('idle');
        if (onClose) onClose();
    };
    
    const handleManualSuccess = () => {
        setScanState('success');
        if (onComplete && !isEditorMode) onComplete();
    };

    // Ensure camera stops if component unmounts
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Helper for rendering target hint
    const hasTarget = data.target && (data.target.startsWith('data:') || data.target.startsWith('http'));

    if (!isOpen) {
        return (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 my-4 shadow-lg">
                <div className="flex items-center mb-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mr-3">
                        <Scan size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">AR 掃描任務</h3>
                        <p className="text-xs text-slate-400">請尋找指定目標並進行掃描</p>
                    </div>
                </div>
                
                {hasTarget && (
                    <div className="mb-4 bg-black/40 rounded-lg p-3 text-center border border-white/5">
                        <p className="text-xs text-slate-500 mb-2 font-bold tracking-wider uppercase">辨識目標</p>
                        <div className="h-32 rounded-md overflow-hidden bg-black/50 inline-block relative group">
                             <img src={data.target} alt="Target" className="h-full object-contain" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-xs text-white font-bold">記住這個樣子</span>
                             </div>
                        </div>
                    </div>
                )}

                <Button onClick={startAR} className="w-full bg-blue-600 hover:bg-blue-500 shadow-blue-500/20">
                    <Camera className="mr-2" size={18} /> 啟動 AR 掃描器
                </Button>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 ${isEditorMode ? 'z-[200]' : ''}`}>
            {/* Camera View */}
            <div className="relative flex-1 overflow-hidden bg-black">
                <video 
                    ref={videoRef} 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover opacity-80" 
                />
                
                {/* Scanning Overlay */}
                {scanState === 'scanning' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                         <div className="relative w-full aspect-square max-w-sm rounded-3xl overflow-hidden">
                            {/* Target Ghost Overlay for Alignment Guidance */}
                            {hasTarget && showGhost && (
                                <div className="absolute inset-0 z-0 opacity-30 flex items-center justify-center pointer-events-none transition-opacity duration-500">
                                    <img src={data.target} className="w-full h-full object-contain" alt="Ghost" />
                                </div>
                            )}

                            {/* Corners */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"></div>
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"></div>
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"></div>
                            
                            {/* Scanning Laser */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_linear_infinite] z-10"></div>
                            
                            {/* Grid effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
                         </div>
                         
                         {/* Guidance Text */}
                         <div className="mt-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl flex flex-col items-center text-white text-center border border-white/10 shadow-xl max-w-xs">
                             <div className="flex items-center text-blue-400 font-bold mb-1">
                                <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
                                <span>搜尋目標中...</span>
                             </div>
                             <p className="text-xs text-slate-300">請將相機對準目標圖片並保持穩定</p>
                             
                             {hasTarget && (
                                <button 
                                    onClick={() => setShowGhost(!showGhost)} 
                                    className="mt-3 flex items-center text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                                >
                                    <Eye size={12} className="mr-1.5"/> {showGhost ? '隱藏' : '顯示'}輔助圖
                                </button>
                             )}
                         </div>

                         {/* Fallback / Help Option */}
                         {showHelp && (
                             <div className="absolute bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                 <button 
                                    onClick={handleManualSuccess}
                                    className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-2 rounded-full backdrop-blur-md border border-slate-600 transition-all"
                                 >
                                    <AlertCircle size={16} className="text-yellow-400" />
                                    <span className="text-sm font-bold">無法辨識？手動確認</span>
                                 </button>
                             </div>
                         )}
                    </div>
                )}

                {/* Success Overlay - Triggers AR Content */}
                {scanState === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300 p-6 z-20">
                        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                            {/* Success Effects */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                            
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-in fade-in zoom-in duration-500">
                                <CheckCircle size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">辨識成功！</h3>
                            <p className="text-slate-300 text-sm mb-6">已解鎖隱藏內容</p>
                            
                            {/* Recognized Content Display */}
                            {data.content && (
                                <div className="mb-6 rounded-xl overflow-hidden border-2 border-green-500/50 shadow-lg bg-black/50 relative group">
                                    <img src={data.content} alt="Content" className="w-full h-auto object-contain max-h-64" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                                </div>
                            )}
                            
                            <Button onClick={closeAR} className="w-full bg-green-600 hover:bg-green-500 border-none shadow-green-500/20">
                                {isEditorMode ? '關閉預覽' : '繼續冒險'}
                            </Button>
                        </div>
                    </div>
                )}
                
                {/* Close Button */}
                <button 
                    onClick={closeAR}
                    className="absolute top-6 right-6 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 z-30 backdrop-blur-sm border border-white/10"
                >
                    <X size={24} />
                </button>
            </div>
            
            {/* Style for scan animation */}
            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// --- Module Renderer ---
const ModuleRenderer = ({ module }: { module: GameModule }) => {
    switch (module.type) {
        case 'TEXT':
        case 'STORY_NARRATION':
            return (
                <div className="mb-6 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                    {module.data.title && <h3 className="font-bold text-lg text-white mb-2 border-b border-slate-700 pb-2">{module.data.title}</h3>}
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{module.data.text || module.data.content}</p>
                    {module.data.image && (
                         <div className="mt-4 rounded-xl overflow-hidden border border-slate-700">
                             <img src={module.data.image} alt="Narration" className="w-full h-auto" />
                         </div>
                    )}
                </div>
            );
        case 'STORY_DIALOGUE':
            return (
                <div className="mb-6 space-y-4">
                    {module.data.lines?.map((line: any, i: number) => {
                        const isPlayer = line.char === '玩家';
                        return (
                            <div key={i} className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                                    isPlayer 
                                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                    : 'bg-slate-700 text-slate-200 rounded-tl-sm'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        <span className="text-xs font-bold uppercase tracking-wider">{line.char}</span>
                                    </div>
                                    <p className="leading-snug">{line.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            );
        case 'IMAGE':
            return (
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
                     <img src={module.data.url || module.data.file} alt="Scene Element" className="w-full h-auto object-cover" />
                </div>
            );
        case 'VIDEO':
             return (
                 <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 aspect-video bg-black">
                     <iframe src={module.data.url?.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen frameBorder="0"/>
                 </div>
             );
        case 'AR_RECOGNIZE':
            return <ARScanner data={module.data} />;
        default:
            return null;
    }
}

export const Player: React.FC<ViewProps> = ({ currentGame, setView, setCurrentGame }) => {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [visitedSceneIds, setVisitedSceneIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  
  const { user, addPoints, addExp } = useAuth();

  useEffect(() => {
    if (currentGame && currentGame.scenes.length > 0) {
      const start = currentGame.scenes.find(s => s.id === currentGame.startSceneId);
      if (start) {
          setCurrentScene(start);
          setVisitedSceneIds(new Set([start.id]));
      }
    }
    setRewardClaimed(false);
    setHistory([]);
  }, [currentGame]);

  useEffect(() => {
    if (currentScene) {
        setVisitedSceneIds(prev => {
            const newSet = new Set(prev);
            newSet.add(currentScene.id);
            return newSet;
        });
    }
  }, [currentScene]);

  const handleChoice = (nextSceneId: string) => {
    if (!currentGame) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      let nextScene = currentGame.scenes.find(s => s.id === nextSceneId);

      if (!nextScene && currentGame.groups) {
         const group = currentGame.groups.find(g => g.id === nextSceneId);
         if (group && group.sceneIds.length > 0) {
             nextScene = currentGame.scenes.find(s => s.id === group.sceneIds[0]);
         }
      }

      if (nextScene) {
        setHistory([...history, currentScene?.id || '']);
        setCurrentScene(nextScene);
      }
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (currentScene?.isEnding && !rewardClaimed && user) {
        addPoints(20);
        addExp(100);
        setRewardClaimed(true);
    }
  }, [currentScene, user, rewardClaimed, addPoints, addExp]);

  const handleRestart = () => {
    if (!currentGame) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const start = currentGame.scenes.find(s => s.id === currentGame.startSceneId);
      if (start) {
        setCurrentScene(start);
        setHistory([]);
        setVisitedSceneIds(new Set([start.id]));
        setRewardClaimed(false); 
      }
      setIsTransitioning(false);
    }, 300);
  };

  const checkGroupCompletion = (group: NodeGroup) => {
      const groupScenes = group.sceneIds;
      if (groupScenes.length === 0) return false;
      const visitedCount = groupScenes.filter(id => visitedSceneIds.has(id)).length;
      if (group.type === 'ALL') {
          return visitedCount === groupScenes.length;
      } else {
          return visitedCount > 0;
      }
  };

  const getAvailableChoices = () => {
      if (!currentScene || !currentGame) return [];
      let choices = [...currentScene.choices];
      const parentGroup = currentGame.groups?.find(g => g.sceneIds.includes(currentScene.id));
      if (parentGroup && parentGroup.choices && parentGroup.choices.length > 0) {
          if (checkGroupCompletion(parentGroup)) {
              choices = [...choices, ...parentGroup.choices];
          }
      }
      return choices;
  };

  const availableChoices = getAvailableChoices();
  const hasModules = currentScene?.modules && currentScene.modules.length > 0;

  if (!currentGame || !currentScene) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
        <p className="mb-4 text-slate-500">載入錯誤或無遊戲資料</p>
        <Button onClick={() => setView('EXPLORE')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white flex flex-col md:flex-row">
      {/* Visual Section (Left) - Background or Atmospheric Image */}
      <div className="relative h-[30vh] md:h-auto md:w-1/2 lg:w-3/5 overflow-hidden bg-black">
        <img 
          src={`https://picsum.photos/seed/${currentScene.imageKeyword || currentScene.id}/1200/1000`} 
          alt="Scene Atmosphere"
          className={`h-full w-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r"></div>
        
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => setView('EXPLORE')}
            className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {/* Narrative Section (Right) - Modules & Interaction */}
      <div className="flex flex-col p-6 md:w-1/2 md:p-10 lg:w-2/5 overflow-y-auto bg-slate-900 border-l border-slate-800">
        <div className={`transition-all duration-500 transform flex-1 flex flex-col ${isTransitioning ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
          
          <div className="mb-4">
              <div className="mb-2 inline-flex items-center rounded-md bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                {currentGame.title}
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {currentScene.title}
              </h2>
          </div>

          {/* Render Modules if available, otherwise fallback to legacy text */}
          <div className="flex-1">
              {hasModules ? (
                  currentScene.modules?.map(mod => <ModuleRenderer key={mod.id} module={mod} />)
              ) : (
                  <p className="mb-10 text-lg leading-relaxed text-slate-300">
                    {currentScene.text}
                  </p>
              )}
          </div>

          {/* Choices Section */}
          <div className="space-y-4 mt-8 pt-6 border-t border-slate-800/50">
            {availableChoices.length > 0 ? (
              availableChoices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice.nextSceneId)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-left transition-all hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] group"
                >
                  <span className="font-semibold text-white group-hover:pl-2 transition-all">{choice.text}</span>
                </button>
              ))
            ) : (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <p className="text-indigo-300 font-bold text-xl mb-2">-- 結局 --</p>
                    {rewardClaimed && user && (
                        <div className="inline-flex items-center bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full border border-yellow-500/50 mb-4 shadow-lg shadow-yellow-500/10">
                             <Trophy size={16} className="mr-2" />
                             <span className="font-bold">+20 Points / +100 EXP</span>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-4">
                  <Button variant="primary" className="w-full" onClick={handleRestart}>
                    <RefreshCw size={18} className="mr-2" /> 重新開始
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-white/10" onClick={() => setView('EXPLORE')}>
                    <Home size={18} className="mr-2" /> 返回大廳
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
