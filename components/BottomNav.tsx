
import React from 'react';
import { Compass, PlusCircle, User, ShoppingBag, Trophy, GraduationCap } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: 'EXPLORE' as ViewState, icon: Compass, label: '探索' },
    { view: 'ACADEMY' as ViewState, icon: GraduationCap, label: '學院' },
    { view: 'CREATE' as ViewState, icon: PlusCircle, label: '創作' },
    { view: 'SHOP' as ViewState, icon: ShoppingBag, label: '商店' },
    { view: 'PROFILE' as ViewState, icon: User, label: '我的' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50 px-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={20} className={isActive ? 'scale-110' : ''} />
              <span className="text-[10px] mt-1 font-bold">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
