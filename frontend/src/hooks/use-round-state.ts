import { useCallback, useEffect, useState } from "react";
import { gameApi } from "@/services/game/game.api";
import { WebSocketEvents } from "@/services/websocket/events";
import type {
  CurrentGameRound,
  GameRoundStatus,
  RoundBettingOpenedWebSocketPayload,
  RoundFinishedWebSocketPayload,
  RoundRunningWebSocketPayload,
  RoundState,
} from "@/types/game.types";

function parsePhaseEndsAt(status: GameRoundStatus, round: CurrentGameRound): Date | null {
  if (status === "BETTING" && round.bettingEndsAt) {
    return new Date(round.bettingEndsAt);
  }

  if (status === "RUNNING" && round.runningEndsAt) {
    return new Date(round.runningEndsAt);
  }

  return null;
}

function stateFromCurrentRound(round: CurrentGameRound): RoundState {
  return {
    roundId: round.id,
    status: round.status,
    phaseEndsAt: parsePhaseEndsAt(round.status, round),
  };
}

export function useRoundState() {
  const [roundState, setRoundState] = useState<RoundState>({
    roundId: null,
    status: null,
    phaseEndsAt: null,
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const syncFromApi = useCallback(async () => {
    try {
      const round = await gameApi.getCurrentRound();
      setRoundState(stateFromCurrentRound(round));
    } catch {
      setRoundState({ roundId: null, status: null, phaseEndsAt: null });
    }
  }, []);

  useEffect(() => {
    void syncFromApi();
  }, [syncFromApi]);

  useEffect(() => {
    if (roundState.phaseEndsAt === null) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const diffMs = roundState.phaseEndsAt!.getTime() - Date.now();
      setRemainingSeconds(Math.max(0, Math.ceil(diffMs / 1000)));
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [roundState.phaseEndsAt]);

  const handleRoundEvent = useCallback(
    (event: string, payload: unknown) => {
      if (event === WebSocketEvents.RoundBettingOpened) {
        const data = payload as RoundBettingOpenedWebSocketPayload;
        setRoundState({
          roundId: data.roundId,
          status: "BETTING",
          phaseEndsAt: new Date(data.bettingEndsAt),
        });
        return;
      }

      if (event === WebSocketEvents.RoundRunning) {
        const data = payload as RoundRunningWebSocketPayload;
        setRoundState({
          roundId: data.roundId,
          status: "RUNNING",
          phaseEndsAt: new Date(data.runningEndsAt),
        });
        return;
      }

      if (event === WebSocketEvents.RoundFinished) {
        const data = payload as RoundFinishedWebSocketPayload;
        setRoundState({
          roundId: data.roundId,
          status: "FINISHED",
          phaseEndsAt: null,
        });
        void syncFromApi();
      }
    },
    [syncFromApi],
  );

  return {
    roundState,
    remainingSeconds,
    handleRoundEvent,
    syncFromApi,
  };
}
