import { create } from 'zustand';
import { GameState, ActionType, Card, TableStage, WinningHand } from '../types/poker';
import { createInitialMockGameState, sampleCommunityCards } from '../utils/mockData';
import confetti from 'canvas-confetti';

interface PokerStore {
  gameState: GameState;
  currentUserId: string;
  isMockMode: boolean;
  isConnected: boolean;
  soundEnabled: boolean;
  fourColorDeck: boolean;

  // Actions
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
  setIsConnected: (connected: boolean) => void;
  setMockMode: (enabled: boolean) => void;
  toggleSound: () => void;
  toggleFourColorDeck: () => void;

  // Game gameplay interactions
  dispatchPlayerAction: (action: ActionType, amount?: number) => void;
  seatPlayer: (seatIndex: number, name?: string) => void;
  leaveSeat: (seatIndex: number) => void;

  // Mock controls
  nextStreet: () => void;
  resetGame: () => void;
  triggerShowdown: () => void;
}

export const usePokerStore = create<PokerStore>((set, get) => ({
  gameState: createInitialMockGameState(),
  currentUserId: 'p1', // Default to Hero
  isMockMode: true,
  isConnected: false,
  soundEnabled: true,
  fourColorDeck: false,

  setGameState: (updater) =>
    set((state) => ({
      gameState: typeof updater === 'function' ? updater(state.gameState) : updater,
    })),

  setIsConnected: (connected) => set({ isConnected: connected }),
  setMockMode: (enabled) => set({ isMockMode: enabled }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleFourColorDeck: () => set((state) => ({ fourColorDeck: !state.fourColorDeck })),

  dispatchPlayerAction: (action, amount) => {
    const { gameState, currentUserId } = get();
    const heroIndex = gameState.players.findIndex((p) => p?.id === currentUserId);
    if (heroIndex === -1) return;

    const currentHero = gameState.players[heroIndex]!;
    let newBet = currentHero.currentBet;
    let newChips = currentHero.chips;
    let newStatus = currentHero.status;

    if (action === 'fold') {
      newStatus = 'folded';
    } else if (action === 'check') {
      // no change to chips
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

    // Calculate next active player seat
    let nextSeat = (heroIndex + 1) % gameState.maxSeats;
    let loops = 0;
    while (loops < gameState.maxSeats) {
      const p = updatedPlayers[nextSeat];
      if (p && p.status === 'active') {
        break;
      }
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

    // Update pots
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

  seatPlayer: (seatIndex, name = 'You (Hero)') => {
    const { gameState, currentUserId } = get();
    if (gameState.players[seatIndex]) return;

    const newPlayer = {
      id: currentUserId,
      name,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      chips: 2000,
      currentBet: 0,
      status: 'active' as const,
      cards: [
        { suit: 'spades' as const, rank: 'A' as const, faceUp: true },
        { suit: 'hearts' as const, rank: 'K' as const, faceUp: true },
      ],
      seatIndex,
      isCurrentTurn: false,
    };

    const updatedPlayers = [...gameState.players];
    updatedPlayers[seatIndex] = newPlayer;

    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
      },
    });
  },

  leaveSeat: (seatIndex) => {
    const { gameState } = get();
    const updatedPlayers = [...gameState.players];
    updatedPlayers[seatIndex] = null;

    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
      },
    });
  },

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
    // Confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Safe fallback
    }

    // Reveal cards
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
    set({
      gameState: createInitialMockGameState(),
    });
  },
}));
