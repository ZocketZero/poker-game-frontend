import { create } from 'zustand';
import {
  GameState,
  ActionType,
  Card,
  TableStage,
  WinningHand,
  Player,
  TableInfo,
  ServerTableState,
  LegalActions,
  GameMode,
  RawCardCode,
  ActionPayload,
} from '../types/poker';
import {
  createInitialMockGameState,
  sampleCommunityCards,
  generateMockPlayersForSeats,
  defaultMockTables,
} from '../utils/mockData';
import { parseCards } from '../utils/cardParser';
import { apiClient } from '../services/apiClient';
import { pokerWsClient } from '../services/pokerWebSocket';
import confetti from 'canvas-confetti';

interface AuthState {
  token: string | null;
  username: string | null;
  chips: number;
  isAuthenticated: boolean;
}

interface PokerStore {
  // Navigation & Page Views
  currentView: 'home' | 'table' | 'auth';
  authViewMode: 'login' | 'register';
  setCurrentView: (view: 'home' | 'table' | 'auth', authMode?: 'login' | 'register') => void;
  quickPlay: () => void;

  // Game Table
  gameState: GameState;
  currentUserId: string;
  isMockMode: boolean;
  isConnected: boolean;
  soundEnabled: boolean;
  fourColorDeck: boolean;
  tableOrientation: 'auto' | 'vertical' | 'rotated90' | 'horizontal';

  // Auth
  auth: AuthState;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => void;

  // Lobby
  tables: TableInfo[];
  currentTableId: string | null;
  isLobbyOpen: boolean;
  setIsLobbyOpen: (open: boolean) => void;
  fetchTables: () => void;
  createTable: (config: {
    name?: string;
    small_blind: number;
    big_blind: number;
    ante?: number;
    max_players?: number;
    game_mode?: GameMode;
    starting_chips?: number;
  }) => void;
  createTournament: (config: {
    small_blind: number;
    big_blind: number;
    ante?: number;
    max_players?: number;
    starting_chips: number;
  }) => void;
  joinTable: (tableId: string, seat: number, buyIn: number) => void;
  leaveTable: () => void;
  startHand: () => void;

  // Notification / Feedback
  toastMessage: { text: string; type: 'info' | 'error' | 'success' } | null;
  clearToast: () => void;

  // Actions & Settings
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
  setIsConnected: (connected: boolean) => void;
  setMockMode: (enabled: boolean) => void;
  toggleSound: () => void;
  toggleFourColorDeck: () => void;
  toggleOrientation: () => void;
  setMaxSeats: (seats: number) => void;

  // Gameplay
  dispatchPlayerAction: (action: ActionType, amount?: number) => void;
  seatPlayer: (seatIndex: number, name?: string) => void;
  leaveSeat: (seatIndex: number) => void;

  // Server message handlers
  applyTableState: (state: ServerTableState) => void;
  applyHoleCards: (cards: RawCardCode[] | string[] | any) => void;
  applyYourTurn: (legalActions: LegalActions) => void;
  applyGameEvent: (event: any) => void;
  applyPlayerJoined: (data: { seat: number; username: string; chips: number }) => void;
  applyPlayerLeft: (data: { seat: number; username: string }) => void;
  applyPlayerEliminated: (data: { seat: number; username: string; rank: number }) => void;
  applyTournamentEnded: (data: { winner_username: string; prize: number }) => void;
  applyServerError: (message: string) => void;

  // Mock controls
  nextStreet: () => void;
  resetGame: () => void;
  triggerShowdown: () => void;
}

const mapServerStage = (stage: string): TableStage => {
  const s = stage.toLowerCase();
  if (s.includes('preflop') || s.includes('pre-flop')) return 'preflop';
  if (s.includes('flop')) return 'flop';
  if (s.includes('turn')) return 'turn';
  if (s.includes('river')) return 'river';
  if (s.includes('showdown')) return 'showdown';
  if (s.includes('wait')) return 'waiting';
  return 'preflop';
};

const initialStoredUser = apiClient.getStoredUser();
const initialStoredToken = apiClient.getStoredToken();

// Initial view from hash if present
const getInitialView = (): 'home' | 'table' | 'auth' => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('table')) return 'table';
    if (hash.includes('login') || hash.includes('register') || hash.includes('auth')) return 'auth';
  }
  return 'home';
};

