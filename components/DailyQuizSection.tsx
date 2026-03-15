import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, Star, Clock, ChevronRight, Brain, Flame } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { DailyQuiz, User } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export const DailyQuizSection: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<{text: string, originalIndex: number}[]>([]);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth?.currentUser?.uid,
        email: auth?.currentUser?.email,
        emailVerified: auth?.currentUser?.emailVerified,
        isAnonymous: auth?.currentUser?.isAnonymous,
        tenantId: auth?.currentUser?.tenantId,
        providerInfo: auth?.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    const fetchTodayQuiz = async () => {
      const path = 'system/dailyQuiz';
      try {
        const quizDoc = await getDoc(doc(db, 'system', 'dailyQuiz'));
        let quizData: DailyQuiz;
        if (quizDoc.exists()) {
          quizData = quizDoc.data() as DailyQuiz;
        } else {
          // Mock quiz if not found in DB
          quizData = {
            id: 'mock_today',
            date: new Date().toISOString().split('T')[0],
            question: '「羲光」在古代漢語中主要指代什麼？',
            type: 'SINGLE',
            options: ['月亮的光芒', '太陽的光輝', '星辰的運行', '晨曦的微光'],
            correctAnswer: 1,
            explanation: '羲光，指太陽的光輝。羲，指羲和，古代神話中駕御日車的神。',
            exp: 50,
            category: '文化常識'
          };
        }
        setQuiz(quizData);
        
        // Prepare display options (shuffled)
        const optionsWithIndices = quizData.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
        const shuffled = [...optionsWithIndices].sort(() => Math.random() - 0.5);
        setDisplayOptions(shuffled);

      } catch (e: any) {
        if (e.code === 'permission-denied') {
          handleFirestoreError(e, OperationType.GET, path);
        }
        console.error("Error fetching quiz:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayQuiz();
  }, []);

  const handleOptionSelect = (option: string, originalIndex: number) => {
    if (submitted) return;
    
    if (quiz?.type === 'MULTI') {
      setSelectedAnswers(prev => 
        prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
      );
    } else if (quiz?.type === 'SORT') {
      setSelectedAnswers(prev => {
        if (prev.includes(option)) return prev.filter(a => a !== option);
        return [...prev, option];
      });
    } else {
      setSelectedAnswers([option]);
    }
  };

  const handleSubmit = async () => {
    if (!user || !quiz || selectedAnswers.length === 0) return;
    
    setSubmitted(true);
    
    let correct = false;
    if (quiz.type === 'MULTI') {
      const correctIndices = Array.isArray(quiz.correctAnswer) ? quiz.correctAnswer : [];
      const correctOptions = correctIndices.map(idx => quiz.options[idx]);
      correct = selectedAnswers.length === correctOptions.length && 
                selectedAnswers.every(a => correctOptions.includes(a));
    } else if (quiz.type === 'SORT') {
      const correctIndices = Array.isArray(quiz.correctAnswer) ? quiz.correctAnswer : [];
      const correctSequence = correctIndices.map(idx => quiz.options[idx]);
      correct = selectedAnswers.length === correctSequence.length && 
                selectedAnswers.every((a, i) => a === correctSequence[i]);
    } else if (quiz.type === 'SINGLE' || quiz.type === 'TRUE_FALSE') {
      const correctOption = quiz.options[quiz.correctAnswer as number];
      correct = selectedAnswers[0] === correctOption;
    }
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate new state
      const newStreak = (user.quizStreak || 0) + 1;
      let bonusExp = quiz.exp || 0;
      if (newStreak === 7) bonusExp += 500;
      if (newStreak === 30) bonusExp += 2000;

      // Update local state
      if (user.lastQuizDate !== today) {
        refreshUser({
          ...user,
          exp: user.exp + bonusExp,
          lastQuizDate: today,
          quizStreak: newStreak
        });
      }

      // Only sync to Firestore if authenticated with Firebase
      if (auth.currentUser && user.id === auth.currentUser.uid) {
        const path = `users/${user.id}`;
        try {
          const userRef = doc(db, 'users', user.id);
          
          if (user.lastQuizDate !== today) {
            await updateDoc(userRef, {
              exp: increment(bonusExp),
              lastQuizDate: today,
              quizStreak: newStreak
            });
          }
        } catch (e: any) {
          if (e.code === 'permission-denied') {
            handleFirestoreError(e, OperationType.WRITE, path);
          }
          console.error("Error updating user quiz status:", e);
        }
      }
    }
  };

  if (loading) return null;
  if (!quiz) return null;

  const hasDoneToday = user?.lastQuizDate === new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Trigger Prompt Banner */}
      <div 
        onClick={() => setIsOpen(true)}
        className="mb-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all group"
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Brain size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-slate-900 font-bold truncate">
              每日問答：{quiz.question}
            </p>
            <p className="text-slate-500 text-xs">
              成功答題快速獲得經驗值
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-indigo-600 font-bold text-sm">
          {!hasDoneToday && (
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden w-full max-w-lg relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-20"
              >
                <XCircle size={24} />
              </button>

              <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">每日文明問答</h2>
                      <p className="text-indigo-100 text-xs">點亮智慧之光，獲取每日獎勵</p>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-xs font-bold">{user.quizStreak || 0} 天連勝</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                {hasDoneToday && !showResult ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">今日已完成！</h3>
                    <p className="text-slate-500 mb-6">你已經完成了今天的問答，明天再來挑戰吧。</p>
                    <Button variant="secondary" onClick={() => setShowResult(true)}>查看今日題目</Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          {quiz.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 leading-snug">
                        {quiz.question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mb-8">
                      {displayOptions.map((opt, idx) => {
                        const option = opt.text;
                        const originalIdx = opt.originalIndex;
                        const isSelected = selectedAnswers.includes(option);
                        const selectedIndex = selectedAnswers.indexOf(option);
                        
                        let isCorrectOption = false;
                        if (quiz.type === 'SINGLE' || quiz.type === 'TRUE_FALSE') {
                          isCorrectOption = quiz.correctAnswer === originalIdx;
                        } else if (quiz.type === 'MULTI' || quiz.type === 'SORT') {
                          isCorrectOption = (quiz.correctAnswer || []).includes(originalIdx);
                        }

                        const showCorrect = submitted && isCorrectOption;
                        const showWrong = submitted && isSelected && !isCorrectOption;

                        return (
                          <button
                            key={idx}
                            disabled={submitted}
                            onClick={() => handleOptionSelect(option, originalIdx)}
                            className={`
                              relative p-4 rounded-2xl border-2 text-left transition-all group
                              ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                              ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                              ${showWrong ? 'border-red-500 bg-red-50' : ''}
                              ${submitted ? 'cursor-default' : 'cursor-pointer'}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {quiz.type === 'SORT' && isSelected && (
                                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold">
                                    {selectedIndex + 1}
                                  </span>
                                )}
                                <span className={`font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-600'} ${showCorrect ? 'text-green-700' : ''} ${showWrong ? 'text-red-700' : ''}`}>
                                  {quiz.type !== 'SORT' && `${String.fromCharCode(65 + idx)}. `}{option}
                                </span>
                              </div>
                              {showCorrect && <CheckCircle2 size={20} className="text-green-500" />}
                              {showWrong && <XCircle size={20} className="text-red-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {showResult && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {isCorrect ? <Trophy size={20} /> : <HelpCircle size={20} />}
                            </div>
                            <div>
                              <h4 className={`font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                {isCorrect ? '回答正確！' : '可惜答錯了'}
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {quiz.explanation}
                              </p>
                              {isCorrect && (
                                <div className="mt-3 flex items-center gap-3">
                                  <div className="flex items-center text-yellow-600 text-xs font-bold">
                                    <Star size={14} className="mr-1 fill-yellow-600" /> +{quiz.exp} EXP
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!submitted && (
                      <Button 
                        fullWidth 
                        size="lg" 
                        onClick={handleSubmit}
                        disabled={selectedAnswers.length === 0}
                        className="shadow-lg shadow-indigo-200"
                      >
                        提交答案
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
