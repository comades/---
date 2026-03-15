
import React, { useState, useEffect } from 'react';
import { ViewProps, Scene, GameStats, NodeGroup, GameModule } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, RefreshCw, Home, Edit, Loader2, ChevronRight, Shuffle, Star, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { ModuleRenderer } from '../components/GamePlayerComponents';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { JourneyReflection } from '../components/JourneyReflection';
import { StarTraceAnimation } from '../components/StarTraceAnimation';

// --- Generic Confirm Modal ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = '確認', confirmColor = 'bg-indigo-600 hover:bg-indigo-700' }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center text-indigo-600">
                    <AlertTriangle className="mr-2" /> {title}
                </h3>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">取消</button>
                    <button onClick={onConfirm} className={`flex-1 py-2 rounded-lg font-bold text-white ${confirmColor}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FailureModal = ({ isOpen, message, onConfirm }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">任務失敗</h3>
                <p className="text-slate-300 mb-8">{message}</p>
                <Button onClick={onConfirm} className="w-full">
                    繼續冒險
                </Button>
            </div>
        </div>
    );
};

const ReviewModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (rating: number, comment: string) => void }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">評價此遊戲</h3>
                <p className="text-slate-500 mb-6 text-sm">您的回饋將幫助創作者做得更好！</p>
                
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star 
                                size={32} 
                                className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="寫下您的心得..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm mb-6 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                />

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">略過</Button>
                    <Button 
                        onClick={() => onSubmit(rating, comment)} 
                        disabled={rating === 0}
                        className="flex-1"
                    >
                        送出評價
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const Player: React.FC<ViewProps> = ({ currentGame, setView }) => {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [visitedSceneIds, setVisitedSceneIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const [pendingScene, setPendingScene] = useState<Scene | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [resolvedModules, setResolvedModules] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [failureModal, setFailureModal] = useState<{ isOpen: boolean, message: string, targetSceneId?: string }>({ isOpen: false, message: '' });
  
  // Tracking Stats
  const [gameStats, setGameStats] = useState<GameStats>({
      startTime: Date.now(),
      interactionCount: 0,
      hintCount: 0,
      puzzleFailures: 0,
      visitedSceneCount: 0,
      totalSceneCount: 0,
      averageDecisionTime: 0
  });
  const [lastActionTime, setLastActionTime] = useState(Date.now());

  const { user, addPoints, addExp } = useAuth();
  const { addReview } = useGame();
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
      const originalAlert = window.alert;
      window.alert = (msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(''), 3000);
      };
      return () => {
          window.alert = originalAlert;
      };
  }, []);

  const handleReviewSubmit = (rating: number, comment: string) => {
      if (currentGame && user) {
          addReview(currentGame.id, {
              id: `review_${Date.now()}`,
              userId: user.id,
              userName: user.name,
              userAvatar: user.avatarUrl,
              rating,
              comment,
              createdAt: new Date().toISOString()
          });
          setShowReviewModal(false);
          setToastMessage("感謝您的評價！");
          setTimeout(() => setToastMessage(''), 3000);
      }
  };

  useEffect(() => {
    if (currentGame) {
      // Try to load saved state from sessionStorage, but skip if it's a draft (test play)
      const savedState = sessionStorage.getItem(`game_progress_${currentGame.id}`);
      if (savedState && currentGame.status !== 'draft') {
        try {
          const parsed = JSON.parse(savedState);
                    const scene = (currentGame.scenes || []).find(s => s.id === parsed.currentSceneId);
          if (scene) {
            setCurrentScene(scene);
            setVisitedSceneIds(new Set(parsed.visitedSceneIds));
            setHistory(parsed.history || []);
            setResolvedModules(new Set(parsed.resolvedModules || []));
            setRewardClaimed(parsed.rewardClaimed || false);
            // Restore stats if available, else reset
            if (parsed.gameStats) {
                setGameStats(parsed.gameStats);
            }
            return; // Skip default initialization if load successful
          }
        } catch (e) {
          console.error("Failed to load saved game state", e);
        }
      } else if (currentGame.status === 'draft') {
          // Clear any previous test play state
          sessionStorage.removeItem(`game_progress_${currentGame.id}`);
      }

      // Default initialization
      if ((currentGame.scenes || []).length > 0) {
        // Find start scene by ID, or fallback to the first scene in the array
        const start = (currentGame.scenes || []).find(s => s.id === currentGame.startSceneId) || currentGame.scenes[0];
        if (start) {
            setCurrentScene(start);
            setVisitedSceneIds(new Set([start.id]));
            setResolvedModules(new Set());
        }
      }
      setRewardClaimed(false);
      setHistory([]);
      setGameStats({
          startTime: Date.now(),
          interactionCount: 0,
          hintCount: 0,
          puzzleFailures: 0,
          visitedSceneCount: 1,
          totalSceneCount: (currentGame.scenes || []).length,
          averageDecisionTime: 0
      });
      setLastActionTime(Date.now());
    }
  }, [currentGame]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (currentGame && currentScene) {
      const stateToSave = {
        currentSceneId: currentScene.id,
        visitedSceneIds: Array.from(visitedSceneIds),
        history,
        resolvedModules: Array.from(resolvedModules),
        rewardClaimed,
        gameStats
      };
      sessionStorage.setItem(`game_progress_${currentGame.id}`, JSON.stringify(stateToSave));
    }
  }, [currentGame, currentScene, visitedSceneIds, history, resolvedModules, rewardClaimed, gameStats]);

  useEffect(() => {
    if (currentScene) {
        setVisitedSceneIds(prev => {
            const newSet = new Set(prev);
            newSet.add(currentScene.id);
            return newSet;
        });
        setGameStats(prev => ({
            ...prev,
            visitedSceneCount: visitedSceneIds.size
        }));
    }
  }, [currentScene]);

  const handleModuleResolve = (moduleId: string) => {
      setResolvedModules(prev => {
          const newSet = new Set(prev);
          newSet.add(moduleId);
          return newSet;
      });
  };

  const handleHintUsed = () => {
      setGameStats(prev => ({
          ...prev,
          hintCount: prev.hintCount + 1
      }));
  };

  const handleTimeout = (module: GameModule) => {
    const action = module.onTimeout?.action || 'DEDUCT_EXP';
    
    if (action === 'DEDUCT_EXP') {
      const deduction = module.onTimeout?.expDeduction || 50;
      addExp(-deduction);
      setToastMessage(`時間到！扣除 ${deduction} EXP`);
      setTimeout(() => setToastMessage(''), 3000);
      // Mark as resolved so player can move on
      handleModuleResolve(module.id);
    } else if (action === 'JUMP' && module.onTimeout?.targetSceneId) {
      setFailureModal({
        isOpen: true,
        message: "時間已到，任務失敗！",
        targetSceneId: module.onTimeout.targetSceneId
      });
    }
  };

  const handleAnswerAttempt = (isCorrect: boolean) => {
      if (!isCorrect) {
          setGameStats(prev => ({
              ...prev,
              puzzleFailures: prev.puzzleFailures + 1
          }));
      }
  };

  const findFirstSceneInGroup = (group: NodeGroup, allScenes: Scene[]) => {
    const groupScenes = allScenes.filter(s => group.sceneIds.includes(s.id));
    // A scene is a "start" if no other scene in the group points to it
    const startScenes = groupScenes.filter(s => {
        return !groupScenes.some(other => 
            other.choices.some(c => c.nextSceneId === s.id)
        );
    });
    return startScenes.length > 0 ? startScenes[0].id : group.sceneIds[0];
  };

  const getAvailableChoices = () => {
      if (!currentScene || !currentGame) return [];
      
      let choices = [...currentScene.choices];
      const parentGroup = currentGame.groups?.find(g => g.sceneIds.includes(currentScene.id));

      // 1. Handle outgoing connections from the current scene/group
      if (parentGroup) {
          if (parentGroup.type === 'ANY') {
              // ANY mode: Ignore internal connections, use group's outgoing connections
              choices = (parentGroup.choices || []).map(c => ({
                  ...c,
                  // Auto-jump if no text OR if it's the only exit
                  isSystemGenerated: !c.text || (parentGroup.choices?.length === 1)
              }));
          } else {
              // ALL mode: 
              // Check if current scene has internal connections within the group
              const internalChoices = choices.filter(c => parentGroup.sceneIds.includes(c.nextSceneId));
              if (internalChoices.length > 0) {
                  choices = internalChoices.map(c => ({
                      ...c,
                      isSystemGenerated: !c.text // Auto-jump if no text
                  }));
              } else {
                  // End of sequence in group, use group's outgoing connections
                  choices = (parentGroup.choices || []).map(c => ({
                      ...c,
                      isSystemGenerated: !c.text // Auto-jump if no text
                  }));
              }
          }
      } else {
          // Normal scene: mark choices without text as system generated
          choices = choices.map(c => ({
              ...c,
              isSystemGenerated: !c.text
          }));
      }

      // 2. Handle incoming connections to groups (Expansion)
      const expandedChoices: any[] = [];
      for (const choice of choices) {
          const targetGroup = currentGame.groups?.find(g => g.id === choice.nextSceneId);
          if (targetGroup) {
              if (targetGroup.type === 'ANY') {
                  // Expand to all scenes in the group
                  targetGroup.sceneIds.forEach(sceneId => {
                      const scene = currentGame.scenes.find(s => s.id === sceneId);
                      if (scene) {
                          expandedChoices.push({
                              text: scene.title,
                              nextSceneId: scene.id,
                              isSystemGenerated: false // Show as normal choices with titles
                          });
                      }
                  });
              } else {
                  // ALL mode: Jump to the first scene in the group
                  const firstSceneId = findFirstSceneInGroup(targetGroup, currentGame.scenes);
                  if (firstSceneId) {
                      const firstScene = currentGame.scenes.find(s => s.id === firstSceneId);
                      expandedChoices.push({
                          ...choice,
                          text: firstScene?.title || choice.text,
                          nextSceneId: firstSceneId,
                          isSystemGenerated: true // ALL groups should auto-jump if possible
                      });
                  }
              }
          } else {
              expandedChoices.push(choice);
          }
      }

      return expandedChoices;
  };

  const blockingModules = (currentScene?.modules || []).filter(m => 
      m.type.startsWith('ANS_') || m.type === 'LOCATION' || m.type === 'AR_RECOGNIZE' || m.type === 'PUZZLE_JIGSAW' || m.type === 'PUZZLE_PASSWORD_LOCK' || m.type === 'PUZZLE_RHYTHM' || m.type === 'PUZZLE_PATTERN_LOCK' || m.type === 'STORY_DIALOGUE'
  ) || [];
  
  const allBlockingResolved = blockingModules.every(m => resolvedModules.has(m.id));

  const handleChoice = (nextSceneId: string, force = false) => {
    if (!currentGame) return;
    if (!allBlockingResolved && !force) {
        const activeCountdownMod = currentScene?.modules?.find(m => m.hasCountdown && !resolvedModules.has(m.id));
        if (activeCountdownMod) {
            setFailureModal({
                isOpen: true,
                message: "您選擇了跳過任務，任務失敗！",
                targetSceneId: nextSceneId
            });
            return;
        }
        setToastMessage("請先完成當前場景的所有任務！");
        setTimeout(() => setToastMessage(''), 3000);
        return;
    }
    
    // Update Stats
    const now = Date.now();
    const decisionTime = (now - lastActionTime) / 1000;
    setGameStats(prev => ({
        ...prev,
        interactionCount: prev.interactionCount + 1,
        averageDecisionTime: (prev.averageDecisionTime * prev.interactionCount + decisionTime) / (prev.interactionCount + 1)
    }));
    setLastActionTime(now);

    // Trigger Cinematic Transition
    setShowCinematic(true);
    
    let nextScene: Scene | null = currentGame.scenes.find(s => s.id === nextSceneId) || null;

    if (nextScene) {
        setPendingScene(nextScene);
    }
  };

  const onCinematicComplete = () => {
    if (pendingScene) {
        setHistory([...history, currentScene?.id || '']);
        setCurrentScene(pendingScene);
        setResolvedModules(new Set());
        setPendingScene(null);
    }
    setShowCinematic(false);
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
              
              // Auto-jump if it's a single choice
              if (isSingleChoice) {
                 handleChoice(available[0].nextSceneId);
              }
          }
  }, [allBlockingResolved, currentScene, resolvedModules, isTransitioning]); 

  const handleRestart = () => {
    if (!currentGame) return;
    sessionStorage.removeItem(`game_progress_${currentGame.id}`);
    setIsTransitioning(true);
    setTimeout(() => {
      const start = currentGame.scenes.find(s => s.id === currentGame.startSceneId) || currentGame.scenes[0];
      if (start) {
        setCurrentScene(start);
        setHistory([]);
        setVisitedSceneIds(new Set([start.id]));
        setResolvedModules(new Set());
        setRewardClaimed(false); 
        setGameStats({
            startTime: Date.now(),
            interactionCount: 0,
            hintCount: 0,
            puzzleFailures: 0,
            visitedSceneCount: 1,
            totalSceneCount: currentGame.scenes.length,
            averageDecisionTime: 0
        });
        setLastActionTime(Date.now());
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
  const isGameFinished = currentScene?.isEnding && allBlockingResolved && availableChoices.length === 0;

  if (!currentGame || !currentScene) return <LoadingOverlay message="正在載入遊戲資源..." subMessage="請稍候，冒險即將開始" />;

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
             <button onClick={() => setConfirmModalOpen(true)} className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 backdrop-blur-md transition-colors" title="重新開始"><RefreshCw size={20} /></button>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 relative z-10 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'} px-[6.5px] pt-20`}>
            
            {/* If there are modules, they take precedence and might handle their own full-screen visuals (like RPG Dialogue) */}
            {hasModules ? (
                <div className="flex-1 w-full relative flex flex-col">
                    {currentScene.modules?.map(mod => (
                        <ModuleRenderer 
                            key={`${mod.id}-${gameStats.startTime}`} 
                            module={mod} 
                            onResolve={handleModuleResolve} 
                            isResolved={resolvedModules.has(mod.id)} 
                            user={user} 
                            characters={currentGame.characters} 
                            onHintUsed={handleHintUsed}
                            onAnswerAttempt={handleAnswerAttempt}
                            onTimeout={handleTimeout}
                        />
                    ))}
                    {(() => {
                        const lastModule = currentScene.modules?.[currentScene.modules.length - 1];
                        const isLastModuleAnswer = lastModule && (lastModule.type.startsWith('ANS_') || lastModule.type === 'PUZZLE_JIGSAW');
                        return !isLastModuleAnswer && <div className="h-24 shrink-0"></div>;
                    })()}
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-end p-6 pb-24">
                     <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white leading-relaxed text-lg shadow-lg">
                         {currentScene.text}
                     </div>
                </div>
            )}
        </div>

        {/* Bottom Interaction Area (Choices) */}
        <div className="absolute bottom-0 left-0 right-0 z-40 px-[6.5px] pb-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
            <div className="space-y-3">
                {allBlockingResolved && availableChoices.length > 0 && (
                    availableChoices.map((choice: any, idx: number) => (
                        <button
                        key={idx}
                        onClick={() => handleChoice(choice.nextSceneId)}
                        className={`w-full rounded-xl p-4 text-center font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-between group border backdrop-blur-md ${choice.isSystemGenerated ? 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/40' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
                        >
                            <span className="flex-1 flex items-center justify-center">
                                {choice.isSystemGenerated && <Shuffle size={16} className="mr-2"/>}
                                {choice.text}
                            </span>
                            <ChevronRight className="opacity-70" size={16} />
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Full Screen Overlays */}
        {isGameFinished && (
            <JourneyReflection 
                gameTitle={currentGame.title}
                stats={gameStats}
                onRestart={handleRestart}
                onExit={handleExit}
                onReview={() => setShowReviewModal(true)}
            />
        )}

      </div>
      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} onSubmit={handleReviewSubmit} />
      <FailureModal 
          isOpen={failureModal.isOpen} 
          message={failureModal.message} 
          onConfirm={() => { 
              if (failureModal.targetSceneId) handleChoice(failureModal.targetSceneId, true);
              setFailureModal({ isOpen: false, message: '' });
          }} 
      />
      
      <StarTraceAnimation 
          isActive={showCinematic} 
          history={history}
          currentSceneId={pendingScene?.id || ''}
          onComplete={onCinematicComplete} 
      />

      <ConfirmModal 
          isOpen={confirmModalOpen}
          title="重新開始"
          message="確定要重新開始遊戲嗎？進度將會重置。"
          onConfirm={() => {
              handleRestart();
              setConfirmModalOpen(false);
          }}
          onCancel={() => setConfirmModalOpen(false)}
          confirmText="重新開始"
          confirmColor="bg-red-600 hover:bg-red-700"
      />

      {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50 whitespace-nowrap">
              <AlertTriangle size={20} className="text-yellow-400" />
              <span className="font-bold">{toastMessage}</span>
          </div>
      )}
    </div>
  );
};
