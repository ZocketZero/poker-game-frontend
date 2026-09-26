import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { ActionType } from '../../types/poker';

export const ActionBar: React.FC = () => {
  const gameState = usePokerStore((state) => state.gameState);
  const currentUserId = usePokerStore((state) => state.currentUserId);
  const dispatchPlayerAction = usePokerStore((state) => state.dispatchPlayerAction);

  // Find hero player
  const heroIndex = gameState.players.findIndex((p) => p?.id === currentUserId);
  const hero = heroIndex !== -1 ? gameState.players[heroIndex] : null;

  const isHeroTurn = hero?.isCurrentTurn ?? false;
  const highestBet = gameState.currentHighestBet;
  const heroCurrentBet = hero?.currentBet || 0;
  const callAmount = Math.max(0, highestBet - heroCurrentBet);
  const canCheck = callAmount === 0;

  const minBet = Math.max(gameState.bigBlind, highestBet + gameState.minRaise);
  const maxBet = (hero?.chips || 0) + heroCurrentBet;

  const [raiseAmount, setRaiseAmount] = useState<number>(minBet);

  // Synchronize default raise value when turn becomes hero's
  useEffect(() => {
    if (isHeroTurn) {
      setRaiseAmount(Math.min(minBet, maxBet));
    }
  }, [isHeroTurn, minBet, maxBet]);

  if (!hero) {
    return (
      <div className="bg-slate-900/90 border-t border-slate-800 p-4 text-center backdrop-blur-md">
        <span className="text-slate-400 text-sm">Choose an open seat on the table to join the action.</span>
      </div>
    );
  }

  const handleAction = (action: ActionType, amt?: number) => {
    dispatchPlayerAction(action, amt);
  };

  const handlePreset = (type: 'min' | '2.5x' | '3x' | 'pot' | 'allin') => {
    if (type === 'min') {
      setRaiseAmount(minBet);
    } else if (type === '2.5x') {
      setRaiseAmount(Math.min(maxBet, Math.round(gameState.bigBlind * 2.5)));
    } else if (type === '3x') {
      setRaiseAmount(Math.min(maxBet, Math.round(gameState.bigBlind * 3)));
    } else if (type === 'pot') {
      const potTotal = gameState.pots.reduce((sum, p) => sum + p.amount, 0);
      setRaiseAmount(Math.min(maxBet, Math.max(minBet, potTotal + callAmount)));
    } else if (type === 'allin') {
      setRaiseAmount(maxBet);
    }
  };

  const currentTurnPlayer = gameState.players.find((p) => p?.isCurrentTurn);

  return (
    <div className="w-full bg-slate-950/95 border-t border-slate-800/80 px-4 py-3 backdrop-blur-lg flex flex-col items-center gap-3 select-none z-30">
      {!isHeroTurn ? (
        <div className="flex items-center justify-between w-full max-w-4xl py-2 px-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-slate-300">
              Waiting for{' '}
              <strong className="text-amber-400 font-semibold">
                {currentTurnPlayer ? currentTurnPlayer.name : 'players'}
              </strong>
              ...
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0" />
              <span>Check / Fold</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0" />
              <span>Call Any</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Quick Presets & Bet Slider */}
          <div className="flex-1 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset('min')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Min (${minBet})
              </button>
              <button
                type="button"
                onClick={() => handlePreset('2.5x')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                2.5x
              </button>
              <button
                type="button"
                onClick={() => handlePreset('3x')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                3x
              </button>
              <button
                type="button"
                onClick={() => handlePreset('pot')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Pot
              </button>
              <button
                type="button"
                onClick={() => handlePreset('allin')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-300 border border-rose-700/50 transition-colors"
              >
                All-In
              </button>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={minBet}
                max={maxBet}
                step={gameState.minRaise}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-sm font-black text-amber-400 min-w-[70px] text-right">
                ${raiseAmount}
              </span>
            </div>
          </div>

          {/* Action Buttons: Fold, Check/Call, Bet/Raise */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Fold */}
            <button
              onClick={() => handleAction('fold')}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-950/40 border border-rose-500/30 transition-transform active:scale-95"
            >
              Fold
            </button>

            {/* Check / Call */}
            <button
              onClick={() => handleAction(canCheck ? 'check' : 'call')}
              className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-bold text-sm shadow-lg border transition-transform active:scale-95 ${
                canCheck
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-emerald-950/40 border-emerald-500/30'
                  : 'bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white shadow-blue-950/40 border-blue-500/30'
              }`}
            >
              {canCheck ? 'Check' : `Call $${callAmount}`}
            </button>

            {/* Bet / Raise */}
            <button
              onClick={() =>
                raiseAmount >= maxBet
                  ? handleAction('all-in')
                  : handleAction(highestBet === 0 ? 'bet' : 'raise', raiseAmount)
              }
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/40 border border-amber-400/50 transition-transform active:scale-95"
            >
              {raiseAmount >= maxBet ? (
                'ALL-IN'
              ) : (
                <>
                  <span>{highestBet === 0 ? 'Bet' : 'Raise'}</span>
                  <span>${raiseAmount}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
