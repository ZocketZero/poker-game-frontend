import React from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import {
  Volume2,
  VolumeX,
  Palette,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCw,
  Users,
  Trophy,
  User,
  Play,
  X,
  Coins,
} from 'lucide-react';

export const Header: React.FC = () => {
  const gameState = usePokerStore((state) => state.gameState);
  const isConnected = usePokerStore((state) => state.isConnected);
  const isMockMode = usePokerStore((state) => state.isMockMode);
  const setMockMode = usePokerStore((state) => state.setMockMode);
  const soundEnabled = usePokerStore((state) => state.soundEnabled);
  const toggleSound = usePokerStore((state) => state.toggleSound);
  const fourColorDeck = usePokerStore((state) => state.fourColorDeck);
  const toggleFourColorDeck = usePokerStore((state) => state.toggleFourColorDeck);
  const resetGame = usePokerStore((state) => state.resetGame);
  const tableOrientation = usePokerStore((state) => state.tableOrientation);
  const toggleOrientation = usePokerStore((state) => state.toggleOrientation);
  const setMaxSeats = usePokerStore((state) => state.setMaxSeats);

  const auth = usePokerStore((state) => state.auth);
  const setIsAuthOpen = usePokerStore((state) => state.setIsAuthOpen);
  const setIsLobbyOpen = usePokerStore((state) => state.setIsLobbyOpen);
  const currentTableId = usePokerStore((state) => state.currentTableId);
  const startHand = usePokerStore((state) => state.startHand);
  const toastMessage = usePokerStore((state) => state.toastMessage);
  const clearToast = usePokerStore((state) => state.clearToast);

  return (
    <>
      <header className="w-full h-11 sm:h-12 shrink-0 bg-slate-950/90 border-b border-slate-800/80 px-2 sm:px-4 py-1 flex items-center justify-between backdrop-blur-md z-30 select-none">
        {/* Brand & Table Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsLobbyOpen(true)}>
            <span className="text-base sm:text-lg">♠️</span>
            <span className="font-serif-poker font-black text-sm sm:text-base bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              POKER PRO
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Lobby Tables Button */}
          <button
            type="button"
            onClick={() => setIsLobbyOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-colors shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Lobby Tables</span>
            <span className="md:hidden">Lobby</span>
          </button>

          {/* Start Hand button in Live Mode */}
          {!isMockMode && currentTableId && !gameState.isStarted && (
            <button
              type="button"
              onClick={startHand}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all animate-pulse"
              title="Start poker hand on current table"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Deal Hand</span>
            </button>
          )}

          {/* Table summary badge */}
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
              {gameState.tableName}
            </span>
            <span className="text-[10px] text-slate-400">
              ${gameState.smallBlind}/${gameState.bigBlind} •{' '}
              <strong className="text-amber-400 uppercase">{gameState.stage}</strong>
            </span>
          </div>
        </div>

        {/* Right Control Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Account / Auth Button */}
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-amber-300 transition-all"
            title="Account & Chip Balance"
          >
            {auth.isAuthenticated ? (
              <>
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${auth.username}`}
                  alt="avatar"
                  className="w-4 h-4 rounded-full border border-amber-400/50"
                />
                <span className="font-bold hidden sm:inline">{auth.username}</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-extrabold text-[11px]">
                  <Coins className="w-3 h-3" />${auth.chips.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-xs">Sign In</span>
              </>
            )}
          </button>

          {/* Mock Mode vs Live Indicator */}
          <button
            onClick={() => setMockMode(!isMockMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              isMockMode
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/50'
                : isConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/50'
                : 'bg-rose-950/40 text-rose-300 border-rose-600/40 hover:bg-rose-900/50'
            }`}
            title="Click to toggle between Mock Mode and Live Backend"
          >
            {isMockMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Mock Mode</span>
              </>
            ) : isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live Server</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </button>

          {/* 4-Color Deck Toggle */}
          <button
            onClick={toggleFourColorDeck}
            className={`p-1.5 rounded-lg border transition-all ${
              fourColorDeck
                ? 'bg-blue-950/60 text-blue-300 border-blue-600/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={fourColorDeck ? '4-Color Deck Active' : 'Switch to 4-Color Deck'}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Rotate Table Orientation */}
          <button
            onClick={toggleOrientation}
            className="flex items-center gap-1 p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800 transition-all"
            title={`Rotate Table (${tableOrientation}). Click to cycle.`}
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-[9px] font-bold uppercase">{tableOrientation}</span>
          </button>

          {/* Seat Count Quick Toggle */}
          <button
            onClick={() => {
              const current = gameState.maxSeats || 6;
              const cycle = [2, 6, 8, 9, 10];
              const nextIdx = (cycle.indexOf(current) + 1) % cycle.length;
              setMaxSeats(cycle[nextIdx]);
            }}
            className="flex items-center gap-1 p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800 transition-all"
            title={`Seats: ${gameState.maxSeats || 6} Players. Click to cycle.`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-bold uppercase">{gameState.maxSeats || 6}P</span>
          </button>

          {/* Reset Hand (only in mock mode) */}
          {isMockMode && (
            <button
              onClick={resetGame}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-all"
              title="Reset Mock Hand"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-bounce">
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
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
