import React from 'react';
import { Play, User } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-slate-100"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-200">
        <img 
          src={`https://picsum.photos/seed/${game.coverImageKeyword || game.id}/800/600`} 
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
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
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-slate-400 font-medium">
            <User size={14} className="mr-1" />
            {game.author}
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <Play size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};