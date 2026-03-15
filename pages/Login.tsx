

import React, { useState, useEffect } from 'react';
import { ViewProps } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Gamepad2, ArrowRight, Lock, AlertTriangle, Phone, MessageCircle, Mail } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export const Login: React.FC<ViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loginMethod, setLoginMethod] = useState<'WECHAT' | 'PHONE' | 'LEGACY'>('WECHAT');
  const { login, user } = useAuth();
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        setView('ADMIN');
      } else {
        setView('EXPLORE');
      }
    }
  }, [user, setView]);

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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
      alert(t('loginErrors.failed'));
    }
  };

  const handleWeChatLogin = () => {
    alert(t('loginErrors.wechatDemo'));
    // In a real app, this would redirect to WeChat OAuth
  };

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('loginErrors.phoneDemo'));
    // In a real app, this would trigger Firebase Phone Auth
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const success = login(name, password);
      if (!success) {
          alert(t('loginErrors.legacyFailed'));
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
             <Gamepad2 size={36} />
           </div>
           <h2 className="text-2xl font-bold text-white">{t('login.title')}</h2>
           <p className="text-slate-400 mt-2 text-sm">{t('login.subtitle')}</p>
        </div>

        <div className="p-8">
           <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
             <button 
               onClick={() => setLoginMethod('WECHAT')}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'WECHAT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {t('login.methods.wechat')}
             </button>
             <button 
               onClick={() => setLoginMethod('PHONE')}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'PHONE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {t('login.methods.phone')}
             </button>
             <button 
               onClick={() => setLoginMethod('LEGACY')}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'LEGACY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {t('login.methods.legacy')}
             </button>
           </div>

           {loginMethod === 'WECHAT' && (
             <div className="space-y-6 text-center">
               <div className="py-8 flex flex-col items-center">
                 <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                   <MessageCircle size={40} />
                 </div>
                 <p className="text-slate-600 text-sm mb-6">{t('login.wechatDesc')}</p>
                 <Button onClick={handleWeChatLogin} className="w-full bg-emerald-500 hover:bg-emerald-600 border-0" size="lg">
                   {t('login.wechatBtn')}
                 </Button>
               </div>
             </div>
           )}

           {loginMethod === 'PHONE' && (
             <form onSubmit={handlePhoneLogin} className="space-y-6">
               <div>
                 <label className="block text-sm font-medium leading-6 text-slate-900">{t('login.phoneLabel')}</label>
                 <div className="mt-2 relative">
                   <input
                     type="tel"
                     required
                     className="block w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                     placeholder={t('login.phonePlaceholder')}
                     value={phoneNumber}
                     onChange={(e) => setPhoneNumber(e.target.value)}
                   />
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 </div>
               </div>
               <Button type="submit" className="w-full" size="lg">
                 {t('login.phoneBtn')}
               </Button>
             </form>
           )}

           {loginMethod === 'LEGACY' && (
             <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                 <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-900">
                   {t('login.accountLabel')}
                 </label>
                 <div className="mt-2">
                   <input
                     id="username"
                     type="text"
                     required
                     className="block w-full rounded-xl border border-slate-300 py-3 px-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                     placeholder=""
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                   />
                 </div>
               </div>

               <div>
                  <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                          {t('login.passwordLabel')}
                      </label>
                  </div>
                  <div className="mt-2 relative">
                      <input 
                          id="password"
                          type="password"
                          className="block w-full rounded-xl border border-slate-300 py-3 px-4 bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                          placeholder=""
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
               </div>

               <Button type="submit" className="w-full" size="lg">
                 {t('login.loginBtn')} <ArrowRight size={18} className="ml-2"/>
               </Button>
             </form>
           )}

           <div className="mt-8 pt-8 border-t border-slate-100">
             <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">{t('login.otherMethods')}</p>
             <button 
               onClick={handleGoogleLogin}
               className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700"
             >
               <Mail size={18} className="text-red-500" />
               {t('login.googleBtn')}
             </button>
           </div>
        </div>
      </div>

      {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50 whitespace-nowrap">
              <AlertTriangle size={20} className="text-yellow-400" />
              <span className="font-bold">{toastMessage}</span>
          </div>
      )}
    </div>
  );
};