import { useCallback, useEffect, useState } from "react";
import { gameApi } from "@/services/game/game.api";
import { WebSocketEvents } from "@/services/websocket/events";
import type {
  CurrentGameRound,
  GameRoundStatus,
  RoundBettingOpenedWebSocketPayload,
  RoundCrashedWebSocketPayload,
  RoundFinishedWebSocketPayload,
  RoundRunningWebSocketPayload,
  RoundState,
} from "@/types/game.types";
import { ROUND_CRASHED_DURATION_MS } from "@/types/game.types";

function crashedPhaseEndsAt(crashedAt: string): Date {
  return new Date(new Date(crashedAt).getTime() + ROUND_CRASHED_DURATION_MS);
}

function parsePhaseEndsAt(status: GameRoundStatus, round: CurrentGameRound): Date | null {
  if (status === "BETTING" && round.bettingEndsAt) {
    return new Date(round.bettingEndsAt);
  }

  if (status === "CRASHED" && round.crashedAt) {
    return crashedPhaseEndsAt(round.crashedAt);
  }

  return null;
}

function stateFromCurrentRound(round: CurrentGameRound): RoundState {
  const exposesFairness = round.status === "BETTING" || round.status === "RUNNING";

  return {
    roundId: round.id,
    status: round.status,
    phaseEndsAt: parsePhaseEndsAt(round.status, round),
    serverSeedHash: exposesFairness ? round.serverSeedHash : null,
    clientSeed: exposesFairness ? round.clientSeed : null,
    nonce: exposesFairness ? round.nonce : null,
  };
}

export function useRoundState() {
  const [roundState, setRoundState] = useState<RoundState>({
    roundId: null,
    status: null,
    phaseEndsAt: null,
    serverSeedHash: null,
    clientSeed: null,
    nonce: null,
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [justCrashed, setJustCrashed] = useState(false);

  const syncFromApi = useCallback(async () => {
    try {
      const round = await gameApi.getCurrentRound();
      setRoundState(stateFromCurrentRound(round));
    } catch {
      setRoundState({ roundId: null, status: null, phaseEndsAt: null, serverSeedHash: null, clientSeed: null, nonce: null });
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
      const seconds = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(Number.isFinite(seconds) ? seconds : null);
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
          serverSeedHash: data.serverSeedHash,
          clientSeed: data.clientSeed,
          nonce: data.nonce,
        });
        return;
      }

      if (event === WebSocketEvents.RoundRunning) {
        const data = payload as RoundRunningWebSocketPayload;
        setRoundState((current) => ({
          roundId: data.roundId,
          status: "RUNNING",
          phaseEndsAt: null,
          serverSeedHash: current.serverSeedHash,
          clientSeed: current.clientSeed,
          nonce: current.nonce,
        }));
        return;
      }

      if (event === WebSocketEvents.RoundCrashed) {
        const data = payload as RoundCrashedWebSocketPayload;
        setJustCrashed(true);
        setRoundState({
          roundId: data.roundId,
          status: "CRASHED",
          phaseEndsAt: crashedPhaseEndsAt(data.crashedAt),
          serverSeedHash: null,
          clientSeed: null,
          nonce: null,
        });
        return;
      }

      if (event === WebSocketEvents.RoundFinished) {
        const data = payload as RoundFinishedWebSocketPayload;
        setRoundState({
          roundId: data.roundId,
          status: "FINISHED",
          phaseEndsAt: null,
          serverSeedHash: null,
          clientSeed: null,
          nonce: null,
        });
        void syncFromApi();
      }
    },
    [syncFromApi],
  );

  useEffect(() => {
    if (!justCrashed) {
      return;
    }

    const timeout = setTimeout(() => setJustCrashed(false), 600);
    return () => clearTimeout(timeout);
  }, [justCrashed]);

  return {
    roundState,
    remainingSeconds,
    justCrashed,
    handleRoundEvent,
    syncFromApi,
  };
}
