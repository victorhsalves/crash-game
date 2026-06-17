import { Button } from "@/components/ui/button";
import { BetAmountControl } from "@/components/validation/bet-amount-control";
import type { BetStatus, GameRoundStatus } from "@/types/game.types";

interface ActionPanelProps {
  amount: number;
  isPending: boolean;
  isCashingOut: boolean;
  isAuthenticated: boolean;
  roundStatus: GameRoundStatus | null;
  betStatus: BetStatus | null;
  onIncrement: () => void;
  onDecrement: () => void;
  onAmountChange: (value: number) => void;
  onPlaceBet: () => void;
  onCashout: () => void;
}

export function ActionPanel({
  amount,
  isPending,
  isCashingOut,
  isAuthenticated,
  roundStatus,
  betStatus,
  onIncrement,
  onDecrement,
  onAmountChange,
  onPlaceBet,
  onCashout,
}: ActionPanelProps) {
  const canPlaceBet =
    isAuthenticated && roundStatus === "BETTING" && !isPending && betStatus === null;

  const canCashout =
    isAuthenticated &&
    roundStatus === "RUNNING" &&
    betStatus === "ACCEPTED" &&
    !isCashingOut;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3">
      <BetAmountControl
        amount={amount}
        disabled={!canPlaceBet}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onChange={onAmountChange}
      />
      <Button variant="primary" disabled={!canPlaceBet} onClick={onPlaceBet}>
        {isPending ? "Apostando..." : "Apostar"}
      </Button>
      <Button disabled={!canCashout} onClick={onCashout}>
        {isCashingOut ? "Sacando..." : "Cashout"}
      </Button>
    </div>
  );
}
