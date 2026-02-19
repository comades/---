
import React, { useState, useRef, useEffect } from 'react';
import { Compass, PlusCircle, Gamepad2, Menu, X, Trophy, LogIn, User, Coins, LogOut, PenTool, GraduationCap, LayoutDashboard } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setView('HOME')}
        >
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Gamepad2 className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            羲光剧游 XiGuang
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
          <NavItem view="HOME" icon={Gamepad2} label="首頁" />
          <NavItem view="EXPLORE" icon={Compass} label="探索" />
          <NavItem view="ACADEMY" icon={GraduationCap} label="創作學院" />
          <NavItem view="LEADERBOARD" icon={Trophy} label="排行榜" />
          
          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Creation Button */}
              <button 
                onClick={() => setView('CREATE')}
                className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                <PenTool size={16} />
                <span>創作遊戲</span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center space-x-3 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 overflow-hidden">
                    <img 
                       src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`} 
                       alt="Avatar" 
                       className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                      <span className="text-xs font-bold text-slate-700 leading-none mb-0.5">{user.name}</span>
                      <div className="flex items-center text-yellow-600 text-[10px] font-bold bg-yellow-50 px-1.5 rounded-full border border-yellow-200">
                           <Coins size={10} className="mr-1" />
                           {user.points}
                      </div>
                  </div>
                </div>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <p className="text-sm text-slate-500">等級 {user.level}</p>
                         {user.isPro && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">PRO</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    </div>
                    <div className="py-1">
                      {user.isAdmin && (
                          <button onClick={() => { setView('ADMIN'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-bold">
                            <LayoutDashboard className="mr-3 h-4 w-4 text-purple-600" /> 管理後台
                          </button>
                      )}
                      <button onClick={() => { setView('PROFILE'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <User className="mr-3 h-4 w-4 text-slate-400" /> 個人檔案
                      </button>
                      <button onClick={() => { setView('ACADEMY'); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <GraduationCap className="mr-3 h-4 w-4 text-slate-400" /> 創作學院
                      </button>
                    </div>
                    <div className="py-1 border-t border-slate-100">
                      <button onClick={() => { logout(); setIsProfileDropdownOpen(false); }} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="mr-3 h-4 w-4 text-red-500" /> 登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setView('LOGIN')}
              className="flex items-center space-x-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              <LogIn size={16} />
              <span>登入 / 註冊</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-xl">
          <NavItem view="HOME" icon={Gamepad2} label="首頁" />
          <NavItem view="EXPLORE" icon={Compass} label="探索" />
          <NavItem view="ACADEMY" icon={GraduationCap} label="創作學院" />
          <NavItem view="LEADERBOARD" icon={Trophy} label="排行榜" />
          
          <div className="border-t border-slate-100 my-2 pt-2">
            {user ? (
               <>
                 <div className="flex items-center px-4 py-2 space-x-3 mb-2">
                   <div className="h-10 w-10 rounded-full bg-indigo-100 overflow-hidden">
                     <img src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId}`} alt="Avatar" className="w-full h-full object-cover"/>
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{user.name}</p>
                        {user.isPro && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">PRO</span>}
                     </div>
                     <p className="text-xs text-yellow-600 font-bold flex items-center"><Coins size={12} className="mr-1"/> {user.points} 點</p>
                   </div>
                 </div>
                 {user.isAdmin && <NavItem view="ADMIN" icon={LayoutDashboard} label="管理後台" />}
                 <NavItem view="PROFILE" icon={User} label="個人檔案" />
                 <NavItem view="CREATE" icon={PlusCircle} label="創作遊戲" />
                 <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex w-full items-center space-x-2 px-4 py-2 rounded-full font-medium text-red-600 hover:bg-red-50">
                   <LogOut size={18} /> <span>登出</span>
                 </button>
               </>
            ) : (
              <button
                onClick={() => {
                  setView('LOGIN');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-white font-bold"
              >
                <LogIn size={18} />
                <span>登入 / 註冊</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
