import React, { useState } from 'react';
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

function App() {
  const [currentView, setView] = useState<ViewState>('HOME');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

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
        return <Profile {...props} />;
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {currentView !== 'PLAY' && currentView !== 'ADMIN' && (
        <Navbar currentView={currentView} setView={setView} />
      )}
      <main className="flex-grow">
        {renderView()}
      </main>
      
      {currentView !== 'PLAY' && currentView !== 'ADMIN' && (
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