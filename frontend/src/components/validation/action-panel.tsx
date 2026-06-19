import { Button } from "@/components/ui/button";
import { CashoutIcon } from "@/components/icons/cashout-icon";
import { BetAmountControl } from "@/components/validation/bet-amount-control";
import type { BetStatus, GameRoundStatus } from "@/types/game.types";
import { formatCurrencyFromReais } from "@/utils/format-currency";

interface ActionPanelProps {
  amount: number;
  isPending: boolean;
  isCashingOut: boolean;
  isAuthenticated: boolean;
  roundStatus: GameRoundStatus | null;
  betStatus: BetStatus | null;
  potentialPayoutReais: number | null;
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
  potentialPayoutReais,
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
    !isCashingOut &&
    potentialPayoutReais !== null;

  const formattedPayout =
    potentialPayoutReais !== null ? formatCurrencyFromReais(potentialPayoutReais) : null;

  const cashoutLabel = isCashingOut
    ? "Sacando..."
    : canCashout && formattedPayout
      ? formattedPayout
      : "Cash Out";

  const cashoutAriaLabel =
    isCashingOut
      ? "Sacando aposta"
      : canCashout && formattedPayout
        ? `Sacar ${formattedPayout}`
        : "Cash Out";

  return (
    <div className="safe-area-bottom flex shrink-0 flex-col gap-3 border-t border-border bg-surface px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
      <BetAmountControl
        className="w-full justify-center sm:w-auto"
        amount={amount}
        disabled={!canPlaceBet}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onChange={onAmountChange}
      />
      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          variant="primary"
          className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          disabled={!canPlaceBet}
          onClick={onPlaceBet}
        >
          {isPending ? "Apostando..." : "Apostar"}
        </Button>
        <Button
          className="min-h-11 min-w-0 flex-1 gap-1.5 sm:min-h-0 sm:flex-none"
          disabled={!canCashout}
          onClick={onCashout}
          aria-label={cashoutAriaLabel}
          title={canCashout && formattedPayout ? formattedPayout : undefined}
        >
          <CashoutIcon className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate text-xs tabular-nums sm:text-sm">{cashoutLabel}</span>
        </Button>
      </div>
    </div>
  );
}
