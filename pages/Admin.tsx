
import React, { useState, useRef } from 'react';
import { ViewProps, Game, Article, Course } from '../types';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, LayoutDashboard, FileText, Settings, Play, Search, Filter, MoreHorizontal, Star, EyeOff, Trash2, Plus, Edit, Image as ImageIcon, Calendar, ArrowLeft, Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Quote, Code, Eye, GraduationCap, Award, Users, BookOpen, Clock, Lock } from 'lucide-react';
import { Button } from '../components/Button';

export const Admin: React.FC<ViewProps> = ({ setView, setCurrentGame }) => {
  const { games, updateGameStatus, toggleGameRecommendation, articles, saveArticle, deleteArticle, courses, saveCourse, deleteCourse } = useGame();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'GAMES' | 'ARTICLES' | 'ACADEMY'>('GAMES');

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
    <div className="min-h-screen bg-slate-100 flex font-sans">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all">
            <div className="p-6">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <Settings className="text-indigo-400" /> 管理控制台
                </h2>
                <p className="text-xs text-slate-500 mt-2">v2.6.0 CMS</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
                <button 
                    onClick={() => setActiveTab('GAMES')} 
                    className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'GAMES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <LayoutDashboard size={18} className="mr-3" /> 遊戲管理
                </button>
                <button 
                    onClick={() => setActiveTab('ARTICLES')} 
                    className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'ARTICLES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <FileText size={18} className="mr-3" /> 公告與文章
                </button>
                <button 
                    onClick={() => setActiveTab('ACADEMY')} 
                    className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'ACADEMY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <GraduationCap size={18} className="mr-3" /> 學院管理
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
                    {activeTab === 'GAMES' ? '遊戲審核與管理' : activeTab === 'ARTICLES' ? '內容發佈系統 (CMS)' : '創作學院管理系統'}
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
                    <GameManager 
                        games={games} 
                        updateStatus={updateGameStatus} 
                        toggleRec={toggleGameRecommendation} 
                        onPlay={(g) => { setCurrentGame(g); setView('PLAY'); }}
                    />
                ) : activeTab === 'ARTICLES' ? (
                    <ArticleManager 
                        articles={articles}
                        onSave={saveArticle}
                        onDelete={deleteArticle}
                        currentUser={user.name}
                    />
                ) : (
                    <AcademyManager 
                        courses={courses}
                        onSaveCourse={saveCourse}
                        onDeleteCourse={deleteCourse}
                    />
                )}
            </div>
        </div>
    </div>
  );
};

