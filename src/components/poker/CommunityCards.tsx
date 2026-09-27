import React, { useRef, useEffect, useState } from 'react';
import { Card as CardType } from '../../types/poker';
import { Card } from './Card';

interface CommunityCardsProps {
  cards: CardType[];
}

/**
 * Renders 5 card slots for the board with a staggered deal animation:
 * each card animates in individually the first time it appears.
 */
export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  const [animatedSlots, setAnimatedSlots] = useState<boolean[]>([false, false, false, false, false]);
  const prevCountRef = useRef<number>(cards.length);

  useEffect(() => {
    const prev = prevCountRef.current;
    const curr = cards.length;

    if (curr === 0) {
      // Reset animation state on new hand
      setAnimatedSlots([false, false, false, false, false]);
      prevCountRef.current = 0;
      return;
    }

    if (curr > prev) {
      // Stagger-animate newly revealed cards
      for (let i = prev; i < curr; i++) {
        const delay = (i - prev) * 110; // 110ms between each card
        setTimeout(() => {
          setAnimatedSlots((s) => {
            const next = [...s];
            next[i] = true;
            return next;
          });
        }, delay);
      }
    }

    prevCountRef.current = curr;
  }, [cards.length]);

  const slots = Array.from({ length: 5 }, (_, i) => cards[i] || null);

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-black/30 border border-emerald-500/20 backdrop-blur-sm shadow-inner">
      {slots.map((card, idx) => (
        <div
          key={idx}
          className="transition-all duration-300"
          style={
            card && animatedSlots[idx]
              ? {
                  animation: `communityDeal 0.45s cubic-bezier(0.22, 1, 0.36, 1) both`,
                  animationDelay: '0ms', // stagger handled by setTimeout above
                }
              : undefined
          }
        >
          <Card card={card || undefined} size="md" />
        </div>
      ))}
    </div>
  );
};
