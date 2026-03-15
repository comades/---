
import React, { useState, useRef, useEffect } from 'react';
import { ViewProps, Post, Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/Button';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Coins, Award, Gamepad2, Calendar, Camera, Edit, Heart, Share2, MoreHorizontal, Image as ImageIcon, MessageCircle, PenLine, Check, X, Share, Trash2, Repeat, Mail, Bell, Circle, AlertTriangle, CheckCircle } from 'lucide-react';
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

interface ProfileProps extends ViewProps {
    initialTab?: 'GAMES' | 'CREATIVE_CIRCLE' | 'MESSAGES';
}

export const Profile: React.FC<ProfileProps> = ({ setView, initialTab = 'GAMES' }) => {
  const { t } = useTranslation();
  const { user, updateProfile, updateName, markMessageAsRead } = useAuth();
  const { games, posts, addPost, deletePost, toggleLikePost } = useGame();
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab] = useState<'GAMES' | 'CREATIVE_CIRCLE' | 'MESSAGES'>(initialTab);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col p-4">
        <p className="text-slate-500 mb-4">{t('profile.loginRequired')}</p>
        <Button onClick={() => setView('LOGIN')}>{t('profile.loginBtn')}</Button>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const result = await compressImage(file);
              if (type === 'avatar') {
                  updateProfile({ avatarUrl: result });
              } else {
                  updateProfile({ profileBanner: result });
              }
          } catch (e) {
              console.error(e);
              setToastMessage(t('profile.uploadFailed'));
              setTimeout(() => setToastMessage(''), 3000);
          }
      }
  };

  const handlePostSubmit = () => {
      if (!newPostContent.trim()) return;
      const newPost: Post = {
          id: `post_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`,
          content: newPostContent,
          likes: [],
          comments: [],
          shares: 0,
          createdAt: new Date().toISOString()
      };
      addPost(newPost);
      setNewPostContent('');
  };

  const handleNameEdit = () => {
      setTempName(user.name);
      setIsEditingName(true);
  };

  const saveName = () => {
      if (tempName.trim()) {
          updateName(tempName);
      }
      setIsEditingName(false);
  };

  const handleShareProfile = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setToastMessage("個人主頁連結已複製！");
      setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRepost = (originalPost: Post) => {
      const repost: Post = {
          id: `post_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`,
          content: `轉發 @${originalPost.userName} 的動態：\n\n${originalPost.content}`,
          likes: [],
          comments: [],
          shares: 0,
          createdAt: new Date().toISOString()
      };
      addPost(repost);
      setToastMessage(t('profile.reposted'));
      setTimeout(() => setToastMessage(''), 3000);
  };

  // Calculate stats
  const nextLevelExp = user.level * 100;
  const progressPercent = Math.min((user.exp / nextLevelExp) * 100, 100);
  const myGames = (games || []).filter(g => g.author === user.name && g.status !== 'deleted');
  const unreadMessagesCount = (user.messages || []).filter(m => !m.isRead).length || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-12" onClick={() => setActivePostMenuId(null)}>
      {/* Header Card */}
      <div className="bg-white shadow-sm border-b border-slate-200 overflow-hidden relative group/banner">
          <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
              {user.profileBanner && <img src={user.profileBanner} className="w-full h-full object-cover" alt="Banner" />}
              <div className="absolute top-4 right-4 opacity-0 group-hover/banner:opacity-100 transition-opacity">
                  <button onClick={() => bannerInputRef.current?.click()} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"><Camera size={18} /></button>
                  <input ref={bannerInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
              </div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
             <div className="flex flex-col sm:flex-row items-end -mt-16 mb-6 relative">
                 <div className="relative group/avatar">
                     <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-lg relative z-10">
                        <div className="h-full w-full rounded-2xl bg-slate-100 overflow-hidden relative">
                           <img 
                             src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`} 
                             alt="Profile" 
                             className="h-full w-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                               <Camera className="text-white" />
                           </div>
                           <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                        </div>
                     </div>
                 </div>
                 
                 <div className="mt-4 sm:mt-24 sm:ml-6 flex-1 text-center sm:text-left w-full sm:w-auto">
                     <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        {isEditingName ? (
                            <div className="flex items-center bg-white rounded-lg p-1 border border-slate-300">
                                <input 
                                    className="bg-white text-slate-600 border-none outline-none text-xl font-bold w-40 px-2"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={saveName} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={18} /></button>
                                <button onClick={() => setIsEditingName(false)} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={18} /></button>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
                                <button onClick={handleNameEdit} className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <PenLine size={18} />
                                </button>
                            </>
                        )}
                     </div>
                     
                     <div className="flex items-center justify-center sm:justify-start gap-6 text-slate-600 text-sm mb-3">
                         <div className="flex flex-col sm:flex-row items-center sm:gap-1">
                             <span className="font-bold text-slate-900 text-lg">{user.followers || 0}</span>
                             <span className="text-xs">粉絲</span>
                         </div>
                         <div className="flex flex-col sm:flex-row items-center sm:gap-1">
                             <span className="font-bold text-slate-900 text-lg">{user.following || 0}</span>
                             <span className="text-xs">關注</span>
                         </div>
                     </div>

                     <div className="flex items-center justify-center sm:justify-start text-slate-500 text-sm">
                        <Calendar size={14} className="mr-1" />
                        <span>加入於 {new Date(user.joinedDate).toLocaleDateString()}</span>
                     </div>
                     <div className="mt-2 text-sm text-slate-600">
                        <p>手機：{user.phone || '未設定'}</p>
                        <p>收件地址：{user.address || '未設定'}</p>
                        <p>微信帳號：{user.wechatId || '未設定'}</p>
                     </div>
                 </div>

                 <div className="mt-4 sm:mt-0 flex gap-2">
                     <Button variant="outline" size="sm" onClick={handleShareProfile} className="border-slate-300 text-slate-600">
                       <Share size={16} className="mr-2" /> 分享主頁
                     </Button>
                     <Button size="sm" onClick={() => setView('CREATE')}>
                       + 創作遊戲
                     </Button>
                 </div>
             </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
            {/* Level & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">等級</span>
                        <span className="text-indigo-600 font-black text-xl">{user.level}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="text-xs text-right text-slate-400 mt-1">{user.exp} / {nextLevelExp} XP</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">羲光點數</p>
                        <p className="text-2xl font-black text-yellow-500">{user.points}</p>
                    </div>
                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                        <Coins size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">成就</p>
                        <p className="text-2xl font-black text-indigo-600">3</p>
                    </div>
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <Award size={20} />
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex space-x-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('GAMES')} className={`pb-3 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'GAMES' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>我的遊戲 ({myGames.length})</button>
                <button onClick={() => setActiveTab('CREATIVE_CIRCLE')} className={`pb-3 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'CREATIVE_CIRCLE' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>創作圈</button>
                <button onClick={() => setActiveTab('MESSAGES')} className={`pb-3 font-bold text-sm transition-all whitespace-nowrap flex items-center ${activeTab === 'MESSAGES' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                    訊息通知 
                    {unreadMessagesCount > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{unreadMessagesCount}</span>}
                </button>
            </div>

            {activeTab === 'GAMES' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myGames.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500 mb-4">還沒有創作任何遊戲</p>
                            <Button variant="secondary" onClick={() => setView('CREATE')}>立即創作</Button>
                        </div>
                    ) : (
                        (myGames || []).map(game => (
                            <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
                                <img src={game.coverImageKeyword?.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/100/100`} className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-slate-900">{game.title}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2">{game.description}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                        game.status === 'published' ? 'bg-green-100 text-green-700' :
                                        game.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                                        game.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        game.status === 'off_shelf' ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {game.status === 'published' ? '已發佈' : 
                                         game.status === 'review' ? '審核中' : 
                                         game.status === 'rejected' ? '退回' : 
                                         game.status === 'off_shelf' ? '已下架' : '草稿'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                 </div>
            )}
            
            {activeTab === 'CREATIVE_CIRCLE' && (
                 <div className="space-y-6">
                     {/* Create Post */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                         <div className="flex gap-3">
                             <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                                 <img src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`} className="h-full w-full object-cover" />
                             </div>
                             <div className="flex-1">
                                 <textarea 
                                    className="w-full bg-white text-slate-600 rounded-xl p-3 text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-100 resize-none transition-all focus:border-indigo-300" 
                                    rows={3} 
                                    placeholder="分享你的創作心得或生活點滴..."
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                 ></textarea>
                                 <div className="flex justify-between items-center mt-3">
                                     <div className="flex gap-2 text-slate-400">
                                         <button className="p-2 hover:bg-slate-50 rounded-full"><ImageIcon size={18} /></button>
                                     </div>
                                     <div className="flex gap-2">
                                          <Button size="sm" onClick={handlePostSubmit} disabled={!newPostContent.trim()}>發佈</Button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Post Feed */}
                     {(posts || []).map(post => (
                         <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative">
                             <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden cursor-pointer">
                                         <img src={post.userAvatar || undefined} className="h-full w-full object-cover" />
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-900 text-sm cursor-pointer hover:text-indigo-600">{post.userName}</p>
                                         <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
                                     </div>
                                 </div>
                                 <div className="relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActivePostMenuId(activePostMenuId === post.id ? null : post.id); }}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                    {activePostMenuId === post.id && (
                                        <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={() => { setPostToDelete(post.id); setConfirmModalOpen(true); setActivePostMenuId(null); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center"
                                            >
                                                <Trash2 size={14} className="mr-2"/> 刪除
                                            </button>
                                        </div>
                                    )}
                                 </div>
                             </div>
                             <p className="text-slate-700 text-sm mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                             <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-slate-500 text-sm font-medium">
                                 <button onClick={() => toggleLikePost(post.id, user.id)} className={`flex items-center transition-colors group ${post.likes.includes(user.id) ? 'text-red-500' : 'hover:text-red-500'}`}>
                                     <div className="p-1.5 rounded-full group-hover:bg-red-50 mr-1.5 transition-colors">
                                         <Heart size={18} className={post.likes.includes(user.id) ? "fill-red-500" : ""} />
                                     </div> 
                                     {post.likes.length}
                                 </button>
                                 <button onClick={() => { setToastMessage("留言功能開發中"); setTimeout(() => setToastMessage(''), 3000); }} className="flex items-center hover:text-blue-500 transition-colors group">
                                     <div className="p-1.5 rounded-full group-hover:bg-blue-50 mr-1.5 transition-colors">
                                         <MessageCircle size={18} />
                                     </div> 
                                     {post.comments ? post.comments.length : 0}
                                 </button>
                                 <button className="flex items-center hover:text-green-500 transition-colors group" onClick={() => { navigator.clipboard.writeText("Post Link"); setToastMessage("連結已複製！"); setTimeout(() => setToastMessage(''), 3000); }}>
                                     <div className="p-1.5 rounded-full group-hover:bg-green-50 mr-1.5 transition-colors">
                                         <Share2 size={18} />
                                     </div> 
                                     {post.shares || 0}
                                 </button>
                                 <button className="flex items-center hover:text-purple-500 transition-colors group" onClick={() => handleRepost(post)}>
                                     <div className="p-1.5 rounded-full group-hover:bg-purple-50 mr-1.5 transition-colors">
                                         <Repeat size={18} />
                                     </div> 
                                     轉發
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
            )}

            {activeTab === 'MESSAGES' && (
                <div className="space-y-4">
                    {user.messages && user.messages.length > 0 ? (
                        (user.messages || []).map((msg: Message) => (
                            <div key={msg.id} 
                                onClick={() => markMessageAsRead(msg.id)}
                                className={`bg-white rounded-2xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${msg.isRead ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/30'}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {!msg.isRead && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                                        <h3 className={`font-bold text-slate-800 ${!msg.isRead ? 'text-indigo-900' : ''}`}>{msg.title}</h3>
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(msg.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{msg.content}</p>
                                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                                    <span>From: {msg.sender}</span>
                                    {msg.type === 'notification' && <Bell size={12} />}
                                    {msg.type === 'system' && <Mail size={12} />}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Mail className="mx-auto text-slate-300 mb-2" size={32}/>
                            <p className="text-slate-500">暫無訊息</p>
                        </div>
                    )}
                </div>
            )}
      </div>

      <ConfirmModal 
          isOpen={confirmModalOpen}
          title="確認刪除"
          message="確定要刪除此動態嗎？此操作無法復原！"
          onConfirm={() => {
              if (postToDelete) deletePost(postToDelete);
              setConfirmModalOpen(false);
              setPostToDelete(null);
          }}
          onCancel={() => { setConfirmModalOpen(false); setPostToDelete(null); }}
          confirmText="刪除"
          confirmColor="bg-red-600 hover:bg-red-700"
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
