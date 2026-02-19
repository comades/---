

import React, { useState } from 'react';
import { ViewProps, Game, Article } from '../types';
import { GameCard } from '../components/GameCard';
import { useGame } from '../contexts/GameContext';
import { Search, ChevronRight, Flame, Trophy, Map, Headphones, Crown, Sparkles, Clock, Star } from 'lucide-react';

export const Explore: React.FC<ViewProps> = ({ setCurrentGame, setView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { getPublishedGames, articles } = useGame();
  
  // Tab States for separate sections
  const [adventureTab, setAdventureTab] = useState<'rec' | 'pop' | 'new'>('rec');
  const [guideTab, setGuideTab] = useState<'rec' | 'pop' | 'new'>('rec');

  const allPublishedGames = getPublishedGames();

  // Filter Logic
  const filterGames = (games: Game[]) => {
    return games.filter(game => 
      game.title.includes(searchTerm) || 
      game.description.includes(searchTerm) ||
      game.author.includes(searchTerm)
    );
  };

  // Get valid articles (Published & Not Expired)
  const validArticles = articles.filter(a => {
      if (!a.isPublished) return false;
      if (a.endDate) {
          const end = new Date(a.endDate).getTime();
          const now = new Date().getTime();
          if (now > end) return false;
      }
      return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const officialGames = filterGames(allPublishedGames.filter(g => g.isOfficial));
  const adventureGames = filterGames(allPublishedGames.filter(g => g.type === 'adventure' && !g.isOfficial));
  const guideGames = filterGames(allPublishedGames.filter(g => g.type === 'guide' && !g.isOfficial));

  // Sort helpers
  // Recommended: Filter by isRecommended flag
  const getRecommended = (list: Game[]) => list.filter(g => g.isRecommended);
  // Popular: Sort by Rating (desc)
  const getPopular = (list: Game[]) => [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  // Newest: Sort by createdAt (desc)
  const getNewest = (list: Game[]) => [...list].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  const handlePlay = (game: any) => {
    setCurrentGame(game);
    setView('PLAY');
  };

  // --- Components ---

  const GameRow = ({ games }: { games: Game[] }) => (
    <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x animate-in fade-in slide-in-from-right-4 duration-300">
      {games.length > 0 ? games.map((game) => (
        <div key={game.id} className="w-[280px] flex-shrink-0 snap-center">
          <GameCard game={game} onClick={() => handlePlay(game)} />
        </div>
      )) : (
        <div className="text-slate-400 text-sm py-12 w-full text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          此分類尚無內容
        </div>
      )}
    </div>
  );

  const ArticleCard = ({ article }: { article: Article }) => (
    <div className="flex-shrink-0 w-[260px] group cursor-pointer">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-3">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {article.category}
        </div>
      </div>
      <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-xs text-slate-400 mt-1 flex justify-between">
          <span>{article.date}</span>
          {article.author && <span>by {article.author}</span>}
      </p>
    </div>
  );

  const TabButton = ({ 
    active, 
    onClick, 
    label, 
    icon: Icon,
    colorClass
  }: { 
    active: boolean; 
    onClick: () => void; 
    label: string; 
    icon: any;
    colorClass: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
        active 
          ? `${colorClass} text-white shadow-md border-transparent scale-105` 
          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm shadow-sm bg-slate-50 focus:bg-white transition-all"
              placeholder="搜尋遊戲、作者或關鍵字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Banner Section (Top Recommended Official) */}
        {!searchTerm && officialGames.length > 0 && (
          <div className="mb-10 relative rounded-3xl overflow-hidden aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] shadow-xl group cursor-pointer" onClick={() => handlePlay(officialGames[0])}>
            <img 
              src={`https://picsum.photos/seed/${officialGames[0].coverImageKeyword}/1600/600`} 
              alt="Banner" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
              <span className="text-yellow-400 font-bold tracking-wider text-sm mb-2 uppercase flex items-center">
                <Crown size={16} className="mr-2" /> 本週編輯推薦
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg max-w-2xl">
                {officialGames[0].title}
              </h1>
              <p className="text-slate-200 line-clamp-2 max-w-xl text-sm md:text-lg mb-6 drop-shadow-md">
                {officialGames[0].description}
              </p>
              <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold w-fit hover:bg-indigo-50 transition-colors">
                立即體驗
              </button>
            </div>
          </div>
        )}

        {/* Columns / News */}
        {!searchTerm && validArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">公告與專欄</h2>
            <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {validArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* --- Adventure Games Section --- */}
        <div className="mb-12">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                 <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Map size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 leading-none">實境遊戲</h2>
                    <p className="text-slate-500 text-xs mt-1">走出戶外，讓城市成為冒險舞台</p>
                 </div>
              </div>
           </div>

           {/* Adventure Tabs */}
           <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <TabButton 
                active={adventureTab === 'rec'} 
                onClick={() => setAdventureTab('rec')} 
                label="編輯推薦" 
                icon={Star}
                colorClass="bg-orange-500"
              />
              <TabButton 
                active={adventureTab === 'pop'} 
                onClick={() => setAdventureTab('pop')} 
                label="熱門好評" 
                icon={Flame}
                colorClass="bg-orange-500"
              />
              <TabButton 
                active={adventureTab === 'new'} 
                onClick={() => setAdventureTab('new')} 
                label="最新上架" 
                icon={Clock}
                colorClass="bg-orange-500"
              />
           </div>
           
           {/* Adventure Content */}
           <div className="min-h-[280px]">
              {adventureTab === 'rec' && <GameRow games={getRecommended(adventureGames)} />}
              {adventureTab === 'pop' && <GameRow games={getPopular(adventureGames)} />}
              {adventureTab === 'new' && <GameRow games={getNewest(adventureGames)} />}
           </div>
        </div>

        {/* --- Smart Guide Section --- */}
        <div className="mb-12 pt-8 border-t border-slate-200">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                 <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Headphones size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 leading-none">智慧導覽</h2>
                    <p className="text-slate-500 text-xs mt-1">深度語音解說，隨身攜帶的導遊</p>
                 </div>
              </div>
           </div>

           {/* Guide Tabs */}
           <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <TabButton 
                active={guideTab === 'rec'} 
                onClick={() => setGuideTab('rec')} 
                label="編輯推薦" 
                icon={Sparkles}
                colorClass="bg-blue-500"
              />
              <TabButton 
                active={guideTab === 'pop'} 
                onClick={() => setGuideTab('pop')} 
                label="熱門好評" 
                icon={Flame}
                colorClass="bg-blue-500"
              />
              <TabButton 
                active={guideTab === 'new'} 
                onClick={() => setGuideTab('new')} 
                label="最新上架" 
                icon={Clock}
                colorClass="bg-blue-500"
              />
           </div>

           {/* Guide Content */}
           <div className="min-h-[280px]">
              {guideTab === 'rec' && <GameRow games={getRecommended(guideGames)} />}
              {guideTab === 'pop' && <GameRow games={getPopular(guideGames)} />}
              {guideTab === 'new' && <GameRow games={getNewest(guideGames)} />}
           </div>
        </div>

        {/* --- Official Originals --- */}
        {officialGames.length > 0 && (
          <div className="mb-12 py-10 bg-gradient-to-b from-indigo-900 to-slate-900 rounded-3xl px-6 md:px-10 -mx-2 md:mx-0 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
             
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8 text-white">
                  <div>
                    <h2 className="text-2xl font-black flex items-center">
                      <Crown className="mr-3 text-yellow-400" />
                      羲光劇遊原創
                    </h2>
                    <p className="text-indigo-200 text-sm mt-1">官方精心打造的高品質沉浸式體驗</p>
                  </div>
                  <button className="text-sm font-bold text-white/80 hover:text-white border border-white/20 px-4 py-1.5 rounded-full hover:bg-white/10 transition-all">
                    查看全部
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {officialGames.map(game => (
                   <div key={game.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all cursor-pointer flex gap-4" onClick={() => handlePlay(game)}>
                      <img 
                        src={`https://picsum.photos/seed/${game.coverImageKeyword}/200/200`} 
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-slate-800"
                      />
                      <div className="overflow-hidden">
                        <h3 className="text-white font-bold text-lg truncate">{game.title}</h3>
                        <p className="text-indigo-200 text-xs line-clamp-2 mt-1">{game.description}</p>
                        <div className="mt-2 flex items-center text-xs text-yellow-400 font-bold">
                           <span>★ {game.rating}</span>
                           <span className="mx-2 text-white/30">•</span>
                           <span className="text-white/60">{game.playCount} 遊玩</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};