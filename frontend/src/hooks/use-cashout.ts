import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { parseApiError } from "@/services/api/api-error";
import { gameApi } from "@/services/game/game.api";
import { resolveApiErrorPayload } from "@/lib/resolve-error-message";
import { toast } from "@/stores/toast.store";
import { WebSocketEvents } from "@/services/websocket/events";
import type { BetUpdatedWebSocketPayload } from "@/types/game.types";
import type { EventLogSource } from "@/types/event-log.types";
import type { ApiErrorPayload } from "@/services/api/api-error";

interface UseCashoutOptions {
  append: (source: EventLogSource, event: string, payload?: unknown) => void;
}

export function useCashout({ append }: UseCashoutOptions) {
  const [lastError, setLastError] = useState<ApiErrorPayload | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setCashoutMultiplier(null);
  }, []);

  const mutation = useMutation({
    mutationFn: () => gameApi.cashout(),
    onSuccess: (response) => {
      setLastError(null);
      setCashoutMultiplier(response.multiplier);
      append("api", "cashout", response);
    },
    onError: (error) => {
      const payload = parseApiError(error);
      setLastError(payload);
      closePopup();
      append("api", "cashout.error", payload);
      toast.error(resolveApiErrorPayload(payload));
    },
  });

  const handleCashoutEvent = useCallback((event: string, payload: unknown) => {
    if (event === WebSocketEvents.BetUpdated) {
      setLastError(null);

      const updated = payload as BetUpdatedWebSocketPayload;
      if (updated.status === "CASHED_OUT" && updated.multiplier !== null) {
        setCashoutMultiplier(updated.multiplier);
      }
    }
  }, []);

  const handleRoundEventForPopup = useCallback(
    (event: string) => {
      if (event === WebSocketEvents.RoundCrashed || event === WebSocketEvents.RoundBettingOpened) {
        closePopup();
      }
    },
    [closePopup],
  );

  const cashout = useCallback(() => {
    if (mutation.isPending) {
      return;
    }

    setLastError(null);
    setIsPopupOpen(true);
    setCashoutMultiplier(null);
    mutation.mutate();
  }, [mutation]);

  return {
    cashout,
    isCashingOut: mutation.isPending,
    lastError,
    isPopupOpen,
    cashoutMultiplier,
    handleCashoutEvent,
    handleRoundEventForPopup,
  };
}
