export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp?: boolean;
  highlighted?: boolean;
}

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  currentBet: number;
  status: PlayerStatus;
  cards: Card[];
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  isCurrentTurn?: boolean;
  turnTimeRemaining?: number; // seconds
  seatIndex: number;
  lastAction?: {
    type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
    amount?: number;
  };
}

export type TableStage = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface Pot {
  amount: number;
  name?: string; // "Main Pot", "Side Pot 1"
  eligiblePlayerIds?: string[];
}

export interface WinningHand {
  playerIds: string[];
  handName: string; // e.g. "Full House, Aces full of Kings"
  winningCards: Card[];
  amountWon: number;
}

export * from './backend';
import { GameMode, LegalActions } from './backend';

export interface GameState {
  tableId: string;
  tableName: string;
  stage: TableStage;
  smallBlind: number;
  bigBlind: number;
  communityCards: Card[];
  pots: Pot[];
  currentTurnSeat: number | null;
  dealerSeat: number;
  minRaise: number;
  currentHighestBet: number;
  players: (Player | null)[]; // Max 2-10 seats
  maxSeats: number;
  winningHand?: WinningHand | null;
  gameMode?: GameMode;
  isStarted?: boolean;
  serverLegalActions?: LegalActions | null;
  creatorId?: string | null;
  creatorUsername?: string | null;
}

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface PlayerActionPayload {
  tableId: string;
  playerId: string;
  action: ActionType;
  amount?: number;
}

export interface SocketServerEvents {
  game_state: (state: GameState) => void;
  player_joined: (player: Player) => void;
  player_left: (playerId: string) => void;
  player_acted: (action: PlayerActionPayload) => void;
  hand_completed: (result: WinningHand) => void;
  chat_message: (message: { sender: string; text: string; timestamp: number }) => void;
  error_message: (error: { message: string }) => void;
}

export interface SocketClientEvents {
  join_table: (tableId: string, seatIndex: number, buyIn: number) => void;
  leave_table: (tableId: string) => void;
  player_action: (payload: PlayerActionPayload) => void;
  send_chat: (tableId: string, text: string) => void;
}
