
import React, { useState } from 'react';
import { ViewProps, Game, Article } from '../types';
import { GameCard } from '../components/GameCard';
import { useGame } from '../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import { Search, ChevronRight, Flame, Trophy, Map, Headphones, Crown, Sparkles, Clock, Star, X, MessageSquare, User, Play, Compass } from 'lucide-react';
import { Button } from '../components/Button';
import { CivilizationStarMap } from '../components/CivilizationStarMap';
import { DailyQuizSection } from '../components/DailyQuizSection';

const GameDetailModal = ({ game, onClose, onPlay }: { game: Game, onClose: () => void, onPlay: () => void }) => {
    const { t } = useTranslation();
    if (!game) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="relative h-48 sm:h-64 bg-slate-200 shrink-0">
                    <img 
                        src={game.coverImageKeyword?.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/800/600`} 
                        alt={game.title}
                        className="w-full h-full object-cover"
                    />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h2 className="text-3xl font-bold mb-2">{game.title}</h2>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center"><User size={16} className="mr-1"/> {game.author}</span>
                            <span className="flex items-center text-yellow-400"><Star size={16} className="mr-1 fill-yellow-400"/> {game.rating ? game.rating.toFixed(1) : 'New'}</span>
                            <span className="flex items-center"><Play size={16} className="mr-1"/> {game.playCount} {t('explore.modal.playCount')}</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <p className="text-slate-600 leading-relaxed mb-8 text-lg">{game.description}</p>
                    
                    <h3 className="font-bold text-slate-900 mb-4 text-lg flex items-center">
                        <MessageSquare size={20} className="mr-2"/> {t('explore.modal.reviews')} ({game.reviews?.length || 0})
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                        {game.reviews && game.reviews.length > 0 ? (
                            (game.reviews || []).map((review, idx) => (
                                <div key={review.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden">
                                                {review.userAvatar ? <img src={review.userAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-500 font-bold">{review.userName[0]}</div>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{review.userName}</div>
                                                <div className="text-xs text-slate-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '剛剛'}</div>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < review.rating ? "fill-yellow-400" : "text-slate-300 fill-slate-300"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                {t('explore.modal.noReviews')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose}>{t('explore.modal.close')}</Button>
                    <Button size="lg" onClick={onPlay} className="px-8 shadow-lg shadow-indigo-500/30">
                        <Play size={20} className="mr-2" fill="currentColor" /> {t('explore.modal.play')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const GameRow: React.FC<{ games: Game[], onPlay: (game: Game) => void }> = ({ games, onPlay }) => {
  const { t } = useTranslation();
  return (
  <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x animate-in fade-in slide-in-from-right-4 duration-300">
    {(games || []).length > 0 ? games.map((game) => (
      <div key={game.id} className="w-[280px] flex-shrink-0 snap-center">
        <GameCard game={game} onClick={() => onPlay(game)} />
      </div>
    )) : (
      <div className="text-slate-400 text-sm py-12 w-full text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        {t('explore.gameRow.empty')}
      </div>
    )}
  </div>
)};

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  <div className="flex-shrink-0 w-[260px] group cursor-pointer">
    <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-3">
      <img 
        src={article.imageUrl || undefined} 
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

const TabButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  icon: any;
  colorClass: string;
}> = ({ 
  active, 
  onClick, 
  label, 
  icon: Icon,
  colorClass
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

export const Explore: React.FC<ViewProps> = ({ setCurrentGame, setView }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showStarMap, setShowStarMap] = useState(false);
  const { getPublishedGames, articles } = useGame();
  
  // Tab States for separate sections
  const [adventureTab, setAdventureTab] = useState<'rec' | 'pop' | 'new'>('rec');
  const [guideTab, setGuideTab] = useState<'rec' | 'pop' | 'new'>('rec');

  const allPublishedGames = getPublishedGames();

  // Filter Logic
  const filterGames = (games: Game[]) => {
    return (games || []).filter(game => 
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get valid articles (Published & Not Expired)
  const validArticles = (articles || []).filter(a => {
      if (!a.isPublished) return false;
      if (a.endDate) {
          const end = new Date(a.endDate).getTime();
          const now = new Date().getTime();
          if (now > end) return false;
      }
      return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const officialGames = filterGames((allPublishedGames || []).filter(g => g.isOfficial));
  const adventureGames = filterGames((allPublishedGames || []).filter(g => g.type === 'adventure' && !g.isOfficial));
  const guideGames = filterGames((allPublishedGames || []).filter(g => g.type === 'guide' && !g.isOfficial));

  // Sort helpers
  // Recommended: Filter by isRecommended flag
  const getRecommended = (list: Game[]) => (list || []).filter(g => g.isRecommended);
  
  // Popular: Sort by Rating (desc), fallback to PlayCount
  const getPopular = (list: Game[]) => [...list].sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.playCount || 0) - (a.playCount || 0);
  });
  
  // Newest: Sort by createdAt (desc)
  const getNewest = (list: Game[]) => [...list].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
  });

  const handlePlay = (game: any) => {
    setSelectedGame(game);
  };

  const handleStartGame = () => {
      if (selectedGame) {
          setCurrentGame(selectedGame);
          setView('PLAY');
          setSelectedGame(null);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* Star Map Entry Banner */}
      <div className="bg-[#0B0D12] py-3 px-4 flex items-center justify-between border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#FFD700]">
            <Compass size={18} />
          </div>
          <div>
            <p className="text-[#FFD700] text-xs font-bold tracking-widest uppercase">{t('explore.starMap.title')}</p>
            <p className="text-[#D4AF37]/50 text-[10px] tracking-wider">{t('explore.starMap.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowStarMap(true)}
          className="bg-[#D4AF37] text-black text-[10px] font-bold px-4 py-1.5 rounded-full hover:bg-[#FFD700] transition-all tracking-widest uppercase"
        >
          {t('explore.starMap.enter')}
        </button>
      </div>

      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm shadow-sm bg-slate-50 focus:bg-white transition-all"
              placeholder={t('explore.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {!searchTerm && officialGames.length > 0 && (
          <div className="mb-10 relative rounded-3xl overflow-hidden aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] shadow-xl group cursor-pointer" onClick={() => handlePlay(officialGames[0])}>
            <img 
              src={`https://picsum.photos/seed/${officialGames[0].coverImageKeyword}/1600/600`} 
              alt="Banner" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
              <span className="text-yellow-400 font-bold tracking-wider text-sm mb-2 uppercase flex items-center">
                <Crown size={16} className="mr-2" /> {t('explore.banner.recommend')}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg max-w-2xl">
                {officialGames[0].title}
              </h1>
              <p className="text-slate-200 line-clamp-2 max-w-xl text-sm md:text-lg mb-6 drop-shadow-md">
                {officialGames[0].description}
              </p>
              <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold w-fit hover:bg-indigo-50 transition-colors">
                {t('explore.banner.play')}
              </button>
            </div>
          </div>
        )}

        {/* Columns / News */}
        {!searchTerm && validArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">{t('explore.articles')}</h2>
            <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4 scrollbar-hide">
              {(validArticles || []).map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {!searchTerm && <div className="mt-8"><DailyQuizSection /></div>}
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
                    <h2 className="text-2xl font-black text-slate-800 leading-none">{t('explore.adventure.title')}</h2>
                    <p className="text-slate-500 text-xs mt-1">{t('explore.adventure.desc')}</p>
                 </div>
              </div>
           </div>

           {/* Adventure Tabs */}
           <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <TabButton 
                active={adventureTab === 'rec'} 
                onClick={() => setAdventureTab('rec')} 
                label={t('explore.tabs.rec')} 
                icon={Star}
                colorClass="bg-orange-500"
              />
              <TabButton 
                active={adventureTab === 'pop'} 
                onClick={() => setAdventureTab('pop')} 
                label={t('explore.tabs.pop')} 
                icon={Flame}
                colorClass="bg-orange-500"
              />
              <TabButton 
                active={adventureTab === 'new'} 
                onClick={() => setAdventureTab('new')} 
                label={t('explore.tabs.new')} 
                icon={Clock}
                colorClass="bg-orange-500"
              />
           </div>
           
           {/* Adventure Content */}
           <div className="min-h-[280px]">
              {adventureTab === 'rec' && <GameRow games={getRecommended(adventureGames)} onPlay={handlePlay} />}
              {adventureTab === 'pop' && <GameRow games={getPopular(adventureGames)} onPlay={handlePlay} />}
              {adventureTab === 'new' && <GameRow games={getNewest(adventureGames)} onPlay={handlePlay} />}
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
                    <h2 className="text-2xl font-black text-slate-800 leading-none">{t('explore.guide.title')}</h2>
                    <p className="text-slate-500 text-xs mt-1">{t('explore.guide.desc')}</p>
                 </div>
              </div>
           </div>

           {/* Guide Tabs */}
           <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <TabButton 
                active={guideTab === 'rec'} 
                onClick={() => setGuideTab('rec')} 
                label={t('explore.tabs.rec')} 
                icon={Sparkles}
                colorClass="bg-blue-500"
              />
              <TabButton 
                active={guideTab === 'pop'} 
                onClick={() => setGuideTab('pop')} 
                label={t('explore.tabs.pop')} 
                icon={Flame}
                colorClass="bg-blue-500"
              />
              <TabButton 
                active={guideTab === 'new'} 
                onClick={() => setGuideTab('new')} 
                label={t('explore.tabs.new')} 
                icon={Clock}
                colorClass="bg-blue-500"
              />
           </div>

           {/* Guide Content */}
           <div className="min-h-[280px]">
              {guideTab === 'rec' && <GameRow games={getRecommended(guideGames)} onPlay={handlePlay} />}
              {guideTab === 'pop' && <GameRow games={getPopular(guideGames)} onPlay={handlePlay} />}
              {guideTab === 'new' && <GameRow games={getNewest(guideGames)} onPlay={handlePlay} />}
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
                      {t('explore.official.title')}
                    </h2>
                    <p className="text-indigo-200 text-sm mt-1">{t('explore.official.desc')}</p>
                  </div>
                  <button className="text-sm font-bold text-white/80 hover:text-white border border-white/20 px-4 py-1.5 rounded-full hover:bg-white/10 transition-all">
                    {t('explore.official.viewAll')}
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {(officialGames || []).map(game => (
                   <div key={game.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all cursor-pointer flex gap-4" onClick={() => handlePlay(game)}>
                      <img 
                        src={`https://picsum.photos/seed/${game.coverImageKeyword}/200/200`} 
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-slate-800"
                        alt={game.title}
                      />
                      <div className="overflow-hidden">
                        <h3 className="text-white font-bold text-lg truncate">{game.title}</h3>
                        <p className="text-indigo-200 text-xs line-clamp-2 mt-1">{game.description}</p>
                        <div className="mt-2 flex items-center text-xs text-yellow-400 font-bold">
                           <span>★ {game.rating}</span>
                           <span className="mx-2 text-white/30">•</span>
                           <span className="text-white/60">{game.playCount} {t('explore.modal.playCount')}</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>

      <GameDetailModal 
        game={selectedGame!} 
        onClose={() => setSelectedGame(null)} 
        onPlay={handleStartGame} 
      />

      {showStarMap && <CivilizationStarMap onClose={() => setShowStarMap(false)} />}
    </div>
  );
};
