import React from 'react';
import { Pot } from '../../types/poker';
import { ChipStack } from './ChipStack';
import { Trophy } from 'lucide-react';

interface PotDisplayProps {
  pots: Pot[];
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ pots }) => {
  const totalPot = pots.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-950/70 border border-amber-500/40 shadow-lg backdrop-blur-md">
        <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
        <span className="text-[9px] sm:text-[11px] font-semibold text-slate-300 uppercase tracking-widest">Total Pot</span>
        <span className="text-xs sm:text-sm font-black text-amber-300">${totalPot.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-3">
        {pots.map((pot, idx) => (
          <div key={idx} className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <ChipStack amount={pot.amount} showLabel={false} />
            {pots.length > 1 && (
              <span className="text-[10px] text-slate-400 font-medium">{pot.name || `Pot ${idx + 1}`}:</span>
            )}
            <span className="text-xs font-bold text-amber-400">${pot.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
