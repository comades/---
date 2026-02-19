

import React, { useState } from 'react';
import { ViewProps } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Gamepad2, ArrowRight, Lock } from 'lucide-react';

export const Login: React.FC<ViewProps> = ({ setView }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const success = login(name, password);
      if (success) {
         if (name === 'admin' && password === '19327829319') {
             setView('ADMIN');
         } else {
             setView('HOME');
         }
      }
    }
  };

  const handleRegister = () => {
      alert("註冊功能尚未開放，目前請直接輸入暱稱登入試玩！");
  };

  const handleForgotPassword = () => {
      alert("請聯繫管理員重設密碼。");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
             <Gamepad2 size={36} />
           </div>
           <h2 className="text-2xl font-bold text-white">歡迎回到 羲光剧游 XiGuang</h2>
           <p className="text-slate-400 mt-2 text-sm">登入以儲存進度、製作遊戲並與好友競爭</p>
        </div>

        <div className="p-8">
           <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-900">
                 輸入你的暱稱 (帳號)
               </label>
               <div className="mt-2">
                 <input
                   id="username"
                   type="text"
                   required
                   className="block w-full rounded-xl border border-slate-300 py-3 px-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                   placeholder="例如：冒險王阿寶"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </div>
             </div>

             <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                        密碼 (一般用戶可免填)
                    </label>
                    <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                        忘記密碼？
                    </button>
                </div>
                <div className="mt-2 relative">
                    <input 
                        id="password"
                        type="password"
                        className="block w-full rounded-xl border border-slate-300 py-3 px-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                        placeholder="管理員請輸入密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
             </div>

             <Button type="submit" className="w-full" size="lg">
               開始冒險 <ArrowRight size={18} className="ml-2"/>
             </Button>

             <div className="mt-4 text-center">
                <p className="text-sm text-slate-500">
                    還沒有帳號嗎？{' '}
                    <button type="button" onClick={handleRegister} className="font-semibold text-indigo-600 hover:text-indigo-500">
                        立即註冊
                    </button>
                </p>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};