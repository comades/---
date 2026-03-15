
import React from 'react';
import { ViewProps } from '../types';
import { Button } from '../components/Button';
import { ArrowRight, MapPin, Sparkles, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Home: React.FC<ViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" 
            alt="Background" 
            className="h-full w-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20 mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="mr-2" />
            {t('home.badge')}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t('home.title')}<br/>
            <span className="text-white">
              {t('home.subtitle')}
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => setView('EXPLORE')}>
              {t('home.explore')}
            </Button>
            <Button size="lg" className="bg-[#B21D2D] text-white border-0 hover:bg-[#B21D2D]/90" onClick={() => setView('CREATE')}>
              <Sparkles size={18} className="mr-2" />
              {t('home.create')}
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative flex flex-col items-center text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.f1.title')}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t('home.features.f1.desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative flex flex-col items-center text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.f2.title')}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t('home.features.f2.desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative flex flex-col items-center text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.f3.title')}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t('home.features.f3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Simple CTA */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="mx-auto max-w-3xl text-center px-4">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-6">{t('home.cta')}</h2>
          <Button size="lg" className="bg-[#B21D2D] text-white border-0 shadow-lg shadow-[#B21D2D]/30 hover:bg-[#B21D2D]/90" onClick={() => setView('EXPLORE')}>
            {t('home.ctaBtn')} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};
