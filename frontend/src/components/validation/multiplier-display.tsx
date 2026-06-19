import type { GameRoundStatus } from "@/types/game.types";
import { formatMultiplier } from "@/utils/format-multiplier";

interface MultiplierDisplayProps {
  value: number;
  status: GameRoundStatus | null;
  justCrashed?: boolean;
}

const statusColorClasses: Partial<Record<GameRoundStatus, string>> = {
  BETTING: "text-muted",
  RUNNING: "text-primary",
  CRASHED: "text-danger",
};

export function MultiplierDisplay({ value, status, justCrashed = false }: MultiplierDisplayProps) {
  const colorClass = status ? (statusColorClasses[status] ?? "text-foreground") : "text-foreground";
  const crashAnimClass = justCrashed ? "animate-crash-pulse" : "";

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={`font-mono text-[clamp(2rem,10vw,3.75rem)] font-bold tracking-tight transition-colors duration-300 ${colorClass} ${crashAnimClass}`}
    >
      {formatMultiplier(value)}
    </span>
  );
}
