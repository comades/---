
import React, { useState } from 'react';
import { ViewProps, Game, Article, Course, Certificate, Exam, User, SystemSettings, ExamQuestion, GameStatus, Message } from '../types';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, LayoutDashboard, FileText, Settings, Play, Search, Filter, MoreHorizontal, Star, EyeOff, Trash2, Plus, Edit, Image as ImageIcon, Calendar, ArrowLeft, Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Quote, Code, Eye, GraduationCap, Award, Users, BookOpen, Clock, Lock, Save, Ban, Check, UserCog, Trophy, AlertTriangle, Shield, MousePointerClick, MessageSquare, RotateCcw, Youtube, Inbox, Mail } from 'lucide-react';
import { Button } from '../components/Button';
import { RichTextEditor } from '../components/RichTextEditor';

export const Admin: React.FC<ViewProps> = ({ setView, setCurrentGame }) => {
  const { games, updateGameStatus, toggleGameRecommendation, articles, saveArticle, deleteArticle, restoreArticle, permanentlyDeleteArticle, courses, saveCourse, deleteCourse, certificates, saveCertificate, deleteCertificate, exams, saveExam, deleteExam, allUsers, updateUser, deleteUser, sendMessage, systemSettings, updateSystemSettings } = useGame();
  const { user, markMessageAsRead } = useAuth();
  const [activeTab, setActiveTab] = useState<'GAMES' | 'ARTICLES' | 'ACADEMY' | 'MEMBERS' | 'MESSAGES'>('GAMES');

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
                  <Button onClick={() => setView('HOME')} variant="outline">返回首頁</Button>
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
                    <LayoutDashboard size={18} className="mr-3" /> 遊戲管理
                </button>
                <button onClick={() => setActiveTab('ARTICLES')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'ARTICLES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <FileText size={18} className="mr-3" /> 公告與文章
                </button>
                <button onClick={() => setActiveTab('ACADEMY')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'ACADEMY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <GraduationCap size={18} className="mr-3" /> 學院管理
                </button>
                <button onClick={() => setActiveTab('MEMBERS')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'MEMBERS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Users size={18} className="mr-3" /> 會員管理
                </button>
                <button onClick={() => setActiveTab('MESSAGES')} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'MESSAGES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Inbox size={18} className="mr-3" /> 訊息中心
                    {user.messages && user.messages.filter(m => !m.isRead).length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{user.messages.filter(m => !m.isRead).length}</span>}
                </button>
            </nav>
            
            <div className="p-4 border-t border-slate-800">
                <button onClick={() => setView('HOME')} className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors text-sm">
                    <ArrowLeft size={16} className="mr-2" /> 返回前台
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col h-screen">
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <h1 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'GAMES' ? '遊戲審核與管理' : activeTab === 'ARTICLES' ? '內容發佈系統 (CMS)' : activeTab === 'ACADEMY' ? '創作學院管理系統' : activeTab === 'MEMBERS' ? '會員管理系統' : '後台訊息中心'}
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
                    <GameManager games={games} updateStatus={updateGameStatus} toggleRec={toggleGameRecommendation} onPlay={(g) => { setCurrentGame(g); setView('PLAY'); }} onSendMessage={sendMessage} />
                ) : activeTab === 'ARTICLES' ? (
                    <ArticleManager articles={articles} onSave={saveArticle} onDelete={deleteArticle} onRestore={restoreArticle} onHardDelete={permanentlyDeleteArticle} currentUser={user.name} />
                ) : activeTab === 'ACADEMY' ? (
                    <AcademyManager courses={courses} onSaveCourse={saveCourse} onDeleteCourse={deleteCourse} certificates={certificates} onSaveCertificate={saveCertificate} onDeleteCertificate={deleteCertificate} exams={exams} onSaveExam={saveExam} onDeleteExam={deleteExam} allUsers={allUsers} />
                ) : activeTab === 'MEMBERS' ? (
                    <MemberManager allUsers={allUsers} updateUser={updateUser} deleteUser={deleteUser} systemSettings={systemSettings} updateSystemSettings={updateSystemSettings} />
                ) : (
                    <MessageManager messages={user.messages || []} markAsRead={markMessageAsRead} />
                )}
            </div>
        </div>
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
                    messages.map((msg) => (
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
const GameManager = ({ games, updateStatus, toggleRec, onPlay, onSendMessage }: { 
    games: Game[], 
    updateStatus: (id: string, s: GameStatus) => void, 
    toggleRec: (id: string) => void,
    onPlay: (g: Game) => void,
    onSendMessage: (uid: string, title: string, content: string) => void
}) => {
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'REJECTED'>('ALL');
    const [search, setSearch] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedGameForReject, setSelectedGameForReject] = useState<Game | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const filteredGames = games.filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.author.toLowerCase().includes(search.toLowerCase());
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

    const handleAction = (e: React.MouseEvent, game: Game, action: 'approve' | 'off_shelf' | 'republish') => {
        e.stopPropagation(); // Stop row clicks

        let confirmMsg = '';
        let newStatus: GameStatus = 'draft';
        let feedback = '';

        switch(action) {
            case 'approve': 
                confirmMsg = `確認通過 ${game.title} 的審核？`; 
                newStatus = 'published'; 
                feedback = '已發佈遊戲';
                break;
            case 'off_shelf': 
                confirmMsg = `確定要將 ${game.title} 下架嗎？`; 
                newStatus = 'off_shelf'; 
                feedback = '遊戲已下架';
                break;
            case 'republish': 
                confirmMsg = `確認重新上架 ${game.title}？`; 
                newStatus = 'published'; 
                feedback = '遊戲已重新上架';
                break;
        }

        if (window.confirm(confirmMsg)) {
            updateStatus(game.id, newStatus);
            // Notify user on approve
            if (action === 'approve' && game.authorId) {
                onSendMessage(game.authorId, `遊戲《${game.title}》已發佈！`, `恭喜！您的遊戲已通過審核並上架。`);
            }
        }
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
                    {['ALL', 'PENDING', 'PUBLISHED', 'REJECTED'].map((f) => (
                        <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                            {f === 'ALL' ? '全部' : f === 'PENDING' ? '待審核' : f === 'PUBLISHED' ? '已上架' : '已下架/退回'}
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
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">狀態</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">推薦</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGames.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-bold">沒有找到符合條件的遊戲</td></tr>
                            ) : (
                                filteredGames.map(game => (
                                    <tr key={game.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shadow-sm">
                                                <img src={game.coverImageKeyword && game.coverImageKeyword.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/100/100`} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{game.title}</div>
                                            <div className="text-xs text-slate-500 font-medium">by {game.author}</div>
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
                                        <td className="p-4"><StatusBadge status={game.status} /></td>
                                        <td className="p-4 text-center">
                                            <button onClick={(e) => { e.stopPropagation(); toggleRec(game.id); }} className={`w-10 h-6 rounded-full p-1 transition-all duration-300 relative ${game.isRecommended ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${game.isRecommended ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </button>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100">
                                                <button onClick={(e) => { e.stopPropagation(); onPlay(game); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="試玩"><Play size={16} /></button>
                                                
                                                {game.status === 'review' && (
                                                    <>
                                                        <button onClick={(e) => handleAction(e, game, 'approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="通過"><CheckCircle size={16} /></button>
                                                        <button onClick={(e) => openRejectModal(e, game)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="退回"><XCircle size={16} /></button>
                                                    </>
                                                )}

                                                {game.status === 'published' && (
                                                    <button onClick={(e) => handleAction(e, game, 'off_shelf')} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="強制下架">
                                                        <EyeOff size={16} />
                                                    </button>
                                                )}

                                                {(game.status === 'off_shelf' || game.status === 'rejected') && (
                                                    <button onClick={(e) => handleAction(e, game, 'republish')} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="重新上架">
                                                        <CheckCircle size={16} />
                                                    </button>
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
        </div>
    );
};

// --- Sub-Component: Article Manager ---
const ArticleManager = ({ articles, onSave, onDelete, onRestore, onHardDelete, currentUser }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'TRASH'>('ACTIVE');
    const [editData, setEditData] = useState<Article | null>(null);
    
    // Filter articles based on viewMode and deletedAt
    const displayArticles = articles.filter((a: Article) => viewMode === 'ACTIVE' ? !a.deletedAt : !!a.deletedAt);

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
                            displayArticles.map(a => (
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
                                                <button onClick={() => { if(confirm("確定移至垃圾桶？")) onDelete(a.id); }} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => onRestore(a.id)} className="text-green-600 p-2 hover:bg-green-50 rounded mr-2" title="復原"><RotateCcw size={16}/></button>
                                                <button onClick={() => { if(confirm("確定永久刪除？無法復原！")) onHardDelete(a.id); }} className="text-red-600 p-2 hover:bg-red-50 rounded bg-red-100 font-bold text-xs">永久刪除</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Sub-Component: Academy Manager ---
const AcademyManager = ({ courses, onSaveCourse, onDeleteCourse, certificates, onSaveCertificate, onDeleteCertificate, exams, onSaveExam, onDeleteExam, allUsers }: any) => {
    const [subTab, setSubTab] = useState<'COURSES' | 'CERTS' | 'STUDENTS' | 'EXAMS'>('COURSES');
    const [editMode, setEditMode] = useState<'LIST' | 'EDIT_COURSE' | 'EDIT_CERT' | 'EDIT_EXAM'>('LIST');
    const [activeItem, setActiveItem] = useState<any>(null);

    // --- Course Editor ---
    const handleEditCourse = (c?: Course) => {
        setActiveItem(c || { id: `c_${Date.now()}`, title: '', description: '', level: 'Basic', duration: '30 分鐘', isLocked: false, completed: false, imageKeyword: 'book', videoUrl: '' });
        setEditMode('EDIT_COURSE');
    };
    const saveCourseEdit = () => { onSaveCourse(activeItem); setEditMode('LIST'); setActiveItem(null); };
    const handleDeleteCourse = (id: string) => {
        if(window.confirm('確定要刪除此課程嗎？')) {
            onDeleteCourse(id);
        }
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
                                const u = allUsers.find((user: User) => user.id === r.userId);
                                return <li key={idx} className="flex justify-between"><span>{u?.name || r.userId}</span><span>{r.date}</span></li>
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
                        <div><label className="text-xs font-bold text-slate-500">及格分數</label><input type="number" className="w-full p-2 border rounded bg-white text-slate-600" value={activeItem.passingScore} onChange={e => setActiveItem({...activeItem, passingScore: parseInt(e.target.value)})} /></div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {activeItem.questions.map((q: ExamQuestion, idx: number) => (
                        <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-slate-700">問題 {idx + 1}</span>
                                <button className="text-red-500" onClick={() => setActiveItem({...activeItem, questions: activeItem.questions.filter((_:any, i:number) => i !== idx)})}>刪除</button>
                            </div>
                            <input className="w-full p-2 border rounded mb-2 bg-white text-slate-600" placeholder="題目內容..." value={q.text} onChange={e => {
                                const qs = [...activeItem.questions]; qs[idx].text = e.target.value; setActiveItem({...activeItem, questions: qs});
                            }} />
                            <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => (
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
                                    {courses.map(c => (
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
                                    {certificates.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-900">{c.title}</td>
                                            <td className="p-4 text-slate-600">{c.recipients?.length || 0}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditCert(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => onDeleteCertificate(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
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
                                {allUsers.filter(u => !u.isAdmin).map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-900 flex items-center"><img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${s.avatarId}`} className="w-6 h-6 rounded-full mr-2"/>{s.name}</td>
                                        <td className="p-4 text-slate-600">Lv.{s.level}</td>
                                        <td className="p-4 text-green-600 font-bold">{certificates.filter(c => c.recipients?.some(r => r.userId === s.id)).length} 張證書</td>
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
                                    {exams.map(e => (
                                        <tr key={e.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-900">{e.title}</td>
                                            <td className="p-4 text-slate-600">{e.questions.length}</td>
                                            <td className="p-4 text-slate-600">{e.passingScore}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditExam(e)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16}/></button>
                                                <button onClick={() => onDeleteExam(e.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
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
        </div>
    );
};

// --- Sub-Component: Member Manager ---
const MemberManager = ({ allUsers, updateUser, deleteUser, systemSettings, updateSystemSettings }: { allUsers: User[], updateUser: (id: string, d: any) => void, deleteUser: (id: string) => void, systemSettings: SystemSettings, updateSystemSettings: (s: SystemSettings) => void }) => {
    const [view, setView] = useState<'USERS' | 'LEVELS'>('USERS');

    const handleLevelUpdate = (idx: number, field: string, value: any) => {
        const newLevels = [...systemSettings.levels];
        newLevels[idx] = { ...newLevels[idx], [field]: value };
        updateSystemSettings({ ...systemSettings, levels: newLevels });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex space-x-2 bg-white p-1 rounded-xl w-fit shadow-sm border border-slate-200">
                <button onClick={() => setView('USERS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'USERS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>用戶列表</button>
                <button onClick={() => setView('LEVELS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'LEVELS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>等級設定</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {view === 'USERS' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200"><tr className="text-xs font-bold text-slate-500"><th className="p-4">用戶</th><th className="p-4">角色</th><th className="p-4">等級/積分</th><th className="p-4">狀態</th><th className="p-4 text-right">操作</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {allUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="p-4 flex items-center font-bold text-slate-900"><img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.avatarId}`} className="w-8 h-8 rounded-full mr-3 bg-slate-100"/>{u.name}</td>
                                        <td className="p-4 text-xs font-bold uppercase text-slate-500">{u.isAdmin ? 'Admin' : u.role || 'User'}</td>
                                        <td className="p-4 text-sm text-slate-600">Lv.{u.level} <span className="text-slate-300 mx-1">|</span> {u.points} pts</td>
                                        <td className="p-4">{u.status === 'banned' ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">停權</span> : <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">正常</span>}</td>
                                        <td className="p-4 text-right">
                                            {!u.isAdmin && (
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
                ) : (
                    <div className="p-8">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><Trophy size={20} className="mr-2 text-yellow-500"/> 等級與經驗值曲線</h3>
                        <div className="space-y-4 max-w-2xl">
                            {systemSettings.levels.map((lvl, idx) => (
                                <div key={lvl.level} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                                    <div className="w-16 font-black text-indigo-600 text-xl">Lv.{lvl.level}</div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500">稱號名稱</label>
                                        <input className="w-full p-2 border rounded bg-white text-slate-600 text-sm mt-1" value={lvl.title} onChange={e => handleLevelUpdate(idx, 'title', e.target.value)} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500">所需經驗值</label>
                                        <input type="number" className="w-full p-2 border rounded bg-white text-slate-600 text-sm mt-1" value={lvl.expRequired} onChange={e => handleLevelUpdate(idx, 'expRequired', parseInt(e.target.value))} />
                                    </div>
                                    <div className="flex-none pt-5">
                                        <button className="text-red-400 hover:text-red-600 p-2" onClick={() => {
                                            const newLevels = systemSettings.levels.filter((_, i) => i !== idx);
                                            updateSystemSettings({ ...systemSettings, levels: newLevels });
                                        }}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={() => updateSystemSettings({...systemSettings, levels: [...systemSettings.levels, { level: systemSettings.levels.length + 1, expRequired: (systemSettings.levels.length + 1) * 1000, title: '新等級' }]})} variant="outline" className="w-full border-dashed">+ 新增等級</Button>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center"><Settings size={20} className="mr-2 text-slate-500"/> 全局參數設定</h3>
                            <div className="grid grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">每場遊戲基礎積分</label>
                                    <input type="number" className="w-full p-2 border rounded bg-white text-slate-600 text-sm mt-1" value={systemSettings.basePointsPerGame} onChange={e => updateSystemSettings({...systemSettings, basePointsPerGame: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">每場遊戲基礎經驗</label>
                                    <input type="number" className="w-full p-2 border rounded bg-white text-slate-600 text-sm mt-1" value={systemSettings.baseExpPerGame} onChange={e => updateSystemSettings({...systemSettings, baseExpPerGame: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
