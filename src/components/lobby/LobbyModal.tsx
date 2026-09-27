import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { GameMode, TableInfo } from '../../types/poker';
import { X, Plus, RefreshCw, Trophy, Users, Play } from 'lucide-react';

export const LobbyModal: React.FC = () => {
  const isLobbyOpen = usePokerStore((state) => state.isLobbyOpen);
  const setIsLobbyOpen = usePokerStore((state) => state.setIsLobbyOpen);
  const tables = usePokerStore((state) => state.tables);
  const currentTableId = usePokerStore((state) => state.currentTableId);
  const fetchTables = usePokerStore((state) => state.fetchTables);
  const createTable = usePokerStore((state) => state.createTable);
  const createTournament = usePokerStore((state) => state.createTournament);
  const joinTable = usePokerStore((state) => state.joinTable);

  const [view, setView] = useState<'list' | 'create'>('list');
  const [createMode, setCreateMode] = useState<GameMode>('Cash');

  // Form fields
  const [smallBlind, setSmallBlind] = useState<number>(10);
  const [bigBlind, setBigBlind] = useState<number>(20);
  const [ante, setAnte] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState<number>(6);
  const [startingChips, setStartingChips] = useState<number>(5000);

  useEffect(() => {
    if (isLobbyOpen) {
      fetchTables();
    }
  }, [isLobbyOpen, fetchTables]);

  if (!isLobbyOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMode === 'Cash') {
      createTable({
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
    setView('list');
  };

  const handleQuickJoin = (table: TableInfo) => {
    // Default to seat 0 or next available
    const tableBuyIn =
      table.game_mode === 'Tournament'
        ? table.starting_chips || 1000
        : Math.max(table.big_blind * 20, 400);
    joinTable(table.id, 0, tableBuyIn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col gap-4 max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Poker Tables Lobby</h3>
              <p className="text-xs text-slate-400">Browse live tables or create your own room</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === 'list' ? (
              <>
                <button
                  type="button"
                  onClick={fetchTables}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                  title="Refresh Table List"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('create')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Table</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Back to List
              </button>
            )}
            <button
              onClick={() => setIsLobbyOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content View */}
        {view === 'list' ? (
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {tables.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                <Users className="w-10 h-10 text-slate-600 mb-1" />
                <p className="font-semibold text-sm text-slate-300">No active tables found</p>
                <p className="text-xs max-w-xs text-slate-500">
                  Be the first to open a table! Click "Create Table" above to launch a Cash or Tournament game.
                </p>
                <button
                  onClick={() => setView('create')}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Create New Room
                </button>
              </div>
            ) : (
              tables.map((table) => {
                const isCurrent = currentTableId === table.id;
                const isTournament = table.game_mode === 'Tournament';

                return (
                  <div
                    key={table.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{table.name}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                            isTournament
                              ? 'bg-purple-950 text-purple-300 border-purple-600/50'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                          }`}
                        >
                          {table.game_mode}
                        </span>
                        {table.is_started && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/40">
                            IN PLAY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>
                          Blinds: <strong className="text-slate-200">${table.small_blind}/${table.big_blind}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Players: <strong className="text-slate-200">{table.player_count}/{table.max_players}</strong>
                        </span>
                        {isTournament && table.starting_chips && (
                          <>
                            <span>•</span>
                            <span>
                              Chips: <strong className="text-amber-400">${table.starting_chips.toLocaleString()}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isCurrent ? (
                        <span className="text-xs font-bold text-amber-400 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40">
                          Joined
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickJoin(table)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Join Room</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Create Table Form */
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3.5 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCreateMode('Cash')}
                className={`py-1.5 rounded-lg transition-all ${
                  createMode === 'Cash'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cash Game
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('Tournament')}
                className={`py-1.5 rounded-lg transition-all ${
                  createMode === 'Tournament'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tournament
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Small Blind ($)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={smallBlind}
                  onChange={(e) => setSmallBlind(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Big Blind ($)</label>
                <input
                  type="number"
                  min={2}
                  required
                  value={bigBlind}
                  onChange={(e) => setBigBlind(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Max Players (2 - 10)</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  required
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Ante ($)</label>
                <input
                  type="number"
                  min={0}
                  value={ante}
                  onChange={(e) => setAnte(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>
            </div>

            {createMode === 'Tournament' && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Equal Starting Chips for All Players ($)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  required
                  value={startingChips}
                  onChange={(e) => setStartingChips(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
                <span className="text-[10px] text-slate-400">
                  Tournament locks once the first hand begins; eliminated players receive rank broadcast.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              Launch {createMode === 'Tournament' ? 'Tournament' : 'Cash'} Table
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
