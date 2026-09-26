import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { Trophy } from 'lucide-react';

// Coordinates for Horizontal 6-max table layout in percentages (x, y)
const horizontalSeatPositions = [
  { x: 50, y: 90 }, // Seat 0: Hero (Bottom Center)
  { x: 12, y: 72 }, // Seat 1: Bottom Left
  { x: 12, y: 28 }, // Seat 2: Top Left
  { x: 50, y: 10 }, // Seat 3: Top Center
  { x: 88, y: 28 }, // Seat 4: Top Right
  { x: 88, y: 72 }, // Seat 5: Bottom Right
];

// Coordinates for Vertical (Mobile Portrait) 6-max table layout in percentages (x, y)
const verticalSeatPositions = [
  { x: 50, y: 91 }, // Seat 0: Hero (Bottom Center)
  { x: 13, y: 70 }, // Seat 1: Bottom Left
  { x: 13, y: 30 }, // Seat 2: Top Left
  { x: 50, y: 9 },  // Seat 3: Top Center
  { x: 87, y: 30 }, // Seat 4: Top Right
  { x: 87, y: 70 }, // Seat 5: Bottom Right
];

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

  const { players, communityCards, pots, tableName, smallBlind, bigBlind, winningHand } = gameState;

  // Determine effective orientation mode
  const isVertical =
    tableOrientation === 'vertical' || (tableOrientation === 'auto' && isMobilePortrait);
  const isRotated90 = tableOrientation === 'rotated90';

  const currentPositions = isVertical ? verticalSeatPositions : horizontalSeatPositions;

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
                maxWidth: '430px',
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

              <div
                className={`absolute text-center pointer-events-none opacity-40 ${
                  isVertical ? 'top-[20%]' : 'top-[22%]'
                }`}
              >
                <span className="font-serif-poker tracking-widest text-emerald-200 text-[9px] sm:text-xs uppercase font-bold">
                  {tableName}
                </span>
                <p className="text-[8px] sm:text-[10px] text-emerald-300 font-medium">
                  Blinds: ${smallBlind} / ${bigBlind}
                </p>
              </div>

              {/* Table Center: Pot and Community Cards */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2.5">
                <PotDisplay pots={pots} />
                <CommunityCards cards={communityCards} />
              </div>

              {/* Winner Announcement Banner */}
              {winningHand && (
                <div className="absolute z-30 bottom-1/4 bg-slate-950/90 border border-amber-400 sm:border-2 px-3 sm:px-6 py-1 sm:py-2 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-2 sm:gap-3">
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
                  <div className="text-center">
                    <div className="text-[9px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Winner Takes ${winningHand.amountWon}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white">{winningHand.handName}</div>
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
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
