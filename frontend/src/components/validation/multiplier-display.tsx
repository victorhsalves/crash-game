import type { GameRoundStatus } from "@/types/game.types";
import { formatMultiplier } from "@/utils/format-multiplier";

interface MultiplierDisplayProps {
  value: number;
  status: GameRoundStatus | null;
}

const statusColorClasses: Partial<Record<GameRoundStatus, string>> = {
  BETTING: "text-muted",
  RUNNING: "text-primary",
  CRASHED: "text-danger",
};

export function MultiplierDisplay({ value, status }: MultiplierDisplayProps) {
  const colorClass = status ? (statusColorClasses[status] ?? "text-foreground") : "text-foreground";

  return (
    <span className={`font-mono text-6xl font-bold tracking-tight ${colorClass}`}>
      {formatMultiplier(value)}
    </span>
  );
}
