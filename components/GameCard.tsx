
import React from 'react';
import { Play, User, Star } from 'lucide-react';
import { Game } from '../types';
import { useTranslation } from 'react-i18next';

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const { t } = useTranslation();
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-slate-100"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-200">
        <img 
          src={game.coverImageKeyword?.startsWith('data:') ? game.coverImageKeyword : `https://picsum.photos/seed/${game.coverImageKeyword || game.id}/800/600`} 
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl font-bold leading-tight drop-shadow-md">{game.title}</h3>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-4 text-sm text-slate-600 line-clamp-2 flex-grow">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3">
             <div className="flex items-center text-xs text-slate-500 font-medium">
                <User size={14} className="mr-1" />
                {game.author}
             </div>
             <div className="flex items-center text-xs font-bold text-slate-700 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                <Star size={10} className="mr-1 text-yellow-500 fill-yellow-500" />
                {game.rating ? game.rating.toFixed(1) : t('explore.gameCard.new')}
             </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <Play size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
