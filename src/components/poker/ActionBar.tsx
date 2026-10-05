import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { ActionType } from '../../types/poker';
import { Clock } from 'lucide-react';

export const ActionBar: React.FC = () => {
  const gameState = usePokerStore((state) => state.gameState);
  const currentUserId = usePokerStore((state) => state.currentUserId);
  const dispatchPlayerAction = usePokerStore((state) => state.dispatchPlayerAction);

  // Find hero player
  const heroIndex = gameState.players.findIndex((p) => p?.id === currentUserId);
  const hero = heroIndex !== -1 ? gameState.players[heroIndex] : null;

  const isHeroTurn = hero?.isCurrentTurn ?? false;
  const legal = gameState.serverLegalActions;

  // Turn timer countdown calculation
  const turnTimeLimit = gameState.turnTimeLimit || 15;
  const turnStartedAt = gameState.turnStartedAt;
  const [timeLeft, setTimeLeft] = useState<number>(turnTimeLimit);

  useEffect(() => {
    if (!turnStartedAt) {
      setTimeLeft(turnTimeLimit);
      return;
    }

    const updateTimer = () => {
      const elapsed = (Date.now() - turnStartedAt) / 1000;
      const rem = Math.max(0, turnTimeLimit - elapsed);
      setTimeLeft(Math.ceil(rem));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);
    return () => clearInterval(interval);
  }, [turnStartedAt, turnTimeLimit]);


  // Derive legal action flags & ranges
  const canFold = legal ? legal.can_fold : isHeroTurn;
  const canCheck = legal ? legal.can_check : false;
  const canCall = legal ? legal.can_call : false;
  const callAmount = legal ? legal.call_amount : 0;

  const canBet = legal ? legal.can_bet : false;
  const canRaise = legal ? legal.can_raise : false;
  const canAllIn = legal ? legal.can_all_in : false;

  const minBet = legal
    ? legal.can_raise
      ? legal.min_raise
      : legal.can_bet
      ? legal.min_bet
      : 0
    : gameState.bigBlind;

  const maxBet = legal
    ? legal.can_raise
      ? legal.max_raise
      : legal.can_bet
      ? legal.max_bet
      : (hero?.chips || 0) + (hero?.currentBet || 0)
    : (hero?.chips || 0) + (hero?.currentBet || 0);

  const [raiseAmount, setRaiseAmount] = useState<number>(minBet);

  // Synchronize default raise value when turn becomes hero's
  useEffect(() => {
    if (isHeroTurn && (canBet || canRaise)) {
      setRaiseAmount(Math.min(minBet, maxBet));
    }
  }, [isHeroTurn, minBet, maxBet, canBet, canRaise]);

  if (!hero) {
    return (
      <div className="bg-slate-900/90 border-t border-slate-800 p-4 text-center backdrop-blur-md">
        <span className="text-slate-400 text-sm">
          Join a table seat from the lobby or table to participate.
        </span>
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
      setRaiseAmount(Math.min(maxBet, Math.max(minBet, Math.round(gameState.bigBlind * 2.5))));
    } else if (type === '3x') {
      setRaiseAmount(Math.min(maxBet, Math.max(minBet, Math.round(gameState.bigBlind * 3))));
    } else if (type === 'pot') {
      const potTotal = gameState.pots.reduce((sum, p) => sum + p.amount, 0);
      setRaiseAmount(Math.min(maxBet, Math.max(minBet, potTotal + callAmount)));
    } else if (type === 'allin') {
      setRaiseAmount(maxBet);
    }
  };

  const currentTurnPlayer = gameState.players.find((p) => p?.isCurrentTurn);

  return (
    <div className="w-full shrink-0 bg-slate-950/95 border-t border-slate-800/80 px-2 sm:px-4 py-1.5 sm:py-2.5 backdrop-blur-lg flex flex-col items-center gap-1.5 sm:gap-2.5 select-none z-30">
      {!isHeroTurn ? (
        <div className="flex items-center justify-between w-full max-w-4xl py-1 sm:py-1.5 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-slate-900/70 border border-slate-800 animate-fade-in">
          {/* Left: whose turn */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${timeLeft <= 5 ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-xs sm:text-sm text-slate-300 truncate">
              Waiting for{' '}
              <strong className="text-amber-400 font-semibold">
                {currentTurnPlayer ? currentTurnPlayer.name : 'players'}
              </strong>
              {currentTurnPlayer?.isSmallBlind && (
                <span className="ml-1 text-[9px] sm:text-[11px] bg-blue-600/30 text-blue-300 border border-blue-600/40 px-1 rounded-full font-semibold">SB</span>
              )}
              {currentTurnPlayer?.isBigBlind && (
                <span className="ml-1 text-[9px] sm:text-[11px] bg-purple-600/30 text-purple-300 border border-purple-600/40 px-1 rounded-full font-semibold">BB</span>
              )}
              {currentTurnPlayer && (
                <span className={`ml-2 text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  timeLeft <= 5 ? 'bg-rose-900/60 text-rose-300 border border-rose-600/50' : 'text-slate-400'
                }`}>
                  ({timeLeft}s)
                </span>
              )}
            </span>
          </div>

          {/* Right: blind info + pre-action */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500">
              <span className="text-blue-400 font-semibold">SB</span>
              <span>${gameState.smallBlind}</span>
              <span className="opacity-40">·</span>
              <span className="text-purple-400 font-semibold">BB</span>
              <span>${gameState.bigBlind}</span>
            </span>
            <label className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 cursor-pointer hover:text-slate-200">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 scale-90" />
              <span>Check/Fold</span>
            </label>
            <label className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 cursor-pointer hover:text-slate-200">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 scale-90" />
              <span>Call Any</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col gap-2">
          {/* Turn timer progress bar for Hero */}
          <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
              <span className={timeLeft <= 5 ? 'text-rose-400 font-bold' : 'text-amber-300'}>
                {timeLeft <= 5 ? 'Hurry up! Time is running out' : 'Your turn to act'}
              </span>
            </div>
            <div className={`font-mono font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-pulse text-xs' : 'text-amber-400'}`}>
              {timeLeft}s remaining
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ease-linear rounded-full ${
                timeLeft <= 5
                  ? 'bg-rose-500 shadow-rose-500 shadow-sm'
                  : timeLeft <= 8
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (timeLeft / turnTimeLimit) * 100))}%` }}
            />
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-1.5 sm:gap-3">
          {/* Quick Presets & Bet Slider */}
          {(canBet || canRaise) && maxBet > minBet && (
            <div className="flex-1 w-full flex flex-col gap-1 sm:gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handlePreset('min')}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Min (${minBet})
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('2.5x')}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  2.5x
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('3x')}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  3x
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('pot')}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Pot
                </button>
                {canAllIn && (
                  <button
                    type="button"
                    onClick={() => handlePreset('allin')}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded bg-rose-900/60 hover:bg-rose-800 text-rose-300 border border-rose-700/50 transition-colors"
                  >
                    All-In
                  </button>
                )}
              </div>

              {/* Slider */}
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="range"
                  min={minBet}
                  max={maxBet}
                  step={gameState.minRaise || gameState.smallBlind || 1}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="w-full h-1.5 sm:h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs sm:text-sm font-black text-amber-400 min-w-[55px] sm:min-w-[70px] text-right">
                  ${raiseAmount}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Fold, Check/Call, Bet/Raise, AllIn */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 w-full md:w-auto">
            {/* Fold */}
            {canFold && (
              <button
                type="button"
                onClick={() => handleAction('fold')}
                className="flex-1 md:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md border border-rose-500/30 transition-transform active:scale-95"
              >
                Fold
              </button>
            )}

            {/* Check */}
            {canCheck && (
              <button
                type="button"
                onClick={() => handleAction('check')}
                className="flex-1 md:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-md border transition-transform active:scale-95 bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white border-emerald-500/30"
              >
                Check
              </button>
            )}

            {/* Call */}
            {!canCheck && canCall && (
              <button
                type="button"
                onClick={() => handleAction('call')}
                className="flex-1 md:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-md border transition-transform active:scale-95 bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-blue-500/30"
              >
                Call ${callAmount}
              </button>
            )}

            {/* Bet / Raise */}
            {(canBet || canRaise) && (
              <button
                type="button"
                onClick={() =>
                  raiseAmount >= maxBet && canAllIn
                    ? handleAction('all-in')
                    : handleAction(canBet ? 'bet' : 'raise', raiseAmount)
                }
                className="flex-1 md:flex-initial flex items-center justify-center gap-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md border border-amber-400/50 transition-transform active:scale-95"
              >
                {raiseAmount >= maxBet && canAllIn ? (
                  'ALL-IN'
                ) : (
                  <>
                    <span>{canBet ? 'Bet' : 'Raise'}</span>
                    <span>${raiseAmount}</span>
                  </>
                )}
              </button>
            )}

            {/* Separate All-in button if Bet/Raise slider is not shown but All-in is legal */}
            {canAllIn && !canBet && !canRaise && (
              <button
                type="button"
                onClick={() => handleAction('all-in')}
                className="flex-1 md:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-md border transition-transform active:scale-95 bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50"
              >
                All-In
              </button>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
