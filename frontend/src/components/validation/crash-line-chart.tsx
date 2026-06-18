import { memo, useMemo } from "react";
import type { CrashChartPhase, CrashCurvePoint, GameRoundStatus } from "@/types/game.types";
import {
  buildAreaPath,
  buildLinePath,
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  computeChartBounds,
  getBaselineY,
  multiplierToY,
} from "@/utils/crash-chart";

interface CrashLineChartProps {
  points: CrashCurvePoint[];
  phase: CrashChartPhase;
  roundStatus: GameRoundStatus | null;
}

const phaseColorClasses: Record<CrashChartPhase, string> = {
  idle: "text-muted",
  running: "text-primary",
  crashed: "text-danger",
};

function CrashLineChartComponent({ points, phase, roundStatus }: CrashLineChartProps) {
  const bounds = useMemo(() => computeChartBounds(points), [points]);
  const linePath = useMemo(
    () => buildLinePath(points, CHART_WIDTH, CHART_HEIGHT, bounds),
    [bounds, points],
  );
  const baselineY = getBaselineY(CHART_HEIGHT, CHART_PADDING);
  const areaPath = useMemo(() => buildAreaPath(linePath, baselineY), [baselineY, linePath]);

  const gridLines = useMemo(() => {
    const multipliers = [1.5, 2, 3, 5, 10].filter((value) => value <= bounds.yMax);

    return multipliers.map((value) => ({
      value,
      y: multiplierToY(value, CHART_HEIGHT, CHART_PADDING, bounds.yMax),
    }));
  }, [bounds.yMax]);

  if (points.length === 0 && (roundStatus === "BETTING" || roundStatus === "WAITING" || phase === "idle")) {
    return null;
  }

  const colorClass = phaseColorClasses[phase];

  return (
    <svg
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${colorClass}`}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crash-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((line) => (
        <line
          key={line.value}
          x1={CHART_PADDING}
          x2={CHART_WIDTH - CHART_PADDING}
          y1={line.y}
          y2={line.y}
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeDasharray="4 6"
        />
      ))}

      {areaPath ? <path d={areaPath} fill="url(#crash-chart-fill)" /> : null}
      {linePath ? (
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}

export const CrashLineChart = memo(CrashLineChartComponent);
