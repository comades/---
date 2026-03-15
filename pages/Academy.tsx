import React, { useState, useEffect } from 'react';
import { ViewProps, Course } from '../types';
import { Button } from '../components/Button';
import { useTranslation } from 'react-i18next';
import { GraduationCap, BookOpen, Lock, PlayCircle, CheckCircle, Award, Star, Clock, Zap, Sparkles, X, Crown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

export const Academy: React.FC<ViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { courses } = useGame();
  const [showPaywall, setShowPaywall] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleStartCourse = (course: Course) => {
    if (course.isLocked && (!user?.isPro)) {
        setShowPaywall(true);
    } else {
        alert(`開始課程: ${course.title}`);
    }
  };

  const handleExam = () => {
      if (!user?.isPro) {
          setShowPaywall(true);
          return;
      }
      alert("進入認證考試系統...");
  };

  if (!user) {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center flex-col p-4 bg-slate-50">
            <div className="text-center max-w-md">
                <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
                    <GraduationCap size={48} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('academy.title')}</h2>
                <p className="text-slate-500 mb-6">{t('academy.loginRequired')}</p>
                <Button onClick={() => setView('LOGIN')}>{t('academy.loginBtn')}</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
             <GraduationCap size={400} />
         </div>
         <div className="max-w-5xl mx-auto relative z-10">
             <div className="inline-flex items-center bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-bold text-indigo-300 mb-4">
                 <Sparkles size={12} className="mr-2" /> {t('academy.officialCourse')}
             </div>
             <h1 className="text-4xl md:text-5xl font-black mb-4">{t('academy.title')}</h1>
             <p className="text-xl text-slate-300 max-w-2xl">
                 {t('academy.subtitle')}
             </p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
          
          {/* Progress Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Award size={32} />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-slate-900">{t('academy.progress.title')}</h3>
                      <p className="text-slate-500 text-sm">{t('academy.progress.desc')}</p>
                  </div>
              </div>
              <div className="flex-1 w-full md:w-auto max-w-md">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>{t('academy.progress.studyProgress', { progress: 25 })}</span>
                      <span>{t('academy.progress.courseCount', { count: 1 })}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-indigo-600 h-3 rounded-full w-1/4"></div>
                  </div>
              </div>
              <Button 
                onClick={handleExam}
                variant={user.isPro ? 'primary' : 'outline'}
                className={user.isPro ? "bg-gradient-to-r from-amber-500 to-orange-500 border-none shadow-orange-500/20" : ""}
              >
                  {user.isPro ? t('academy.examBtn.take') : t('academy.examBtn.unlock')}
              </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course List */}
              <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                      <BookOpen className="mr-2 text-indigo-600" /> {t('academy.coreCourses')}
                  </h2>
                  
                  {(courses || []).map((course) => (
                      <div key={course.id} className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col sm:flex-row overflow-hidden group ${course.isLocked && !user.isPro ? 'border-slate-200 opacity-80' : 'border-indigo-100'}`}>
                          <div className="sm:w-48 h-32 sm:h-auto bg-slate-200 relative">
                              <img src={`https://picsum.photos/seed/${course.imageKeyword}/300/200`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"/>
                              {course.isLocked && !user.isPro && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <Lock className="text-white" size={24} />
                                  </div>
                              )}
                              {course.completed && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                                      <CheckCircle size={16} />
                                  </div>
                              )}
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                          course.level === 'Basic' ? 'bg-green-100 text-green-700' : 
                                          course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                      }`}>
                                          {t(`academy.levels.${course.level.toLowerCase()}`)}
                                      </span>
                                      <span className="text-xs text-slate-400 flex items-center"><Clock size={12} className="mr-1"/> {course.duration}</span>
                                  </div>
                                  <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                                  <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                  <button 
                                    onClick={() => handleStartCourse(course)}
                                    className={`text-sm font-bold flex items-center ${course.isLocked && !user.isPro ? 'text-slate-400' : 'text-indigo-600 hover:text-indigo-700'}`}
                                  >
                                      {course.completed ? t('academy.course.review') : (course.isLocked && !user.isPro ? t('academy.course.upgrade') : t('academy.course.start'))}
                                      {!(course.isLocked && !user.isPro) && <PlayCircle size={16} className="ml-1" />}
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                  {/* Pro Promo Card */}
                  {!user.isPro && (
                      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                          <div className="relative z-10">
                              <h3 className="font-black text-xl mb-2 flex items-center"><Zap className="text-yellow-400 mr-2" fill="currentColor"/> {t('academy.proPromo.title')}</h3>
                              <ul className="space-y-2 text-sm text-indigo-100 mb-6">
                                  {(() => {
                                      const benefits = t('academy.proPromo.benefits', { returnObjects: true });
                                      return Array.isArray(benefits) ? (benefits as string[]).map((benefit: string, i: number) => (
                                          <li key={i} className="flex items-center"><CheckCircle size={14} className="mr-2"/> {benefit}</li>
                                      )) : null;
                                  })()}
                              </ul>
                              <Button onClick={() => setShowPaywall(true)} className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none">
                                  {t('academy.proPromo.btn')}
                              </Button>
                          </div>
                      </div>
                  )}

                  {/* Certification Benefits */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 mb-4">{t('academy.benefits.title')}</h3>
                      <div className="space-y-4">
                          <div className="flex gap-3">
                              <div className="mt-1 bg-amber-100 p-1.5 rounded-lg text-amber-600 h-fit">
                                  <Award size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-sm text-slate-800">{t('academy.benefits.badge.title')}</h4>
                                  <p className="text-xs text-slate-500">{t('academy.benefits.badge.desc')}</p>
                              </div>
                          </div>
                          <div className="flex gap-3">
                              <div className="mt-1 bg-blue-100 p-1.5 rounded-lg text-blue-600 h-fit">
                                  <Star size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-sm text-slate-800">{t('academy.benefits.recommend.title')}</h4>
                                  <p className="text-xs text-slate-500">{t('academy.benefits.recommend.desc')}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Mock Paywall Modal */}
      {showPaywall && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                  <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                      <X size={24} />
                  </button>
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                          <Crown size={32} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">{t('academy.paywall.title')}</h2>
                      <p className="text-slate-500 mt-2">{t('academy.paywall.desc')}</p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                      {(() => {
                          const features = t('academy.paywall.features', { returnObjects: true });
                          return Array.isArray(features) ? (features as string[]).map((feature: string, i: number) => (
                              <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center">
                                  <CheckCircle className="text-green-500 mr-3" size={20} />
                                  <span className="font-bold text-slate-700 text-sm">{feature}</span>
                              </div>
                          )) : null;
                      })()}
                  </div>

                  <Button className="w-full text-lg py-4 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-xl shadow-indigo-500/20" onClick={() => {
                      alert(t('common.success'));
                      setShowPaywall(false);
                  }}>
                      {t('academy.paywall.btn')}
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-4">{t('academy.paywall.cancel')}</p>
              </div>
          </div>
      )}

      {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50 whitespace-nowrap">
              <AlertTriangle size={20} className="text-yellow-400" />
              <span className="font-bold">{toastMessage}</span>
          </div>
      )}
    </div>
  );
};
