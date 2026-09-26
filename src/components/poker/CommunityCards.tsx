import React from 'react';
import { Card as CardType } from '../../types/poker';
import { Card } from './Card';

interface CommunityCardsProps {
  cards: CardType[];
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  // Always show 5 slots: Flop 1-3, Turn 4, River 5
  const slots = Array.from({ length: 5 }, (_, i) => cards[i] || null);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/30 border border-emerald-500/20 backdrop-blur-sm shadow-inner">
      {slots.map((card, idx) => (
        <div key={idx} className="transition-all duration-300">
          <Card card={card || undefined} size="md" />
        </div>
      ))}
    </div>
  );
};
