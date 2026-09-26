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
        className={`relative ${sizeClasses} rounded-lg bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-900 border-2 border-indigo-400/40 shadow-card flex items-center justify-center overflow-hidden transition-all duration-300 hover:-translate-y-1 ${className}`}
      >
        {/* Geometric card back pattern */}
        <div className="absolute inset-1 rounded border border-indigo-300/20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:6px_6px] opacity-70" />
        <div className="relative w-5 h-5 rounded-full border border-indigo-300/40 flex items-center justify-center text-[10px] text-indigo-300/80 font-bold">
          ♠
        </div>
      </div>
    );
  }

  const colorClass = getSuitColor(suit);
  const symbol = suitSymbols[suit];

  return (
    <div
      className={`relative ${sizeClasses} rounded-lg bg-white shadow-card font-semibold select-none flex flex-col justify-between p-0.5 sm:p-1.5 transition-all duration-200 ${
        highlighted ? 'ring-2 sm:ring-4 ring-amber-400 scale-105 shadow-xl' : 'hover:-translate-y-0.5'
      } ${className}`}
    >
      {/* Top Left Rank & Suit */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="font-bold tracking-tight text-[9px] sm:text-xs md:text-sm">{rank}</span>
        <span className="text-[8px] sm:text-[10px] md:text-xs -mt-0.5">{symbol}</span>
      </div>

      {/* Center Big Suit */}
      <div className={`absolute inset-0 flex items-center justify-center text-xs sm:text-base md:text-xl pointer-events-none opacity-85 ${colorClass}`}>
        {symbol}
      </div>

      {/* Bottom Right Rank & Suit (Inverted) */}
      <div className={`flex flex-col items-center leading-none rotate-180 self-end ${colorClass}`}>
        <span className="font-bold tracking-tight text-[9px] sm:text-xs md:text-sm">{rank}</span>
        <span className="text-[8px] sm:text-[10px] md:text-xs -mt-0.5">{symbol}</span>
      </div>
    </div>
  );
};
