
import React, { useState, useEffect } from 'react';
import { ViewProps, Scene } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, RefreshCw, Home, Edit, Loader2, ChevronRight, Shuffle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ModuleRenderer } from '../components/GamePlayerComponents';

export const Player: React.FC<ViewProps> = ({ currentGame, setView }) => {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [visitedSceneIds, setVisitedSceneIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [resolvedModules, setResolvedModules] = useState<Set<string>>(new Set());
  
  const { user, addPoints, addExp } = useAuth();

  useEffect(() => {
    if (currentGame && currentGame.scenes.length > 0) {
      // Find start scene by ID, or fallback to the first scene in the array
      const start = currentGame.scenes.find(s => s.id === currentGame.startSceneId) || currentGame.scenes[0];
      if (start) {
          setCurrentScene(start);
          setVisitedSceneIds(new Set([start.id]));
          setResolvedModules(new Set());
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

  const handleModuleResolve = (moduleId: string) => {
      setResolvedModules(prev => {
          const newSet = new Set(prev);
          newSet.add(moduleId);
          return newSet;
      });
  };

  const getAvailableChoices = () => {
      if (!currentScene || !currentGame) return [];
      
      const choices = [...currentScene.choices];
      const parentGroup = currentGame.groups?.find(g => g.sceneIds.includes(currentScene.id));

      if (parentGroup) {
          if (parentGroup.type === 'ALL') {
              const unvisitedInGroup = parentGroup.sceneIds.filter(id => !visitedSceneIds.has(id));
              if (unvisitedInGroup.length > 0) {
                  return [{
                      text: "繼續探索 (隨機關卡)",
                      nextSceneId: "RANDOM_IN_GROUP_" + parentGroup.id,
                      isSystemGenerated: true
                  }];
              } else {
                  if (parentGroup.choices) {
                      return [...choices, ...parentGroup.choices];
                  }
              }
          } else {
              if (parentGroup.choices) {
                  return [...choices, ...parentGroup.choices];
              }
          }
      }
      return choices;
  };

  const blockingModules = currentScene?.modules?.filter(m => 
      m.type.startsWith('ANS_') || m.type === 'LOCATION' || m.type === 'AR_RECOGNIZE' || m.type === 'PUZZLE_JIGSAW' || m.type === 'STORY_DIALOGUE'
  ) || [];
  
  const allBlockingResolved = blockingModules.every(m => resolvedModules.has(m.id));

  const handleChoice = (nextSceneId: string) => {
    if (!currentGame) return;
    if (!allBlockingResolved) {
        // For dialogue, we might not want to show an alert, just hide the buttons.
        // But the UI logic below (lines 211-235) handles hiding buttons if not resolved.
        // This check is a safeguard.
        // However, if buttons are hidden, user can't click.
        // If buttons ARE shown (e.g. custom choices in dialogue?), we might want to block.
        // But usually choices are at the bottom.
        // Let's keep the alert for safety but the UI should hide them.
        alert("請先完成當前場景的所有任務！");
        return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      let nextScene = null;

      if (nextSceneId.startsWith("RANDOM_IN_GROUP_")) {
          const groupId = nextSceneId.split("RANDOM_IN_GROUP_")[1];
          const group = currentGame.groups?.find(g => g.id === groupId);
          if (group) {
              const unvisited = group.sceneIds.filter(id => !visitedSceneIds.has(id));
              if (unvisited.length > 0) {
                  const randomIndex = Math.floor(Math.random() * unvisited.length);
                  const randomId = unvisited[randomIndex];
                  nextScene = currentGame.scenes.find(s => s.id === randomId);
              }
          }
      } else {
          nextScene = currentGame.scenes.find(s => s.id === nextSceneId);
          if (!nextScene && currentGame.groups) {
             const group = currentGame.groups.find(g => g.id === nextSceneId);
             if (group && group.sceneIds.length > 0) {
                 // Randomly pick a start scene from the group
                 // If it's ALL, pick random unvisited (which is all of them initially)
                 // If it's ANY, pick random from all
                 const randomIndex = Math.floor(Math.random() * group.sceneIds.length);
                 nextScene = currentGame.scenes.find(s => s.id === group.sceneIds[randomIndex]);
             }
          }
      }

      if (nextScene) {
        setHistory([...history, currentScene?.id || '']);
        setCurrentScene(nextScene);
        setResolvedModules(new Set());
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

  // Auto-transition for RPG mode (or single choice scenarios) when resolved
  useEffect(() => {
      if (!currentScene || !currentGame || isTransitioning) return;

      const available = getAvailableChoices();
      if (allBlockingResolved && available.length > 0) {
          const isSingleChoice = available.length === 1;
          const isSystemChoice = available.some(c => c.isSystemGenerated);
          
          if (isSingleChoice || isSystemChoice) {
             handleChoice(available[0].nextSceneId);
          }
      }
  }, [allBlockingResolved, currentScene, resolvedModules, isTransitioning]); 

  const handleRestart = () => {
    if (!currentGame) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const start = currentGame.scenes.find(s => s.id === currentGame.startSceneId) || currentGame.scenes[0];
      if (start) {
        setCurrentScene(start);
        setHistory([]);
        setVisitedSceneIds(new Set([start.id]));
        setResolvedModules(new Set());
        setRewardClaimed(false); 
      }
      setIsTransitioning(false);
    }, 300);
  };
  
  const handleExit = () => {
      if (currentGame?.status === 'draft') {
          setView('CREATE');
      } else {
          setView('EXPLORE');
      }
  };

  const availableChoices = getAvailableChoices();
  const hasModules = currentScene?.modules && currentScene.modules.length > 0;
  const isDraft = currentGame?.status === 'draft';

  if (!currentGame || !currentScene) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> 載入中...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
      <div className="w-full max-w-[420px] h-[100dvh] bg-black relative overflow-hidden flex flex-col shadow-2xl">
        
        {/* Background Layer (Base Scene) */}
        <div className="absolute inset-0 z-0">
             <img 
              src={currentScene.imageKeyword && currentScene.imageKeyword.startsWith('data:') ? currentScene.imageKeyword : `https://picsum.photos/seed/${currentScene.imageKeyword || currentScene.id}/800/1200`}
              className={`h-full w-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              alt="Scene Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
             <button onClick={handleExit} className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 backdrop-blur-md transition-colors"><ArrowLeft size={20} /></button>
             <div className="flex flex-col items-center">
                 <h2 className="text-white font-bold text-shadow-md truncate max-w-[200px]">{currentScene.title}</h2>
                 <div className="h-[0.5px] w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-1 opacity-80"></div>
             </div>
             <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 relative z-10 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'} px-[6.5px] pt-20`}>
            
            {/* If there are modules, they take precedence and might handle their own full-screen visuals (like RPG Dialogue) */}
            {hasModules ? (
                <div className="flex-1 w-full relative">
                    {currentScene.modules?.map(mod => (
                        <ModuleRenderer key={mod.id} module={mod} onResolve={handleModuleResolve} isResolved={resolvedModules.has(mod.id)} user={user} characters={currentGame.characters} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-end p-6 pb-24">
                     <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white leading-relaxed text-lg shadow-lg">
                         {currentScene.text}
                     </div>
                </div>
            )}
            
            {/* Padding for bottom buttons */}
            <div className="h-24"></div>
        </div>

        {/* Bottom Interaction Area (Choices) */}
        <div className="absolute bottom-0 left-0 right-0 z-40 px-[6.5px] pb-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
            <div className="space-y-3">
                {allBlockingResolved && availableChoices.length > 0 ? (
                availableChoices.map((choice: any, idx: number) => (
                    <button
                    key={idx}
                    onClick={() => handleChoice(choice.nextSceneId)}
                    className={`w-full rounded-xl p-4 text-center font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-between group border border-white/10 backdrop-blur-md ${choice.isSystemGenerated ? 'bg-purple-600/90' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <span className="flex-1 flex items-center justify-center">
                            {choice.isSystemGenerated && <Shuffle size={16} className="mr-2"/>}
                            {choice.text}
                        </span>
                        <ChevronRight className="opacity-70" size={16} />
                    </button>
                ))
                ) : (
                    !hasModules || (hasModules && allBlockingResolved) ? (
                        availableChoices.length === 0 && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <Button variant="secondary" className="flex-1 text-sm py-4" onClick={handleRestart}><RefreshCw size={16} className="mr-2" /> 重新開始</Button>
                                <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 text-sm py-4" onClick={handleExit}>
                                    {isDraft ? <Edit size={16} className="mr-2" /> : <Home size={16} className="mr-2" />} 
                                    {isDraft ? '返回遊戲編輯' : '返回大廳'}
                                </Button>
                            </div>
                        )
                    ) : null
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
