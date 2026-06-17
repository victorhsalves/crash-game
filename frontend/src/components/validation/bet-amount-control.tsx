import { Button } from "@/components/ui/button";

interface BetAmountControlProps {
  amount: number;
  disabled?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (value: number) => void;
}

export function BetAmountControl({
  amount,
  disabled = false,
  onIncrement,
  onDecrement,
  onChange,
}: BetAmountControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" disabled={disabled} onClick={onDecrement} aria-label="Diminuir valor">
        -
      </Button>
      <input
        type="number"
        min={1}
        max={1000}
        value={amount}
        disabled={disabled}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(parsed)) {
            onChange(parsed);
          }
        }}
        className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button variant="secondary" disabled={disabled} onClick={onIncrement} aria-label="Aumentar valor">
        +
      </Button>
    </div>
  );
}
