import React, { useState } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { FastForward, Trophy, RotateCcw, ChevronRight, Bot, Wrench } from 'lucide-react';

export const DevSimulatorToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const gameState = usePokerStore((state) => state.gameState);
  const nextStreet = usePokerStore((state) => state.nextStreet);
  const triggerShowdown = usePokerStore((state) => state.triggerShowdown);
  const resetGame = usePokerStore((state) => state.resetGame);
  const setGameState = usePokerStore((state) => state.setGameState);

  // Simulate a random bot move for testing turn rotation
  const simulateBotMove = () => {
    const activeBots = gameState.players.filter((p) => p && p.id !== 'p1' && p.status === 'active');
    if (activeBots.length === 0) return;

    const targetBot = activeBots[Math.floor(Math.random() * activeBots.length)]!;
    const actions: ('call' | 'raise' | 'fold' | 'check')[] = ['call', 'raise', 'check'];
    const chosenAction = actions[Math.floor(Math.random() * actions.length)];

    setGameState((prev) => {
      const updated = [...prev.players];
      const botIdx = updated.findIndex((p) => p?.id === targetBot.id);
      if (botIdx === -1) return prev;

      const bot = updated[botIdx]!;
      let newBet = bot.currentBet;
      let newChips = bot.chips;
      let newStatus = bot.status;

      if (chosenAction === 'fold') {
        newStatus = 'folded';
      } else if (chosenAction === 'call') {
        const diff = prev.currentHighestBet - bot.currentBet;
        newChips -= diff;
        newBet += diff;
      } else if (chosenAction === 'raise') {
        const raiseAmt = prev.currentHighestBet + prev.minRaise;
        const diff = raiseAmt - bot.currentBet;
        newChips -= diff;
        newBet = raiseAmt;
      }

      updated[botIdx] = {
        ...bot,
        chips: Math.max(0, newChips),
        currentBet: newBet,
        status: newStatus,
        lastAction: { type: chosenAction, amount: chosenAction === 'fold' ? undefined : newBet },
      };

      return {
        ...prev,
        players: updated,
        currentHighestBet: Math.max(prev.currentHighestBet, newBet),
        pots: [{ amount: prev.pots[0].amount + (newBet - bot.currentBet), name: 'Main Pot' }],
      };
    });
  };

  return (
    <aside
      aria-label="Developer simulator toolbar"
      className={`fixed top-20 right-0 z-40 transition-transform duration-300 flex items-start ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Toggle Tab */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Collapse simulator toolbar' : 'Open developer simulator toolbar'}
        className="bg-slate-900 text-amber-400 hover:text-amber-300 p-2.5 rounded-l-xl border-l border-t border-b border-amber-500/40 shadow-xl flex items-center justify-center -ml-10"
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <Wrench className="w-5 h-5 animate-pulse" />}
      </button>

      {/* Control Drawer */}
      <div className="w-72 max-h-[calc(100dvh-70px)] overflow-y-auto bg-slate-950/95 border-l border-t border-b border-slate-800 rounded-l-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3.5 text-xs text-slate-300">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
              Dev Simulator
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono text-[10px] border border-amber-600/40">
            {gameState.stage.toUpperCase()}
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Use this toolbar to step through poker rounds and trigger actions without needing the backend running.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Next Street */}
          <button
            type="button"
            onClick={nextStreet}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <FastForward className="w-4 h-4 text-emerald-400" />
              <span>Next Street</span>
            </span>
            <span className="text-[10px] opacity-75">Flop ➔ River</span>
          </button>

          {/* Trigger Showdown */}
          <button
            type="button"
            onClick={triggerShowdown}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-600/40 font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Showdown & Winner</span>
            </span>
            <span className="text-[10px] opacity-75">Reveal</span>
          </button>

          {/* Bot Action */}
          <button
            type="button"
            onClick={simulateBotMove}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/40 font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Simulate Opponent Turn</span>
            </span>
            <span className="text-[10px] opacity-75">Bot</span>
          </button>

          {/* Reset Hand */}
          <button
            type="button"
            onClick={resetGame}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset Game Table</span>
            </span>
            <span className="text-[10px] opacity-75">New Hand</span>
          </button>
        </div>

        {/* Live Socket Info Box */}
        <div className="mt-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Backend Connection</div>
          <div>Default Socket URL: <code className="text-amber-400">http://localhost:4000</code></div>
          <div>Configure in: <code className="text-blue-300">src/hooks/usePokerSocket.ts</code></div>
        </div>
      </div>
    </aside>
  );
};
