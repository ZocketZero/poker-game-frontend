import React, { useEffect } from 'react';
import { usePokerStore } from './store/usePokerStore';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/layout/Header';
import { PokerTable } from './components/poker/PokerTable';
import { ActionBar } from './components/poker/ActionBar';
import { AuthModal } from './components/auth/AuthModal';
import { LobbyModal } from './components/lobby/LobbyModal';
import { usePokerSocket } from './hooks/usePokerSocket';

export const App: React.FC = () => {
  // Initialize native WebSocket hook
  usePokerSocket();

  const currentView = usePokerStore((state) => state.currentView);
  const setCurrentView = usePokerStore((state) => state.setCurrentView);

  // Sync window hash with view state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('table')) {
        setCurrentView('table');
      } else if (hash.includes('register')) {
        setCurrentView('auth', 'register');
      } else if (hash.includes('login') || hash.includes('auth')) {
        setCurrentView('auth', 'login');
      } else if (hash.includes('home')) {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentView]);

  // Dedicated Homepage View
  if (currentView === 'home') {
    return (
      <>
        <HomePage />
        <AuthModal />
        <LobbyModal />
      </>
    );
  }

  // Dedicated Auth (Login / Register) Page View
  if (currentView === 'auth') {
    return (
      <>
        <AuthPage />
        <LobbyModal />
      </>
    );
  }

  // Active Poker Table View
  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#07090e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#07090e] to-black text-slate-100">
      {/* Top Header */}
      <Header />

      {/* Main Table Arena */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 md:p-3 overflow-hidden relative">
        <PokerTable />
      </main>

      {/* Interactive Bottom Action Bar */}
      <ActionBar />

      {/* Modals for Auth and Lobby */}
      <AuthModal />
      <LobbyModal />
    </div>
  );
};

export default App;
