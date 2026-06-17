import { useCallback, useState } from "react";
import { WebSocketEvents } from "@/services/websocket/events";
import { websocketService } from "@/services/websocket/websocket.service";
import type { BetCashoutFailedWebSocketPayload, BetUpdatedWebSocketPayload } from "@/types/game.types";
import type { EventLogSource } from "@/types/event-log.types";

interface UseCashoutOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
  onUpdated?: (payload: BetUpdatedWebSocketPayload) => void;
  onFailed?: (payload: BetCashoutFailedWebSocketPayload) => void;
}

export function useCashout({ append, onUpdated, onFailed }: UseCashoutOptions) {
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [lastError, setLastError] = useState<BetCashoutFailedWebSocketPayload | null>(null);

  const handleCashoutEvent = useCallback(
    (event: string, payload: unknown) => {
      if (event === WebSocketEvents.BetUpdated) {
        setIsCashingOut(false);
        setLastError(null);
        onUpdated?.(payload as BetUpdatedWebSocketPayload);
        return;
      }

      if (event === WebSocketEvents.BetCashoutFailed) {
        setIsCashingOut(false);
        const errorPayload = payload as BetCashoutFailedWebSocketPayload;
        setLastError(errorPayload);
        onFailed?.(errorPayload);
      }
    },
    [onFailed, onUpdated],
  );

  const cashout = useCallback(() => {
    if (isCashingOut) {
      return;
    }

    setIsCashingOut(true);
    setLastError(null);
    websocketService.emit(WebSocketEvents.BetCashout);
    append("ws", WebSocketEvents.BetCashout);
  }, [append, isCashingOut]);

  return {
    cashout,
    isCashingOut,
    lastError,
    handleCashoutEvent,
  };
}
