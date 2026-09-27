import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { Trophy, Clock } from 'lucide-react';

/**
 * Calculates (x, y) coordinates as percentages around the table perimeter
 * for any number of seats from 2 to 10.
 * Seat 0 (Hero) is always anchored at bottom center.
 */
export const calculateSeatCoordinates = (
  totalSeats: number,
  isVertical: boolean
): { x: number; y: number }[] => {
  const count = Math.max(2, Math.min(10, totalSeats));

  if (!isVertical) {
    // Horizontal (Landscape / Desktop)
    if (count === 2) {
      return [
        { x: 50, y: 90 }, // Hero (Bottom)
        { x: 50, y: 10 }, // Opponent (Top)
      ];
    }
    if (count === 6) {
      return [
        { x: 50, y: 90 },
        { x: 12, y: 72 },
        { x: 12, y: 28 },
        { x: 50, y: 10 },
        { x: 88, y: 28 },
        { x: 88, y: 72 },
      ];
    }
    if (count === 9) {
      return [
        { x: 50, y: 91 },
        { x: 26, y: 84 },
        { x: 11, y: 58 },
        { x: 11, y: 32 },
        { x: 30, y: 11 },
        { x: 70, y: 11 },
        { x: 89, y: 32 },
        { x: 89, y: 58 },
        { x: 74, y: 84 },
      ];
    }

    // Elliptical distribution for 3, 4, 5, 7, 8, 10 seats
    const Rx = 39.5;
    const Ry = 39.5;
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.PI / 2 + (i * 2 * Math.PI) / count;
      const x = Math.round((50 + Rx * Math.cos(theta)) * 10) / 10;
      const y = Math.round((50 + Ry * Math.sin(theta)) * 10) / 10;
      coords.push({ x, y });
    }
    return coords;
  } else {
    // Vertical (Portrait Mobile)
    if (count === 2) {
      return [
        { x: 50, y: 92 },
        { x: 50, y: 8 },
      ];
    }
    if (count === 6) {
      return [
        { x: 50, y: 91 },
        { x: 13, y: 70 },
        { x: 13, y: 30 },
        { x: 50, y: 9 },
        { x: 87, y: 30 },
        { x: 87, y: 70 },
      ];
    }

    const Rx = 38;
    const Ry = 41.5;
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.PI / 2 + (i * 2 * Math.PI) / count;
      const x = Math.round((50 + Rx * Math.cos(theta)) * 10) / 10;
      const y = Math.round((50 + Ry * Math.sin(theta)) * 10) / 10;
      coords.push({ x, y });
    }
    return coords;
  }
};