const getInitialAuthMode = (): 'login' | 'register' => {
  if (typeof window !== 'undefined' && window.location.hash.toLowerCase().includes('register')) {
    return 'register';
  }
  return 'login';
};

export const usePokerStore = create<PokerStore>((set, get) => ({
  // Navigation & Page Views
  currentView: getInitialView(),
  authViewMode: getInitialAuthMode(),
  setCurrentView: (view, authMode) => {
    set((state) => ({
      currentView: view,
      authViewMode: authMode || state.authViewMode,
      isAuthOpen: false,
      isLobbyOpen: false,
    }));
    if (typeof window !== 'undefined') {
      const targetHash = view === 'auth' ? (authMode === 'register' ? '#register' : '#login') : `#${view}`;
      window.history.replaceState(null, '', targetHash);
    }
  },

  quickPlay: () => {
    const { tables, joinTable } = get();
    if (tables.length > 0) {
      // Pick first active or available table
      const target = tables.find((t) => t.player_count < t.max_players) || tables[0];
      const buyIn = target.game_mode === 'Tournament' ? target.starting_chips || 1000 : target.big_blind * 50;
      joinTable(target.id, 0, buyIn);
    } else {
      // Fallback: create mock table or switch to table view
      set({ currentView: 'table', currentTableId: 'table-las-vegas-01' });
    }
  },

  gameState: createInitialMockGameState(),
  currentUserId: initialStoredUser?.username || 'Hero',
  isMockMode: true,
  isConnected: false,
  soundEnabled: true,
  fourColorDeck: false,
  tableOrientation: 'auto',

  // Auth State
  auth: {
    token: initialStoredToken,
    username: initialStoredUser?.username || null,
    chips: initialStoredUser?.chips ?? 10000,
    isAuthenticated: Boolean(initialStoredToken && initialStoredUser),
  },
  isAuthOpen: false,
  setIsAuthOpen: (open) => set({ isAuthOpen: open }),

  login: async (username, password) => {
    try {
      const res = await apiClient.login({ username, password });
      const uname = res.username || res.user?.username || username;
      const chips = res.chips ?? res.user?.chips ?? 10000;
      set({
        auth: {
          token: res.token,
          username: uname,
          chips,
          isAuthenticated: true,
        },
        currentUserId: uname,
        isAuthOpen: false,
        currentView: 'home',
        toastMessage: { text: `Welcome back, ${uname}! Chips: $${chips.toLocaleString()}`, type: 'success' },
      });

      // If in live mode, connect WebSocket
      if (!get().isMockMode) {
        pokerWsClient.connect(apiClient.getWsUrl(), res.token);
      }
    } catch (err: any) {
      set({ toastMessage: { text: err.message || 'Login failed', type: 'error' } });
      throw err;
    }
  },

  register: async (username, password) => {
    try {
      const res = await apiClient.register({ username, password });
      const uname = res.username || res.user?.username || username;
      const chips = res.chips ?? res.user?.chips ?? 10000;
      set({
        auth: {
          token: res.token,
          username: uname,
          chips,
          isAuthenticated: true,
        },
        currentUserId: uname,
        isAuthOpen: false,
        currentView: 'home',
        toastMessage: { text: `Account created for ${uname}! Starting chips: $${chips.toLocaleString()}`, type: 'success' },
      });

      if (!get().isMockMode) {
        pokerWsClient.connect(apiClient.getWsUrl(), res.token);
      }
    } catch (err: any) {
      set({ toastMessage: { text: err.message || 'Registration failed', type: 'error' } });
      throw err;
    }
  },

  logout: () => {
    apiClient.clearAuth();
    pokerWsClient.disconnect();
    set({
      auth: {
        token: null,
        username: null,
        chips: 0,
        isAuthenticated: false,
      },
      currentUserId: 'Hero',
      isConnected: false,
      currentTableId: null,
      currentView: 'home',
      toastMessage: { text: 'You have been logged out.', type: 'info' },
    });
  },

  // Lobby State
  tables: defaultMockTables,
  currentTableId: null,
  isLobbyOpen: false,
  setIsLobbyOpen: (open) => set({ isLobbyOpen: open }),

  fetchTables: () => {
    const { isMockMode } = get();
    if (!isMockMode) {
      pokerWsClient.listTables();
    }
  },

  createTable: (config) => {
    const { isMockMode, tables, auth, currentUserId } = get();
    const newTableId = `table-${Date.now().toString(36)}`;
    const tableName = config.name || `Cash Game $${config.small_blind}/$${config.big_blind}`;

    if (isMockMode) {
      const newTable: TableInfo = {
        id: newTableId,
        name: tableName,
        game_mode: 'Cash',
        small_blind: config.small_blind,
        big_blind: config.big_blind,
        ante: config.ante || 0,
        max_players: config.max_players ?? 6,
        player_count: 1,
        stage: 'Waiting',
        is_started: false,
      };

      const heroName = auth.username || currentUserId || 'Hero';
      const maxSeats = config.max_players ?? 6;
      const initialPlayers = generateMockPlayersForSeats(maxSeats);
      // Ensure seat 0 is hero
      initialPlayers[0] = {
        id: currentUserId,
        name: heroName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${heroName}`,
        chips: 2000,
        currentBet: 0,
        status: 'active',
        cards: [
          { suit: 'spades', rank: 'A', faceUp: true },
          { suit: 'hearts', rank: 'K', faceUp: true },
        ],
        seatIndex: 0,
        isCurrentTurn: true,
      };

      set((prev) => ({
        tables: [newTable, ...tables],
        currentTableId: newTableId,
        isLobbyOpen: false,
        currentView: 'table',
        gameState: {
          ...prev.gameState,
          tableId: newTableId,
          tableName,
          smallBlind: config.small_blind,
          bigBlind: config.big_blind,
          maxSeats,
          players: initialPlayers,
          pots: [{ amount: config.small_blind + config.big_blind, name: 'Main Pot' }],
          communityCards: sampleCommunityCards.flop,
        },
        toastMessage: { text: `Room "${tableName}" created!`, type: 'success' },
      }));
    } else {
      pokerWsClient.createTable({
        small_blind: config.small_blind,
        big_blind: config.big_blind,
        ante: config.ante,
        max_players: config.max_players ?? 6,
        game_mode: 'Cash',
        starting_chips: config.starting_chips,
      });
      set({ isLobbyOpen: false, currentView: 'table' });
    }
  },

  createTournament: (config) => {
    const { isMockMode, tables, auth, currentUserId } = get();
    const newTableId = `tourney-${Date.now().toString(36)}`;
    const tableName = `Tournament $${config.small_blind}/$${config.big_blind}`;

    if (isMockMode) {
      const newTable: TableInfo = {
        id: newTableId,
        name: tableName,
        game_mode: 'Tournament',
        small_blind: config.small_blind,
        big_blind: config.big_blind,
        ante: config.ante || 0,
        max_players: config.max_players ?? 6,
        player_count: 1,
        stage: 'Waiting',
        starting_chips: config.starting_chips,
        is_started: false,
      };

      const heroName = auth.username || currentUserId || 'Hero';
      const maxSeats = config.max_players ?? 6;
      const initialPlayers = generateMockPlayersForSeats(maxSeats);
      initialPlayers[0] = {
        id: currentUserId,
        name: heroName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${heroName}`,
        chips: config.starting_chips,
        currentBet: 0,
        status: 'active',
        cards: [
          { suit: 'spades', rank: 'A', faceUp: true },
          { suit: 'hearts', rank: 'K', faceUp: true },
        ],
        seatIndex: 0,
        isCurrentTurn: true,
      };

      set((prev) => ({
        tables: [newTable, ...tables],
        currentTableId: newTableId,
        isLobbyOpen: false,
        currentView: 'table',
        gameState: {
          ...prev.gameState,
          tableId: newTableId,
          tableName,
          smallBlind: config.small_blind,
          bigBlind: config.big_blind,
          maxSeats,
          players: initialPlayers,
          pots: [{ amount: config.small_blind + config.big_blind, name: 'Main Pot' }],
          communityCards: sampleCommunityCards.flop,
        },
        toastMessage: { text: `Tournament "${tableName}" created!`, type: 'success' },
      }));
    } else {
      pokerWsClient.createTournament({
        small_blind: config.small_blind,
        big_blind: config.big_blind,
        ante: config.ante,
        max_players: config.max_players ?? 6,
        starting_chips: config.starting_chips,
      });
      set({ isLobbyOpen: false, currentView: 'table' });
    }
  },

  joinTable: (tableId, seat, buyIn) => {
    const { isMockMode, tables, auth, currentUserId } = get();

    if (isMockMode) {
      const found = tables.find((t) => t.id === tableId);
      const tableName = found ? found.name : `Table ${tableId}`;
      const sb = found ? found.small_blind : 10;
      const bb = found ? found.big_blind : 20;
      const maxSeats = found ? found.max_players : 6;
      const heroName = auth.username || currentUserId || 'Hero';

      const players = generateMockPlayersForSeats(maxSeats);
      const targetSeat = Math.min(seat, maxSeats - 1);
      players[targetSeat] = {
        id: currentUserId,
        name: heroName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${heroName}`,
        chips: buyIn || 2000,
        currentBet: 0,
        status: 'active',
        cards: [
          { suit: 'spades', rank: 'A', faceUp: true },
          { suit: 'hearts', rank: 'K', faceUp: true },
        ],
        seatIndex: targetSeat,
        isCurrentTurn: true,
      };

      set((prev) => ({
        currentTableId: tableId,
        isLobbyOpen: false,
        currentView: 'table',
        gameState: {
          ...prev.gameState,
          tableId,
          tableName,
          smallBlind: sb,
          bigBlind: bb,
          maxSeats,
          players,
          pots: [{ amount: sb + bb, name: 'Main Pot' }],
          communityCards: sampleCommunityCards.flop,
        },
        toastMessage: { text: `Joined ${tableName}!`, type: 'success' },
      }));
    } else {
      set({ currentTableId: tableId, isLobbyOpen: false, currentView: 'table' });
      pokerWsClient.joinTable(tableId, seat, buyIn);
    }
  },

  leaveTable: () => {
    const { currentTableId, isMockMode } = get();
    if (!isMockMode && currentTableId) {
      pokerWsClient.leaveTable(currentTableId);
    }
    set({ currentTableId: null, currentView: 'home', toastMessage: { text: 'Returned to Lobby', type: 'info' } });
  },

  startHand: () => {
    const { currentTableId } = get();
    if (currentTableId) {
      pokerWsClient.startHand(currentTableId);
    }
  },

  toastMessage: null,
  clearToast: () => set({ toastMessage: null }),

  setGameState: (updater) =>
    set((state) => ({
      gameState: typeof updater === 'function' ? updater(state.gameState) : updater,
    })),

  setIsConnected: (connected) => set({ isConnected: connected }),

  setMockMode: (enabled) => {
    set({ isMockMode: enabled });
    if (!enabled) {
      const { auth } = get();
      if (auth.token) {
        pokerWsClient.connect(apiClient.getWsUrl(), auth.token);
      } else {
        set({ isAuthOpen: true });
      }
    } else {
      pokerWsClient.disconnect();
      set({ isConnected: false });
    }
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleFourColorDeck: () => set((state) => ({ fourColorDeck: !state.fourColorDeck })),
  toggleOrientation: () =>
    set((state) => {
      const modes: ('auto' | 'vertical' | 'rotated90' | 'horizontal')[] = [
        'auto',
        'vertical',
        'rotated90',
        'horizontal',
      ];
      const nextIdx = (modes.indexOf(state.tableOrientation) + 1) % modes.length;
      return { tableOrientation: modes[nextIdx] };
    }),

  setMaxSeats: (seats) => {
    const clamped = Math.max(2, Math.min(10, Math.round(seats)));
    const { gameState } = get();
    if (gameState.maxSeats === clamped) return;

    let updatedPlayers = [...gameState.players];
    if (clamped > updatedPlayers.length) {
      const newSeedList = generateMockPlayersForSeats(clamped);
      while (updatedPlayers.length < clamped) {
        const nextIdx = updatedPlayers.length;
        updatedPlayers.push(newSeedList[nextIdx] || null);
      }
    } else {
      updatedPlayers = updatedPlayers.slice(0, clamped);
    }

    updatedPlayers = updatedPlayers.map((p, idx) => (p ? { ...p, seatIndex: idx } : null));

    set({
      gameState: {
        ...gameState,
        maxSeats: clamped,
        players: updatedPlayers,
        currentTurnSeat: gameState.currentTurnSeat !== null ? gameState.currentTurnSeat % clamped : 0,
        dealerSeat: gameState.dealerSeat % clamped,
      },
    });
  },

  // ─── Gameplay Actions ───────────────────────────────────────────────────────

  dispatchPlayerAction: (action, amount) => {
    const { isMockMode, currentTableId, gameState, currentUserId } = get();

    // LIVE MODE: Send to Backend WebSocket
    if (!isMockMode && currentTableId) {
      let payload: ActionPayload;
      if (action === 'fold') {
        payload = { action: 'Fold' };
      } else if (action === 'check') {
        payload = { action: 'Check' };
      } else if (action === 'call') {
        payload = { action: 'Call' };
      } else if (action === 'bet') {
        payload = { action: 'Bet', amount: amount || gameState.minRaise };
      } else if (action === 'raise') {
        // Raise amount is cumulative total bet level
        payload = { action: 'Raise', amount: amount || gameState.minRaise };
      } else if (action === 'all-in') {
        payload = { action: 'AllIn' };
      } else {
        payload = { action: 'Check' };
      }

      pokerWsClient.sendAction(currentTableId, payload);
      // Hero turn is completed locally until next prompt
      set((prev) => ({
        gameState: {
          ...prev.gameState,
          serverLegalActions: null,
          players: prev.gameState.players.map((p) =>
            p?.id === currentUserId ? { ...p, isCurrentTurn: false } : p
          ),
        },
      }));
      return;
    }

    // MOCK MODE: Local Simulation
    const heroIndex = gameState.players.findIndex((p) => p?.id === currentUserId);
    if (heroIndex === -1) return;

    const currentHero = gameState.players[heroIndex]!;
    let newBet = currentHero.currentBet;
    let newChips = currentHero.chips;
    let newStatus = currentHero.status;

    if (action === 'fold') {
      newStatus = 'folded';
    } else if (action === 'check') {
      // no change
    } else if (action === 'call') {
      const callDiff = gameState.currentHighestBet - currentHero.currentBet;
      const actualCall = Math.min(callDiff, currentHero.chips);
      newChips -= actualCall;
      newBet += actualCall;
    } else if (action === 'bet' || action === 'raise') {
      const raiseAmt = amount || gameState.minRaise;
      const addAmount = raiseAmt - currentHero.currentBet;
      newChips -= addAmount;
      newBet = raiseAmt;
    } else if (action === 'all-in') {
      newBet += newChips;
      newChips = 0;
      newStatus = 'all-in';
    }

    const updatedPlayers = [...gameState.players];
    updatedPlayers[heroIndex] = {
      ...currentHero,
      chips: Math.max(0, newChips),
      currentBet: newBet,
      status: newStatus,
      isCurrentTurn: false,
      lastAction: { type: action, amount: action === 'fold' || action === 'check' ? undefined : newBet },
    };

    let nextSeat = (heroIndex + 1) % gameState.maxSeats;
    let loops = 0;
    while (loops < gameState.maxSeats) {
      const p = updatedPlayers[nextSeat];
      if (p && p.status === 'active') break;
      nextSeat = (nextSeat + 1) % gameState.maxSeats;
      loops++;
    }

    if (updatedPlayers[nextSeat]) {
      updatedPlayers[nextSeat] = {
        ...updatedPlayers[nextSeat]!,
        isCurrentTurn: true,
        turnTimeRemaining: 25,
      };
    }

    const totalPot = updatedPlayers.reduce((acc, p) => acc + (p?.currentBet || 0), 100);

    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentTurnSeat: nextSeat,
        currentHighestBet: Math.max(gameState.currentHighestBet, newBet),
        pots: [{ amount: totalPot, name: 'Main Pot' }],
      },
    });
  },

  seatPlayer: (seatIndex, name) => {
    const { isMockMode, currentTableId, auth, currentUserId } = get();

    if (!isMockMode && currentTableId) {
      const buyIn = 1000;
      pokerWsClient.joinTable(currentTableId, seatIndex, buyIn);
      return;
    }

    // Mock Mode seating
    const heroName = name || auth.username || 'You (Hero)';
    const newPlayer: Player = {
      id: currentUserId,
      name: heroName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${heroName}`,
      chips: 2000,
      currentBet: 0,
      status: 'active',
      cards: [
        { suit: 'spades', rank: 'A', faceUp: true },
        { suit: 'hearts', rank: 'K', faceUp: true },
      ],
      seatIndex,
      isCurrentTurn: false,
    };

    set((prev) => {
      const updated = [...prev.gameState.players];
      updated[seatIndex] = newPlayer;
      return { gameState: { ...prev.gameState, players: updated } };
    });
  },

  leaveSeat: (seatIndex) => {
    const { isMockMode, currentTableId } = get();
    if (!isMockMode && currentTableId) {
      pokerWsClient.leaveTable(currentTableId);
    }
    set((prev) => {
      const updated = [...prev.gameState.players];
      updated[seatIndex] = null;
      return { gameState: { ...prev.gameState, players: updated } };
    });
  },

  // ─── Server Inbound Adaptors ───────────────────────────────────────────────

  applyTableState: (serverState) => {
    const { currentUserId, gameState } = get();
    const maxSeats = Math.max(serverState.seats.length, 6);
    const existingHeroCards = gameState.players.find((p) => p?.id === currentUserId)?.cards || [];

    const mappedPlayers: (Player | null)[] = serverState.seats.map((s, idx) => {
      if (!s.username) return null;
      const isHero = s.username === currentUserId;
      const isCurrentTurn = serverState.current_player === idx;

      return {
        id: s.username,
        name: s.username,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${s.username}`,
        chips: s.chips ?? 0,
        currentBet: s.current_bet ?? 0,
        status: s.status === 'Folded' ? 'folded' : s.status === 'AllIn' ? 'all-in' : 'active',
        cards: isHero && existingHeroCards.length === 2 ? existingHeroCards : [],
        seatIndex: idx,
        isCurrentTurn,
      };
    });

    while (mappedPlayers.length < maxSeats) {
      mappedPlayers.push(null);
    }

    const highestBet = mappedPlayers.reduce((max, p) => Math.max(max, p?.currentBet || 0), 0);
    const communityCards = parseCards(serverState.board);

    set((prev) => ({
      currentTableId: serverState.table_id,
      gameState: {
        ...prev.gameState,
        tableId: serverState.table_id,
        stage: mapServerStage(serverState.stage),
        communityCards,
        pots: [{ amount: serverState.pot, name: 'Main Pot' }],
        currentTurnSeat: serverState.current_player,
        currentHighestBet: highestBet,
        players: mappedPlayers,
        maxSeats,
        gameMode: serverState.game_mode,
        isStarted: serverState.is_started,
      },
    }));
  },

  applyHoleCards: (cards) => {
    const parsed = parseCards(cards);
    if (parsed.length === 0) return;

    set((prev) => {
      const { currentUserId, gameState } = prev;
      const updatedPlayers = gameState.players.map((p) => {
        if (!p || p.id !== currentUserId) return p;
        return {
          ...p,
          cards: parsed.map((c) => ({ ...c, faceUp: true })),
        };
      });
      return {
        gameState: {
          ...gameState,
          players: updatedPlayers,
        },
      };
    });
  },

  applyYourTurn: (legalActions) => {
    const { currentUserId, gameState } = get();
    const heroIdx = gameState.players.findIndex((p) => p?.id === currentUserId);

    set((prev) => ({
      gameState: {
        ...prev.gameState,
        serverLegalActions: legalActions,
        currentTurnSeat: heroIdx !== -1 ? heroIdx : prev.gameState.currentTurnSeat,
        players: prev.gameState.players.map((p) =>
          p ? (p.id === currentUserId ? { ...p, isCurrentTurn: true } : { ...p, isCurrentTurn: false }) : null
        ),
      },
    }));
  },

  applyGameEvent: (rawEvent) => {
    console.log('[PokerStore] Inbound GameEvent:', rawEvent);
    if (!rawEvent) return;

    // Serde externally tagged enum or untagged
    const eventType = Object.keys(rawEvent)[0] || rawEvent.type;
    const eventPayload = rawEvent[eventType] || rawEvent;

    if (eventType === 'PlayerActed' || rawEvent.type === 'ActionTaken') {
      const seat = eventPayload.player_id ?? eventPayload.seat;
      const act = eventPayload.action;
      const actionName = (typeof act === 'string' ? act : act?.action || 'Check').toLowerCase();
      const chipsCommitted = eventPayload.chips_committed ?? act?.amount;

      set((prev) => {
        const updated = [...prev.gameState.players];
        if (typeof seat === 'number' && updated[seat]) {
          const p = updated[seat]!;
          updated[seat] = {
            ...p,
            currentBet: chipsCommitted ?? p.currentBet,
            status: actionName === 'fold' ? 'folded' : actionName === 'allin' ? 'all-in' : p.status,
            lastAction: { type: actionName as any, amount: chipsCommitted },
          };
        }
        return { gameState: { ...prev.gameState, players: updated } };
      });
    } else if (eventType === 'StreetStarted') {
      const stage = mapServerStage(eventPayload.stage || '');
      const board = parseCards(eventPayload.board || []);
      set((prev) => ({
        gameState: {
          ...prev.gameState,
          stage,
          communityCards: board,
        },
      }));
    } else if (eventType === 'PotAwarded' || eventType === 'Winners') {
      try {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      const amountWon = eventPayload.amount || 0;
      set((prev) => ({
        gameState: {
          ...prev.gameState,
          winningHand: {
            playerIds: [String(eventPayload.player_id ?? '')],
            handName: eventPayload.hand_rank ? JSON.stringify(eventPayload.hand_rank) : 'Winner declared',
            winningCards: [],
            amountWon,
          },
        },
      }));
    }
  },

  applyPlayerJoined: (data) => {
    set((prev) => {
      const updated = [...prev.gameState.players];
      updated[data.seat] = {
        id: data.username,
        name: data.username,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
        chips: data.chips,
        currentBet: 0,
        status: 'active',
        cards: [],
        seatIndex: data.seat,
        isCurrentTurn: false,
      };
      return {
        gameState: { ...prev.gameState, players: updated },
        toastMessage: { text: `${data.username} joined seat ${data.seat + 1}`, type: 'info' },
      };
    });
  },

  applyPlayerLeft: (data) => {
    set((prev) => {
      const updated = [...prev.gameState.players];
      updated[data.seat] = null;
      return {
        gameState: { ...prev.gameState, players: updated },
        toastMessage: { text: `${data.username} left the table`, type: 'info' },
      };
    });
  },

  applyPlayerEliminated: (data) => {
    set((prev) => {
      const updated = [...prev.gameState.players];
      if (updated[data.seat]) {
        updated[data.seat] = {
          ...updated[data.seat]!,
          status: 'folded',
          chips: 0,
        };
      }
      return {
        gameState: { ...prev.gameState, players: updated },
        toastMessage: { text: `Tournament: ${data.username} has been eliminated (Rank #${data.rank})!`, type: 'error' },
      };
    });
  },

  applyTournamentEnded: (data) => {
    try {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
    set({
      toastMessage: {
        text: `🏆 Tournament Concluded! Winner: ${data.winner_username} takes the $${data.prize.toLocaleString()} prize!`,
        type: 'success',
      },
    });
  },

  applyServerError: (message) => {
    set({ toastMessage: { text: `Server: ${message}`, type: 'error' } });
  },

  // ─── Mock Simulator Controls ───────────────────────────────────────────────

  nextStreet: () => {
    const { gameState } = get();
    const stages: TableStage[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
    const currentIdx = stages.indexOf(gameState.stage);
    const nextStage = stages[(currentIdx + 1) % stages.length];

    let communityCards: Card[] = [];
    if (nextStage === 'preflop') communityCards = sampleCommunityCards.preflop;
    else if (nextStage === 'flop') communityCards = sampleCommunityCards.flop;
    else if (nextStage === 'turn') communityCards = sampleCommunityCards.turn;
    else if (nextStage === 'river' || nextStage === 'showdown') communityCards = sampleCommunityCards.river;

    if (nextStage === 'showdown') {
      get().triggerShowdown();
      return;
    }

    set({
      gameState: {
        ...gameState,
        stage: nextStage,
        communityCards,
        winningHand: null,
      },
    });
  },

  triggerShowdown: () => {
    const { gameState } = get();
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    const revealedPlayers = gameState.players.map((p) => {
      if (!p) return null;
      return {
        ...p,
        cards: p.cards.map((c) => ({ ...c, faceUp: true })),
      };
    });

    const winningHand: WinningHand = {
      playerIds: ['p1'],
      handName: 'Three of a Kind, Kings with Ace kicker',
      winningCards: [
        { suit: 'spades', rank: 'K', faceUp: true },
        { suit: 'hearts', rank: 'K', faceUp: true },
        { suit: 'spades', rank: 'K', faceUp: true },
        { suit: 'hearts', rank: 'A', faceUp: true },
        { suit: 'hearts', rank: 'A', faceUp: true },
      ],
      amountWon: gameState.pots.reduce((sum, p) => sum + p.amount, 0),
    };

    set({
      gameState: {
        ...gameState,
        stage: 'showdown',
        communityCards: sampleCommunityCards.river,
        players: revealedPlayers,
        winningHand,
      },
    });
  },

  resetGame: () => {
    const { gameState } = get();
    set({
      gameState: createInitialMockGameState(gameState.maxSeats),
    });
  },
}));
