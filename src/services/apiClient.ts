import { AuthResponse, ErrorResponse, HealthResponse, LoginRequest, RegisterRequest } from '../types/backend';

export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080';
export const DEFAULT_WS_BASE_URL = 'ws://127.0.0.1:8080/ws';

const TOKEN_KEY = 'poker_jwt_token';
const USER_KEY = 'poker_user_info';

class ApiClient {
  private baseUrl: string = DEFAULT_API_BASE_URL;

  constructor() {
    const saved = localStorage.getItem('poker_api_base');
    if (saved) {
      this.baseUrl = saved;
    }
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem('poker_api_base', this.baseUrl);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getWsUrl(): string {
    const savedWs = localStorage.getItem('poker_ws_base');
    if (savedWs) return savedWs;
    try {
      const parsed = new URL(this.baseUrl);
      const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProto}//${parsed.host}/ws`;
    } catch {
      return DEFAULT_WS_BASE_URL;
    }
  }

  public getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public getStoredUser(): { username: string; chips: number } | null {
    const item = localStorage.getItem(USER_KEY);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  public storeAuth(token: string, username: string, chips: number): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({ username, chips }));
  }

  public clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with HTTP ${res.status}`);
    }
    return res.json();
  }

  public async register(payload: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const err = data as ErrorResponse;
      throw new Error(err.error || `Registration failed with status ${res.status}`);
    }

    const auth = data as AuthResponse;
    const username = auth.username || auth.user?.username || payload.username;
    const chips = auth.chips ?? auth.user?.chips ?? 10000;
    this.storeAuth(auth.token, username, chips);
    return auth;
  }

  public async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const err = data as ErrorResponse;
      throw new Error(err.error || `Login failed with status ${res.status}`);
    }

    const auth = data as AuthResponse;
    const username = auth.username || auth.user?.username || payload.username;
    const chips = auth.chips ?? auth.user?.chips ?? 1000;
    this.storeAuth(auth.token, username, chips);
    return auth;
  }
}

export const apiClient = new ApiClient();
