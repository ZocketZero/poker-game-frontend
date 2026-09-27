import React, { useState } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { GameMode } from '../../types/poker';
import { X, Sparkles, Trophy, DollarSign, Users, ArrowRight } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROOM_NAME_IDEAS = [
  'Royal Flush VIP Club',
  'Texas High Roller Lounge',
  'All-In Arena',
  'Monaco Elite Table',
  'Vegas Midnight Express',
  'Diamond Stakes Poker',
  'Golden Dragon Saloon',
];

const BLIND_PRESETS = [
  { label: 'Micro ($1 / $2)', sb: 1, bb: 2, ante: 0 },
  { label: 'Low ($5 / $10)', sb: 5, bb: 10, ante: 0 },
  { label: 'Medium ($10 / $20)', sb: 10, bb: 20, ante: 2 },
  { label: 'High Stakes ($50 / $100)', sb: 50, bb: 100, ante: 10 },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const createTable = usePokerStore((state) => state.createTable);
  const createTournament = usePokerStore((state) => state.createTournament);

  const [gameMode, setGameMode] = useState<GameMode>('Cash');
  const [roomName, setRoomName] = useState('High Roller Suite');
  const [smallBlind, setSmallBlind] = useState<number>(10);
  const [bigBlind, setBigBlind] = useState<number>(20);
  const [ante, setAnte] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState<number>(6);
  const [startingChips, setStartingChips] = useState<number>(5000);

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    const random = ROOM_NAME_IDEAS[Math.floor(Math.random() * ROOM_NAME_IDEAS.length)];
    setRoomName(random);
  };

  const handleApplyPreset = (preset: typeof BLIND_PRESETS[0]) => {
    setSmallBlind(preset.sb);
    setBigBlind(preset.bb);
    setAnte(preset.ante);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameMode === 'Cash') {
      createTable({
        name: roomName.trim() || `Cash Game $${smallBlind}/$${bigBlind}`,
        small_blind: Number(smallBlind),
        big_blind: Number(bigBlind),
        ante: Number(ante),
        max_players: Number(maxPlayers),
        game_mode: 'Cash',
      });
    } else {
      createTournament({
        small_blind: Number(smallBlind),
        big_blind: Number(bigBlind),
        ante: Number(ante),
        max_players: Number(maxPlayers),
        starting_chips: Number(startingChips),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 text-slate-100 flex flex-col gap-5 max-h-[92dvh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-xl text-slate-100 tracking-wide">
              Create Poker Room
            </h3>
            <p className="text-xs text-slate-400">
              Set your table stakes, game rules, and invite friends to join
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Game Mode Switcher */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Game Type</label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setGameMode('Cash')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${
                  gameMode === 'Cash'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Cash Game</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('Tournament')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${
                  gameMode === 'Tournament'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Tournament (MTT)</span>
              </button>
            </div>
          </div>

          {/* Room Name Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Room Name</label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                <span>Randomize</span>
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={40}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. VIP High Stakes Room"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Stakes Preset Shortcuts */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Stakes Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {BLIND_PRESETS.map((preset) => {
                const isSelected = smallBlind === preset.sb && bigBlind === preset.bb;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Small Blind & Big Blind */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Small Blind ($)</label>
              <input
                type="number"
                min={1}
                max={5000}
                required
                value={smallBlind}
                onChange={(e) => setSmallBlind(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Big Blind ($)</label>
              <input
                type="number"
                min={2}
                max={10000}
                required
                value={bigBlind}
                onChange={(e) => setBigBlind(Math.max(2, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Max Players & Ante */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Max Players</span>
              </label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value={2}>2 Players (Heads Up)</option>
                <option value={6}>6 Players (6-Max)</option>
                <option value={8}>8 Players</option>
                <option value={9}>9 Players (Full Ring)</option>
                <option value={10}>10 Players (Max Table)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Ante ($)</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={ante}
                onChange={(e) => setAnte(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Tournament Starting Chips */}
          {gameMode === 'Tournament' && (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-purple-950/20 border border-purple-800/40">
              <label className="text-xs font-bold text-purple-300">
                Starting Chips per Player
              </label>
              <input
                type="number"
                min={500}
                step={500}
                required
                value={startingChips}
                onChange={(e) => setStartingChips(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-purple-700/50 text-xs sm:text-sm text-slate-100 focus:outline-none"
              />
              <span className="text-[11px] text-purple-300/70">
                All players buy-in with equal chips. The last player standing takes the pot!
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Launch & Enter Room</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
