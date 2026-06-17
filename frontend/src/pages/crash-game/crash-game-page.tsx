import { useCallback } from "react";
import { ActionPanel } from "@/components/validation/action-panel";
import { EventPanel } from "@/components/validation/event-panel";
import { RoundStatusPanel } from "@/components/validation/round-status-panel";
import { useAuth } from "@/hooks/use-auth";
import { useBetAmount } from "@/hooks/use-bet-amount";
import { useEventLog } from "@/hooks/use-event-log";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useRoundState } from "@/hooks/use-round-state";
import { useValidationWebSocket } from "@/hooks/use-validation-websocket";
import { websocketService } from "@/services/websocket/websocket.service";

export function CrashGamePage() {
  const { isAuthenticated } = useAuth();
  const { entries, append, clear, scrollRef } = useEventLog();
  const { amount, increment, decrement, setAmount } = useBetAmount();
  const { placeBet, isPending } = usePlaceBet({ append });
  const { roundState, remainingSeconds, handleRoundEvent } = useRoundState();

  useValidationWebSocket({ append, onEvent: handleRoundEvent });

  const handlePlaceBet = useCallback(() => {
    placeBet({
      amountCents: amount * 100,
      socketId: websocketService.getSocketId(),
    });
  }, [amount, placeBet]);

  return (
    <div className="-mx-6 -my-8 flex h-[calc(100vh-65px)] flex-col">
      <RoundStatusPanel roundState={roundState} remainingSeconds={remainingSeconds} />
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
