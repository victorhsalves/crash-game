import { useEffect, useRef, useState } from "react";
import type { BetStatus, GameRoundStatus } from "@/types/game.types";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import { formatCurrencyFromReais } from "@/utils/format-currency";

interface BetStakeDisplayProps {
  amountCents: number;
  roundStatus: GameRoundStatus | null;
  betStatus: BetStatus | null;
  payout: number | null;
}

type StakeVariant = "default" | "win" | "loss";

const CRASH_ANIMATION_MS = 1200;

function resolveVariant(roundStatus: GameRoundStatus | null, betStatus: BetStatus | null): StakeVariant {
  if (roundStatus !== "CRASHED") {
    return "default";
  }

  if (betStatus === "CASHED_OUT") {
    return "win";
  }

  return "loss";
}

const borderClasses: Record<StakeVariant, string> = {
  default: "border-gold",
  win: "border-primary",
  loss: "border-danger",
};

export function BetStakeDisplay({
  amountCents,
  roundStatus,
  betStatus,
  payout,
}: BetStakeDisplayProps) {
  const betAmountReais = amountCents / 100;
  const variant = resolveVariant(roundStatus, betStatus);
  const previousRoundStatusRef = useRef<GameRoundStatus | null>(roundStatus);
  const [isAnimatingCrashed, setIsAnimatingCrashed] = useState(false);

  useEffect(() => {
    if (roundStatus === "CRASHED" && previousRoundStatusRef.current !== "CRASHED") {
      setIsAnimatingCrashed(true);
      const timer = window.setTimeout(() => setIsAnimatingCrashed(false), CRASH_ANIMATION_MS);
      previousRoundStatusRef.current = roundStatus;
      return () => window.clearTimeout(timer);
    }

    previousRoundStatusRef.current = roundStatus;

    if (roundStatus === "BETTING" || roundStatus === "WAITING" || roundStatus === null) {
      setIsAnimatingCrashed(false);
    }
  }, [roundStatus]);

  const targetValue =
    variant === "win" ? (payout ?? betAmountReais) : variant === "loss" ? 0 : betAmountReais;

  const isCrashed = roundStatus === "CRASHED";
  const displayValue = useAnimatedValue({
    from: betAmountReais,
    to: isCrashed ? targetValue : betAmountReais,
    durationMs: CRASH_ANIMATION_MS,
    enabled: isAnimatingCrashed,
  });

  const label =
    variant === "win" ? "Ganho" : variant === "loss" ? "Perdido" : "Apostado";

  if (betStatus === null) {
    return null;
  }

  return (
    <div
      className={`animate-slide-up flex flex-col items-center rounded-xl border-2 bg-surface/90 px-6 py-3 shadow-lg backdrop-blur-sm transition-colors duration-500 ${borderClasses[variant]}`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-xl font-semibold">{formatCurrencyFromReais(displayValue)}</span>
    </div>
  );
}
