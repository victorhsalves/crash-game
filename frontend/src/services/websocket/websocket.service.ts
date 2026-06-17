import { authService } from "@/services/auth/auth.service";
import { io, type Socket } from "socket.io-client";

export interface WebSocketLifecyclePayload {
  socketId?: string;
  reason?: string;
  message?: string;
}

export interface WebSocketHandlers {
  onConnect?: (payload: WebSocketLifecyclePayload) => void;
  onDisconnect?: (payload: WebSocketLifecyclePayload) => void;
  onConnectError?: (payload: WebSocketLifecyclePayload) => void;
  onEvent?: (event: string, payload: unknown) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private handlers: WebSocketHandlers = {};
  private connectPromise: Promise<void> | null = null;
  private connectGeneration = 0;
  private connectedUrl: string | null = null;

  public subscribe(handlers: WebSocketHandlers): void {
    this.handlers = handlers;
  }

  public connect(url: string): Promise<void> {
    if (this.socket?.connected && this.connectedUrl === url) {
      return Promise.resolve();
    }

    if (this.connectPromise !== null) {
      return this.connectPromise;
    }

    this.connectGeneration += 1;
    const generation = this.connectGeneration;

    this.connectPromise = this.establishConnection(url, generation).finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
  }

  private async establishConnection(url: string, generation: number): Promise<void> {
    this.teardownSocket();

    const token = await authService.getAccessToken();

    if (generation !== this.connectGeneration) {
      return;
    }

    const socket = io(url, {
      auth: {
        token: token ?? "",
      },
      reconnection: false,
    });

    if (generation !== this.connectGeneration) {
      socket.removeAllListeners();
      socket.disconnect();
      return;
    }

    this.socket = socket;
    this.connectedUrl = url;

    socket.on("connect", () => {
      this.handlers.onConnect?.({ socketId: socket.id });
    });

    socket.on("disconnect", (reason) => {
      this.handlers.onDisconnect?.({ socketId: socket.id, reason });
    });

    socket.on("connect_error", (error: Error) => {
      this.handlers.onConnectError?.({ message: error.message });
    });

    socket.onAny((event, ...args) => {
      const payload = args.length === 1 ? args[0] : args;
      this.handlers.onEvent?.(event, payload);
    });
  }

  public emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload);
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public disconnect(): void {
    this.connectGeneration += 1;
    this.connectPromise = null;
    this.teardownSocket();
    this.connectedUrl = null;
  }

  private teardownSocket(): void {
    if (this.socket === null) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }
}

export const websocketService = new WebSocketService();
