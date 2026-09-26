import { GameState, Card, Player } from '../types/poker';

export const initialMockPlayers: (Player | null)[] = [
  {
    id: 'p1',
    name: 'You (Hero)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hero',
    chips: 1450,
    currentBet: 20,
    status: 'active',
    cards: [
      { suit: 'spades', rank: 'A', faceUp: true },
      { suit: 'hearts', rank: 'K', faceUp: true },
    ],
    seatIndex: 0,
    isCurrentTurn: true,
    turnTimeRemaining: 25,
    lastAction: { type: 'bet', amount: 20 },
  },
  {
    id: 'p2',
    name: 'Sarah Connor',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
    chips: 2100,
    currentBet: 20,
    status: 'active',
    cards: [
      { suit: 'clubs', rank: 'Q', faceUp: false },
      { suit: 'diamonds', rank: 'J', faceUp: false },
    ],
    seatIndex: 1,
    isDealer: true,
    lastAction: { type: 'call', amount: 20 },
  },
  {
    id: 'p3',
    name: 'Neo Matrix',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=neo',
    chips: 890,
    currentBet: 0,
    status: 'folded',
    cards: [],
    seatIndex: 2,
    lastAction: { type: 'fold' },
  },
  {
    id: 'p4',
    name: 'Alex Russo',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    chips: 3400,
    currentBet: 40,
    status: 'active',
    cards: [
      { suit: 'hearts', rank: 'T', faceUp: false },
      { suit: 'spades', rank: 'T', faceUp: false },
    ],
    seatIndex: 3,
    isSmallBlind: true,
    lastAction: { type: 'raise', amount: 40 },
  },
  {
    id: 'p5',
    name: 'John Wick',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=wick',
    chips: 1980,
    currentBet: 40,
    status: 'active',
    cards: [
      { suit: 'diamonds', rank: '8', faceUp: false },
      { suit: 'diamonds', rank: '9', faceUp: false },
    ],
    seatIndex: 4,
    isBigBlind: true,
    lastAction: { type: 'call', amount: 40 },
  },
  null, // Empty seat 5
];

export const sampleCommunityCards: Record<string, Card[]> = {
  preflop: [],
  flop: [
    { suit: 'spades', rank: 'K', faceUp: true },
    { suit: 'hearts', rank: 'A', faceUp: true },
    { suit: 'diamonds', rank: '4', faceUp: true },
  ],
  turn: [
    { suit: 'spades', rank: 'K', faceUp: true },
    { suit: 'hearts', rank: 'A', faceUp: true },
    { suit: 'diamonds', rank: '4', faceUp: true },
    { suit: 'clubs', rank: '9', faceUp: true },
  ],
  river: [
    { suit: 'spades', rank: 'K', faceUp: true, highlighted: true },
    { suit: 'hearts', rank: 'A', faceUp: true, highlighted: true },
    { suit: 'diamonds', rank: '4', faceUp: true },
    { suit: 'clubs', rank: '9', faceUp: true },
    { suit: 'hearts', rank: 'K', faceUp: true, highlighted: true },
  ],
};

export const createInitialMockGameState = (): GameState => ({
  tableId: 'table-las-vegas-01',
  tableName: "High Rollers - No Limit Hold'em",
  stage: 'flop',
  smallBlind: 10,
  bigBlind: 20,
  communityCards: sampleCommunityCards.flop,
  pots: [
    {
      amount: 140,
      name: 'Main Pot',
    },
  ],
  currentTurnSeat: 0, // Hero's turn
  dealerSeat: 1,
  minRaise: 20,
  currentHighestBet: 40,
  players: initialMockPlayers,
  maxSeats: 6,
  winningHand: null,
});
