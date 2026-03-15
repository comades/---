
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewProps, Game, Article, Course, Certificate, Exam, User, SystemSettings, ExamQuestion, GameStatus, Message, RolePermissions, TranslationData } from '../types';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText, generateQuiz } from '../services/geminiService';
import { CheckCircle, XCircle, LayoutDashboard, FileText, Settings, Play, Search, Filter, MoreHorizontal, Star, EyeOff, Trash2, Plus, Edit, Image as ImageIcon, Calendar, ArrowLeft, Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Quote, Code, Eye, GraduationCap, Award, Users, BookOpen, Clock, Lock, Save, Ban, Check, UserCog, Trophy, AlertTriangle, Shield, MousePointerClick, MessageSquare, RotateCcw, RefreshCw, Youtube, Inbox, Mail, ShoppingBag, Languages, Coins, CreditCard, Package, Upload, Key, Sparkles, ChevronLeft, ChevronRight, Download, Trash } from 'lucide-react';
import { Button } from '../components/Button';
import { RichTextEditor } from '../components/RichTextEditor';
import { compressImage } from '../utils/imageUtils';

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

export const Admin: React.FC<ViewProps> = ({ setView, setCurrentGame }) => {
  const { games, updateGameStatus, toggleGameRecommendation, deleteGame, restoreGame, permanentlyDeleteGame, articles, saveArticle, deleteArticle, restoreArticle, permanentlyDeleteArticle, courses, saveCourse, deleteCourse, certificates, saveCertificate, deleteCertificate, exams, saveExam, deleteExam, allUsers, updateUser, deleteUser, sendMessage, systemSettings, updateSystemSettings, dailyQuizzes, saveDailyQuiz, deleteDailyQuiz } = useGame();
  const { user, markMessageAsRead } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'GAMES' | 'ARTICLES' | 'ACADEMY' | 'MEMBERS' | 'MESSAGES' | 'SYSTEM' | 'TRANSLATIONS' | 'SHOP_MANAGEMENT' | 'API_MANAGEMENT'>('GAMES');

  // Security Check
  if (!user || !user.isAdmin) {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col bg-slate-50">
              <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-slate-100">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle size={32} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">權限不足</h2>
                  <p className="text-slate-500 mb-6">此頁面僅供系統管理員訪問。</p>
                  <Button onClick={() => setView('EXPLORE')} variant="outline">返回探索</Button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-serif text-slate-900">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all shadow-xl z-20">
            <div className="p-6">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <Shield className="text-indigo-400" /> 管理控制台
                </h2>
                <p className="text-xs text-slate-500 mt-2">v2.9.1 Enterprise</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
                <button onClick={() => setActiveTab('GAMES')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'GAMES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <LayoutDashboard size={18} className="mr-3" /> {t('遊戲管理')}
                </button>
                <button onClick={() => setActiveTab('ARTICLES')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'ARTICLES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <FileText size={18} className="mr-3" /> {t('公告與文章')}
                </button>
                <button onClick={() => setActiveTab('ACADEMY')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'ACADEMY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <GraduationCap size={18} className="mr-3" /> {t('學院管理')}
                </button>
                <button onClick={() => setActiveTab('MEMBERS')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'MEMBERS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Users size={18} className="mr-3" /> {t('會員管理')}
                </button>
                <button onClick={() => setActiveTab('MESSAGES')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'MESSAGES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Inbox size={18} className="mr-3" /> {t('訊息中心')}
                    {user.messages && (user.messages || []).filter(m => !m.isRead).length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{(user.messages || []).filter(m => !m.isRead).length}</span>}
                </button>
                <button onClick={() => setActiveTab('SHOP_MANAGEMENT')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'SHOP_MANAGEMENT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <ShoppingBag size={18} className="mr-3" /> {t('商店管理')}
                </button>
                <button onClick={() => setActiveTab('TRANSLATIONS')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'TRANSLATIONS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Languages size={18} className="mr-3" /> {t('翻譯管理')}
                </button>
                <button onClick={() => setActiveTab('API_MANAGEMENT')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'API_MANAGEMENT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Key size={18} className="mr-3" /> {t('API 管理')}
                </button>
                <button onClick={() => setActiveTab('SYSTEM')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'SYSTEM' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Star size={18} className="mr-3" /> {t('文明星圖設定')}
                </button>
            </nav>
            
            <div className="p-4 border-t border-slate-800">
                <button onClick={() => setView('EXPLORE')} className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors text-sm">
                    <ArrowLeft size={16} className="mr-2" /> 返回前台
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col h-screen">
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <h1 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'GAMES' ? t('遊戲審核與管理') : activeTab === 'ARTICLES' ? t('內容發佈系統 (CMS)') : activeTab === 'ACADEMY' ? t('創作學院管理系統') : activeTab === 'MEMBERS' ? t('會員管理系統') : activeTab === 'MESSAGES' ? t('後台訊息中心') : activeTab === 'TRANSLATIONS' ? t('翻譯管理系統') : activeTab === 'SHOP_MANAGEMENT' ? t('商店與支付管理') : activeTab === 'API_MANAGEMENT' ? t('API 接口管理') : t('文明星圖設定')}
                </h1>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-600">{user.name}</span>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'GAMES' ? (
                    <GameManager games={games} updateStatus={updateGameStatus} toggleRec={toggleGameRecommendation} deleteGame={deleteGame} restoreGame={restoreGame} permanentlyDeleteGame={permanentlyDeleteGame} onPlay={(g) => { setCurrentGame(g); setView('PLAY'); }} onSendMessage={sendMessage} />
                ) : activeTab === 'ARTICLES' ? (
                    <ArticleManager articles={articles} onSave={saveArticle} onDelete={deleteArticle} onRestore={restoreArticle} onHardDelete={permanentlyDeleteArticle} currentUser={user.name} />
                ) : activeTab === 'ACADEMY' ? (
                    <AcademyManager courses={courses} onSaveCourse={saveCourse} onDeleteCourse={deleteCourse} certificates={certificates} onSaveCertificate={saveCertificate} onDeleteCertificate={deleteCertificate} exams={exams} onSaveExam={saveExam} onDeleteExam={deleteExam} allUsers={allUsers} />
                ) : activeTab === 'MEMBERS' ? (
                    <MemberManager allUsers={allUsers} updateUser={updateUser} deleteUser={deleteUser} systemSettings={systemSettings} updateSystemSettings={updateSystemSettings} currentUser={user} />
                ) : activeTab === 'MESSAGES' ? (
                    <MessageManager messages={user.messages || []} markAsRead={markMessageAsRead} />
                ) : activeTab === 'TRANSLATIONS' ? (
                    <TranslationManager />
                ) : activeTab === 'SHOP_MANAGEMENT' ? (
                    <ShopManager games={games} courses={courses} onUpdateGame={updateGameStatus} onUpdateCourse={saveCourse} settings={systemSettings} updateSettings={updateSystemSettings} />
                ) : activeTab === 'API_MANAGEMENT' ? (
                    <APIManager settings={systemSettings} updateSettings={updateSystemSettings} />
                ) : (
                    <SystemManager 
                        settings={systemSettings} 
                        updateSettings={updateSystemSettings} 
                        quizzes={dailyQuizzes} 
                        saveQuiz={saveDailyQuiz} 
                        deleteQuiz={deleteDailyQuiz} 
                    />
                )}
            </div>
        </div>
    </div>
  );
};

// --- Sub-Component: System Manager ---
const SystemManager = ({ settings, updateSettings, quizzes, saveQuiz, deleteQuiz }: any) => {
    const [subTab, setSubTab] = useState<'EXP' | 'QUIZ' | 'STAR_MAP'>('EXP');
    const [editingQuiz, setEditingQuiz] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSaveQuiz = () => {
        if (editingQuiz) {
            saveQuiz(editingQuiz);
            setEditingQuiz(null);
        }
    };

    const handleAIGenerate = async () => {
        if (!editingQuiz.question && !editingQuiz.category) {
            alert('請先輸入題目內容或類別，以便 AI 生成相關選項與答案。');
            return;
        }
        setIsGenerating(true);
        try {
            const topic = editingQuiz.question || editingQuiz.category;
            const result = await generateQuiz(topic, editingQuiz.type);
            setEditingQuiz({
                ...editingQuiz,
                question: result.question,
                options: result.options,
                correctAnswer: result.correctAnswer,
                explanation: result.explanation,
                category: result.category
            });
        } catch (error) {
            alert('AI 生成失敗，請檢查 API Key 設定。');
        } finally {
            setIsGenerating(false);
        }
    };

    const addOption = () => {
        const next = [...(editingQuiz.options || [])];
        next.push('');
        setEditingQuiz({ ...editingQuiz, options: next });
    };

    const removeOption = (idx: number) => {
        const next = [...(editingQuiz.options || [])];
        next.splice(idx, 1);
        
        // Adjust correctAnswer if needed
        let nextCorrect = editingQuiz.correctAnswer;
        if (editingQuiz.type === 'MULTI') {
            nextCorrect = (editingQuiz.correctAnswer || []).filter((i: number) => i !== idx).map((i: number) => i > idx ? i - 1 : i);
        } else if (editingQuiz.type === 'SINGLE' || editingQuiz.type === 'TRUE_FALSE') {
            if (editingQuiz.correctAnswer === idx) nextCorrect = 0;
            else if (editingQuiz.correctAnswer > idx) nextCorrect = editingQuiz.correctAnswer - 1;
        } else if (editingQuiz.type === 'SORT') {
            nextCorrect = (editingQuiz.correctAnswer || []).filter((i: number) => i !== idx).map((i: number) => i > idx ? i - 1 : i);
        }

        setEditingQuiz({ ...editingQuiz, options: next, correctAnswer: nextCorrect });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
                <button onClick={() => setSubTab('EXP')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'EXP' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>經驗值獎勵設定</button>
                <button onClick={() => setSubTab('QUIZ')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'QUIZ' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>每日文明問答管理</button>
                <button onClick={() => setSubTab('STAR_MAP')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'STAR_MAP' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>星圖星域門檻</button>
            </div>

            {subTab === 'EXP' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Trophy className="text-yellow-500" size={18}/> 每日問答獎勵</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">答對題目 EXP</label>
                                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={settings.expSettings?.quizCorrect || 0} onChange={e => updateSettings({...settings, expSettings: {...settings.expSettings, quizCorrect: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">連續 7 天 EXP</label>
                                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={settings.expSettings?.quizStreak7 || 0} onChange={e => updateSettings({...settings, expSettings: {...settings.expSettings, quizStreak7: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">連續 30 天 EXP</label>
                                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={settings.expSettings?.quizStreak30 || 0} onChange={e => updateSettings({...settings, expSettings: {...settings.expSettings, quizStreak30: parseInt(e.target.value) || 0}})} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar className="text-indigo-500" size={18}/> 會員日與排行榜</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">會員日參與 EXP</label>
                                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={settings.expSettings?.memberDayParticipation || 0} onChange={e => updateSettings({...settings, expSettings: {...settings.expSettings, memberDayParticipation: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">完成會員日任務 EXP</label>
                                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={settings.expSettings?.memberDayTask || 0} onChange={e => updateSettings({...settings, expSettings: {...settings.expSettings, memberDayTask: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">排行榜前 10 名 EXP</label>
                                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={settings.expSettings?.leaderboardTop10 || 0} onChange={e => updateSettings({...settings, expSettings: {...settings.expSettings, leaderboardTop10: parseInt(e.target.value) || 0}})} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'QUIZ' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">題庫列表</h3>
                        <Button onClick={() => setEditingQuiz({ id: `q_${Date.now()}`, date: new Date().toISOString().split('T')[0], question: '', type: 'SINGLE', options: ['', '', '', ''], correctAnswer: 0, explanation: '' })}>
                            <Plus size={18} className="mr-2"/> 新增題目
                        </Button>
                    </div>

                    {editingQuiz && (
                        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500 shadow-xl space-y-4 animate-in zoom-in-95">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-indigo-600">編輯題目</h4>
                                <button onClick={() => setEditingQuiz(null)}><XCircle size={20} className="text-slate-400"/></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-bold text-slate-500">題目內容</label>
                                        <button 
                                            onClick={handleAIGenerate}
                                            disabled={isGenerating}
                                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                                        >
                                            <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                                            {isGenerating ? '生成中...' : 'AI 生成選項與答案'}
                                        </button>
                                    </div>
                                    <input className="w-full p-3 border rounded-xl" value={editingQuiz.question} onChange={e => setEditingQuiz({...editingQuiz, question: e.target.value})} placeholder="輸入題目或主題..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">題型</label>
                                    <select className="w-full p-3 border rounded-xl" value={editingQuiz.type} onChange={e => {
                                        const newType = e.target.value;
                                        let newOptions = editingQuiz.options;
                                        let newCorrect = editingQuiz.correctAnswer;
                                        
                                        if (newType === 'TRUE_FALSE') {
                                            newOptions = ['正確', '錯誤'];
                                            newCorrect = 0;
                                        } else if (newType === 'SINGLE') {
                                            if (newOptions.length < 2) newOptions = ['', '', '', ''];
                                            newCorrect = 0;
                                        } else if (newType === 'MULTI') {
                                            if (newOptions.length < 2) newOptions = ['', '', '', ''];
                                            newCorrect = [0];
                                        } else if (newType === 'SORT') {
                                            if (newOptions.length < 2) newOptions = ['', '', '', ''];
                                            newCorrect = newOptions.map((_: any, i: number) => i);
                                        }
                                        
                                        setEditingQuiz({...editingQuiz, type: newType, options: newOptions, correctAnswer: newCorrect});
                                    }}>
                                        <option value="SINGLE">單選題</option>
                                        <option value="MULTI">多選題</option>
                                        <option value="TRUE_FALSE">是非題</option>
                                        <option value="SORT">排序題</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">發布日期</label>
                                    <input type="date" className="w-full p-3 border rounded-xl" value={editingQuiz.date} onChange={e => setEditingQuiz({...editingQuiz, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">類別</label>
                                    <input className="w-full p-3 border rounded-xl" value={editingQuiz.category || ''} onChange={e => setEditingQuiz({...editingQuiz, category: e.target.value})} placeholder="例如：歷史, 文化..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">獎勵經驗值 (EXP)</label>
                                    <input type="number" className="w-full p-3 border rounded-xl" value={editingQuiz.exp || 10} onChange={e => setEditingQuiz({...editingQuiz, exp: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-500">選項與正確答案</label>
                                    {editingQuiz.type !== 'TRUE_FALSE' && (
                                        <button onClick={addOption} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                            <Plus size={14} /> 新增選項
                                        </button>
                                    )}
                                </div>
                                
                                {editingQuiz.type === 'SORT' && (
                                    <p className="text-[10px] text-slate-400 mb-2 italic">* 排序題：請按正確順序輸入選項，系統將自動記錄正確序列。</p>
                                )}

                                {(editingQuiz.options || []).map((opt: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 group">
                                        {editingQuiz.type !== 'SORT' && (
                                            <input 
                                                type={editingQuiz.type === 'MULTI' ? 'checkbox' : 'radio'} 
                                                name="correct" 
                                                checked={editingQuiz.type === 'MULTI' ? (editingQuiz.correctAnswer || []).includes(idx) : editingQuiz.correctAnswer === idx}
                                                onChange={() => {
                                                    if (editingQuiz.type === 'MULTI') {
                                                        const current = editingQuiz.correctAnswer || [];
                                                        const next = current.includes(idx) ? current.filter((i: number) => i !== idx) : [...current, idx];
                                                        setEditingQuiz({...editingQuiz, correctAnswer: next});
                                                    } else {
                                                        setEditingQuiz({...editingQuiz, correctAnswer: idx});
                                                    }
                                                }}
                                            />
                                        )}
                                        {editingQuiz.type === 'SORT' && (
                                            <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">
                                                {idx + 1}
                                            </span>
                                        )}
                                        <input className="flex-1 p-2 border rounded-lg text-sm" value={opt} onChange={e => {
                                            const next = [...(editingQuiz.options || [])];
                                            next[idx] = e.target.value;
                                            setEditingQuiz({...editingQuiz, options: next});
                                        }} placeholder={`選項 ${idx + 1}`} />
                                        
                                        {editingQuiz.type !== 'TRUE_FALSE' && (editingQuiz.options || []).length > 2 && (
                                            <button 
                                                onClick={() => removeOption(idx)}
                                                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">解析 (選填)</label>
                                <textarea className="w-full p-3 border rounded-xl text-sm" rows={2} value={editingQuiz.explanation} onChange={e => setEditingQuiz({...editingQuiz, explanation: e.target.value})} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingQuiz(null)}>取消</Button>
                                <Button onClick={handleSaveQuiz}>儲存題目</Button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-xs font-bold text-slate-500">
                                    <th className="p-4">日期</th>
                                    <th className="p-4">題目</th>
                                    <th className="p-4">類型</th>
                                    <th className="p-4 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!quizzes || (quizzes || []).length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">尚無題目</td></tr>
                                ) : (
                                    (quizzes || []).map((q: any) => (
                                        <tr key={q.id} className="hover:bg-slate-50">
                                            <td className="p-4 text-sm font-mono">{q.date}</td>
                                            <td className="p-4 font-bold text-slate-800">{q.question}</td>
                                            <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{q.type}</span></td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => setEditingQuiz({...q})} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => deleteQuiz(q.id)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {subTab === 'STAR_MAP' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Star className="text-yellow-500" size={18}/> 星圖星域門檻設定</h3>
                        <Button onClick={() => {
                            const newSector = { id: `sector_${Date.now()}`, name: '新星域', description: '', requiredPlayers: 0, isAwakened: false, color: '#6366f1' };
                            updateSettings({ ...settings, starSectors: [...(settings.starSectors || []), newSector] });
                        }}>
                            <Plus size={18} className="mr-2"/> 新增星域
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {(settings.starSectors || []).length === 0 && (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                尚無星域設定，請點擊上方按鈕新增。
                            </div>
                        )}
                        {(settings.starSectors || []).map((sector: any, idx: number) => (
                            <div key={sector.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">星域名稱</label>
                                    <input className="w-full p-2 border rounded-lg bg-white" value={sector.name} onChange={e => {
                                        const next = [...settings.starSectors];
                                        next[idx].name = e.target.value;
                                        updateSettings({ ...settings, starSectors: next });
                                    }} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">解鎖門檻 (玩過人數)</label>
                                    <input type="number" className="w-full p-2 border rounded-lg bg-white" value={sector.requiredPlayers} onChange={e => {
                                        const next = [...settings.starSectors];
                                        next[idx].requiredPlayers = parseInt(e.target.value) || 0;
                                        updateSettings({ ...settings, starSectors: next });
                                    }} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">代表顏色</label>
                                    <div className="flex gap-2">
                                        <input type="color" className="p-1 h-10 w-12 border rounded-lg bg-white" value={sector.color} onChange={e => {
                                            const next = [...settings.starSectors];
                                            next[idx].color = e.target.value;
                                            updateSettings({ ...settings, starSectors: next });
                                        }} />
                                        <input className="flex-1 p-2 border rounded-lg bg-white text-xs font-mono" value={sector.color} onChange={e => {
                                            const next = [...settings.starSectors];
                                            next[idx].color = e.target.value;
                                            updateSettings({ ...settings, starSectors: next });
                                        }} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button fullWidth variant="outline" onClick={() => {
                                        const next = settings.starSectors.filter((_: any, i: number) => i !== idx);
                                        updateSettings({ ...settings, starSectors: next });
                                    }} className="text-red-500 border-red-200 hover:bg-red-50">刪除</Button>
                                </div>
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-bold text-slate-500">星域描述</label>
                                    <textarea className="w-full p-2 border rounded-lg bg-white h-20" value={sector.description} onChange={e => {
                                        const next = [...settings.starSectors];
                                        next[idx].description = e.target.value;
                                        updateSettings({ ...settings, starSectors: next });
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-Component: Message Manager ---
const MessageManager = ({ messages, markAsRead }: { messages: Message[], markAsRead: (id: string) => void }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-slate-500 text-sm">共 {messages.length} 則訊息</div>
                </div>
            </div>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Inbox className="mx-auto text-slate-300 mb-4" size={48}/>
                        <p className="text-slate-500 font-bold">暫無訊息</p>
                        <p className="text-slate-400 text-sm mt-1">目前沒有收到任何用戶或系統通知</p>
                    </div>
                ) : (
                    (messages || []).map(msg => (
                        <div 
                            key={msg.id} 
                            onClick={() => markAsRead(msg.id)}
                            className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${msg.isRead ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/10'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${msg.isRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${msg.isRead ? 'text-slate-700' : 'text-indigo-900'}`}>{msg.title}</h3>
                                        <p className="text-xs text-slate-500 font-bold mt-0.5">From: {msg.sender}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">{new Date(msg.date).toLocaleString()}</span>
                            </div>
                            <div className="pl-12">
                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Game Manager ---
const GameManager = ({ games, updateStatus, toggleRec, deleteGame, restoreGame, permanentlyDeleteGame, onPlay, onSendMessage }: { 
    games: Game[], 
    updateStatus: (id: string, s: GameStatus, extraData?: Partial<Game>) => void, 
    toggleRec: (id: string) => void,
    deleteGame: (id: string) => void,
    restoreGame: (id: string) => void,
    permanentlyDeleteGame: (id: string) => void,
    onPlay: (g: Game) => void,
    onSendMessage: (uid: string, title: string, content: string) => void
}) => {
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'TRASH'>('ALL');
    const [search, setSearch] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedGameForReject, setSelectedGameForReject] = useState<Game | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
    const [selectedAuthorName, setSelectedAuthorName] = useState<string>('');
    const [messageTitle, setMessageTitle] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{game: Game, action: 'approve' | 'off_shelf' | 'republish' | 'delete' | 'restore' | 'hardDelete'} | null>(null);

    const filteredGames = (games || []).filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.author.toLowerCase().includes(search.toLowerCase());
        if (filter === 'TRASH') return matchesSearch && g.status === 'deleted';
        if (g.status === 'deleted') return false; // Hide deleted games from other tabs
        if (filter === 'ALL') return matchesSearch;
        if (filter === 'PENDING') return matchesSearch && g.status === 'review';
        if (filter === 'PUBLISHED') return matchesSearch && g.status === 'published';
        if (filter === 'REJECTED') return matchesSearch && (g.status === 'rejected' || g.status === 'off_shelf');
        return matchesSearch;
    });

    const openRejectModal = (e: React.MouseEvent, game: Game) => {
        e.stopPropagation();
        setSelectedGameForReject(game);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const confirmReject = () => {
        if (!selectedGameForReject) return;
        updateStatus(selectedGameForReject.id, 'rejected');
        
        // Send Notification
        if (selectedGameForReject.authorId) {
            onSendMessage(
                selectedGameForReject.authorId, 
                `遊戲《${selectedGameForReject.title}》審核未通過`, 
                `很遺憾通知您，您的遊戲作品因以下原因未通過審核：\n\n${rejectReason}\n\n請修改後再次提交。`
            );
        }

        setRejectModalOpen(false);
        setSelectedGameForReject(null);
    };

    const openMessageModal = (e: React.MouseEvent, authorId: string, authorName: string) => {
        e.stopPropagation();
        setSelectedAuthorId(authorId);
        setSelectedAuthorName(authorName);
        setMessageTitle('');
        setMessageContent('');
        setMessageModalOpen(true);
    };

    const confirmSendMessage = () => {
        if (!selectedAuthorId) return;
        onSendMessage(selectedAuthorId, messageTitle, messageContent);
        setMessageModalOpen(false);
        setSelectedAuthorId(null);
        setToastMessage('訊息已成功發送！');
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleActionClick = (e: React.MouseEvent, game: Game, action: 'approve' | 'off_shelf' | 'republish' | 'delete' | 'restore' | 'hardDelete') => {
        e.stopPropagation();
        setConfirmAction({ game, action });
        setConfirmModalOpen(true);
    };

    const executeConfirmAction = () => {
        if (!confirmAction) return;
        const { game, action } = confirmAction;

        let newStatus: GameStatus = 'draft';

        switch(action) {
            case 'approve': newStatus = 'published'; break;
            case 'off_shelf': newStatus = 'off_shelf'; break;
            case 'republish': newStatus = 'published'; break;
            case 'delete': break;
        }

        if (action === 'delete') {
            deleteGame(game.id);
            if (game.authorId) {
                onSendMessage(game.authorId, `遊戲《${game.title}》已被移至垃圾桶`, `您的遊戲已被管理員移至垃圾桶。`);
            }
        } else if (action === 'restore') {
            restoreGame(game.id);
            if (game.authorId) {
                onSendMessage(game.authorId, `遊戲《${game.title}》已還原`, `您的遊戲已被管理員還原。`);
            }
        } else if (action === 'hardDelete') {
            permanentlyDeleteGame(game.id);
            if (game.authorId) {
                onSendMessage(game.authorId, `遊戲《${game.title}》已被永久刪除`, `您的遊戲已被管理員永久刪除。`);
            }
        } else {
            updateStatus(game.id, newStatus);
            if (action === 'approve' && game.authorId) {
                onSendMessage(game.authorId, `遊戲《${game.title}》已發佈！`, `恭喜！您的遊戲已通過審核並上架。`);
            }
        }
        
        setConfirmModalOpen(false);
        setConfirmAction(null);
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        switch(status) {
            case 'published': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">已上架</span>;
            case 'review': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">待審核</span>;
            case 'rejected': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">已退回</span>;
            case 'off_shelf': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-600 text-white border border-slate-700">已下架</span>;
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">草稿</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
                    {['ALL', 'PENDING', 'PUBLISHED', 'REJECTED', 'TRASH'].map((f) => (
                        <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                            {f === 'ALL' ? '全部' : f === 'PENDING' ? '待審核' : f === 'PUBLISHED' ? '已上架' : f === 'REJECTED' ? '已下架/退回' : '垃圾桶'}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="搜尋遊戲名稱或作者..." className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-72 shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 pl-6">封面</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">遊戲資訊</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">類型</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">數據</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">券數定價</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">狀態</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">推薦</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGames.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-bold">沒有找到符合條件的遊戲</td></tr>
                            ) : (
                                (filteredGames || []).map(game => (
                                    <tr key={game.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shadow-sm">
                                                <img src={game.coverImageKeyword?.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/100/100`} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{game.title}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="text-xs text-slate-500 font-medium">by {game.author}</div>
                                                {game.authorId && (
                                                    <button 
                                                        onClick={(e) => openMessageModal(e, game.authorId!, game.author)}
                                                        className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                                        title="傳送訊息給創作者"
                                                    >
                                                        <MessageSquare size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${game.type === 'guide' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                {game.type === 'guide' ? '智慧導覽' : '實境遊戲'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-sm font-bold text-slate-700">
                                                <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                                                {game.rating || 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">{game.playCount || 0} 遊玩</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                                                <Coins size={14} />
                                                <input 
                                                    type="number" 
                                                    className="w-16 p-1 border rounded bg-transparent focus:bg-white" 
                                                    value={game.ticketPrice || 0} 
                                                    onChange={(e) => updateStatus(game.id, game.status, { ticketPrice: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4"><StatusBadge status={game.status} /></td>
                                        <td className="p-4 text-center">
                                            <button onClick={(e) => { e.stopPropagation(); toggleRec(game.id); }} className={`w-10 h-6 rounded-full p-1 transition-all duration-300 relative ${game.isRecommended ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${game.isRecommended ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </button>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100">
                                                {game.status !== 'deleted' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); onPlay(game); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="試玩"><Play size={16} /></button>
                                                        
                                                        {game.status === 'review' && (
                                                            <>
                                                                <button onClick={(e) => handleActionClick(e, game, 'approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="通過"><CheckCircle size={16} /></button>
                                                                <button onClick={(e) => openRejectModal(e, game)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="退回"><XCircle size={16} /></button>
                                                            </>
                                                        )}

                                                        {game.status === 'published' && (
                                                            <button onClick={(e) => handleActionClick(e, game, 'off_shelf')} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="強制下架">
                                                                <EyeOff size={16} />
                                                            </button>
                                                        )}

                                                        {(game.status === 'off_shelf' || game.status === 'rejected') && (
                                                            <button onClick={(e) => handleActionClick(e, game, 'republish')} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="重新上架">
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        
                                                        <button onClick={(e) => handleActionClick(e, game, 'delete')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="移至垃圾桶">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {game.status === 'deleted' && (
                                                    <>
                                                        <button onClick={(e) => handleActionClick(e, game, 'restore')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="還原">
                                                            <RotateCcw size={16} />
                                                        </button>
                                                        <button onClick={(e) => handleActionClick(e, game, 'hardDelete')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="永久刪除">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center text-red-600">
                            <XCircle className="mr-2" /> 退回遊戲審核
                        </h3>
                        <p className="text-slate-600 mb-2 text-sm">請填寫退回原因，將發送訊息通知創作者：</p>
                        <textarea 
                            className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-700 min-h-[120px] mb-4 focus:ring-2 focus:ring-red-200 outline-none"
                            placeholder="例如：內容涉及敏感議題、圖片失效、流程卡關..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
                        <div className="flex gap-3">
                            <button onClick={() => setRejectModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">取消</button>
                            <button onClick={confirmReject} disabled={!rejectReason.trim()} className="flex-1 py-2 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700 disabled:opacity-50">確認退回</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center text-indigo-600">
                            <MessageSquare className="mr-2" /> 傳送訊息給 {selectedAuthorName}
                        </h3>
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">訊息標題</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    placeholder="輸入標題..."
                                    value={messageTitle}
                                    onChange={(e) => setMessageTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">訊息內容</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-700 min-h-[120px] focus:ring-2 focus:ring-indigo-200 outline-none"
                                    placeholder="輸入訊息內容..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setMessageModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">取消</button>
                            <button onClick={confirmSendMessage} disabled={!messageTitle.trim() || !messageContent.trim()} className="flex-1 py-2 rounded-lg bg-indigo-600 font-bold text-white hover:bg-indigo-700 disabled:opacity-50">送出訊息</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModalOpen}
                title="確認操作"
                message={
                    confirmAction?.action === 'approve' ? `確認通過 ${confirmAction.game.title} 的審核？` :
                    confirmAction?.action === 'off_shelf' ? `確定要將 ${confirmAction.game.title} 下架嗎？` :
                    confirmAction?.action === 'republish' ? `確認重新上架 ${confirmAction.game.title}？` :
                    confirmAction?.action === 'delete' ? `確定要將 ${confirmAction.game.title} 移至垃圾桶嗎？` :
                    confirmAction?.action === 'restore' ? `確定要還原 ${confirmAction.game.title} 嗎？` :
                    confirmAction?.action === 'hardDelete' ? `確定要永久刪除 ${confirmAction.game.title} 嗎？此操作無法復原！` : ''
                }
                onConfirm={executeConfirmAction}
                onCancel={() => { setConfirmModalOpen(false); setConfirmAction(null); }}
                confirmText={confirmAction?.action === 'hardDelete' ? '永久刪除' : confirmAction?.action === 'delete' ? '移至垃圾桶' : '確認'}
                confirmColor={confirmAction?.action === 'hardDelete' || confirmAction?.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
            />

            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
                    <CheckCircle size={20} className="text-green-400" />
                    <span className="font-bold">{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

// --- Sub-Component: Article Manager ---
const ArticleManager = ({ articles, onSave, onDelete, onRestore, onHardDelete, currentUser }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'TRASH'>('ACTIVE');
    const [editData, setEditData] = useState<Article | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{id: string, type: 'delete' | 'hardDelete'} | null>(null);
    
    // Filter articles based on viewMode and deletedAt
    const displayArticles = (articles || []).filter((a: Article) => viewMode === 'ACTIVE' ? !a.deletedAt : !!a.deletedAt);

    const handleCreate = () => { setEditData({ id: `art_${Date.now()}`, title: '', imageUrl: '', category: '活動公告', tags: [], date: new Date().toISOString().split('T')[0], author: currentUser, content: '', isPublished: true, views: 0 }); setIsEditing(true); };
    const handleEdit = (a: Article) => { setEditData({ ...a }); setIsEditing(true); };
    const handleSave = () => { if(editData) { onSave(editData); setIsEditing(false); } };

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">編輯文章</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>取消</Button>
                        <Button onClick={handleSave}>儲存變更</Button>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">文章標題</label>
                        <input className="w-full p-3 border border-slate-300 rounded-lg text-slate-600 bg-white" placeholder="輸入標題" value={editData?.title} onChange={e => setEditData({...editData!, title: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">分類</label>
                            <select className="w-full p-3 border border-slate-300 rounded-lg text-slate-600 bg-white" value={editData?.category} onChange={e => setEditData({...editData!, category: e.target.value})}>
                                <option value="活動公告">活動公告</option><option value="創作教學">創作教學</option><option value="專欄">專欄</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">發布狀態</label>
                            <select className="w-full p-3 border border-slate-300 rounded-lg text-slate-600 bg-white" value={editData?.isPublished ? 'true' : 'false'} onChange={e => setEditData({...editData!, isPublished: e.target.value === 'true'})}>
                                <option value="true">已發佈</option><option value="false">草稿</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">封面圖片 URL</label>
                        <input className="w-full p-3 border border-slate-300 rounded-lg text-slate-600 bg-white" placeholder="https://..." value={editData?.imageUrl} onChange={e => setEditData({...editData!, imageUrl: e.target.value})} />
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">文章內容</label>
                         <RichTextEditor 
                            value={editData?.content || ''} 
                            onChange={(val) => setEditData({...editData!, content: val})} 
                            height="h-96"
                         />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button onClick={() => setViewMode('ACTIVE')} className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'ACTIVE' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>已發佈 / 草稿</button>
                        <button onClick={() => setViewMode('TRASH')} className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'TRASH' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>垃圾桶</button>
                    </div>
                    <div className="font-bold text-slate-500 text-sm">共 {displayArticles.length} 篇</div>
                </div>
                {viewMode === 'ACTIVE' && <Button onClick={handleCreate}><Plus size={18} className="mr-2"/> 新增文章</Button>}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">標題</th><th className="p-4">分類</th><th className="p-4">狀態</th><th className="p-4 text-right">操作</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayArticles.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">尚無內容</td></tr>
                        ) : (
                            (displayArticles || []).map(a => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{a.title}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{a.category}</span></td>
                                    <td className="p-4">
                                        {a.deletedAt ? <span className="text-red-500 text-xs font-bold">已刪除</span> : 
                                         a.isPublished ? <span className="text-green-600 font-bold text-xs">已發佈</span> : 
                                         <span className="text-slate-400 text-xs">草稿</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {viewMode === 'ACTIVE' ? (
                                            <>
                                                <button onClick={() => handleEdit(a)} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => { setConfirmAction({id: a.id, type: 'delete'}); setConfirmModalOpen(true); }} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => onRestore(a.id)} className="text-green-600 p-2 hover:bg-green-50 rounded mr-2" title="復原"><RotateCcw size={16}/></button>
                                                <button onClick={() => { setConfirmAction({id: a.id, type: 'hardDelete'}); setConfirmModalOpen(true); }} className="text-red-600 p-2 hover:bg-red-50 rounded bg-red-100 font-bold text-xs">永久刪除</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal 
                isOpen={confirmModalOpen}
                title="確認刪除"
                message={confirmAction?.type === 'delete' ? '確定要將此文章移至垃圾桶嗎？' : '確定要永久刪除此文章嗎？此操作無法復原！'}
                onConfirm={() => {
                    if (confirmAction?.type === 'delete') onDelete(confirmAction.id);
                    if (confirmAction?.type === 'hardDelete') onHardDelete(confirmAction.id);
                    setConfirmModalOpen(false);
                    setConfirmAction(null);
                }}
                onCancel={() => { setConfirmModalOpen(false); setConfirmAction(null); }}
                confirmText={confirmAction?.type === 'hardDelete' ? '永久刪除' : '移至垃圾桶'}
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

// --- Sub-Component: Academy Manager ---
const AcademyManager = ({ courses, onSaveCourse, onDeleteCourse, certificates, onSaveCertificate, onDeleteCertificate, exams, onSaveExam, onDeleteExam, allUsers }: any) => {
    const [subTab, setSubTab] = useState<'COURSES' | 'CERTS' | 'STUDENTS' | 'EXAMS'>('COURSES');
    const [editMode, setEditMode] = useState<'LIST' | 'EDIT_COURSE' | 'EDIT_CERT' | 'EDIT_EXAM'>('LIST');
    const [activeItem, setActiveItem] = useState<any>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{id: string, type: 'course' | 'cert' | 'exam'} | null>(null);

    // --- Course Editor ---
    const handleEditCourse = (c?: Course) => {
        setActiveItem(c || { id: `c_${Date.now()}`, title: '', description: '', level: 'Basic', duration: '30 分鐘', isLocked: false, completed: false, imageKeyword: 'book', videoUrl: '' });
        setEditMode('EDIT_COURSE');
    };
    const saveCourseEdit = () => { onSaveCourse(activeItem); setEditMode('LIST'); setActiveItem(null); };
    const handleDeleteCourse = (id: string) => {
        setConfirmAction({ id, type: 'course' });
        setConfirmModalOpen(true);
    };

    // --- Cert Editor ---
    const handleEditCert = (c?: Certificate) => {
        setActiveItem(c || { id: `crt_${Date.now()}`, title: '', description: '', requiredCourseIds: [], recipients: [] });
        setEditMode('EDIT_CERT');
    };
    const saveCertEdit = () => { onSaveCertificate(activeItem); setEditMode('LIST'); setActiveItem(null); };

    // --- Exam Editor ---
    const handleEditExam = (e?: Exam) => {
        setActiveItem(e || { id: `ex_${Date.now()}`, title: '', durationMinutes: 30, passingScore: 60, questions: [], participants: 0 });
        setEditMode('EDIT_EXAM');
    };
    const saveExamEdit = () => { onSaveExam(activeItem); setEditMode('LIST'); setActiveItem(null); };

    if (editMode === 'EDIT_COURSE') {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-bold mb-6 text-slate-800">{activeItem.id.startsWith('c_') ? '新增課程' : '編輯課程'}</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">課程名稱</label>
                            <input className="w-full p-3 border rounded-lg bg-white text-slate-600" value={activeItem.title} onChange={e => setActiveItem({...activeItem, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">難度</label>
                            <select className="w-full p-3 border rounded-lg bg-white text-slate-600" value={activeItem.level} onChange={e => setActiveItem({...activeItem, level: e.target.value})}><option value="Basic">Basic</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">課程影片 URL (YouTube/MP4)</label>
                        <div className="relative">
                            <input className="w-full p-3 pl-10 border rounded-lg bg-white text-slate-600" value={activeItem.videoUrl || ''} onChange={e => setActiveItem({...activeItem, videoUrl: e.target.value})} placeholder="https://..." />
                            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">課程詳細內容 (Rich Text)</label>
                        <RichTextEditor 
                            value={activeItem.description || ''} 
                            onChange={(val) => setActiveItem({...activeItem, description: val})}
                            placeholder="輸入課程大綱與介紹..." 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">時長</label>
                            <input className="w-full p-3 border rounded-lg bg-white text-slate-600" value={activeItem.duration} onChange={e => setActiveItem({...activeItem, duration: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">權限</label>
                            <select className="w-full p-3 border rounded-lg bg-white text-slate-600" value={activeItem.isLocked ? 'true' : 'false'} onChange={e => setActiveItem({...activeItem, isLocked: e.target.value === 'true'})}><option value="false">免費</option><option value="true">Pro 會員限定</option></select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">圖片關鍵字 (English)</label>
                        <input className="w-full p-3 border rounded-lg bg-white text-slate-600" value={activeItem.imageKeyword} onChange={e => setActiveItem({...activeItem, imageKeyword: e.target.value})} placeholder="e.g. map, book, computer" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setEditMode('LIST')}>取消</Button>
                        <Button onClick={saveCourseEdit}>儲存課程</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (editMode === 'EDIT_CERT') {
        return (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
                <h3 className="text-xl font-bold mb-6 text-slate-800">設計證書</h3>
                <div className="space-y-4">
                    <input className="w-full p-2 border rounded bg-white text-slate-600" placeholder="證書名稱" value={activeItem.title} onChange={e => setActiveItem({...activeItem, title: e.target.value})} />
                    <textarea className="w-full p-2 border rounded bg-white text-slate-600" placeholder="證書描述 / 授予條件" rows={2} value={activeItem.description} onChange={e => setActiveItem({...activeItem, description: e.target.value})} />
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <h4 className="text-sm font-bold mb-2">預覽樣式</h4>
                        <div className="w-full aspect-[3/2] bg-white border-4 border-double border-yellow-500 p-8 text-center flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                            <Award size={48} className="text-yellow-500 mb-4" />
                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">{activeItem.title || '證書標題'}</h2>
                            <p className="text-slate-500 text-sm mb-6">{activeItem.description || '授予條件...'}</p>
                            <div className="text-xs text-slate-400">授予：[學員名稱]</div>
                            <div className="text-xs text-slate-400 mt-1">日期：YYYY-MM-DD</div>
                            <div className="absolute bottom-4 right-4 w-16 h-16 opacity-10"><GraduationCap size={64}/></div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold mb-2">獲獎學員名單 ({activeItem.recipients?.length || 0})</h4>
                        <ul className="text-xs text-slate-600 space-y-1">
                            {activeItem.recipients && activeItem.recipients.length > 0 ? activeItem.recipients.map((r: any, idx: number) => {
                                const u = (allUsers || []).find((user: User) => user.id === r.userId);
                                return <li key={r.userId} className="flex justify-between"><span>{u?.name || r.userId}</span><span>{r.date}</span></li>
                            }) : <li className="text-slate-400 italic">尚無學員獲得此證書</li>}
                        </ul>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setEditMode('LIST')}>取消</Button>
                        <Button onClick={saveCertEdit}>儲存設定</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (editMode === 'EDIT_EXAM') {
        const addQuestion = () => setActiveItem({...activeItem, questions: [...activeItem.questions, { id: `q${Date.now()}`, text: '', options: ['','','',''], correctIndex: 0 }]});
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
                <h3 className="text-xl font-bold mb-6 text-slate-800">編輯考試內容</h3>
                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-500">考試名稱</label><input className="w-full p-2 border rounded bg-white text-slate-600" value={activeItem.title} onChange={e => setActiveItem({...activeItem, title: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-slate-500">及格分數</label><input type="number" className="w-full p-2 border rounded bg-white text-slate-600" value={activeItem.passingScore || 0} onChange={e => setActiveItem({...activeItem, passingScore: parseInt(e.target.value) || 0})} /></div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {(activeItem.questions || []).map((q: ExamQuestion, idx: number) => (
                        <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-slate-700">問題 {idx + 1}</span>
                                <button className="text-red-500" onClick={() => setActiveItem({...activeItem, questions: (activeItem.questions || []).filter((_:any, i:number) => i !== idx)})}>刪除</button>
                            </div>
                            <input className="w-full p-2 border rounded mb-2 bg-white text-slate-600" placeholder="題目內容..." value={q.text} onChange={e => {
                                const qs = [...activeItem.questions]; qs[idx].text = e.target.value; setActiveItem({...activeItem, questions: qs});
                            }} />
                            <div className="grid grid-cols-2 gap-2">
                                {(q.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center">
                                        <input type="radio" checked={q.correctIndex === oIdx} onChange={() => { const qs = [...activeItem.questions]; qs[idx].correctIndex = oIdx; setActiveItem({...activeItem, questions: qs}); }} />
                                        <input className="ml-2 w-full p-1 border rounded text-sm bg-white text-slate-600" value={opt} onChange={e => { const qs = [...activeItem.questions]; qs[idx].options[oIdx] = e.target.value; setActiveItem({...activeItem, questions: qs}); }} placeholder={`選項 ${oIdx+1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={addQuestion} className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors font-bold">+ 新增問題</button>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setEditMode('LIST')}>取消</Button>
                    <Button onClick={saveExamEdit}>儲存考試</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex space-x-2 bg-white p-1 rounded-xl w-fit shadow-sm border border-slate-200">
                <button onClick={() => setSubTab('COURSES')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'COURSES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>課程管理</button>
                <button onClick={() => setSubTab('CERTS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'CERTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>證書管理</button>
                <button onClick={() => setSubTab('STUDENTS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'STUDENTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>學員管理</button>
                <button onClick={() => setSubTab('EXAMS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'EXAMS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>考試管理</button>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {subTab === 'COURSES' && (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">課程名稱</th><th className="p-4">難度/時長</th><th className="p-4">狀態</th><th className="p-4 text-right">操作</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(courses || []).map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-900">{c.title}</td>
                                            <td className="p-4 text-xs text-slate-600">{c.level} / {c.duration}</td>
                                            <td className="p-4">{c.isLocked ? <span className="text-red-500 text-xs font-bold">Pro</span> : <span className="text-green-500 text-xs font-bold">Free</span>}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditCourse(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => handleDeleteCourse(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 border-t border-slate-100"><Button onClick={() => handleEditCourse()} className="w-full">新增課程</Button></div>
                        </>
                    )}

                    {subTab === 'CERTS' && (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">證書名稱</th><th className="p-4">獲獎人數</th><th className="p-4 text-right">操作</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(certificates || []).map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-900">{c.title}</td>
                                            <td className="p-4 text-slate-600">{c.recipients?.length || 0}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditCert(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => { setConfirmAction({id: c.id, type: 'cert'}); setConfirmModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 border-t border-slate-100"><Button onClick={() => handleEditCert()} className="w-full">新增證書</Button></div>
                        </>
                    )}

                    {subTab === 'STUDENTS' && (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">學員名稱</th><th className="p-4">等級</th><th className="p-4">已完成課程</th><th className="p-4 text-right">狀態</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {(allUsers || []).filter(u => !u.isAdmin).map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-900 flex items-center"><img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${s.avatarId}`} className="w-6 h-6 rounded-full mr-2"/>{s.name}</td>
                                        <td className="p-4 text-slate-600">Lv.{s.level}</td>
                                        <td className="p-4 text-green-600 font-bold">{(certificates || []).filter(c => c.recipients?.some(r => r.userId === s.id)).length} 張證書</td>
                                        <td className="p-4 text-right text-xs text-slate-500">{s.status === 'active' ? '正常' : '停權'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {subTab === 'EXAMS' && (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">考試名稱</th><th className="p-4">題數</th><th className="p-4">及格分</th><th className="p-4 text-right">操作</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(exams || []).map(e => (
                                        <tr key={e.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-900">{e.title}</td>
                                            <td className="p-4 text-slate-600">{e.questions.length}</td>
                                            <td className="p-4 text-slate-600">{e.passingScore}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditExam(e)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => { setConfirmAction({id: e.id, type: 'exam'}); setConfirmModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 border-t border-slate-100"><Button onClick={() => handleEditExam()} className="w-full">新增考試</Button></div>
                        </>
                    )}
                </div>
             </div>

             <ConfirmModal 
                isOpen={confirmModalOpen}
                title="確認刪除"
                message="確定要刪除此項目嗎？此操作無法復原！"
                onConfirm={() => {
                    if (confirmAction?.type === 'course') onDeleteCourse(confirmAction.id);
                    if (confirmAction?.type === 'cert') onDeleteCertificate(confirmAction.id);
                    if (confirmAction?.type === 'exam') onDeleteExam(confirmAction.id);
                    setConfirmModalOpen(false);
                    setConfirmAction(null);
                }}
                onCancel={() => { setConfirmModalOpen(false); setConfirmAction(null); }}
                confirmText="確認刪除"
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

// --- Sub-Component: Member Manager ---
const MemberManager = ({ allUsers, updateUser, deleteUser, systemSettings, updateSystemSettings, currentUser }: { allUsers: User[], updateUser: (id: string, d: any) => void, deleteUser: (id: string) => void, systemSettings: SystemSettings | undefined, updateSystemSettings: (s: SystemSettings) => void, currentUser: User }) => {
    const settings = systemSettings || { levels: [], basePointsPerGame: 0, baseExpPerGame: 0, rolePermissions: { user: {} as any, creator: {} as any, admin: {} as any } };
    const [view, setView] = useState<'USERS' | 'LEVELS' | 'PERMISSIONS'>('USERS');

    const handleLevelUpdate = (idx: number, field: string, value: any) => {
        const newLevels = [...(settings.levels || [])];
        newLevels[idx] = { ...newLevels[idx], [field]: value };
        updateSystemSettings({ ...settings, levels: newLevels });
    };

    const handlePermissionUpdate = (role: 'user' | 'creator' | 'admin', field: keyof RolePermissions, value: boolean) => {
        const newPermissions = { ...settings.rolePermissions };
        newPermissions[role] = { ...newPermissions[role], [field]: value };
        updateSystemSettings({ ...settings, rolePermissions: newPermissions });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex space-x-2 bg-white p-1 rounded-xl w-fit shadow-sm border border-slate-200">
                <button onClick={() => setView('USERS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'USERS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>用戶列表</button>
                <button onClick={() => setView('LEVELS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'LEVELS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>等級設定</button>
                <button onClick={() => setView('PERMISSIONS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'PERMISSIONS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>權限設定</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {view === 'USERS' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">用戶</th><th className="p-4">手機號</th><th className="p-4">收件地址</th><th className="p-4">微信帳號</th><th className="p-4">稱謂</th><th className="p-4">角色</th><th className="p-4">等級/積分</th><th className="p-4">狀態</th><th className="p-4 text-right">操作</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {(allUsers || []).map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="p-4 flex items-center font-bold text-slate-900"><img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.avatarId}`} className="w-8 h-8 rounded-full mr-3 bg-slate-100"/>{u.name}</td>
                                        <td className="p-4 text-sm text-slate-600">{u.phone || '-'}</td>
                                        <td className="p-4 text-sm text-slate-600">{u.address || '-'}</td>
                                        <td className="p-4 text-sm text-slate-600">{u.wechatId || '-'}</td>
                                        <td className="p-4 text-sm text-slate-600">{u.title || '-'}</td>
                                        <td className="p-4 text-xs font-bold uppercase text-slate-500">
                                            <select value={u.role || 'user'} onChange={(e) => { const newRole = e.target.value as any; updateUser(u.id, { role: newRole, isAdmin: newRole === 'admin' }); }} className="bg-slate-100 border-none rounded p-1 text-xs font-bold text-slate-700">
                                                <option value="user">User</option>
                                                <option value="creator">Creator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">Lv.{u.level} <span className="text-slate-300 mx-1">|</span> {u.points} pts</td>
                                        <td className="p-4">{u.status === 'banned' ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">停權</span> : <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">正常</span>}</td>
                                        <td className="p-4 text-right">
                                            {u.id !== currentUser.id && (
                                                <div className="flex justify-end gap-1">
                                                    {u.status === 'banned' ? 
                                                        <button onClick={() => updateUser(u.id, { status: 'active' })} className="text-green-600 hover:bg-green-50 p-2 rounded transition-colors" title="解除停權"><CheckCircle size={16}/></button> :
                                                        <button onClick={() => updateUser(u.id, { status: 'banned' })} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="停權用戶"><Ban size={16}/></button>
                                                    }
                                                    <button onClick={() => { const p = prompt("修改積分", u.points.toString()); if(p) updateUser(u.id, { points: parseInt(p) }) }} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors" title="修改積分"><UserCog size={16}/></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : view === 'LEVELS' ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center"><Trophy size={20} className="mr-2 text-yellow-500"/> 等級與稱號系統設定</h3>
                            <Button onClick={() => {
                                const newLevel = { level: (settings.levels || []).length + 1, expRequired: 1000, title: '新稱號' };
                                updateSystemSettings({ ...settings, levels: [...(settings.levels || []), newLevel] });
                            }}>
                                <Plus size={18} className="mr-2"/> 新增等級
                            </Button>
                        </div>

                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-slate-200">
                                    <tr className="text-xs font-bold text-slate-500">
                                        <th className="p-4">等級</th>
                                        <th className="p-4">所需經驗值 (EXP)</th>
                                        <th className="p-4">解鎖稱號</th>
                                        <th className="p-4 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(settings.levels || []).length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">尚無等級設定</td></tr>
                                    ) : (
                                        (settings.levels || []).map((lvl, idx) => (
                                            <tr key={idx} className="hover:bg-white transition-colors">
                                                <td className="p-4 font-bold text-slate-700">Lv.{lvl.level}</td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        className="w-32 p-2 border rounded-lg bg-white text-sm" 
                                                        value={lvl.expRequired} 
                                                        onChange={e => handleLevelUpdate(idx, 'expRequired', parseInt(e.target.value) || 0)} 
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        className="w-full max-w-xs p-2 border rounded-lg bg-white text-sm" 
                                                        value={lvl.title} 
                                                        onChange={e => handleLevelUpdate(idx, 'title', e.target.value)} 
                                                    />
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button 
                                                        onClick={() => {
                                                            const next = settings.levels.filter((_, i) => i !== idx);
                                                            updateSystemSettings({ ...settings, levels: next });
                                                        }}
                                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><Settings size={20} className="mr-2 text-slate-500"/> 全局參數設定</h3>
                            <div className="grid grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">每場遊戲基礎積分</label>
                                    <input type="number" className="w-full p-2 border rounded bg-white text-slate-600 text-sm mt-1" value={settings.basePointsPerGame || 0} onChange={e => updateSystemSettings({...settings, basePointsPerGame: parseInt(e.target.value) || 0})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">每場遊戲基礎經驗</label>
                                    <input type="number" className="w-full p-2 border rounded bg-white text-slate-600 text-sm mt-1" value={settings.baseExpPerGame || 0} onChange={e => updateSystemSettings({...settings, baseExpPerGame: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><Shield size={20} className="mr-2 text-indigo-500"/> 編輯器功能權限設定</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-xs font-bold text-slate-500">
                                        <th className="p-4">功能</th>
                                        <th className="p-4 text-center">一般用戶 (User)</th>
                                        <th className="p-4 text-center">創作者 (Creator)</th>
                                        <th className="p-4 text-center">管理員 (Admin)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { key: 'canUseAI', label: 'AI 生成劇本' },
                                        { key: 'canUseAdvancedLogic', label: '進階邏輯與變數' },
                                        { key: 'canPublish', label: '發佈遊戲' },
                                        { key: 'canAddLocation', label: '新增關卡位置' },
                                        { key: 'canAddStoryNarration', label: '新增旁白' },
                                        { key: 'canAddStoryDialogue', label: '新增對話' },
                                        { key: 'canAddText', label: '新增文字內容' },
                                        { key: 'canUploadImage', label: '上傳圖片' },
                                        { key: 'canUploadVideo', label: '上傳影片' },
                                        { key: 'canUploadAudio', label: '上傳音訊' },
                                        { key: 'canAddARRecognize', label: 'AR 辨識' },
                                        { key: 'canAddARTransparent', label: 'AR 透圖' },
                                        { key: 'canAddQuizAR', label: 'AR 答題' },
                                        { key: 'canAddPuzzle', label: '拼圖解謎' },
                                        { key: 'canAddHint', label: '提示系統' },
                                        { key: 'canExplore', label: '探索' },
                                        { key: 'canAccessAcademy', label: '創作學院' },
                                        { key: 'canAccessShop', label: '商店' },
                                        { key: 'canAccessLeaderboard', label: '排行榜' }
                                    ].map(perm => (
                                        <tr key={perm.key} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-700">{perm.label}</td>
                                            {['user', 'creator', 'admin'].map(role => (
                                                <td key={role} className="p-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={role === 'admin' ? true : (settings.rolePermissions?.[role as 'user'|'creator'|'admin']?.[perm.key as keyof RolePermissions] || false)}
                                                        onChange={(e) => role !== 'admin' && handlePermissionUpdate(role as 'user'|'creator'|'admin', perm.key as keyof RolePermissions, e.target.checked)}
                                                        disabled={role === 'admin'}
                                                        className={`w-5 h-5 rounded border-slate-300 focus:ring-indigo-500 ${role === 'admin' ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600'}`}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Translation Manager ---
const TranslationRow = ({ translationKey, initialData, languages, onUpdate, onDelete }: any) => {
    const [localData, setLocalData] = useState(initialData || {});

    useEffect(() => {
        setLocalData(initialData || {});
    }, [initialData]);

    const handleChange = (lang: string, value: string) => {
        setLocalData((prev: any) => ({ ...prev, [lang]: value }));
    };

    const handleBlur = (lang: string) => {
        if (localData[lang] !== initialData?.[lang]) {
            onUpdate(lang, translationKey, localData[lang]);
        }
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="p-4 font-mono text-xs text-slate-500 break-all">{translationKey}</td>
            {languages.map((lang: string) => (
                <td key={lang} className="p-2">
                    <textarea 
                        className="w-full p-2 border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-lg text-sm bg-transparent focus:bg-white transition-all resize-none"
                        rows={1}
                        value={localData[lang] || ''}
                        onChange={(e) => handleChange(lang, e.target.value)}
                        onBlur={() => handleBlur(lang)}
                    />
                </td>
            ))}
            <td className="p-4 text-right">
                <button 
                    onClick={() => onDelete(translationKey)}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};

const TranslationManager = () => {
    const { translations, updateTranslations } = useLanguage();
    const [search, setSearch] = useState('');
    const [newKey, setNewKey] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [isAutoTranslating, setIsAutoTranslating] = useState(false);
    const [filterMissing, setFilterMissing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const languages = ['zh-TW', 'zh-CN', 'en'];
    const filteredKeys = Object.keys(translations).filter(key => {
        const matchesSearch = key.toLowerCase().includes(search.toLowerCase()) || 
            Object.values(translations[key] || {}).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
        
        if (filterMissing && selectedLanguage) {
            return matchesSearch && !translations[key][selectedLanguage];
        }
        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
    const paginatedKeys = filteredKeys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAutoTranslate = async () => {
        if (!selectedLanguage || selectedLanguage === 'zh-TW') return;
        if (!window.confirm(`確定要使用 AI 自動翻譯當前頁面缺失的 ${selectedLanguage} 字串嗎？`)) return;
        
        setIsAutoTranslating(true);
        try {
            const next = { ...translations };
            const keysToTranslate = paginatedKeys.filter(k => !next[k][selectedLanguage]);
            
            if (keysToTranslate.length === 0) {
                alert('當前頁面沒有需要翻譯的缺失字串。');
                return;
            }

            // Batch translate for efficiency
            for (const key of keysToTranslate) {
                const sourceText = next[key]['zh-TW'];
                if (sourceText) {
                    const translated = await translateText(sourceText, selectedLanguage);
                    next[key][selectedLanguage] = translated;
                }
            }
            
            await updateTranslations(next);
            alert(`成功翻譯 ${keysToTranslate.length} 個字串！`);
        } catch (e) {
            console.error(e);
            alert('自動翻譯失敗，請檢查 API 設定。');
        } finally {
            setIsAutoTranslating(false);
        }
    };

    const handleUpdate = (lang: string, key: string, value: string) => {
        const next = { ...translations };
        if (!next[key]) next[key] = {};
        next[key][lang] = value;
        updateTranslations(next);
    };

    const handleAddKey = () => {
        if (!newKey) return;
        const next = { ...translations };
        next[newKey] = {};
        languages.forEach(lang => {
            next[newKey][lang] = '';
        });
        updateTranslations(next);
        setNewKey('');
        setIsAdding(false);
    };

    const handleDeleteKey = (key: string) => {
        if (!window.confirm(`確定要刪除翻譯鍵 "${key}" 嗎？`)) return;
        const next = { ...translations };
        delete next[key];
        updateTranslations(next);
    };

    const handleResetToDefaults = async () => {
        if (!window.confirm('確定要將所有翻譯重置為預設值嗎？這將覆蓋現有的翻譯。')) return;
        const defaults = {
            'navbar.home': { 'zh-TW': '首頁', 'zh-CN': '首页', 'en': 'Home' },
            'navbar.explore': { 'zh-TW': '探索', 'zh-CN': '探索', 'en': 'Explore' },
            'navbar.academy': { 'zh-TW': '創作學院', 'zh-CN': '创作学院', 'en': 'Academy' },
            'navbar.shop': { 'zh-TW': '商店', 'zh-CN': '商店', 'en': 'Shop' },
            'navbar.leaderboard': { 'zh-TW': '排行榜', 'zh-CN': '排行榜', 'en': 'Leaderboard' },
            'navbar.create': { 'zh-TW': '創作遊戲', 'zh-CN': '创作游戏', 'en': 'Create Game' },
            'navbar.login': { 'zh-TW': '登入', 'zh-CN': '登录', 'en': 'Login' },
            'navbar.register': { 'zh-TW': '註冊', 'zh-CN': '注册', 'en': 'Register' },
            'navbar.admin': { 'zh-TW': '管理後台', 'zh-CN': '管理后台', 'en': 'Admin' },
            'navbar.profile': { 'zh-TW': '個人檔案', 'zh-CN': '个人档案', 'en': 'Profile' },
            'navbar.logout': { 'zh-TW': '登出帳號', 'zh-CN': '登出', 'en': 'Logout' },
            'explore.modal.playCount': { 'zh-TW': '遊玩', 'zh-CN': '游玩', 'en': 'Plays' },
            'explore.modal.reviews': { 'zh-TW': '玩家評論', 'zh-CN': '玩家评论', 'en': 'Reviews' },
            'explore.modal.noReviews': { 'zh-TW': '尚無評論，成為第一個評價的人吧！', 'zh-CN': '尚无评论，成为第一個評價的人吧！', 'en': 'No reviews yet. Be the first to review!' },
            'explore.modal.close': { 'zh-TW': '關閉', 'zh-CN': '关闭', 'en': 'Close' },
            'explore.modal.play': { 'zh-TW': '開始遊戲', 'zh-CN': '开始游戏', 'en': 'Play Now' },
            'player.clues': { 'zh-TW': '線索', 'zh-CN': '线索', 'en': 'Clues' },
            'player.map': { 'zh-TW': '地圖', 'zh-CN': '地图', 'en': 'Map' },
            'player.back': { 'zh-TW': '返回', 'zh-CN': '返回', 'en': 'Back' },
            'player.submit': { 'zh-TW': '提交', 'zh-CN': '提交', 'en': 'Submit' },
            'player.hint': { 'zh-TW': '提示', 'zh-CN': '提示', 'en': 'Hint' }
        };
        await updateTranslations(defaults);
    };

    const handleSyncToFiles = async () => {
        if (!window.confirm('確定要將當前翻譯同步到伺服器 JSON 檔案嗎？這將更新原始碼中的翻譯。')) return;
        try {
            for (const lang of languages) {
                const langData: { [key: string]: string } = {};
                Object.keys(translations).forEach(key => {
                    if (translations[key][lang]) {
                        langData[key] = translations[key][lang];
                    }
                });
                
                const response = await fetch(`/api/locales/${lang}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(langData)
                });
                
                if (!response.ok) throw new Error(`Failed to sync ${lang}`);
            }
            alert('同步成功！翻譯已儲存至伺服器檔案。');
        } catch (e) {
            console.error(e);
            alert('同步失敗，請檢查伺服器狀態。');
        }
    };

    const handleSyncFromFiles = async () => {
        if (!window.confirm('確定要從伺服器 JSON 檔案同步翻譯到資料庫嗎？這將覆蓋資料庫中的現有翻譯。')) return;
        try {
            const nextTranslations: TranslationData = { ...translations };
            for (const lang of languages) {
                const response = await fetch(`/api/locales/${lang}`);
                if (response.ok) {
                    const data = await response.json();
                    Object.keys(data).forEach(key => {
                        if (!nextTranslations[key]) nextTranslations[key] = {};
                        nextTranslations[key][lang] = data[key];
                    });
                }
            }
            await updateTranslations(nextTranslations);
            alert('同步成功！已從檔案載入翻譯。');
        } catch (e) {
            console.error(e);
            alert('同步失敗，請檢查伺服器狀態。');
        }
    };

    if (selectedLanguage) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedLanguage(null)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Languages className="text-indigo-500" />
                                編輯語言: <span className="text-indigo-600">{selectedLanguage}</span>
                            </h3>
                            <p className="text-sm text-slate-400">正在編輯翻譯內容，對比來源語言 (zh-TW)</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 mr-4 bg-slate-100 px-3 py-1 rounded-lg">
                            <input 
                                type="checkbox" 
                                id="filter-missing" 
                                checked={filterMissing} 
                                onChange={(e) => setFilterMissing(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="filter-missing" className="text-xs font-bold text-slate-600 cursor-pointer">僅顯示缺失</label>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="搜尋關鍵字..." 
                                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {selectedLanguage !== 'zh-TW' && (
                            <Button 
                                variant="outline" 
                                onClick={handleAutoTranslate} 
                                disabled={isAutoTranslating}
                                className={isAutoTranslating ? 'animate-pulse' : ''}
                            >
                                <Sparkles size={18} className={`mr-2 ${isAutoTranslating ? 'animate-spin' : ''}`} /> 
                                {isAutoTranslating ? '翻譯中...' : 'AI 自動翻譯'}
                            </Button>
                        )}
                        <Button onClick={handleSyncToFiles}>
                            <Save size={18} className="mr-2"/> 儲存變更
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">翻譯鍵 (Key)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">來源 (zh-TW)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">目標 ({selectedLanguage})</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[80px]">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedKeys.map(key => (
                                <tr key={key} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 align-top">
                                        <div className="font-mono text-[10px] text-slate-400 mb-1">{key.length > 30 ? key.substring(0, 30) + '...' : key}</div>
                                        <div className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors truncate max-w-[200px]" title={key}>
                                            {key.split('.').pop()}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[40px]">
                                            {translations[key]['zh-TW'] || <span className="text-slate-300 italic">未定義</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <textarea 
                                            className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] transition-all"
                                            value={translations[key][selectedLanguage] || ''}
                                            onChange={(e) => handleUpdate(selectedLanguage, key, e.target.value)}
                                            placeholder={`輸入 ${selectedLanguage} 翻譯...`}
                                        />
                                    </td>
                                    <td className="p-4 align-top">
                                        <button 
                                            onClick={() => handleDeleteKey(key)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            title="刪除翻譯鍵"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-slate-600">
                            第 {currentPage} 頁，共 {totalPages} 頁
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Languages className="text-indigo-500" />
                    翻譯管理系統
                </h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus size={18} className="mr-2" /> 新增來源文字
                    </Button>
                    <Button variant="outline" onClick={handleSyncFromFiles}>
                        <RefreshCw size={18} className="mr-2" /> 從檔案同步
                    </Button>
                    <Button variant="outline" onClick={handleResetToDefaults}>
                        <RotateCcw size={18} className="mr-2" /> 重置預設
                    </Button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-6 animate-in slide-in-from-top duration-300">
                    <h4 className="text-sm font-bold text-indigo-900 mb-4">新增繁體中文來源文字</h4>
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder="輸入繁體中文字串..." 
                            className="flex-1 px-4 py-2 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                        />
                        <Button onClick={handleAddKey}>確認新增</Button>
                        <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {languages.map(lng => {
                    const totalKeys = Object.keys(translations).length;
                    const translatedKeys = Object.keys(translations).filter(k => translations[k][lng]).length;
                    const progress = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

                    return (
                        <div key={lng} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Languages size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lng}</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-1">
                                {lng === 'zh-TW' ? '繁體中文' : lng === 'zh-CN' ? '简体中文' : 'English'}
                            </h4>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-500">{progress}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">{translatedKeys} / {totalKeys} 字串已翻譯</span>
                                <button 
                                    onClick={() => setSelectedLanguage(lng)}
                                    className="text-indigo-600 text-sm font-bold hover:underline flex items-center"
                                >
                                    進入編輯 <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center gap-4 flex-wrap pt-6 border-t border-slate-100">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="搜尋翻譯鍵或內容..." 
                        className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSyncFromFiles} title="從 JSON 檔案載入">
                        <Download size={18} className="mr-2"/> 從檔案同步
                    </Button>
                    <Button variant="outline" onClick={handleSyncToFiles} title="儲存到 JSON 檔案">
                        <Save size={18} className="mr-2"/> 同步到檔案
                    </Button>
                    <Button variant="outline" onClick={handleResetToDefaults}>
                        <RotateCcw size={18} className="mr-2"/> 重置預設
                    </Button>
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus size={18} className="mr-2"/> 新增翻譯鍵
                    </Button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500 shadow-xl space-y-4 animate-in zoom-in-95">
                    <h4 className="font-bold text-indigo-600">新增翻譯鍵</h4>
                    <div className="flex gap-3">
                        <input 
                            className="flex-1 p-3 border rounded-xl" 
                            placeholder="例如: common.welcome" 
                            value={newKey} 
                            onChange={e => setNewKey(e.target.value)} 
                        />
                        <Button onClick={handleAddKey}>確認新增</Button>
                        <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
                    </div>
                    <p className="text-xs text-slate-400">建議使用 dot notation，如 `navbar.home`</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">翻譯鍵 (Key)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">繁體中文 (zh-TW)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">简体中文 (zh-CN)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">English (en)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredKeys.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold">沒有找到翻譯項</td></tr>
                            ) : (
                                filteredKeys.map(key => (
                                    <TranslationRow 
                                        key={key} 
                                        translationKey={key} 
                                        initialData={translations[key]} 
                                        languages={languages} 
                                        onUpdate={handleUpdate} 
                                        onDelete={handleDeleteKey} 
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: API Manager ---
const APIManager = ({ settings, updateSettings }: any) => {
    const [newApiKey, setNewApiKey] = useState('');
    const [newApiValue, setNewApiValue] = useState('');

    const defaultApiKeys = [
        { key: 'GEMINI_API_KEY', name: 'Gemini AI 密鑰', description: '用於生成遊戲內容、對話與解謎提示' },
        { key: 'GOOGLE_MAPS_API_KEY', name: 'Google Maps 密鑰', description: '用於地圖模組的顯示與定位 (選用)' },
        { key: 'STRIPE_SECRET_KEY', name: 'Stripe 支付密鑰', description: '用於商店禮包的購買與結帳 (選用)' },
        { key: 'FIREBASE_API_KEY', name: 'Firebase API 密鑰', description: '用於資料庫與身份驗證 (通常已在設定檔中)' }
    ];

    // Ensure default keys are listed
    const apiKeys = { ...settings.apiKeys };
    defaultApiKeys.forEach(def => {
        if (apiKeys[def.key] === undefined) {
            apiKeys[def.key] = '';
        }
    });

    const handleAdd = () => {
        if (!newApiKey) return;
        const next = { ...settings, apiKeys: { ...apiKeys, [newApiKey]: newApiValue } };
        updateSettings(next);
        setNewApiKey('');
        setNewApiValue('');
    };

    const handleUpdateKey = (key: string, value: string) => {
        const next = { ...settings, apiKeys: { ...apiKeys, [key]: value } };
        updateSettings(next);
    };

    const handleDelete = (key: string) => {
        const nextApiKeys = { ...apiKeys };
        delete nextApiKeys[key];
        const next = { ...settings, apiKeys: nextApiKeys };
        updateSettings(next);
    };

    return (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Key className="text-indigo-500" /> API 接口管理</h3>
            <p className="text-sm text-slate-500">在此管理網站使用的第三方 API 密鑰與接口地址。請注意，此處設定的密鑰將優先於環境變數中的預設值。</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <input 
                    className="p-3 border rounded-xl bg-white text-sm" 
                    placeholder="自訂 API 名稱 (例如: CUSTOM_API_KEY)" 
                    value={newApiKey}
                    onChange={e => setNewApiKey(e.target.value)}
                />
                <input 
                    className="p-3 border rounded-xl bg-white text-sm" 
                    placeholder="API 數值" 
                    value={newApiValue}
                    onChange={e => setNewApiValue(e.target.value)}
                />
                <Button onClick={handleAdd}><Plus size={18} className="mr-2"/> 新增自訂接口</Button>
            </div>

            <div className="space-y-4">
                {Object.entries(apiKeys).map(([key, value]: [string, any]) => {
                    const def = defaultApiKeys.find(d => d.key === key);
                    return (
                        <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-slate-800">{def ? def.name : key}</p>
                                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{key}</span>
                                </div>
                                {def && <p className="text-xs text-slate-500 mb-3">{def.description}</p>}
                                <input 
                                    type="password"
                                    className="w-full p-3 border rounded-lg text-sm font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder={`請輸入 ${key} 密鑰...`}
                                    value={value}
                                    onChange={(e) => handleUpdateKey(key, e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 self-end md:self-center">
                                <button onClick={() => handleDelete(key)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" disabled={!!def}>
                                    <Trash2 size={20} className={def ? 'opacity-30' : ''} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Sub-Component: Shop Manager ---
const ShopManager = ({ games, courses, onUpdateGame, onUpdateCourse, settings, updateSettings }: any) => {
    const [subTab, setSubTab] = useState<'GAMES' | 'COURSES' | 'PRODUCTS' | 'PACKAGES' | 'PAYMENT'>('GAMES');
    const { products, updateProducts } = useGame();

    const ticketPacks = settings?.ticketPacks || [
        { id: 't1', name: '新手禮包', description: '包含 100 張券', price: 0, cashPrice: 10, tickets: 100 },
        { id: 't2', name: '進階禮包', description: '包含 550 張券 (多送 50 張)', price: 0, cashPrice: 50, tickets: 550 },
        { id: 't3', name: '大師禮包', description: '包含 1200 張券 (多送 200 張)', price: 0, cashPrice: 100, tickets: 1200 },
    ];

    const handleUpdatePack = (index: number, field: string, value: any) => {
        const newPacks = [...ticketPacks];
        newPacks[index] = { ...newPacks[index], [field]: value };
        updateSettings({ ...settings, ticketPacks: newPacks });
    };

    const handleAddPack = () => {
        const newPacks = [...ticketPacks, { id: `t${Date.now()}`, name: '新禮包', description: '', price: 0, cashPrice: 0, tickets: 0 }];
        updateSettings({ ...settings, ticketPacks: newPacks });
    };

    const handleDeletePack = (index: number) => {
        const newPacks = ticketPacks.filter((_: any, i: number) => i !== index);
        updateSettings({ ...settings, ticketPacks: newPacks });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit flex-wrap">
                <button onClick={() => setSubTab('GAMES')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'GAMES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>遊戲定價</button>
                <button onClick={() => setSubTab('COURSES')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'COURSES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>課程定價</button>
                <button onClick={() => setSubTab('PRODUCTS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'PRODUCTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>實體/數位產品</button>
                <button onClick={() => setSubTab('PACKAGES')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'PACKAGES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>禮包設定</button>
                <button onClick={() => setSubTab('PAYMENT')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'PAYMENT' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>支付設定</button>
            </div>

            {subTab === 'GAMES' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs font-bold text-slate-500">
                                <th className="p-4">遊戲名稱</th>
                                <th className="p-4">當前狀態</th>
                                <th className="p-4">券數定價</th>
                                <th className="p-4">庫存/數量</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {games.map((game: any) => (
                                <tr key={game.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold">{game.title}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{game.status}</span></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Coins size={14} className="text-yellow-500" />
                                            <input 
                                                type="number" 
                                                className="w-24 p-2 border rounded-lg text-sm" 
                                                value={game.ticketPrice || 0} 
                                                onChange={(e) => onUpdateGame(game.id, game.status, { ticketPrice: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            className="w-24 p-2 border rounded-lg text-sm" 
                                            value={game.quantity || 999} 
                                            onChange={(e) => onUpdateGame(game.id, game.status, { quantity: parseInt(e.target.value) || 0 })}
                                        />
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="outline">保存</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'PACKAGES' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">禮包設定</h3>
                        <Button onClick={handleAddPack}>
                            <Plus size={18} className="mr-2"/> 新增禮包
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {ticketPacks.map((pack: any, idx: number) => (
                            <div key={pack.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">禮包名稱</label>
                                    <input className="w-full p-2 border rounded-lg bg-white" value={pack.name} onChange={e => handleUpdatePack(idx, 'name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">禮包描述</label>
                                    <input className="w-full p-2 border rounded-lg bg-white" value={pack.description} onChange={e => handleUpdatePack(idx, 'description', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">獲得券數</label>
                                    <input type="number" className="w-full p-2 border rounded-lg bg-white" value={pack.tickets} onChange={e => handleUpdatePack(idx, 'tickets', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">現金價格 (TWD)</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="number" className="flex-1 p-2 border rounded-lg bg-white" value={pack.cashPrice} onChange={e => handleUpdatePack(idx, 'cashPrice', parseInt(e.target.value) || 0)} />
                                        <button onClick={() => handleDeletePack(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subTab === 'PRODUCTS' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">產品列表 (典籍/周邊)</h3>
                        <Button onClick={() => updateProducts([...products, { id: Date.now().toString(), name: '新產品', description: '', price: 0, quantity: 0, imageUrl: '', type: 'BOOK' }])}>
                            <Plus size={18} className="mr-2"/> 新增產品
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {products.map((product, idx) => (
                            <div key={product.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">產品名稱</label>
                                    <input className="w-full p-2 border rounded-lg bg-white" value={product.name} onChange={e => {
                                        const next = [...products];
                                        next[idx].name = e.target.value;
                                        updateProducts(next);
                                    }} />
                                    <label className="text-xs font-bold text-slate-500">產品圖片</label>
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2 border rounded-lg bg-white text-xs" placeholder="圖片 URL" value={product.imageUrl} onChange={e => {
                                            const next = [...products];
                                            next[idx].imageUrl = e.target.value;
                                            updateProducts(next);
                                        }} />
                                        <input 
                                            type="file" 
                                            id={`product-img-${product.id}`} 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const base64 = await compressImage(file);
                                                    const next = [...products];
                                                    next[idx].imageUrl = base64;
                                                    updateProducts(next);
                                                }
                                            }}
                                        />
                                        <Button size="sm" variant="outline" onClick={() => document.getElementById(`product-img-${product.id}`)?.click()}>
                                            <Upload size={16}/>
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">產品說明</label>
                                    <textarea className="w-full p-2 border rounded-lg bg-white h-24" value={product.description} onChange={e => {
                                        const next = [...products];
                                        next[idx].description = e.target.value;
                                        updateProducts(next);
                                    }} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">定價 (券數)</label>
                                    <input type="number" className="w-full p-2 border rounded-lg bg-white" value={product.price} onChange={e => {
                                        const next = [...products];
                                        next[idx].price = parseInt(e.target.value) || 0;
                                        updateProducts(next);
                                    }} />
                                    <label className="text-xs font-bold text-slate-500">庫存數量</label>
                                    <input type="number" className="w-full p-2 border rounded-lg bg-white" value={product.quantity} onChange={e => {
                                        const next = [...products];
                                        next[idx].quantity = parseInt(e.target.value) || 0;
                                        updateProducts(next);
                                    }} />
                                </div>
                                <div className="flex flex-col justify-end gap-2">
                                    <Button fullWidth variant="primary">保存產品</Button>
                                    <Button fullWidth variant="outline" onClick={() => updateProducts(products.filter(p => p.id !== product.id))} className="text-red-500 border-red-200 hover:bg-red-50">刪除</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subTab === 'COURSES' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs font-bold text-slate-500">
                                <th className="p-4">課程名稱</th>
                                <th className="p-4">券數定價</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map((course: any) => (
                                <tr key={course.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold">{course.title}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Coins size={14} className="text-yellow-500" />
                                            <input 
                                                type="number" 
                                                className="w-24 p-2 border rounded-lg text-sm" 
                                                value={course.ticketPrice || 0} 
                                                onChange={(e) => onUpdateCourse({ ...course, ticketPrice: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="outline">保存</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'PAYMENT' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><CreditCard className="text-indigo-500" size={18}/> 支付接口配置</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">支</div>
                                        <div>
                                            <p className="font-bold text-sm">支付寶 (Alipay)</p>
                                            <p className="text-xs text-slate-400">{settings?.payment?.alipay ? '已啟用' : '未啟用'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => updateSettings({ ...settings, payment: { ...settings?.payment, alipay: !settings?.payment?.alipay } })}
                                        className={`w-10 h-6 rounded-full p-1 relative transition-colors ${settings?.payment?.alipay ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings?.payment?.alipay ? 'translate-x-4' : ''}`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">微</div>
                                        <div>
                                            <p className="font-bold text-sm">微信支付 (WeChat Pay)</p>
                                            <p className="text-xs text-slate-400">{settings?.payment?.wechat ? '已啟用' : '未啟用'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => updateSettings({ ...settings, payment: { ...settings?.payment, wechat: !settings?.payment?.wechat } })}
                                        className={`w-10 h-6 rounded-full p-1 relative transition-colors ${settings?.payment?.wechat ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings?.payment?.wechat ? 'translate-x-4' : ''}`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold"><CreditCard size={20}/></div>
                                        <div>
                                            <p className="font-bold text-sm">信用卡 (Stripe/Paypal)</p>
                                            <p className="text-xs text-slate-400">{settings?.payment?.creditCard ? '已啟用' : '未配置'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => updateSettings({ ...settings, payment: { ...settings?.payment, creditCard: !settings?.payment?.creditCard } })}
                                        className={`w-10 h-6 rounded-full p-1 relative transition-colors ${settings?.payment?.creditCard ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings?.payment?.creditCard ? 'translate-x-4' : ''}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package className="text-orange-500" size={18}/> 物流與實體商品設定</h3>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 mb-2">預設物流服務商</label>
                                <select 
                                    className="w-full p-3 border rounded-xl bg-white mb-4"
                                    value={settings?.shipping?.provider || '順豐速運'}
                                    onChange={(e) => updateSettings({ ...settings, shipping: { ...settings?.shipping, provider: e.target.value } })}
                                >
                                    <option>順豐速運</option>
                                    <option>圓通快遞</option>
                                    <option>中通快遞</option>
                                </select>
                                <label className="block text-xs font-bold text-slate-500 mb-2">運費模板</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="flex-1 p-3 border rounded-xl bg-white" 
                                        placeholder="0.00" 
                                        value={settings?.shipping?.fee || 0}
                                        onChange={(e) => updateSettings({ ...settings, shipping: { ...settings?.shipping, fee: parseFloat(e.target.value) || 0 } })}
                                    />
                                    <span className="text-sm font-bold text-slate-400">¥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
