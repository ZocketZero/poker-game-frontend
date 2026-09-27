import React from 'react';
import { Player } from '../../types/poker';
import { Card } from './Card';
import { ChipStack } from './ChipStack';
import { usePokerStore } from '../../store/usePokerStore';
import { UserPlus } from 'lucide-react';

interface PlayerSeatProps {
  player: Player | null;
  seatIndex: number;
  isHero?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({ player, seatIndex, isHero = false }) => {
  const seatPlayer = usePokerStore((state) => state.seatPlayer);
  const auth = usePokerStore((state) => state.auth);
  const setIsAuthOpen = usePokerStore((state) => state.setIsAuthOpen);
  const currentTableId = usePokerStore((state) => state.currentTableId);
  const setIsLobbyOpen = usePokerStore((state) => state.setIsLobbyOpen);

  const handleSitClick = () => {
    if (!auth.isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    if (!currentTableId) {
      setIsLobbyOpen(true);
      return;
    }
    seatPlayer(seatIndex);
  };

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={handleSitClick}
          className="group w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-emerald-600/40 bg-emerald-950/30 hover:bg-emerald-900/40 hover:border-amber-400/70 flex flex-col items-center justify-center text-emerald-400/80 hover:text-amber-300 transition-all duration-200 shadow-inner"
          title={`Seat ${seatIndex + 1} - Click to sit`}
        >
          <UserPlus className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] sm:text-[10px] mt-0.5 font-semibold uppercase tracking-wider">Sit</span>
        </button>
      </div>
    );
  }

  const {
    name,
    avatar,
    chips,
    currentBet,
    status,
    cards,
    isDealer,
    isSmallBlind,
    isBigBlind,
    isCurrentTurn,
    lastAction,
  } = player;

  const isFolded = status === 'folded';
  const isAllIn = status === 'all-in';

  return (
    <div className={`relative flex flex-col items-center select-none ${isFolded ? 'opacity-40 grayscale-[50%]' : ''}`}>
      {/* Bet Stack floating in front of player towards center */}
      {currentBet > 0 && (
        <div className="absolute -top-5 sm:-top-7 z-20 scale-75 sm:scale-100 origin-bottom animate-fade-in">
          <ChipStack amount={currentBet} />
        </div>
      )}

      {/* Main Seat Box */}
      <div
        className={`relative flex items-center gap-1.5 sm:gap-2.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-slate-900/90 border-2 backdrop-blur-md transition-all duration-300 shadow-xl ${
          isCurrentTurn
            ? 'border-amber-400 ring-2 sm:ring-4 ring-amber-400/40 shadow-turn-pulse scale-105'
            : isHero
            ? 'border-blue-500/80 ring-1 sm:ring-2 ring-blue-500/30'
            : 'border-slate-700/80'
        }`}
      >
        {/* Avatar with Turn Ring */}
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-600/60 bg-slate-800 object-cover"
          />
          {isCurrentTurn && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-amber-500 border border-slate-900"></span>
            </span>
          )}
        </div>

        {/* Info Column */}
        <div className="flex flex-col min-w-[50px] sm:min-w-[65px]">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="text-[9px] sm:text-xs font-semibold text-slate-100 truncate max-w-[55px] sm:max-w-[80px]">{name}</span>
            {isHero && <span className="text-[7px] sm:text-[9px] bg-blue-600 text-blue-100 px-0.5 sm:px-1 rounded font-bold">ME</span>}
          </div>
          <span className="text-[9px] sm:text-xs font-bold text-amber-400 tracking-tight">
            ${chips.toLocaleString()}
          </span>
        </div>

        {/* Badges: Dealer, SB, BB */}
        <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 z-10">
          {isDealer && (
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-300 text-slate-950 font-black text-[9px] sm:text-[11px] flex items-center justify-center border border-amber-600 shadow-md">
              D
            </span>
          )}
          {isSmallBlind && (
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 text-white font-black text-[7px] sm:text-[9px] flex items-center justify-center border border-blue-700 shadow-md">
              SB
            </span>
          )}
          {isBigBlind && (
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 text-white font-black text-[7px] sm:text-[9px] flex items-center justify-center border border-purple-800 shadow-md">
              BB
            </span>
          )}
        </div>

        {/* Action / Status Pill */}
        {lastAction && (
          <div
            className={`absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider border shadow ${
              lastAction.type === 'fold'
                ? 'bg-rose-950/90 text-rose-300 border-rose-600/50'
                : lastAction.type === 'check'
                ? 'bg-slate-800/90 text-slate-300 border-slate-500/50'
                : lastAction.type === 'call'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
            }`}
          >
            {lastAction.type} {lastAction.amount ? `$${lastAction.amount}` : ''}
          </div>
        )}

        {isAllIn && (
          <div className="absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white border border-rose-300 shadow animate-pulse">
            ALL-IN
          </div>
        )}
      </div>

      {/* Hole Cards */}
      {cards && cards.length > 0 && (
        <div className="flex items-center -space-x-4 mt-1.5 z-10">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`transform transition-transform duration-200 ${
                i === 0 ? '-rotate-6 hover:-translate-y-1' : 'rotate-6 hover:-translate-y-1'
              }`}
            >
              <Card card={c} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
