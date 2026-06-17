import { useCallback } from "react";
import { ActionPanel } from "@/components/validation/action-panel";
import { EventPanel } from "@/components/validation/event-panel";
import { RoundStatusPanel } from "@/components/validation/round-status-panel";
import { useAuth } from "@/hooks/use-auth";
import { useBetAmount } from "@/hooks/use-bet-amount";
import { useBetState } from "@/hooks/use-bet-state";
import { useCashout } from "@/hooks/use-cashout";
import { useEventLog } from "@/hooks/use-event-log";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useRoundState } from "@/hooks/use-round-state";
import { useValidationWebSocket } from "@/hooks/use-validation-websocket";
import { websocketService } from "@/services/websocket/websocket.service";

export function CrashGamePage() {
  const { isAuthenticated } = useAuth();
  const { entries, append, clear, scrollRef } = useEventLog();
  const { amount, increment, decrement, setAmount } = useBetAmount();
  const { betState, setPendingBet, handleBetEvent, resetBetState } = useBetState();
  const { roundState, remainingSeconds, handleRoundEvent } = useRoundState();
  const { cashout, isCashingOut, handleCashoutEvent } = useCashout({ append });

  const handlePlaceBetSuccess = useCallback(
    (response: { betId: string }) => {
      setPendingBet(response.betId);
    },
    [setPendingBet],
  );

  const { placeBet, isPending } = usePlaceBet({
    append,
    onSuccess: handlePlaceBetSuccess,
  });

  const handleWebSocketEvent = useCallback(
    (event: string, payload: unknown) => {
      handleRoundEvent(event, payload);
      handleBetEvent(event, payload);
      handleCashoutEvent(event, payload);

      if (event === "round.finished" || event === "round.betting-opened") {
        resetBetState();
      }
    },
    [handleBetEvent, handleCashoutEvent, handleRoundEvent, resetBetState],
  );

  useValidationWebSocket({ append, onEvent: handleWebSocketEvent });

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
        isCashingOut={isCashingOut}
        isAuthenticated={isAuthenticated}
        roundStatus={roundState.status}
        betStatus={betState.status}
        onIncrement={increment}
        onDecrement={decrement}
        onAmountChange={setAmount}
        onPlaceBet={handlePlaceBet}
        onCashout={cashout}
      />
    </div>
  );
}
