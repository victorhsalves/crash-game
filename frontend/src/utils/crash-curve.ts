export const DEFAULT_GROWTH_FACTOR = 0.23;

export function calculateMultiplier(elapsedSeconds: number, growthFactor: number): number {
  return Math.exp(growthFactor * elapsedSeconds);
}

export function calculateElapsedSeconds(
  startedAt: string,
  nowMs: number,
  serverOffsetMs: number,
): number {
  return (nowMs + serverOffsetMs - new Date(startedAt).getTime()) / 1000;
}
