import React from 'react';

interface ChipStackProps {
  amount: number;
  className?: string;
  showLabel?: boolean;
}

export const ChipStack: React.FC<ChipStackProps> = ({ amount, className = '', showLabel = true }) => {
  if (amount <= 0) return null;

  // Format amount (e.g. 1.2k)
  const formatAmount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    return num.toString();
  };

  // Determine chip color palette based on bet magnitude
  const getChipColors = () => {
    if (amount >= 500) return 'from-purple-600 to-purple-800 border-purple-300 text-purple-100';
    if (amount >= 100) return 'from-slate-800 to-slate-950 border-slate-400 text-slate-100';
    if (amount >= 25) return 'from-emerald-600 to-emerald-800 border-emerald-300 text-emerald-100';
    if (amount >= 5) return 'from-red-600 to-red-800 border-red-300 text-red-100';
    return 'from-blue-600 to-blue-800 border-blue-300 text-blue-100';
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Visual Stack Effect */}
      <div className="relative flex items-center justify-center">
        {/* Under stacked chip shadow */}
        <div className="absolute -top-1 w-5 h-5 rounded-full bg-slate-900/60 border border-white/20" />
        {/* Main chip */}
        <div
          className={`relative w-6 h-6 rounded-full bg-gradient-to-b ${getChipColors()} border-2 border-dashed shadow-chip flex items-center justify-center font-bold text-[10px] transform hover:scale-110 transition-transform`}
        >
          <div className="w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center text-[8px]">
            ●
          </div>
        </div>
      </div>

      {showLabel && (
        <span className="bg-black/60 px-2 py-0.5 rounded-full text-xs font-bold text-amber-300 border border-amber-500/30 backdrop-blur-sm shadow">
          ${formatAmount(amount)}
        </span>
      )}
    </div>
  );
};
