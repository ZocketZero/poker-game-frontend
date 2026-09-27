import React, { useState, useMemo } from 'react';
import { usePokerStore } from '../store/usePokerStore';
import { Navbar } from '../components/layout/Navbar';
import { CreateRoomModal } from '../components/lobby/CreateRoomModal';
import { TableInfo } from '../types/poker';
import {
  Trophy,
  Users,
  Play,
  Plus,
  Search,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  Coins,
  ArrowRight,
  Flame,
  KeyRound,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const tables = usePokerStore((state) => state.tables);
  const currentTableId = usePokerStore((state) => state.currentTableId);
  const gameState = usePokerStore((state) => state.gameState);
  const fetchTables = usePokerStore((state) => state.fetchTables);
  const joinTable = usePokerStore((state) => state.joinTable);
  const quickPlay = usePokerStore((state) => state.quickPlay);
  const setCurrentView = usePokerStore((state) => state.setCurrentView);
  const auth = usePokerStore((state) => state.auth);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'Cash' | 'Tournament'>('All');
  const [filterStakes, setFilterStakes] = useState<'All' | 'Micro' | 'Mid' | 'High'>('All');
  const [directCode, setDirectCode] = useState('');
  const [directCodeError, setDirectCodeError] = useState<string | null>(null);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      // Mode filter
      if (filterMode !== 'All' && table.game_mode !== filterMode) {
        return false;
      }

      // Stakes filter
      if (filterStakes === 'Micro' && table.big_blind > 5) return false;
      if (filterStakes === 'Mid' && (table.big_blind <= 5 || table.big_blind > 40)) return false;
      if (filterStakes === 'High' && table.big_blind <= 40) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = table.name.toLowerCase().includes(query);
        const matchesId = table.id.toLowerCase().includes(query);
        return matchesName || matchesId;
      }

      return true;
    });
  }, [tables, filterMode, filterStakes, searchQuery]);

  const handleJoinTable = (table: TableInfo) => {
    const buyIn =
      table.game_mode === 'Tournament'
        ? table.starting_chips || 1000
        : Math.max(table.big_blind * 20, 200);
    // Join first available seat
    joinTable(table.id, 0, buyIn);
  };

  const handleDirectJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectCodeError(null);
    const code = directCode.trim();
    if (!code) return;

    const target = tables.find(
      (t) => t.id.toLowerCase() === code.toLowerCase() || t.name.toLowerCase() === code.toLowerCase()
    );

    if (target) {
      handleJoinTable(target);
    } else {
      // If code isn't in existing list, join with code as tableId
      joinTable(code, 0, 1000);
    }
  };

  // Stats
  const totalPlayersInRooms = tables.reduce((acc, t) => acc + (t.player_count || 1), 0);
  const activeRoomsCount = tables.length;

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar onCreateRoomClick={() => setIsCreateModalOpen(true)} />

      {/* Active Game Alert Banner (if seated/at table) */}
      {currentTableId && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">
              You have an active table in progress: <strong className="text-emerald-400">{gameState.tableName}</strong> (${gameState.smallBlind}/${gameState.bigBlind})
            </span>
          </div>
          <button
            onClick={() => setCurrentView('table')}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1 shadow transition-all active:scale-95"
          >
            <span>Return to Game</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6">
        {/* Glow Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm shadow-amber-500/10 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-time Multiplayer Texas Hold'em</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl">
            Create or Join Your Poker Room{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Host custom private tables with friends, compete in high-stakes Cash games, or dominate multi-table tournaments. Fast, frictionless online poker with no download required.
          </p>

          {/* Action Cards & Quick Join */}
          <div className="mt-8 w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {/* Quick Play Button */}
            <button
              type="button"
              onClick={quickPlay}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
            >
              <Play className="w-4 h-4 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>Quick Play</span>
            </button>

            {/* Create Room Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
              <span>Create New Room</span>
            </button>

            {/* Register / Welcome Bonus Button for non-authenticated */}
            {!auth.isAuthenticated && (
              <button
                type="button"
                onClick={() => setCurrentView('auth', 'register')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Claim $10,000 Bonus</span>
              </button>
            )}
          </div>

          {/* Join by Room Code bar */}
          <form
            onSubmit={handleDirectJoinSubmit}
            className="mt-6 w-full max-w-md p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 focus-within:border-amber-400/60 shadow-xl flex items-center gap-2 transition-all"
          >
            <div className="pl-3 text-slate-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={directCode}
              onChange={(e) => setDirectCode(e.target.value)}
              placeholder="Have a Room ID or Name? Paste here..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all shrink-0"
            >
              Join
            </button>
          </form>
          {directCodeError && (
            <p className="mt-1 text-xs text-rose-400">{directCodeError}</p>
          )}

          {/* Live Stats Strip */}
          <div className="mt-12 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Rooms</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-100">{activeRoomsCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Players Online</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-100">{totalPlayersInRooms + 12}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chips in Action</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-100">$2.4M+</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Engine Latency</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">&lt; 15ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Lobby Browser Section */}
      <section id="rooms" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="flex flex-col gap-6">
          {/* Section Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                <span>Poker Tables & Rooms</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
                  {filteredTables.length} Available
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a table below to sit down and play, or create your own custom game
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={fetchTables}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                title="Refresh Room List"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create Table</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1 text-xs font-bold">
                {(['All', 'Cash', 'Tournament'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      filterMode === mode
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'All' ? 'All Games' : mode === 'Cash' ? 'Cash Games' : 'Tournaments'}
                  </button>
                ))}
              </div>

              {/* Stakes Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1 text-xs font-bold">
                {(['All', 'Micro', 'Mid', 'High'] as const).map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => setFilterStakes(stk)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      filterStakes === stk
                        ? 'bg-slate-700 text-amber-300 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {stk === 'All' ? 'All Stakes' : stk}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by room name or ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400/60 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table Cards Grid */}
          {filteredTables.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-800/60 text-slate-400 mb-3">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-200">No rooms match your filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Be the table host! Create a room with your preferred blinds, seat limits, and rules in seconds.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                Create Room Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTables.map((table) => {
                const isCurrent = currentTableId === table.id;
                const isTournament = table.game_mode === 'Tournament';
                const occupancyPercent = Math.min(
                  100,
                  Math.round(((table.player_count || 1) / table.max_players) * 100)
                );

                return (
                  <div
                    key={table.id}
                    className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 group ${
                      isCurrent
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isTournament
                              ? 'bg-purple-950/80 text-purple-300 border-purple-600/40'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                          }`}
                        >
                          {table.game_mode}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {table.is_started ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-600/30">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>IN PLAY</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60">
                              WAITING
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Room Name */}
                      <h3 className="font-black text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                        {table.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        ID: {table.id}
                      </div>

                      {/* Room Details */}
                      <div className="mt-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Blinds & Ante:</span>
                          <span className="font-bold text-slate-200">
                            ${table.small_blind}/${table.big_blind}
                            {table.ante ? ` (Ante $${table.ante})` : ''}
                          </span>
                        </div>

                        {isTournament && table.starting_chips && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Starting Chips:</span>
                            <span className="font-bold text-amber-400">
                              ${table.starting_chips.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Player Seats Bar */}
                        <div>
                          <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>Seats Filled:</span>
                            </span>
                            <span className="font-bold text-slate-200">
                              {table.player_count}/{table.max_players} Players
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                occupancyPercent >= 90
                                  ? 'bg-rose-500'
                                  : occupancyPercent >= 50
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Join / Table Action Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      {isCurrent ? (
                        <button
                          type="button"
                          onClick={() => setCurrentView('table')}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Return to Seated Table</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinTable(table)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Join Table</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="bg-slate-950/60 border-t border-slate-800/80 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-100">Custom Private Rooms</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create heads-up 1v1 duels, 6-max tables, or 9-handed tournament championships with custom blinds, antes, and starting bankrolls.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-100">Live WebSocket Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless real-time action synchronization. Low-latency player action timers, card reveals, hand evaluation, and automated pot distribution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-100">Fair Play & Smart UI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enjoy accessibility features such as a 4-color deck, customizable orientation, mobile responsiveness, and crisp audio cues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Poker Pro • Texas Hold'em Real-time Web Platform</p>
      </footer>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
