import { useCallback, useState } from "react";
import { WebSocketEvents } from "@/services/websocket/events";
import { websocketService } from "@/services/websocket/websocket.service";
import type { BetCashoutFailedWebSocketPayload, BetUpdatedWebSocketPayload } from "@/types/game.types";
import type { EventLogSource } from "@/types/event-log.types";

interface UseCashoutOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
}

export function useCashout({ append }: UseCashoutOptions) {
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [lastError, setLastError] = useState<BetCashoutFailedWebSocketPayload | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setCashoutMultiplier(null);
  }, []);

  const handleCashoutEvent = useCallback(
    (event: string, payload: unknown) => {
      if (event === WebSocketEvents.BetUpdated) {
        setIsCashingOut(false);
        setLastError(null);

        const updated = payload as BetUpdatedWebSocketPayload;
        if (updated.status === "CASHED_OUT" && updated.multiplier !== null) {
          setCashoutMultiplier(updated.multiplier);
        }
        return;
      }

      if (event === WebSocketEvents.BetCashoutFailed) {
        setIsCashingOut(false);
        const errorPayload = payload as BetCashoutFailedWebSocketPayload;
        setLastError(errorPayload);
        closePopup();
      }
    },
    [closePopup],
  );

  const handleRoundEventForPopup = useCallback(
    (event: string) => {
      if (event === WebSocketEvents.RoundCrashed || event === WebSocketEvents.RoundBettingOpened) {
        closePopup();
      }
    },
    [closePopup],
  );

  const cashout = useCallback(() => {
    if (isCashingOut) {
      return;
    }

    setIsCashingOut(true);
    setLastError(null);
    setIsPopupOpen(true);
    setCashoutMultiplier(null);
    websocketService.emit(WebSocketEvents.BetCashout);
    append("ws", WebSocketEvents.BetCashout);
  }, [append, isCashingOut]);

  return {
    cashout,
    isCashingOut,
    lastError,
    isPopupOpen,
    cashoutMultiplier,
    handleCashoutEvent,
    handleRoundEventForPopup,
  };
}
