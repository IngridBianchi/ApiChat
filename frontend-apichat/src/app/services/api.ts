import { io, Socket } from "socket.io-client";

export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

interface HistoryResponse {
  data: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

type EventCallback = (data: any) => void;

function clearStoredSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function normalizeMessage(payload: Partial<Message>): Message {
  return {
    id: String(payload.id || ""),
    roomId: String(payload.roomId || ""),
    userId: String(payload.userId || ""),
    username: String(payload.username || ""),
    message: String(payload.message || ""),
    createdAt: String(payload.createdAt || new Date().toISOString()),
  };
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((subscriber) => subscriber.resolve(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailed(error: Error) {
    this.refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(resolve: (token: string) => void, reject: (error: Error) => void) {
    this.refreshSubscribers.push({ resolve, reject });
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No hay refresh token");
    }

    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      throw new Error("Refresh token expirado o invalido");
    }

    const tokens = (await refreshResponse.json()) as AuthTokens;
    localStorage.setItem("token", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    return tokens.accessToken;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");

    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401 && token) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.onRefreshed(newToken);
        } catch (error) {
          const refreshError = error instanceof Error ? error : new Error("Sesion expirada");
          this.onRefreshFailed(refreshError);
          clearStoredSession();
          window.location.href = "/login";
        } finally {
          this.isRefreshing = false;
        }
      }

      const refreshedToken = await new Promise<string>((resolve, reject) => {
        this.addRefreshSubscriber(resolve, reject);
      });

      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  async register(data: { username: string; password: string }) {
    return this.fetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: { username: string; password: string }) {
    return this.fetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.fetch<null>("/auth/logout", {
      method: "POST",
    });
  }

  async getHistory(roomId: string) {
    const response = await this.fetch<HistoryResponse>(`/messages/history?roomId=${encodeURIComponent(roomId)}`);
    return {
      ...response,
      data: [...response.data].reverse().map((message) => normalizeMessage(message)),
    };
  }
}

export const api = new ApiClient();

export class SocketClient {
  private socket: Socket | null = null;
  private currentRoom: string | null = null;
  private localListeners: Record<string, EventCallback[]> = {};

  connect(token: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      if (this.currentRoom) {
        this.emit("chat.room.join", { roomId: this.currentRoom });
      }
    });

    this.socket.on("connect_error", () => {
      this.emitToLocalListeners("chat.error", { message: "Error de conexion con socket" });
    });

    this.socket.on("chat.message.received", (payload: Message) => {
      this.emitToLocalListeners("chat.message.received", normalizeMessage(payload));
    });

    this.socket.on("chat.user.joined", (payload: any) => {
      this.emitToLocalListeners("chat.user.joined", payload);
    });

    this.socket.on("chat.user.left", (payload: any) => {
      this.emitToLocalListeners("chat.user.left", payload);
    });

    this.socket.on("chat.error", (payload: any) => {
      this.emitToLocalListeners("chat.error", payload);
    });
  }

  on(event: string, callback: EventCallback) {
    if (!this.localListeners[event]) {
      this.localListeners[event] = [];
    }

    this.localListeners[event].push(callback);
  }

  off(event: string) {
    delete this.localListeners[event];
  }

  emit(event: string, data: any) {
    if (event === "chat.room.join") {
      this.currentRoom = data.roomId;
    }

    if (!this.socket) {
      return;
    }

    this.socket.emit(event, data);
  }

  private emitToLocalListeners(event: string, data: any) {
    if (!this.localListeners[event]) {
      return;
    }

    this.localListeners[event].forEach((callback) => callback(data));
  }

  disconnect() {
    if (!this.socket) {
      this.localListeners = {};
      this.currentRoom = null;
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.localListeners = {};
    this.currentRoom = null;
  }
}

export const socketClient = new SocketClient();
