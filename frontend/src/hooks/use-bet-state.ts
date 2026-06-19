import { useCallback, useState } from "react";
import { mapBetRejectedReason } from "@/lib/resolve-error-message";
import { toast } from "@/stores/toast.store";
import type { BetRejectedWebSocketPayload, BetState, BetUpdatedWebSocketPayload } from "@/types/game.types";

const initialBetState: BetState = {
  betId: null,
  status: null,
  amountCents: null,
  multiplier: null,
  payout: null,
  cashedOutAt: null,
};

export function useBetState() {
  const [betState, setBetState] = useState<BetState>(initialBetState);

  const setPendingBet = useCallback((betId: string, amountCents: number) => {
    setBetState({
      betId,
      status: "PENDING",
      amountCents,
      multiplier: null,
      payout: null,
      cashedOutAt: null,
    });
  }, []);

  const handleBetEvent = useCallback((event: string, payload: unknown) => {
    if (event === "bet.accepted" && typeof payload === "object" && payload !== null && "betId" in payload) {
      const betId = (payload as { betId: string }).betId;
      setBetState((current) => ({
        ...current,
        betId,
        status: "ACCEPTED",
      }));
      return;
    }

    if (event === "bet.rejected" && typeof payload === "object" && payload !== null && "betId" in payload) {
      const rejected = payload as BetRejectedWebSocketPayload;
      toast.error(mapBetRejectedReason(rejected.reason));
      setBetState(initialBetState);
      return;
    }

    if (event === "bet.updated" && typeof payload === "object" && payload !== null) {
      const updated = payload as BetUpdatedWebSocketPayload;

      setBetState((current) => ({
        betId: updated.betId,
        status: updated.status,
        amountCents: current.amountCents,
        multiplier: updated.multiplier,
        payout: updated.payout,
        cashedOutAt: updated.cashedOutAt,
      }));
    }
  }, []);

  const resetBetState = useCallback(() => {
    setBetState(initialBetState);
  }, []);

  return {
    betState,
    setPendingBet,
    handleBetEvent,
    resetBetState,
  };
}