// --- Sub-Component: Game Manager ---
const GameManager = ({ games, updateStatus, toggleRec, onPlay }: { 
    games: Game[], 
    updateStatus: (id: string, s: any) => void, 
    toggleRec: (id: string) => void,
    onPlay: (g: Game) => void 
}) => {
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'REJECTED'>('ALL');
    const [search, setSearch] = useState('');

    const filteredGames = games.filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.author.toLowerCase().includes(search.toLowerCase());
        if (filter === 'ALL') return matchesSearch;
        if (filter === 'PENDING') return matchesSearch && g.status === 'review';
        if (filter === 'PUBLISHED') return matchesSearch && g.status === 'published';
        if (filter === 'REJECTED') return matchesSearch && (g.status === 'rejected' || g.status === 'off_shelf');
        return matchesSearch;
    });

    const StatusBadge = ({ status }: { status?: string }) => {
        switch(status) {
            case 'published': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">已上架</span>;
            case 'review': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">待審核</span>;
            case 'rejected': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">已退回</span>;
            case 'off_shelf': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">已下架</span>;
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">草稿</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
                    {['ALL', 'PENDING', 'PUBLISHED', 'REJECTED'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {f === 'ALL' ? '全部' : f === 'PENDING' ? '待審核' : f === 'PUBLISHED' ? '已上架' : '已下架/退回'}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="搜尋遊戲名稱或作者..." 
                        className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-72 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                                                <img src={game.coverImageKeyword.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword}/100/100`} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{game.title}</div>
                                            <div className="text-xs text-slate-500 font-medium">by {game.author}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">{new Date(game.createdAt || '').toLocaleDateString()}</div>
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
                                            <button 
                                                onClick={() => toggleRec(game.id)}
                                                className={`w-10 h-6 rounded-full p-1 transition-all duration-300 relative ${game.isRecommended ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${game.isRecommended ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </button>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100">
                                                <button onClick={() => onPlay(game)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="試玩"><Play size={16} /></button>
                                                
                                                {game.status === 'review' && (
                                                    <>
                                                        <button onClick={() => { if(confirm('確認通過審核？')) updateStatus(game.id, 'published') }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="通過"><CheckCircle size={16} /></button>
                                                        <button onClick={() => { if(confirm('確認退回？')) updateStatus(game.id, 'rejected') }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="退回"><XCircle size={16} /></button>
                                                    </>
                                                )}

                                                {game.status === 'published' && (
                                                    <button onClick={() => { if(confirm('確定要下架此遊戲嗎？')) updateStatus(game.id, 'off_shelf') }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="下架">
                                                        <EyeOff size={16} />
                                                    </button>
                                                )}

                                                {(game.status === 'off_shelf' || game.status === 'rejected') && (
                                                    <button onClick={() => updateStatus(game.id, 'published')} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="重新上架">
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
        </div>
    );
};

// --- Sub-Component: Article Manager ---
const ArticleManager = ({ articles, onSave, onDelete, currentUser }: { articles: Article[], onSave: (a: Article) => void, onDelete: (id: string) => void, currentUser: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Article | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCreate = () => {
        setEditData({
            id: `art_${Date.now()}`,
            title: '',
            imageUrl: '',
            category: '活動公告',
            tags: [],
            date: new Date().toISOString().split('T')[0],
            endDate: '',
            author: currentUser,
            content: '',
            isPublished: true,
            views: 0
        });
        setIsEditing(true);
    };

    const handleEdit = (article: Article) => {
        setEditData({ ...article });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!editData || !editData.title) return;
        onSave(editData);
        setIsEditing(false);
        setEditData(null);
    };

    const insertText = (before: string, after: string = '') => {
        if (!textareaRef.current || !editData) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);
        const newText = text.substring(0, start) + before + selection + after + text.substring(end);
        
        setEditData({...editData, content: newText});
        
        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
        <button type="button" onClick={onClick} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-md transition-colors" title={title}>
            <Icon size={16} />
        </button>
    );

    // --- List View (Now a Table) ---
    if (!isEditing) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
                            共 {articles.length} 篇文章
                        </div>
                    </div>
                    <Button onClick={handleCreate} className="shadow-lg shadow-indigo-500/20">
                        <Plus size={18} className="mr-2" /> 新增文章
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 pl-6">封面</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">文章資訊</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">分類</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">數據</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">狀態</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {articles.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-bold">尚無文章，點擊新增按鈕開始發佈。</td></tr>
                                ) : (
                                    articles.map(article => (
                                        <tr key={article.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shadow-sm relative">
                                                    {article.imageUrl ? (
                                                        <img src={article.imageUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20} /></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 line-clamp-1">{article.title}</div>
                                                <div className="text-xs text-slate-500 font-medium">by {article.author}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">{article.date}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    {article.category}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-xs text-slate-500 font-bold">
                                                    <Eye size={12} className="mr-1" />
                                                    {article.views || 0}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {article.isPublished ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">已發佈</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">草稿</span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100">
                                                    <button onClick={() => handleEdit(article)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => { if(confirm('確定刪除？')) onDelete(article.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- Edit View (Wordpress-like) ---
    return (
        <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => setIsEditing(false)} className="mr-4 p-2 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <h2 className="text-2xl font-black text-slate-800">{editData?.id.includes('new') ? '新增文章' : '編輯文章'}</h2>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center px-4 bg-white rounded-full border border-slate-200 shadow-sm">
                        <span className={`w-2 h-2 rounded-full mr-2 ${editData?.isPublished ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                        <select 
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none py-2 cursor-pointer"
                            value={editData?.isPublished ? 'published' : 'draft'}
                            onChange={(e) => setEditData(prev => prev ? {...prev, isPublished: e.target.value === 'published'} : null)}
                        >
                            <option value="draft">草稿</option>
                            <option value="published">已發佈</option>
                        </select>
                    </div>
                    <Button onClick={handleSave} className="shadow-lg shadow-indigo-500/20">發佈更新</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor Area */}
                <div className="lg:col-span-2 space-y-6">
                     <input 
                        className="w-full p-6 text-3xl font-black text-slate-600 placeholder:text-slate-300 border-none outline-none bg-white rounded-xl shadow-sm" 
                        value={editData?.title} 
                        onChange={e => setEditData(prev => prev ? {...prev, title: e.target.value} : null)}
                        placeholder="在此輸入標題"
                    />
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                        {/* Editor Toolbar */}
                        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 flex-wrap">
                            <ToolbarButton icon={Bold} title="粗體 (Cmd+B)" onClick={() => insertText('**', '**')} />
                            <ToolbarButton icon={Italic} title="斜體 (Cmd+I)" onClick={() => insertText('*', '*')} />
                            <div className="w-px h-5 bg-slate-300 mx-1"></div>
                            <ToolbarButton icon={Heading1} title="標題 1" onClick={() => insertText('# ', '')} />
                            <ToolbarButton icon={Heading2} title="標題 2" onClick={() => insertText('## ', '')} />
                            <div className="w-px h-5 bg-slate-300 mx-1"></div>
                            <ToolbarButton icon={List} title="清單" onClick={() => insertText('- ', '')} />
                            <ToolbarButton icon={Quote} title="引用" onClick={() => insertText('> ', '')} />
                            <ToolbarButton icon={Code} title="程式碼" onClick={() => insertText('`', '`')} />
                            <div className="w-px h-5 bg-slate-300 mx-1"></div>
                            <ToolbarButton icon={LinkIcon} title="連結" onClick={() => insertText('[連結文字](', ')')} />
                            <ToolbarButton icon={ImageIcon} title="圖片" onClick={() => insertText('![圖片描述](', ')')} />
                        </div>
                        
                        {/* Content Area */}
                        <textarea 
                            ref={textareaRef}
                            className="w-full flex-1 p-6 text-base leading-relaxed text-slate-600 bg-white border-none outline-none resize-none font-mono" 
                            value={editData?.content} 
                            onChange={e => setEditData(prev => prev ? {...prev, content: e.target.value} : null)}
                            placeholder="開始撰寫精彩內容..."
                        />
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Settings size={18} className="mr-2"/> 文章設定</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">固定連結 / Slug</label>
                                <input className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none" value={editData?.id} disabled />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">文章分類</label>
                                <select 
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editData?.category}
                                    onChange={e => setEditData(prev => prev ? {...prev, category: e.target.value} : null)}
                                >
                                    <option value="活動公告">🎉 活動公告</option>
                                    <option value="創作教學">🎓 創作教學</option>
                                    <option value="專欄">📰 專欄</option>
                                    <option value="系統通知">🔔 系統通知</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">作者</label>
                                <input 
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={editData?.author} 
                                    onChange={e => setEditData(prev => prev ? {...prev, author: e.target.value} : null)}
                                />
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">發佈時間</label>
                                <input 
                                    type="date"
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={editData?.date} 
                                    onChange={e => setEditData(prev => prev ? {...prev, date: e.target.value} : null)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center"><ImageIcon size={18} className="mr-2"/> 特色圖片</h3>
                        <div className="space-y-3">
                             <div className="aspect-video w-full bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-indigo-400 transition-colors group">
                                {editData?.imageUrl ? (
                                    <>
                                        <img src={editData.imageUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs">更換圖片</div>
                                    </>
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <ImageIcon size={24} className="mx-auto mb-1"/>
                                        <span className="text-xs">設定封面圖</span>
                                    </div>
                                )}
                             </div>
                             <input 
                                className="w-full p-2 text-xs border border-slate-200 rounded bg-white text-slate-600 font-mono outline-none focus:bg-white focus:border-indigo-300" 
                                placeholder="輸入圖片 URL..."
                                value={editData?.imageUrl}
                                onChange={e => setEditData(prev => prev ? {...prev, imageUrl: e.target.value} : null)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: Academy Manager ---
const AcademyManager = ({ courses, onSaveCourse, onDeleteCourse }: { courses: Course[], onSaveCourse: (c: Course) => void, onDeleteCourse: (id: string) => void }) => {
    const [subTab, setSubTab] = useState<'COURSES' | 'CERTS' | 'STUDENTS' | 'EXAMS'>('COURSES');
    
    // Mock Data for other tables
    const mockCerts = [
        { id: 'cert1', name: '基礎創作者', user: 'StoryMaster', date: '2023-11-20', code: 'CRT-8821' },
        { id: 'cert2', name: '進階敘事設計', user: 'GameGenius', date: '2023-12-05', code: 'CRT-9932' }
    ];
    const mockStudents = [
        { id: 'std1', name: 'StoryMaster', enrolled: 4, completed: 2, lastActive: '2024-01-10' },
        { id: 'std2', name: 'Newbie', enrolled: 1, completed: 0, lastActive: '2024-01-08' }
    ];
    const mockExams = [
        { id: 'exam1', name: '實境遊戲設計基礎考核', passingScore: 80, duration: '30 mins', takers: 45 },
        { id: 'exam2', name: '進階腳本邏輯測驗', passingScore: 85, duration: '60 mins', takers: 12 }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             {/* Sub Tabs */}
             <div className="flex space-x-2 bg-white p-1 rounded-xl w-fit shadow-sm border border-slate-200">
                <button onClick={() => setSubTab('COURSES')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'COURSES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>課程管理</button>
                <button onClick={() => setSubTab('CERTS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'CERTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>證書管理</button>
                <button onClick={() => setSubTab('STUDENTS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'STUDENTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>學員管理</button>
                <button onClick={() => setSubTab('EXAMS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${subTab === 'EXAMS' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>考試管理</button>
             </div>

             {/* Dynamic Content Table */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {subTab === 'COURSES' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 w-20">縮圖</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">課程名稱</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">難度/時長</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">狀態</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courses.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="p-4"><img src={`https://picsum.photos/seed/${c.imageKeyword}/50/50`} className="w-10 h-10 rounded bg-slate-200 object-cover"/></td>
                                        <td className="p-4"><div className="font-bold text-slate-900">{c.title}</div><div className="text-xs text-slate-500 line-clamp-1">{c.description}</div></td>
                                        <td className="p-4"><div className="text-xs font-bold text-slate-700">{c.level}</div><div className="text-xs text-slate-500">{c.duration}</div></td>
                                        <td className="p-4">{c.isLocked ? <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Pro Only</span> : <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">Free</span>}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => { if(confirm('確定刪除課程?')) onDeleteCourse(c.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={5} className="p-4 text-center border-t border-slate-100">
                                        <button onClick={() => alert("新增課程功能 (模擬)")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center w-full"><Plus size={16} className="mr-2"/> 新增課程</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {subTab === 'CERTS' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500">證書名稱</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">獲得學員</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">頒發日期</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">證書編號</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockCerts.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-900">{c.name}</td>
                                        <td className="p-4 text-slate-600">{c.user}</td>
                                        <td className="p-4 text-slate-600">{c.date}</td>
                                        <td className="p-4 font-mono text-xs text-slate-500">{c.code}</td>
                                        <td className="p-4 text-right"><button className="text-indigo-600 hover:underline text-xs font-bold">查看</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {subTab === 'STUDENTS' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500">學員名稱</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">已註冊課程</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">已完成</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">最後活躍</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockStudents.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-900">{s.name}</td>
                                        <td className="p-4 text-slate-600">{s.enrolled}</td>
                                        <td className="p-4 text-green-600 font-bold">{s.completed}</td>
                                        <td className="p-4 text-slate-500 text-xs">{s.lastActive}</td>
                                        <td className="p-4 text-right"><button className="text-red-500 hover:bg-red-50 p-1.5 rounded"><XCircle size={14}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {subTab === 'EXAMS' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500">考試名稱</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">及格分數</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">限時</th>
                                    <th className="p-4 text-xs font-bold text-slate-500">參加人數</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockExams.map(e => (
                                    <tr key={e.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-900">{e.name}</td>
                                        <td className="p-4 text-slate-600">{e.passingScore}分</td>
                                        <td className="p-4 text-slate-600">{e.duration}</td>
                                        <td className="p-4 text-slate-600">{e.takers}</td>
                                        <td className="p-4 text-right"><button className="text-indigo-600 hover:underline text-xs font-bold">編輯試題</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
             </div>
        </div>
    );
};