/** Stage label mapping for the HUD */
const STAGE_LABELS: Record<string, string> = {
  waiting: 'Waiting',
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export const PokerTable: React.FC = () => {
  const gameState = usePokerStore((state) => state.gameState);
  const currentUserId = usePokerStore((state) => state.currentUserId);
  const tableOrientation = usePokerStore((state) => state.tableOrientation);

  const [isMobilePortrait, setIsMobilePortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 && window.innerHeight > window.innerWidth;
    }
    return false;
  });

  useEffect(() => {
    const checkOrientation = () => {
      setIsMobilePortrait(window.innerWidth < 640 && window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const {
    players,
    communityCards,
    pots,
    tableName,
    smallBlind,
    bigBlind,
    winningHand,
    maxSeats = 6,
    stage,
    currentTurnSeat,
  } = gameState;

  const currentTurnPlayer = currentTurnSeat !== null ? players[currentTurnSeat] : null;
  const heroPlayer = players.find((p) => p?.id === currentUserId) ?? null;
  const isHeroTurn = heroPlayer?.isCurrentTurn ?? false;

  // Determine effective orientation mode
  const isVertical =
    tableOrientation === 'vertical' || (tableOrientation === 'auto' && isMobilePortrait);
  const isRotated90 = tableOrientation === 'rotated90';

  const totalSeats = Math.max(2, Math.min(10, maxSeats));
  const currentPositions = calculateSeatCoordinates(totalSeats, isVertical);

  // Dynamic scale adjustment for high seat counts (8-10 players)
  const seatScaleClass =
    totalSeats >= 9
      ? 'scale-[0.78] sm:scale-85'
      : totalSeats >= 7
      ? 'scale-[0.88] sm:scale-95'
      : 'scale-100';

  return (
    <div className="relative w-full h-full max-h-full flex items-center justify-center p-1 sm:p-2 md:p-3 select-none overflow-hidden">
      <div
        className={`relative flex items-center justify-center transition-all duration-300 ${
          isRotated90 ? 'origin-center' : ''
        }`}
        style={
          isRotated90
            ? {
                transform: 'rotate(90deg)',
                width: 'min(calc(100dvh - 120px), 720px)',
                aspectRatio: '16 / 9',
                maxHeight: 'min(calc(100dvw - 20px), 440px)',
              }
            : isVertical
            ? {
                aspectRatio: '9 / 14',
                maxHeight: '100%',
                width: 'min(100%, calc((100dvh - 110px) * (9 / 14)))',
                maxWidth: '440px',
              }
            : {
                aspectRatio: '16 / 9',
                maxHeight: '100%',
                width: 'min(100%, calc((100dvh - 110px) * 1.6))',
                maxWidth: '1020px',
              }
        }
      >
        {/* Outer Table Rim (Wood/Leather Bumper) */}
        <div
          className={`relative w-full h-full bg-gradient-to-b from-[#2a1b14] via-[#1a0f0a] to-[#2a1b14] shadow-2xl border-2 sm:border-4 border-[#3d271d] ${
            isVertical
              ? 'rounded-[70px] sm:rounded-[90px] p-2.5 sm:p-3.5'
              : 'rounded-[60px] sm:rounded-[90px] md:rounded-[130px] p-2 sm:p-3.5 md:p-5'
          }`}
        >
          {/* Chrome / Brass accent bead */}
          <div
            className={`w-full h-full bg-[#120a06] border border-amber-600/30 ${
              isVertical
                ? 'rounded-[62px] sm:rounded-[80px] p-1'
                : 'rounded-[50px] sm:rounded-[80px] md:rounded-[115px] p-1 sm:p-1.5 md:p-2'
            }`}
          >
            {/* Inner Casino Green Felt */}
            <div
              className={`relative w-full h-full bg-gradient-to-b from-[#1b5e20] via-[#144919] to-[#0d3311] shadow-felt-inner flex flex-col items-center justify-center overflow-hidden border border-emerald-400/20 ${
                isVertical
                  ? 'rounded-[56px] sm:rounded-[72px]'
                  : 'rounded-[44px] sm:rounded-[72px] md:rounded-[105px]'
              }`}
            >
              {/* Table Watermark & Subtle Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#2e7d32_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

              {/* ── Table Info Watermark (top) ── */}
              <div
                className={`absolute text-center pointer-events-none opacity-40 ${
                  isVertical ? 'top-[20%]' : 'top-[22%]'
                }`}
              >
                <span className="font-serif-poker tracking-widest text-emerald-200 text-[9px] sm:text-xs uppercase font-bold">
                  {tableName} • {totalSeats}-Max
                </span>
                <p className="text-[8px] sm:text-[10px] text-emerald-300 font-medium">
                  Blinds: ${smallBlind} / ${bigBlind}
                </p>
              </div>

              {/* ── Live Blind / Stage HUD (bottom of felt, above pot) ── */}
              <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-10">
                {/* Stage pill */}
                {stage !== 'waiting' && (
                  <span className="px-1.5 py-0.5 rounded-full bg-black/50 border border-emerald-600/40 text-[8px] sm:text-[10px] text-emerald-300 font-bold uppercase tracking-wider animate-fade-in">
                    {STAGE_LABELS[stage] ?? stage}
                  </span>
                )}
                {/* Blinds pill */}
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 border border-slate-600/40 text-[8px] sm:text-[10px] text-slate-300 font-semibold animate-fade-in">
                  <span className="text-blue-400 font-bold">SB</span>
                  <span>${smallBlind}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-purple-400 font-bold">BB</span>
                  <span>${bigBlind}</span>
                </span>
              </div>

              {/* ── Whose Turn HUD ── */}
              {currentTurnPlayer && stage !== 'waiting' && (
                <div
                  key={currentTurnPlayer.id}
                  className={`absolute top-[28%] left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border shadow-lg backdrop-blur-sm pointer-events-none z-10 animate-fade-in-up ${
                    isHeroTurn
                      ? 'bg-amber-500/90 border-amber-300 text-slate-950'
                      : 'bg-slate-900/85 border-amber-500/60 text-amber-300'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  <span className="text-[9px] sm:text-[11px] font-bold truncate max-w-[100px] sm:max-w-[140px]">
                    {isHeroTurn ? '⚡ Your Turn!' : `${currentTurnPlayer.name}'s turn`}
                  </span>
                </div>
              )}

              {/* Table Center: Pot and Community Cards */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2.5">
                <PotDisplay pots={pots} />
                <CommunityCards cards={communityCards} />
              </div>

              {/* ── Winner Announcement Banner ── */}
              {winningHand && (
                <div className="absolute z-30 bottom-1/4 animate-winner-in">
                  <div className="bg-slate-950/95 border-2 border-amber-400 px-4 sm:px-7 py-1.5 sm:py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
                    <div className="text-center">
                      <div className="text-[9px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Winner Takes ${winningHand.amountWon.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-white">{winningHand.handName}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Seats positioned proportionally around the felt */}
        {currentPositions.map((pos, index) => {
          const player = players[index] || null;
          const isHero = player?.id === currentUserId;

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto transition-all duration-300 ${seatScaleClass}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              <PlayerSeat player={player} seatIndex={index} isHero={isHero} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
