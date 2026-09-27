import { GameState, Card, Player } from '../types/poker';

export const allMockBotProfiles = [
  { id: 'p1', name: 'You (Hero)', seed: 'hero', chips: 1500 },
  { id: 'p2', name: 'Sarah Connor', seed: 'sarah', chips: 2100 },
  { id: 'p3', name: 'Neo Matrix', seed: 'neo', chips: 980 },
  { id: 'p4', name: 'Alex Russo', seed: 'alex', chips: 3400 },
  { id: 'p5', name: 'John Wick', seed: 'wick', chips: 1980 },
  { id: 'p6', name: 'Ellen Ripley', seed: 'ripley', chips: 2450 },
  { id: 'p7', name: 'James Bond', seed: 'bond', chips: 4200 },
  { id: 'p8', name: 'Tony Stark', seed: 'stark', chips: 5000 },
  { id: 'p9', name: 'Ethan Hunt', seed: 'hunt', chips: 1800 },
  { id: 'p10', name: 'Luke Skywalker', seed: 'luke', chips: 2600 },
];

export const generateMockPlayersForSeats = (seatCount: number): (Player | null)[] => {
  const count = Math.max(2, Math.min(10, seatCount));
  const players: (Player | null)[] = [];

  for (let i = 0; i < count; i++) {
    // Leave seat 5 empty if 6 seats, or seat (count-1) empty if > 6 seats so player can test "Sit"
    if (i === count - 1 && count >= 5) {
      players.push(null);
      continue;
    }

    const bot = allMockBotProfiles[i] || {
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      seed: `player${i + 1}`,
      chips: 2000,
    };

    const isHero = i === 0;

    players.push({
      id: bot.id,
      name: bot.name,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${bot.seed}`,
      chips: bot.chips,
      currentBet: i === 0 ? 20 : i === 1 ? 20 : i === 3 ? 40 : 0,
      status: i === 2 ? 'folded' : 'active',
      cards: isHero
        ? [
            { suit: 'spades', rank: 'A', faceUp: true },
            { suit: 'hearts', rank: 'K', faceUp: true },
          ]
        : [
            { suit: 'clubs', rank: 'Q', faceUp: false },
            { suit: 'diamonds', rank: 'J', faceUp: false },
          ],
      seatIndex: i,
      isDealer: i === 1,
      isSmallBlind: i === 3,
      isBigBlind: i === 4 % count,
      isCurrentTurn: isHero,
      turnTimeRemaining: isHero ? 25 : undefined,
      lastAction: isHero
        ? { type: 'bet', amount: 20 }
        : i === 1
        ? { type: 'call', amount: 20 }
        : i === 2
        ? { type: 'fold' }
        : undefined,
    });
  }

  return players;
};

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

export const createInitialMockGameState = (seats: number = 6): GameState => ({
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
  players: generateMockPlayersForSeats(seats),
  maxSeats: seats,
  winningHand: null,
});

export const defaultMockTables = [
  {
    id: 'room-vegas-01',
    name: 'Vegas High Rollers',
    game_mode: 'Cash' as const,
    small_blind: 10,
    big_blind: 20,
    ante: 0,
    max_players: 6,
    player_count: 5,
    stage: 'Flop',
    is_started: true,
  },
  {
    id: 'room-macau-02',
    name: 'Macau Millions Championship',
    game_mode: 'Tournament' as const,
    small_blind: 50,
    big_blind: 100,
    ante: 10,
    max_players: 8,
    player_count: 6,
    stage: 'Turn',
    starting_chips: 10000,
    is_started: true,
  },
  {
    id: 'room-monaco-03',
    name: 'Monaco Micro Stakes',
    game_mode: 'Cash' as const,
    small_blind: 1,
    big_blind: 2,
    ante: 0,
    max_players: 6,
    player_count: 2,
    stage: 'Waiting',
    is_started: false,
  },
  {
    id: 'room-atlantic-04',
    name: 'Atlantic City Turbo MTT',
    game_mode: 'Tournament' as const,
    small_blind: 25,
    big_blind: 50,
    ante: 5,
    max_players: 9,
    player_count: 4,
    stage: 'Waiting',
    starting_chips: 5000,
    is_started: false,
  },
  {
    id: 'room-duel-05',
    name: 'Heads-Up Legends Duel',
    game_mode: 'Cash' as const,
    small_blind: 5,
    big_blind: 10,
    ante: 0,
    max_players: 2,
    player_count: 1,
    stage: 'PreFlop',
    is_started: false,
  },
];
