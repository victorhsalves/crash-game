import { useEffect } from "react";
import { websocketService } from "@/services/websocket/websocket.service";
import type { EventLogSource } from "@/types/event-log.types";

interface UseValidationWebSocketOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
  onEvent?: (event: string, payload: unknown) => void;
}

export function useValidationWebSocket({ append, onEvent }: UseValidationWebSocketOptions): void {
  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL;

    websocketService.subscribe({
      onConnect: (payload) => {
        append("system", "connected", payload);
      },
      onDisconnect: (payload) => {
        append("system", "disconnected", payload);
      },
      onConnectError: (payload) => {
        append("system", "connection error", payload);
      },
      onEvent: (event, payload) => {
        append("ws", event, payload);
        onEvent?.(event, payload);
      },
    });

    websocketService.connect(url);

    return () => {
      websocketService.disconnect();
    };
  }, [append, onEvent]);
}
