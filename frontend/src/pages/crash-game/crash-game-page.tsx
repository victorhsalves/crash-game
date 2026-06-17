import { useCallback } from "react";
import { ActionPanel } from "@/components/validation/action-panel";
import { EventPanel } from "@/components/validation/event-panel";
import { useAuth } from "@/hooks/use-auth";
import { useBetAmount } from "@/hooks/use-bet-amount";
import { useEventLog } from "@/hooks/use-event-log";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useValidationWebSocket } from "@/hooks/use-validation-websocket";

export function CrashGamePage() {
  const { isAuthenticated } = useAuth();
  const { entries, append, clear, scrollRef } = useEventLog();
  const { amount, increment, decrement, setAmount } = useBetAmount();
  const { placeBet, isPending } = usePlaceBet({ append });

  useValidationWebSocket({ append });

  const handlePlaceBet = useCallback(() => {
    placeBet(amount * 100);
  }, [amount, placeBet]);

  return (
    <div className="-mx-6 -my-8 flex h-[calc(100vh-65px)] flex-col">
      <EventPanel entries={entries} scrollRef={scrollRef} onClear={clear} />
      <ActionPanel
        amount={amount}
        isPending={isPending}
        isAuthenticated={isAuthenticated}
        onIncrement={increment}
        onDecrement={decrement}
        onAmountChange={setAmount}
        onPlaceBet={handlePlaceBet}
      />
    </div>
  );
}
