import { io, Socket } from 'socket.io-client';
import { GameState, PlayerActionPayload, WinningHand, Player } from '../types/poker';

export type SocketStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

class SocketService {
  private socket: Socket | null = null;
  private statusListeners: ((status: SocketStatus) => void)[] = [];
  private gameStateListeners: ((state: GameState) => void)[] = [];
  private winnerListeners: ((result: WinningHand) => void)[] = [];
  private chatListeners: ((msg: { sender: string; text: string; timestamp: number }) => void)[] = [];

  public connect(serverUrl: string = 'http://localhost:4000', options?: { auth?: { token?: string } }): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.notifyStatus('connecting');

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      auth: options?.auth,
    });

    this.socket.on('connect', () => {
      console.log('[PokerSocket] Connected to server:', serverUrl);
      this.notifyStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[PokerSocket] Disconnected:', reason);
      this.notifyStatus('disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[PokerSocket] Connection error:', err.message);
      this.notifyStatus('error');
    });

    // Inbound Poker Server Events
    this.socket.on('game_state', (state: GameState) => {
      this.gameStateListeners.forEach((fn) => fn(state));
    });

    this.socket.on('hand_completed', (result: WinningHand) => {
      this.winnerListeners.forEach((fn) => fn(result));
    });

    this.socket.on('chat_message', (msg: { sender: string; text: string; timestamp: number }) => {
      this.chatListeners.forEach((fn) => fn(msg));
    });

    this.socket.on('player_joined', (player: Player) => {
      console.log('[PokerSocket] Player joined:', player.name);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.notifyStatus('disconnected');
    }
  }

  // Outbound Poker Actions
  public joinTable(tableId: string, seatIndex: number, buyIn: number): void {
    this.socket?.emit('join_table', { tableId, seatIndex, buyIn });
  }

  public leaveTable(tableId: string): void {
    this.socket?.emit('leave_table', { tableId });
  }

  public sendAction(payload: PlayerActionPayload): void {
    this.socket?.emit('player_action', payload);
  }

  public sendChatMessage(tableId: string, text: string): void {
    this.socket?.emit('send_chat', { tableId, text });
  }

  // Event Listeners subscription
  public onStatusChange(callback: (status: SocketStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public onGameState(callback: (state: GameState) => void): () => void {
    this.gameStateListeners.push(callback);
    return () => {
      this.gameStateListeners = this.gameStateListeners.filter((cb) => cb !== callback);
    };
  }

  public onWinner(callback: (result: WinningHand) => void): () => void {
    this.winnerListeners.push(callback);
    return () => {
      this.winnerListeners = this.winnerListeners.filter((cb) => cb !== callback);
    };
  }

  public onChat(callback: (msg: { sender: string; text: string; timestamp: number }) => void): () => void {
    this.chatListeners.push(callback);
    return () => {
      this.chatListeners = this.chatListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyStatus(status: SocketStatus): void {
    this.statusListeners.forEach((fn) => fn(status));
  }

  public isSocketConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
