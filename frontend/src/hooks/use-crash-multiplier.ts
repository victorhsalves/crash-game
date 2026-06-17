import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketEvents } from "@/services/websocket/events";
import type {
  CurrentGameRound,
  RoundCrashedWebSocketPayload,
  RoundRunningWebSocketPayload,
} from "@/types/game.types";
import {
  calculateElapsedSeconds,
  calculateMultiplier,
  DEFAULT_GROWTH_FACTOR,
} from "@/utils/crash-curve";

const INITIAL_MULTIPLIER = 1;

type MultiplierMode = "initial" | "running" | "crashed";

export function useCrashMultiplier() {
  const [displayValue, setDisplayValue] = useState(INITIAL_MULTIPLIER);

  const modeRef = useRef<MultiplierMode>("initial");
  const startedAtRef = useRef<string | null>(null);
  const growthFactorRef = useRef(DEFAULT_GROWTH_FACTOR);
  const serverOffsetMsRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const startedAt = startedAtRef.current;
    if (!startedAt || modeRef.current !== "running") {
      return;
    }

    const elapsed = calculateElapsedSeconds(startedAt, Date.now(), serverOffsetMsRef.current);
    setDisplayValue(calculateMultiplier(elapsed, growthFactorRef.current));
    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();
    modeRef.current = "running";
    rafIdRef.current = requestAnimationFrame(tick);
  }, [stopAnimation, tick]);

  const resetToInitial = useCallback(() => {
    stopAnimation();
    modeRef.current = "initial";
    startedAtRef.current = null;
    setDisplayValue(INITIAL_MULTIPLIER);
  }, [stopAnimation]);

  const freezeAtCrashPoint = useCallback((crashPoint: number) => {
    stopAnimation();
    modeRef.current = "crashed";
    setDisplayValue(crashPoint);
  }, [stopAnimation]);

  const beginRunning = useCallback(
    (startedAt: string, growthFactor: number, serverTime?: string) => {
      startedAtRef.current = startedAt;
      growthFactorRef.current = growthFactor;
      serverOffsetMsRef.current = serverTime
        ? new Date(serverTime).getTime() - Date.now()
        : 0;
      startAnimation();
    },
    [startAnimation],
  );

  const syncFromRound = useCallback(
    (round: CurrentGameRound) => {
      if (round.status === "BETTING" || round.status === "WAITING") {
        resetToInitial();
        return;
      }

      if (round.status === "RUNNING" && round.startedAt) {
        beginRunning(round.startedAt, DEFAULT_GROWTH_FACTOR);
        return;
      }

      if (
        (round.status === "CRASHED" || round.status === "FINISHED") &&
        round.crashPoint !== null
      ) {
        freezeAtCrashPoint(Number(round.crashPoint));
      }
    },
    [beginRunning, freezeAtCrashPoint, resetToInitial],
  );

  const handleMultiplierEvent = useCallback(
    (event: string, payload: unknown) => {
      if (event === WebSocketEvents.RoundBettingOpened) {
        resetToInitial();
        return;
      }

      if (event === WebSocketEvents.RoundRunning) {
        const data = payload as RoundRunningWebSocketPayload;
        beginRunning(data.startedAt, data.growthFactor, data.serverTime);
        return;
      }

      if (event === WebSocketEvents.RoundCrashed) {
        const data = payload as RoundCrashedWebSocketPayload;
        freezeAtCrashPoint(data.crashPoint);
      }
    },
    [beginRunning, freezeAtCrashPoint, resetToInitial],
  );

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  return {
    displayValue,
    handleMultiplierEvent,
    syncFromRound,
  };
}
