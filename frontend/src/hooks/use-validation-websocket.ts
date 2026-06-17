import { useEffect, useRef } from "react";
import { websocketService } from "@/services/websocket/websocket.service";
import type { EventLogSource } from "@/types/event-log.types";

interface UseValidationWebSocketOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
  onEvent?: (event: string, payload: unknown) => void;
}

export function useValidationWebSocket({ append, onEvent }: UseValidationWebSocketOptions): void {
  const appendRef = useRef(append);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    appendRef.current = append;
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL;

    websocketService.subscribe({
      onConnect: (payload) => {
        appendRef.current("system", "connected", payload);
      },
      onDisconnect: (payload) => {
        appendRef.current("system", "disconnected", payload);
      },
      onConnectError: (payload) => {
        appendRef.current("system", "connection error", payload);
      },
      onEvent: (event, payload) => {
        appendRef.current("ws", event, payload);
        onEventRef.current?.(event, payload);
      },
    });

    void websocketService.connect(url);

    return () => {
      websocketService.disconnect();
    };
  }, []);
}
