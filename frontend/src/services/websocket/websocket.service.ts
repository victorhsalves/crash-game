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

  public subscribe(handlers: WebSocketHandlers): void {
    this.handlers = handlers;
  }

  public connect(url: string): void {
    if (this.socket?.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socket = io(url);
    this.socket = socket;

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

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
