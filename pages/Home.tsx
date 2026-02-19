
import React from 'react';
import { ViewProps } from '../types';
import { Button } from '../components/Button';
import { ArrowRight, MapPin, Sparkles, Smartphone } from 'lucide-react';

export const Home: React.FC<ViewProps> = ({ setView }) => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" 
            alt="Background" 
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20 mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="mr-2" />
            AI 驅動的創意世界
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            把你的城市變成<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              巨大的遊樂場
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            羲光剧游 XiGuang 是一個結合實境與虛擬的遊戲創作平台。探索他人創造的奇幻故事，或是使用 AI 助手在幾秒鐘內打造屬於你的冒險。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => setView('EXPLORE')}>
              開始探索
            </Button>
            <Button size="lg" variant="outline" className="text-white border-slate-600 hover:border-white hover:text-white hover:bg-white/10" onClick={() => setView('CREATE')}>
              <Sparkles size={18} className="mr-2" />
              AI 製作遊戲
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
              <h3 className="text-xl font-bold text-slate-900 mb-3">實境解謎</h3>
              <p className="text-slate-600 leading-relaxed">
                結合 GPS 定位，走到特定地點觸發劇情。讓日常生活場景變成遊戲舞台，發現城市不為人知的一面。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative flex flex-col items-center text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI 創意生成</h3>
              <p className="text-slate-600 leading-relaxed">
                沒有靈感？只要輸入一句話，我們的 AI 引擎就能為你生成完整的劇本、選項與結局。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative flex flex-col items-center text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">社群分享</h3>
              <p className="text-slate-600 leading-relaxed">
                發布你的作品，讓全世界的玩家來挑戰。收集好評，成為 羲光剧游 XiGuang 的傳奇創作者。
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Simple CTA */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="mx-auto max-w-3xl text-center px-4">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-6">準備好開始冒險了嗎？</h2>
          <Button variant="secondary" size="lg" onClick={() => setView('EXPLORE')}>
            瀏覽熱門遊戲 <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};
