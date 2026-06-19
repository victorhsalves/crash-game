import { useCallback, useEffect, useRef, useState } from "react";
import { gameApi } from "@/services/game/game.api";
import { WebSocketEvents } from "@/services/websocket/events";
import type {
  RoundBetAddedWebSocketPayload,
  RoundBetListItem,
  RoundBetUpdatedWebSocketPayload,
} from "@/types/game.types";
import {
  mapToSortedList,
  roundBetsSync,
  upsertRoundBet,
  type RoundBetsSyncMessage,
} from "@/lib/round-bets-sync";

const SNAPSHOT_DEBOUNCE_MS = 100;

export function useRoundBets(currentRoundId: string | null) {
  const [betsMap, setBetsMap] = useState<Map<string, RoundBetListItem>>(() => new Map());
  const [isLoading, setIsLoading] = useState(true);
  const roundIdRef = useRef<string | null>(currentRoundId);
  const snapshotTimerRef = useRef<number | null>(null);

  roundIdRef.current = currentRoundId;

  const applySnapshot = useCallback((roundId: string, bets: RoundBetListItem[]) => {
    if (roundIdRef.current !== roundId) {
      return;
    }

    const next = new Map<string, RoundBetListItem>();
    for (const bet of bets) {
      next.set(bet.id, bet);
    }

    setBetsMap(next);
    setIsLoading(false);
  }, []);

  const applyPatch = useCallback((roundId: string, bet: RoundBetListItem) => {
    if (roundIdRef.current !== roundId) {
      return;
    }

    setBetsMap((current) => upsertRoundBet(current, bet));
    setIsLoading(false);
  }, []);

  const resetForRound = useCallback((roundId: string) => {
    if (roundIdRef.current !== roundId) {
      return;
    }

    setBetsMap(new Map());
    setIsLoading(false);
  }, []);

  const postSnapshot = useCallback((roundId: string, bets: RoundBetListItem[]) => {
    if (snapshotTimerRef.current !== null) {
      window.clearTimeout(snapshotTimerRef.current);
    }

    snapshotTimerRef.current = window.setTimeout(() => {
      roundBetsSync.post({ type: "snapshot", roundId, bets });
      snapshotTimerRef.current = null;
    }, SNAPSHOT_DEBOUNCE_MS);
  }, []);

  const hydrate = useCallback(async () => {
    setIsLoading(true);

    try {
      const round = await gameApi.getCurrentRound();
      roundIdRef.current = round.id;

      const bets = round.bets.map((bet) => ({ ...bet, isPending: false }));
      applySnapshot(round.id, bets);
      postSnapshot(round.id, bets);
    } catch {
      setIsLoading(false);
    }
  }, [applySnapshot, postSnapshot]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    return roundBetsSync.subscribe((message: RoundBetsSyncMessage) => {
      if (message.type === "snapshot") {
        applySnapshot(
          message.roundId,
          message.bets.map((bet) => ({ ...bet, isPending: false })),
        );
        return;
      }

      if (message.type === "patch") {
        applyPatch(message.roundId, message.bet);
        return;
      }

      if (message.type === "reset") {
        resetForRound(message.roundId);
      }
    });
  }, [applyPatch, applySnapshot, resetForRound]);

  useEffect(() => {
    return () => {
      if (snapshotTimerRef.current !== null) {
        window.clearTimeout(snapshotTimerRef.current);
      }
    };
  }, []);

  const addOptimisticBet = useCallback(
    (betId: string, username: string, amountCents: number) => {
      const roundId = roundIdRef.current;

      if (roundId === null) {
        return;
      }

      const bet: RoundBetListItem = {
        id: betId,
        username,
        amountCents,
        status: "ACCEPTED",
        multiplier: null,
        payoutCents: null,
        cashedOutAt: null,
        isPending: true,
      };

      applyPatch(roundId, bet);
      roundBetsSync.post({ type: "patch", roundId, bet });
    },
    [applyPatch],
  );

  const removeOptimisticBet = useCallback((betId: string) => {
    const roundId = roundIdRef.current;

    if (roundId === null) {
      return;
    }

    setBetsMap((current) => {
      const next = new Map(current);
      const existing = next.get(betId);

      if (existing?.isPending === true) {
        next.delete(betId);
      }

      return next;
    });
  }, []);

  const handleRoundBetEvent = useCallback(
    (event: string, payload: unknown) => {
      if (event === WebSocketEvents.RoundBettingOpened) {
        if (typeof payload === "object" && payload !== null && "roundId" in payload) {
          const roundId = (payload as { roundId: string }).roundId;
          roundIdRef.current = roundId;
          resetForRound(roundId);
          roundBetsSync.post({ type: "reset", roundId });
        }

        return;
      }

      if (event === WebSocketEvents.RoundBetAdded && typeof payload === "object" && payload !== null) {
        const data = payload as RoundBetAddedWebSocketPayload;
        const bet: RoundBetListItem = { ...data.bet, isPending: false };
        applyPatch(data.roundId, bet);
        roundBetsSync.post({ type: "patch", roundId: data.roundId, bet });
        return;
      }

      if (event === WebSocketEvents.RoundBetUpdated && typeof payload === "object" && payload !== null) {
        const data = payload as RoundBetUpdatedWebSocketPayload;

        setBetsMap((current) => {
          const existing = current.get(data.betId);

          if (existing === undefined) {
            return current;
          }

          const updated: RoundBetListItem = {
            ...existing,
            status: data.status,
            multiplier: data.multiplier,
            payoutCents: data.payoutCents,
            cashedOutAt: data.cashedOutAt,
            isPending: false,
          };

          const next = upsertRoundBet(current, updated);
          roundBetsSync.post({ type: "patch", roundId: data.roundId, bet: updated });
          return next;
        });
      }
    },
    [applyPatch, resetForRound],
  );

  return {
    bets: mapToSortedList(betsMap),
    isLoading,
    hydrate,
    addOptimisticBet,
    removeOptimisticBet,
    handleRoundBetEvent,
  };
}
