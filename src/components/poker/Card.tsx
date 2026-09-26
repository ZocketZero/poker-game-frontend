import React from 'react';
import { Card as CardType, Suit } from '../../types/poker';
import { usePokerStore } from '../../store/usePokerStore';

interface CardProps {
  card?: CardType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const Card: React.FC<CardProps> = ({ card, className = '', size = 'md' }) => {
  const fourColorDeck = usePokerStore((state) => state.fourColorDeck);

  if (!card) {
    return (
      <div
        className={`rounded-lg border-2 border-dashed border-emerald-800/40 bg-emerald-950/20 flex items-center justify-center ${
          size === 'sm'
            ? 'w-7 h-10 sm:w-9 sm:h-13'
            : size === 'lg'
            ? 'w-14 h-20 sm:w-20 sm:h-28'
            : 'w-8 h-12 sm:w-12 sm:h-18 md:w-14 md:h-20'
        } ${className}`}
      />
    );
  }

  const { suit, rank, faceUp = true, highlighted = false } = card;
  const displayRank = rank === 'T' ? '10' : rank;

  // 4-Color deck vs standard 2-color
  const getSuitColor = (s: Suit) => {
    if (fourColorDeck) {
      switch (s) {
        case 'spades':
          return 'text-slate-900';
        case 'hearts':
          return 'text-red-600';
        case 'diamonds':
          return 'text-blue-600';
        case 'clubs':
          return 'text-emerald-700';
      }
    }
    return s === 'hearts' || s === 'diamonds' ? 'text-red-600' : 'text-slate-900';
  };

  const sizeClasses = {
    sm: 'w-7 h-10 sm:w-9 sm:h-13 text-[10px] sm:text-xs',
    md: 'w-8 h-12 sm:w-12 sm:h-18 md:w-14 md:h-20 text-xs sm:text-sm',
    lg: 'w-14 h-20 sm:w-20 sm:h-28 text-sm sm:text-base',
  }[size];

  if (!faceUp) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-md sm:rounded-lg bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-900 border-2 border-indigo-400/40 shadow-card flex items-center justify-center overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      >
        {/* Geometric card back pattern */}
        <div className="absolute inset-0.5 sm:inset-1 rounded border border-indigo-300/20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:6px_6px] opacity-70" />
        <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-indigo-300/40 flex items-center justify-center text-[9px] sm:text-[10px] text-indigo-300/80 font-bold">
          ♠
        </div>
      </div>
    );
  }

  const colorClass = getSuitColor(suit);
  const symbol = suitSymbols[suit];

  return (
    <div
      className={`relative ${sizeClasses} rounded-md sm:rounded-lg bg-white shadow-card font-semibold select-none flex flex-col justify-between p-0.5 sm:p-1 transition-all duration-200 overflow-hidden ${
        highlighted ? 'ring-2 sm:ring-4 ring-amber-400 scale-105 shadow-xl' : 'hover:-translate-y-0.5'
      } ${className}`}
    >
      {/* Top Left Corner Index: Rank on top, Suit symbol directly below it */}
      <div className={`self-start flex flex-col items-center leading-none ${colorClass} z-10 select-none`}>
        <span className="font-black tracking-tight text-[10px] sm:text-xs md:text-sm leading-none">
          {displayRank}
        </span>
        <span className="text-[9px] sm:text-[11px] md:text-xs leading-none mt-0.5">
          {symbol}
        </span>
      </div>

      {/* Center Suit Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none ${colorClass}`}>
        <span
          className={
            size === 'sm'
              ? 'text-xs opacity-35'
              : 'text-base sm:text-xl md:text-2xl opacity-80'
          }
        >
          {symbol}
        </span>
      </div>

      {/* Bottom Right Corner Index: Inverted 180deg */}
      <div className={`self-end flex flex-col items-center leading-none rotate-180 ${colorClass} z-10 select-none`}>
        <span className="font-black tracking-tight text-[10px] sm:text-xs md:text-sm leading-none">
          {displayRank}
        </span>
        <span className="text-[9px] sm:text-[11px] md:text-xs leading-none mt-0.5">
          {symbol}
        </span>
      </div>
    </div>
  );
};
