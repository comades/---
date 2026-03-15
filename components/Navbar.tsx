
import React, { useState, useRef, useEffect } from 'react';
import { Compass, PlusCircle, Gamepad2, Menu, X, Trophy, LogIn, User, Coins, LogOut, PenTool, GraduationCap, LayoutDashboard, Bell, Languages, ShoppingBag } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getUserDisplayName } from '../utils/userUtils';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (user) {
      updateProfile({ language: lng as any });
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 font-medium ${
        currentView === view
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  const unreadCount = (user?.messages || []).filter(m => !m.isRead).length || 0;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setView('EXPLORE')}
        >
          <span className="text-xl font-black text-[#B21D2D]">
            羲光剧游 XiGuang
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
          <NavItem view="EXPLORE" icon={Compass} label={t('探索')} />
          <NavItem view="ACADEMY" icon={GraduationCap} label={t('創作學院')} />
          <NavItem view="SHOP" icon={ShoppingBag} label={t('商店')} />
          <NavItem view="LEADERBOARD" icon={Trophy} label={t('排行榜')} />
          
          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {/* Language Switcher */}
          <div className="relative" ref={languageDropdownRef}>
            <button 
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Languages size={20} />
            </button>
            {isLanguageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <button onClick={() => { changeLanguage('zh-TW'); setIsLanguageDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">{t('繁體中文')}</button>
                <button onClick={() => { changeLanguage('zh-CN'); setIsLanguageDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">{t('简体中文')}</button>
                <button onClick={() => { changeLanguage('en'); setIsLanguageDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">{t('English')}</button>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Creation Button */}
              <button 
                onClick={() => setView('CREATE')}
                className="hidden lg:flex items-center space-x-1 px-4 py-2 rounded-full bg-[#B21D2D] text-white font-bold border-0 transition-all text-sm font-sans"
              >
                <PlusCircle size={16} />
                <span>{t('創作遊戲')}</span>
              </button>

              {/* Message/Notification Button */}
              <button
                onClick={() => setView('PROFILE_MESSAGES')}
                className="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors mx-1"
                title={t('訊息通知')}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden">
                    <img 
                       src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`} 
                       alt="Avatar" 
                       className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:flex flex-col items-start pr-2">
                      <span className="text-xs font-bold text-slate-700 leading-none mb-0.5">{getUserDisplayName(user)}</span>
                      <div className="flex items-center text-yellow-600 text-[10px] font-bold">
                           <Coins size={10} className="mr-1" />
                           {user.points}
                      </div>
                  </div>
                </div>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                    <div className="px-4 py-4 border-b border-slate-50 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('等級')} {user.level}</p>
                         {user.isPro && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-black">PRO</span>}
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    </div>
                    <div className="py-2">
                      {user.isAdmin && (
                          <button onClick={() => { setView('ADMIN'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-bold">
                            <LayoutDashboard className="mr-3 h-4 w-4 text-indigo-600" /> {t('管理後台')}
                          </button>
                      )}
                      <button onClick={() => { setView('PROFILE'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <User className="mr-3 h-4 w-4 text-slate-400" /> {t('個人檔案')}
                      </button>
                      <button onClick={() => { setView('EXPLORE'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Compass className="mr-3 h-4 w-4 text-slate-400" /> {t('探索')}
                      </button>
                      <button onClick={() => { setView('ACADEMY'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <GraduationCap className="mr-3 h-4 w-4 text-slate-400" /> {t('創作學院')}
                      </button>
                      <button onClick={() => { setView('SHOP'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <ShoppingBag className="mr-3 h-4 w-4 text-slate-400" /> {t('商店')}
                      </button>
                      <button onClick={() => { setView('LEADERBOARD'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Trophy className="mr-3 h-4 w-4 text-slate-400" /> {t('排行榜')}
                      </button>
                    </div>
                    <div className="py-2 border-t border-slate-100">
                      <button onClick={() => { logout(); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                        <LogOut className="mr-3 h-4 w-4 text-red-500" /> {t('登出帳號')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('LOGIN')}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {t('登入')}
              </button>
              <button
                onClick={() => setView('LOGIN')}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
              >
                {t('註冊')}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Profile/Login Button */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <button 
              onClick={() => setView('PROFILE')}
              className="h-8 w-8 rounded-full bg-indigo-100 overflow-hidden border border-slate-200"
            >
              <img 
                src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`} 
                alt="Avatar" 
                className="h-full w-full object-cover"
              />
            </button>
          ) : (
            <button 
              onClick={() => setView('LOGIN')}
              className="p-2 text-slate-600"
            >
              <User size={20} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
