import { io, type Socket } from "socket.io-client";
import { E2E_CONFIG } from "./config";

export function connectGameSocket(token: string): Socket {
  return io(E2E_CONFIG.gamesWsUrl, {
    auth: { token },
    transports: ["websocket"],
    reconnection: false,
  });
}

export function waitForSocketConnection(socket: Socket, timeoutMs: number = E2E_CONFIG.defaultTimeoutMs): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("WebSocket connection timed out"));
    }, timeoutMs);

    const onConnect = (): void => {
      cleanup();
      resolve();
    };

    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };

    const cleanup = (): void => {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
  });
}

export function waitForWsEvent<T = unknown>(
  socket: Socket,
  eventName: string,
  predicate?: (payload: T) => boolean,
  timeoutMs: number = E2E_CONFIG.defaultTimeoutMs,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for WebSocket event "${eventName}"`));
    }, timeoutMs);

    const handler = (payload: T): void => {
      if (predicate !== undefined && !predicate(payload)) {
        return;
      }

      cleanup();
      resolve(payload);
    };

    const cleanup = (): void => {
      clearTimeout(timer);
      socket.off(eventName, handler);
    };

    socket.on(eventName, handler);
  });
}

export async function disconnectSocket(socket: Socket): Promise<void> {
  socket.disconnect();
}
