/**
 * Backend API and WebSocket Protocol Types
 * Aligned with docs/openapi.json and docs/websocket-schema.json
 */

export type GameMode = 'Cash' | 'Tournament';

// ─── REST API Schemas ────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  service?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id?: string;
  username: string;
  chips: number;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  username?: string;
  chips?: number;
  user?: AuthUser;
}

export interface ErrorResponse {
  error: string;
}

// ─── WebSocket Schemas ───────────────────────────────────────────────────────

export interface RawCardCode {
  code: number;
}

export type BackendCard = RawCardCode | string | { suit: string; rank: string };

export interface TableInfo {
  id: string;
  name: string;
  player_count: number;
  max_players: number;
  small_blind: number;
  big_blind: number;
  stage: string;
  game_mode: GameMode;
  is_started: boolean;
  ante?: number;
  starting_chips?: number | null;
  min_buy_in?: number;
  max_buy_in?: number;
  creator_id?: string | null;
  creator_username?: string | null;
}

export interface SeatInfo {
  seat: number;
  username: string | null;
  chips: number | null;
  status: string | null;
  current_bet: number | null;
}

export interface LegalActions {
  can_fold: boolean;
  can_check: boolean;
  can_call: boolean;
  call_amount: number;
  can_bet: boolean;
  min_bet: number;
  max_bet: number;
  can_raise: boolean;
  min_raise: number;
  max_raise: number;
  can_all_in: boolean;
  all_in_cost: number;
}

// ─── Client-to-Server Messages ──────────────────────────────────────────────

export type ActionPayload =
  | { action: 'Fold' }
  | { action: 'Check' }
  | { action: 'Call' }
  | { action: 'Bet'; amount: number }
  | { action: 'Raise'; amount: number }
  | { action: 'AllIn' };

export type ClientMessage =
  | { type: 'ListTables' }
  | {
      type: 'CreateTable';
      small_blind: number;
      big_blind: number;
      ante?: number;
      max_players?: number;
      game_mode?: GameMode;
      starting_chips?: number;
    }
  | {
      type: 'CreateTournament';
      small_blind: number;
      big_blind: number;
      ante?: number;
      max_players?: number;
      starting_chips: number;
    }
  | {
      type: 'JoinTable';
      table_id: string;
      seat: number;
      buy_in: number;
    }
  | {
      type: 'LeaveTable';
      table_id: string;
    }
  | {
      type: 'StartHand';
      table_id: string;
    }
  | {
      type: 'PlayerAction';
      table_id: string;
      action: ActionPayload;
    };

// ─── Server-to-Client Messages ──────────────────────────────────────────────

export interface ServerTableList {
  type: 'TableList';
  tables: TableInfo[];
}

export interface ServerJoinedTable {
  type: 'JoinedTable';
  table_id: string;
  seat: number;
}

export interface ServerPlayerJoined {
  type: 'PlayerJoined';
  table_id: string;
  seat: number;
  username: string;
  chips: number;
}

export interface ServerPlayerLeft {
  type: 'PlayerLeft';
  table_id: string;
  seat: number;
  username: string;
}

export interface ServerPlayerEliminated {
  type: 'PlayerEliminated';
  table_id: string;
  seat: number;
  username: string;
  rank: number;
}

export interface ServerTournamentEnded {
  type: 'TournamentEnded';
  table_id: string;
  winner_username: string;
  prize: number;
}

export interface ServerHoleCards {
  type: 'HoleCards';
  table_id: string;
  cards: [RawCardCode, RawCardCode] | RawCardCode[] | string[];
}

export interface ServerYourTurn {
  type: 'YourTurn';
  table_id: string;
  legal_actions: LegalActions;
}

export interface ServerTableCreated {
  type: 'TableCreated';
  table_id: string;
}

export interface ServerTableState {
  type: 'TableState';
  table_id: string;
  seats: SeatInfo[];
  stage: string;
  board: string[];
  pot: number;
  current_player: number | null;
  game_mode: GameMode;
  is_started: boolean;
  creator_id?: string | null;
  creator_username?: string | null;
}

export interface ServerGameEvent {
  type: 'GameEvent';
  table_id: string;
  event: any;
}

export interface ServerError {
  type: 'Error';
  message: string;
}

export type ServerMessage =
  | ServerTableCreated
  | ServerTableList
  | ServerJoinedTable
  | ServerPlayerJoined
  | ServerPlayerLeft
  | ServerPlayerEliminated
  | ServerTournamentEnded
  | ServerHoleCards
  | ServerYourTurn
  | ServerTableState
  | ServerGameEvent
  | ServerError;
