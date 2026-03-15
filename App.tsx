
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
import { Shop } from './pages/Shop';
import { StyleGuide } from './components/StyleGuide';
import { BottomNav } from './components/BottomNav';
import { ViewState, Game } from './types';
import { useTranslation } from 'react-i18next';
import { LanguageProvider } from './contexts/LanguageContext';

import { useGame } from './contexts/GameContext';

import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentView, setView] = useState<ViewState>('EXPLORE');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { games } = useGame();
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  // Load Data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const gameIdParam = params.get('gameId');

    if (viewParam === 'PLAY' && gameIdParam && games.length > 0) {
        const game = (games || []).find(g => g.id === gameIdParam);
        if (game) {
            setCurrentGame(game);
            setView('PLAY');
        }
    }
  }, [games]);

  // Enforce Login for specific views
  useEffect(() => {
    const publicViews: ViewState[] = ['HOME', 'EXPLORE', 'LEADERBOARD', 'ACADEMY', 'PLAY', 'LOGIN', 'STYLE_GUIDE'];
    if (!loading && !user && !publicViews.includes(currentView)) {
      setView('LOGIN');
    }
  }, [user, loading, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">{t('loading')}</p>
        </div>
      </div>
    );
  }

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
      case 'SHOP':
        return <Shop {...props} />;
      case 'STYLE_GUIDE':
        return <StyleGuide />;
      default:
        return <Explore {...props} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {currentView !== 'PLAY' && currentView !== 'ADMIN' && currentView !== 'STYLE_GUIDE' && (
          <Navbar currentView={currentView} setView={setView} />
        )}
        <main className="flex-grow pb-20 md:pb-0">
          {renderView()}
        </main>
        
        {currentView !== 'PLAY' && currentView !== 'ADMIN' && currentView !== 'CREATE' && currentView !== 'STYLE_GUIDE' && (
          <footer className="bg-white py-8 border-t border-slate-200 mt-auto hidden md:block">
            <div className="mx-auto max-w-7xl px-4 text-center text-slate-500 text-sm">
              <p className="mb-2">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
              <p>{t('footer.poweredBy')}</p>
            </div>
          </footer>
        )}

        {currentView !== 'PLAY' && currentView !== 'ADMIN' && currentView !== 'STYLE_GUIDE' && (
          <BottomNav currentView={currentView} setView={setView} />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;
