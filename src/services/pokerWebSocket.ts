import {
  ActionPayload,
  ClientMessage,
  GameMode,
  ServerGameEvent,
  ServerHoleCards,
  ServerJoinedTable,
  ServerMessage,
  ServerPlayerEliminated,
  ServerPlayerJoined,
  ServerPlayerLeft,
  ServerTableList,
  ServerTableState,
  ServerTournamentEnded,
  ServerYourTurn,
  ServerError,
  ServerTableCreated,
} from '../types/backend';

export type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type MessageListener<T> = (msg: T) => void;

class PokerWebSocketClient {
  private ws: WebSocket | null = null;
  private status: WsStatus = 'disconnected';
  private token: string | null = null;
  private wsBaseUrl: string = 'ws://127.0.0.1:8080/ws';
  private reconnectTimer: number | null = null;
  private shouldReconnect: boolean = false;
  private reconnectAttempts: number = 0;

  // Listeners
  private statusListeners: ((status: WsStatus) => void)[] = [];
  private tableCreatedListeners: MessageListener<ServerTableCreated>[] = [];
  private tableListListeners: MessageListener<ServerTableList>[] = [];
  private joinedTableListeners: MessageListener<ServerJoinedTable>[] = [];
  private playerJoinedListeners: MessageListener<ServerPlayerJoined>[] = [];
  private playerLeftListeners: MessageListener<ServerPlayerLeft>[] = [];
  private playerEliminatedListeners: MessageListener<ServerPlayerEliminated>[] = [];
  private tournamentEndedListeners: MessageListener<ServerTournamentEnded>[] = [];
  private holeCardsListeners: MessageListener<ServerHoleCards>[] = [];
  private yourTurnListeners: MessageListener<ServerYourTurn>[] = [];
  private tableStateListeners: MessageListener<ServerTableState>[] = [];
  private gameEventListeners: MessageListener<ServerGameEvent>[] = [];
  private errorListeners: MessageListener<ServerError>[] = [];

  public connect(wsBaseUrl: string, token: string): void {
    this.wsBaseUrl = wsBaseUrl;
    this.token = token;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    this.establishConnection();
  }

  private establishConnection(): void {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    if (!this.token) {
      this.setStatus('disconnected');
      return;
    }

    this.setStatus('connecting');
    const fullUrl = `${this.wsBaseUrl}?token=${encodeURIComponent(this.token)}`;

    try {
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = () => {
        console.log('[PokerWS] Connected to', this.wsBaseUrl);
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        // Automatically query lobby tables on connect
        this.listTables();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = typeof event.data === 'string' ? event.data : '';
          if (!raw) return;
          const msg = JSON.parse(raw) as ServerMessage;
          this.routeMessage(msg);
        } catch (err) {
          console.error('[PokerWS] Error parsing incoming frame:', err, event.data);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[PokerWS] WebSocket error:', err);
        this.setStatus('error');
      };

      this.ws.onclose = (event) => {
        console.log('[PokerWS] Connection closed:', event.code, event.reason);
        this.ws = null;
        this.setStatus('disconnected');

        if (this.shouldReconnect) {
          const delay = Math.min(10000, 1500 * Math.pow(1.5, this.reconnectAttempts));
          this.reconnectAttempts++;
          console.log(`[PokerWS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})...`);
          this.reconnectTimer = window.setTimeout(() => {
            if (this.shouldReconnect) {
              this.establishConnection();
            }
          }, delay);
        }
      };
    } catch (err) {
      console.error('[PokerWS] Failed to create WebSocket:', err);
      this.setStatus('error');
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private setStatus(status: WsStatus): void {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public getStatus(): WsStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // ─── Dispatch Outbound Client Messages ─────────────────────────────────────

  public send(msg: ClientMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[PokerWS] Cannot send message, socket is not OPEN:', msg);
      return false;
    }
    try {
      this.ws.send(JSON.stringify(msg));
      return true;
    } catch (err) {
      console.error('[PokerWS] Failed to send message:', err, msg);
      return false;
    }
  }

  public listTables(): boolean {
    return this.send({ type: 'ListTables' });
  }

  public createTable(config: {
    small_blind: number;
    big_blind: number;
    ante?: number;
    max_players?: number;
    game_mode?: GameMode;
    starting_chips?: number;
  }): boolean {
    return this.send({
      type: 'CreateTable',
      small_blind: config.small_blind,
      big_blind: config.big_blind,
      ante: config.ante,
      max_players: config.max_players,
      game_mode: config.game_mode,
      starting_chips: config.starting_chips,
    });
  }

  public createTournament(config: {
    small_blind: number;
    big_blind: number;
    ante?: number;
    max_players?: number;
    starting_chips: number;
  }): boolean {
    return this.send({
      type: 'CreateTournament',
      small_blind: config.small_blind,
      big_blind: config.big_blind,
      ante: config.ante,
      max_players: config.max_players,
      starting_chips: config.starting_chips,
    });
  }

  public joinTable(table_id: string, seat: number, buy_in: number): boolean {
    return this.send({
      type: 'JoinTable',
      table_id,
      seat,
      buy_in,
    });
  }

  public leaveTable(table_id: string): boolean {
    return this.send({
      type: 'LeaveTable',
      table_id,
    });
  }

  public startHand(table_id: string): boolean {
    return this.send({
      type: 'StartHand',
      table_id,
    });
  }

  public sendAction(table_id: string, action: ActionPayload): boolean {
    return this.send({
      type: 'PlayerAction',
      table_id,
      action,
    });
  }

  // ─── Route Inbound Server Messages ─────────────────────────────────────────

  private routeMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case 'TableCreated':
        this.tableCreatedListeners.forEach((fn) => fn(msg));
        break;
      case 'TableList':
        this.tableListListeners.forEach((fn) => fn(msg));
        break;
      case 'JoinedTable':
        this.joinedTableListeners.forEach((fn) => fn(msg));
        break;
      case 'PlayerJoined':
        this.playerJoinedListeners.forEach((fn) => fn(msg));
        break;
      case 'PlayerLeft':
        this.playerLeftListeners.forEach((fn) => fn(msg));
        break;
      case 'PlayerEliminated':
        this.playerEliminatedListeners.forEach((fn) => fn(msg));
        break;
      case 'TournamentEnded':
        this.tournamentEndedListeners.forEach((fn) => fn(msg));
        break;
      case 'HoleCards':
        this.holeCardsListeners.forEach((fn) => fn(msg));
        break;
      case 'YourTurn':
        this.yourTurnListeners.forEach((fn) => fn(msg));
        break;
      case 'TableState':
        this.tableStateListeners.forEach((fn) => fn(msg));
        break;
      case 'GameEvent':
        this.gameEventListeners.forEach((fn) => fn(msg));
        break;
      case 'Error':
        this.errorListeners.forEach((fn) => fn(msg));
        break;
      default:
        console.log('[PokerWS] Unhandled message:', msg);
    }
  }

