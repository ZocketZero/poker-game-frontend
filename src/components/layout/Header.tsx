import React from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { Volume2, VolumeX, Palette, Wifi, WifiOff, RefreshCw } from 'lucide-react';

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

  return (
    <header className="w-full bg-slate-950/80 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between backdrop-blur-md z-30">
      {/* Brand & Table Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">♠️</span>
          <span className="font-serif-poker font-black text-lg bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            POKER PRO
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-slate-200">{gameState.tableName}</span>
          <span className="text-[10px] text-slate-400">
            Blinds: ${gameState.smallBlind}/${gameState.bigBlind} • Stage:{' '}
            <strong className="text-amber-400 uppercase">{gameState.stage}</strong>
          </span>
        </div>
      </div>

      {/* Control Buttons & Mode Badges */}
      <div className="flex items-center gap-3">
        {/* Mock Mode vs Live Indicator */}
        <button
          onClick={() => setMockMode(!isMockMode)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
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
              <span>Mock Mode</span>
            </>
          ) : isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Socket</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Disconnected</span>
            </>
          )}
        </button>

        {/* 4-Color Deck Toggle */}
        <button
          onClick={toggleFourColorDeck}
          className={`p-2 rounded-lg border transition-all ${
            fourColorDeck
              ? 'bg-blue-950/60 text-blue-300 border-blue-600/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title={fourColorDeck ? '4-Color Deck Active' : 'Switch to 4-Color Deck'}
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Hand */}
        <button
          onClick={resetGame}
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-all"
          title="Reset Hand"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
