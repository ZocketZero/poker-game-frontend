import React from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import {
  Coins,
  User,
  LogOut,
  Volume2,
  VolumeX,
  Palette,
  Wifi,
  WifiOff,
  Plus,
} from 'lucide-react';

interface NavbarProps {
  onCreateRoomClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateRoomClick }) => {
  const currentView = usePokerStore((state) => state.currentView);
  const setCurrentView = usePokerStore((state) => state.setCurrentView);
  const currentTableId = usePokerStore((state) => state.currentTableId);
  const auth = usePokerStore((state) => state.auth);
  const logout = usePokerStore((state) => state.logout);
  const isConnected = usePokerStore((state) => state.isConnected);
  const soundEnabled = usePokerStore((state) => state.soundEnabled);
  const toggleSound = usePokerStore((state) => state.toggleSound);
  const fourColorDeck = usePokerStore((state) => state.fourColorDeck);
  const toggleFourColorDeck = usePokerStore((state) => state.toggleFourColorDeck);
  const toastMessage = usePokerStore((state) => state.toastMessage);
  const clearToast = usePokerStore((state) => state.clearToast);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between select-none">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 group text-left transition-transform active:scale-95"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all border border-amber-300/40">
              <span className="text-slate-950 text-lg sm:text-xl font-black leading-none">♠</span>
            </div>
            <div>
              <div className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-serif-poker">
                POKER PRO
              </div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-1 hidden sm:block">
                Texas Hold'em Online
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 pl-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Lobby & Rooms
            </button>

            {currentTableId && (
              <button
                onClick={() => setCurrentView('table')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/40 transition-all shadow-sm shadow-emerald-950"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Table</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Room Button */}
          {onCreateRoomClick && (
            <button
              type="button"
              onClick={onCreateRoomClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Room</span>
            </button>
          )}

          {/* Sound & Deck Settings */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleFourColorDeck}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                fourColorDeck
                  ? 'bg-blue-950/60 text-blue-300 border-blue-600/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={fourColorDeck ? '4-Color Deck Enabled' : 'Enable 4-Color Deck'}
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={soundEnabled ? 'Sound On' : 'Sound Muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>

          {/* Real-time Live Server Connection Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-600/40'
            }`}
            title={isConnected ? 'Connected to Poker WebSocket' : 'Connecting or disconnected from Poker WebSocket'}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Live Server</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Auth / Profile Area */}
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${auth.username}`}
                  alt="avatar"
                  className="w-6 h-6 rounded-full border border-amber-400/50 bg-slate-800"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100 max-w-[80px] sm:max-w-[120px] truncate">
                    {auth.username}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400 leading-none">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>${auth.chips.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-600/50 text-slate-400 hover:text-rose-300 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('auth', 'login')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('auth', 'register')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl border backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                : toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                : 'bg-slate-900/90 text-slate-200 border-slate-700'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={clearToast}
              className="p-0.5 rounded hover:bg-white/10 transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
