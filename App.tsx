
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Editor } from './pages/Editor';
import { Player } from './pages/Player';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Academy } from './pages/Academy';
import { Admin } from './pages/Admin';
import { ViewState, Game } from './types';

import { useGame } from './contexts/GameContext';

function App() {
  const [currentView, setView] = useState<ViewState>('HOME');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { games } = useGame();

  // Load Data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const gameIdParam = params.get('gameId');

    if (viewParam === 'PLAY' && gameIdParam && games.length > 0) {
        const game = games.find(g => g.id === gameIdParam);
        if (game) {
            setCurrentGame(game);
            setView('PLAY');
        }
    }
  }, [games]);

  // Simple Router Switch
  const renderView = () => {
    const props = {
      setView,
      setCurrentGame,
      currentGame,
    };

    switch (currentView) {
      case 'HOME':
        return <Home {...props} />;
      case 'EXPLORE':
        return <Explore {...props} />;
      case 'CREATE':
        return <Editor {...props} />;
      case 'PLAY':
        return <Player {...props} />;
      case 'LOGIN':
        return <Login {...props} />;
      case 'PROFILE':
        return <Profile {...props} initialTab="GAMES" />;
      case 'PROFILE_MESSAGES':
        return <Profile {...props} initialTab="MESSAGES" />;
      case 'LEADERBOARD':
        return <Leaderboard {...props} />;
      case 'ACADEMY':
        return <Academy {...props} />;
      case 'ADMIN':
        return <Admin {...props} />;
      default:
        return <Home {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-serif text-slate-900">
      {currentView !== 'PLAY' && currentView !== 'ADMIN' && (
        <Navbar currentView={currentView} setView={setView} />
      )}
      <main className="flex-grow">
        {renderView()}
      </main>
      
      {currentView !== 'PLAY' && currentView !== 'ADMIN' && currentView !== 'CREATE' && (
        <footer className="bg-white py-8 border-t border-slate-200 mt-auto">
          <div className="mx-auto max-w-7xl px-4 text-center text-slate-500 text-sm">
            <p className="mb-2">羲光剧游 XiGuang &copy; {new Date().getFullYear()}</p>
            <p>Powered by Google Gemini 2.5</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
