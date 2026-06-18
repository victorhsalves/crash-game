import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketEvents } from "@/services/websocket/events";
import type {
  CrashChartPhase,
  CrashCurvePoint,
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
const MAX_CURVE_POINTS = 600;
const BACKFILL_STEP_SECONDS = 0.05;

type MultiplierMode = CrashChartPhase;

function buildBackfillPoints(
  elapsedSeconds: number,
  growthFactor: number,
): CrashCurvePoint[] {
  const points: CrashCurvePoint[] = [{ elapsedSeconds: 0, multiplier: INITIAL_MULTIPLIER }];

  for (let t = BACKFILL_STEP_SECONDS; t <= elapsedSeconds; t += BACKFILL_STEP_SECONDS) {
    points.push({
      elapsedSeconds: t,
      multiplier: calculateMultiplier(t, growthFactor),
    });
  }

  const last = points[points.length - 1];
  if (last.elapsedSeconds < elapsedSeconds) {
    points.push({
      elapsedSeconds,
      multiplier: calculateMultiplier(elapsedSeconds, growthFactor),
    });
  }

  return points.slice(-MAX_CURVE_POINTS);
}

function appendPoint(
  points: CrashCurvePoint[],
  point: CrashCurvePoint,
): CrashCurvePoint[] {
  const last = points[points.length - 1];
  if (
    last &&
    last.elapsedSeconds === point.elapsedSeconds &&
    last.multiplier === point.multiplier
  ) {
    return points;
  }

  const next = [...points, point];
  if (next.length > MAX_CURVE_POINTS) {
    return next.slice(next.length - MAX_CURVE_POINTS);
  }

  return next;
}

export function useCrashMultiplier() {
  const [displayValue, setDisplayValue] = useState(INITIAL_MULTIPLIER);
  const [curvePoints, setCurvePoints] = useState<CrashCurvePoint[]>([]);
  const [chartPhase, setChartPhase] = useState<CrashChartPhase>("idle");

  const modeRef = useRef<MultiplierMode>("idle");
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
    const multiplier = calculateMultiplier(elapsed, growthFactorRef.current);

    setDisplayValue(multiplier);
    setCurvePoints((current) =>
      appendPoint(current, { elapsedSeconds: elapsed, multiplier }),
    );
    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();
    modeRef.current = "running";
    setChartPhase("running");
    rafIdRef.current = requestAnimationFrame(tick);
  }, [stopAnimation, tick]);

  const resetToInitial = useCallback(() => {
    stopAnimation();
    modeRef.current = "idle";
    startedAtRef.current = null;
    setChartPhase("idle");
    setDisplayValue(INITIAL_MULTIPLIER);
    setCurvePoints([]);
  }, [stopAnimation]);

  const freezeAtCrashPoint = useCallback(
    (crashPoint: number, elapsedSeconds?: number) => {
      stopAnimation();
      modeRef.current = "crashed";
      setChartPhase("crashed");
      setDisplayValue(crashPoint);

      setCurvePoints((current) => {
        const elapsed =
          elapsedSeconds ??
          (startedAtRef.current
            ? calculateElapsedSeconds(
                startedAtRef.current,
                Date.now(),
                serverOffsetMsRef.current,
              )
            : current[current.length - 1]?.elapsedSeconds ?? 0);

        return appendPoint(current, { elapsedSeconds: elapsed, multiplier: crashPoint });
      });
    },
    [stopAnimation],
  );

  const beginRunning = useCallback(
    (startedAt: string, growthFactor: number, serverTime?: string, backfill = false) => {
      startedAtRef.current = startedAt;
      growthFactorRef.current = growthFactor;
      serverOffsetMsRef.current = serverTime
        ? new Date(serverTime).getTime() - Date.now()
        : 0;

      if (backfill) {
        const elapsed = calculateElapsedSeconds(
          startedAt,
          Date.now(),
          serverOffsetMsRef.current,
        );
        const multiplier = calculateMultiplier(elapsed, growthFactor);
        setDisplayValue(multiplier);
        setCurvePoints(buildBackfillPoints(elapsed, growthFactor));
      } else {
        setCurvePoints([{ elapsedSeconds: 0, multiplier: INITIAL_MULTIPLIER }]);
        setDisplayValue(INITIAL_MULTIPLIER);
      }

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
        beginRunning(round.startedAt, DEFAULT_GROWTH_FACTOR, undefined, true);
        return;
      }

      if (
        (round.status === "CRASHED" || round.status === "FINISHED") &&
        round.crashPoint !== null
      ) {
        const crashPoint = Number(round.crashPoint);
        const elapsed =
          round.startedAt !== null
            ? calculateElapsedSeconds(round.startedAt, Date.now(), 0)
            : 0;

        stopAnimation();
        modeRef.current = "crashed";
        setChartPhase("crashed");
        setDisplayValue(crashPoint);

        const points = buildBackfillPoints(elapsed, DEFAULT_GROWTH_FACTOR);
        if (points.length === 0) {
          setCurvePoints([{ elapsedSeconds: elapsed, multiplier: crashPoint }]);
          return;
        }

        points[points.length - 1] = { elapsedSeconds: elapsed, multiplier: crashPoint };
        setCurvePoints(points);
      }
    },
    [beginRunning, resetToInitial, stopAnimation],
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
    curvePoints,
    chartPhase,
    handleMultiplierEvent,
    syncFromRound,
  };
}
