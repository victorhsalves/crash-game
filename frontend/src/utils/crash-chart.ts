import type { CrashCurvePoint } from "@/types/game.types";

export const CHART_WIDTH = 400;
export const CHART_HEIGHT = 240;
export const CHART_PADDING = 24;

const MIN_MULTIPLIER = 1;
const MIN_X_MAX_SECONDS = 3;
const Y_MAX_HEADROOM = 1.15;
const MIN_Y_MAX = 2;

export interface ChartBounds {
  xMax: number;
  yMax: number;
}

export function computeChartBounds(points: CrashCurvePoint[]): ChartBounds {
  if (points.length === 0) {
    return { xMax: MIN_X_MAX_SECONDS, yMax: MIN_Y_MAX };
  }

  const maxElapsed = points.reduce((max, point) => Math.max(max, point.elapsedSeconds), 0);
  const maxMultiplier = points.reduce((max, point) => Math.max(max, point.multiplier), MIN_MULTIPLIER);

  return {
    xMax: Math.max(maxElapsed, MIN_X_MAX_SECONDS),
    yMax: Math.max(maxMultiplier * Y_MAX_HEADROOM, MIN_Y_MAX),
  };
}

export function elapsedToX(
  elapsedSeconds: number,
  width: number,
  padding: number,
  xMax: number,
): number {
  const innerWidth = width - padding * 2;
  const ratio = Math.min(Math.max(elapsedSeconds / xMax, 0), 1);
  return padding + ratio * innerWidth;
}

export function multiplierToY(
  multiplier: number,
  height: number,
  padding: number,
  yMax: number,
): number {
  const innerHeight = height - padding * 2;
  const safeMultiplier = Math.max(multiplier, MIN_MULTIPLIER);
  const logMin = Math.log(MIN_MULTIPLIER);
  const logMax = Math.log(Math.max(yMax, MIN_Y_MAX));
  const logValue = Math.log(Math.min(safeMultiplier, yMax));
  const ratio = logMax === logMin ? 0 : (logValue - logMin) / (logMax - logMin);

  return height - padding - ratio * innerHeight;
}

export function buildLinePath(
  points: CrashCurvePoint[],
  width: number,
  height: number,
  bounds?: ChartBounds,
): string {
  if (points.length === 0) {
    return "";
  }

  const { xMax, yMax } = bounds ?? computeChartBounds(points);

  return points
    .map((point, index) => {
      const x = elapsedToX(point.elapsedSeconds, width, CHART_PADDING, xMax);
      const y = multiplierToY(point.multiplier, height, CHART_PADDING, yMax);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function buildAreaPath(linePath: string, baselineY: number): string {
  if (!linePath) {
    return "";
  }

  const match = linePath.match(/M ([\d.]+) ([\d.]+)/);
  const lastMatch = [...linePath.matchAll(/L ([\d.]+) ([\d.]+)/g)].pop();

  if (!match || !lastMatch) {
    return "";
  }

  const startX = match[1];
  const endX = lastMatch[1];

  return `${linePath} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
}

export function getBaselineY(height: number, padding: number): number {
  return height - padding;
}
