import React from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { Trophy } from 'lucide-react';

// Coordinates for 6-max table layout in percentages (x, y)
const seatPositions6Max = [
  { x: 50, y: 88 },  // Seat 0: Hero (Bottom Center)
  { x: 14, y: 72 },  // Seat 1: Bottom Left
  { x: 14, y: 28 },  // Seat 2: Top Left
  { x: 50, y: 12 },  // Seat 3: Top Center
  { x: 86, y: 28 },  // Seat 4: Top Right
  { x: 86, y: 72 },  // Seat 5: Bottom Right
];

export const PokerTable: React.FC = () => {
  const gameState = usePokerStore((state) => state.gameState);
  const currentUserId = usePokerStore((state) => state.currentUserId);

  const { players, communityCards, pots, tableName, smallBlind, bigBlind, winningHand } = gameState;

  return (
    <div className="relative w-full max-w-5xl aspect-[16/9] min-h-[500px] max-h-[680px] mx-auto p-4 flex items-center justify-center select-none">
      {/* Outer Table Rim (Wood/Leather Bumper) */}
      <div className="relative w-full h-full rounded-[140px] bg-gradient-to-b from-[#2a1b14] via-[#1a0f0a] to-[#2a1b14] p-5 shadow-2xl border-4 border-[#3d271d]">
        {/* Chrome / Brass accent bead */}
        <div className="w-full h-full rounded-[120px] p-2 bg-[#120a06] border border-amber-600/30">
          {/* Inner Casino Green Felt */}
          <div className="relative w-full h-full rounded-[110px] bg-gradient-to-b from-[#1b5e20] via-[#144919] to-[#0d3311] shadow-felt-inner flex flex-col items-center justify-center overflow-hidden border border-emerald-400/20">
            {/* Table Watermark & Subtle Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#2e7d32_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            <div className="absolute top-1/4 text-center pointer-events-none opacity-40">
              <span className="font-serif-poker tracking-widest text-emerald-200 text-xs uppercase font-bold">
                {tableName}
              </span>
              <p className="text-[10px] text-emerald-300 font-medium">
                Blinds: ${smallBlind} / ${bigBlind}
              </p>
            </div>

            {/* Table Center: Pot and Community Cards */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <PotDisplay pots={pots} />
              <CommunityCards cards={communityCards} />
            </div>

            {/* Winner Announcement Banner */}
            {winningHand && (
              <div className="absolute z-30 bottom-1/4 bg-slate-950/90 border-2 border-amber-400 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                <div className="text-center">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Winner Takes ${winningHand.amountWon}</div>
                  <div className="text-sm font-black text-white">{winningHand.handName}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Seats positioned proportionally around the felt */}
      {seatPositions6Max.map((pos, index) => {
        const player = players[index] || null;
        const isHero = player?.id === currentUserId;

        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
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
  );
};