  // ─── Subscriptions ─────────────────────────────────────────────────────────

  public onStatusChange(callback: (status: WsStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public onTableCreated(callback: MessageListener<ServerTableCreated>): () => void {
    this.tableCreatedListeners.push(callback);
    return () => {
      this.tableCreatedListeners = this.tableCreatedListeners.filter((cb) => cb !== callback);
    };
  }

  public onTableList(callback: MessageListener<ServerTableList>): () => void {
    this.tableListListeners.push(callback);
    return () => {
      this.tableListListeners = this.tableListListeners.filter((cb) => cb !== callback);
    };
  }

  public onJoinedTable(callback: MessageListener<ServerJoinedTable>): () => void {
    this.joinedTableListeners.push(callback);
    return () => {
      this.joinedTableListeners = this.joinedTableListeners.filter((cb) => cb !== callback);
    };
  }

  public onPlayerJoined(callback: MessageListener<ServerPlayerJoined>): () => void {
    this.playerJoinedListeners.push(callback);
    return () => {
      this.playerJoinedListeners = this.playerJoinedListeners.filter((cb) => cb !== callback);
    };
  }

  public onPlayerLeft(callback: MessageListener<ServerPlayerLeft>): () => void {
    this.playerLeftListeners.push(callback);
    return () => {
      this.playerLeftListeners = this.playerLeftListeners.filter((cb) => cb !== callback);
    };
  }

  public onPlayerEliminated(callback: MessageListener<ServerPlayerEliminated>): () => void {
    this.playerEliminatedListeners.push(callback);
    return () => {
      this.playerEliminatedListeners = this.playerEliminatedListeners.filter((cb) => cb !== callback);
    };
  }

  public onTournamentEnded(callback: MessageListener<ServerTournamentEnded>): () => void {
    this.tournamentEndedListeners.push(callback);
    return () => {
      this.tournamentEndedListeners = this.tournamentEndedListeners.filter((cb) => cb !== callback);
    };
  }

  public onHoleCards(callback: MessageListener<ServerHoleCards>): () => void {
    this.holeCardsListeners.push(callback);
    return () => {
      this.holeCardsListeners = this.holeCardsListeners.filter((cb) => cb !== callback);
    };
  }

  public onYourTurn(callback: MessageListener<ServerYourTurn>): () => void {
    this.yourTurnListeners.push(callback);
    return () => {
      this.yourTurnListeners = this.yourTurnListeners.filter((cb) => cb !== callback);
    };
  }

  public onTableState(callback: MessageListener<ServerTableState>): () => void {
    this.tableStateListeners.push(callback);
    return () => {
      this.tableStateListeners = this.tableStateListeners.filter((cb) => cb !== callback);
    };
  }

  public onGameEvent(callback: MessageListener<ServerGameEvent>): () => void {
    this.gameEventListeners.push(callback);
    return () => {
      this.gameEventListeners = this.gameEventListeners.filter((cb) => cb !== callback);
    };
  }

  public onError(callback: MessageListener<ServerError>): () => void {
    this.errorListeners.push(callback);
    return () => {
      this.errorListeners = this.errorListeners.filter((cb) => cb !== callback);
    };
  }
}

export const pokerWsClient = new PokerWebSocketClient();
