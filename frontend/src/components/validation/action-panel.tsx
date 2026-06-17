import { Button } from "@/components/ui/button";
import { BetAmountControl } from "@/components/validation/bet-amount-control";

interface ActionPanelProps {
  amount: number;
  isPending: boolean;
  isAuthenticated: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onAmountChange: (value: number) => void;
  onPlaceBet: () => void;
}

export function ActionPanel({
  amount,
  isPending,
  isAuthenticated,
  onIncrement,
  onDecrement,
  onAmountChange,
  onPlaceBet,
}: ActionPanelProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3">
      <BetAmountControl
        amount={amount}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onChange={onAmountChange}
      />
      <Button
        variant="primary"
        disabled={!isAuthenticated || isPending}
        onClick={onPlaceBet}
      >
        {isPending ? "Apostando..." : "Apostar"}
      </Button>
      <Button disabled>Cashout (Coming Soon)</Button>
    </div>
  );
}
