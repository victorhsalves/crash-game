import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionPanel } from "@/components/validation/action-panel";
import { CrashGameStage } from "@/components/validation/crash-game-stage";
import { EventLogModal } from "@/components/validation/event-log-modal";
import { ProvablyFairModal } from "@/components/validation/provably-fair-modal";
import { RoundHistoryStrip } from "@/components/validation/round-history-strip";
import { CrashGameTopBar } from "@/components/validation/crash-game-top-bar";
import { useAuth } from "@/hooks/use-auth";
import { useBetAmount } from "@/hooks/use-bet-amount";
import { useBetState } from "@/hooks/use-bet-state";
import { useCashout } from "@/hooks/use-cashout";
import { useCrashMultiplier } from "@/hooks/use-crash-multiplier";
import { useEventLog } from "@/hooks/use-event-log";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useRoundHistory } from "@/hooks/use-round-history";
import { useRoundState } from "@/hooks/use-round-state";
import { useRoundVerification } from "@/hooks/use-round-verification";
import { useValidationWebSocket } from "@/hooks/use-validation-websocket";
import { gameApi } from "@/services/game/game.api";
import { WebSocketEvents } from "@/services/websocket/events";
import { websocketService } from "@/services/websocket/websocket.service";
import type { BetUpdatedWebSocketPayload } from "@/types/game.types";

export function CrashGamePage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [isEventLogOpen, setIsEventLogOpen] = useState(false);
  const [verificationRoundId, setVerificationRoundId] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const { entries, append, clear, scrollRef } = useEventLog();
  const { amount, increment, decrement, setAmount } = useBetAmount();
  const { betState, setPendingBet, handleBetEvent, resetBetState } = useBetState();
  const { roundState, remainingSeconds, handleRoundEvent } = useRoundState();
  const { items: historyItems, isLoading: isHistoryLoading, refresh: refreshHistory } = useRoundHistory();
  const { state: verificationState } = useRoundVerification(verificationRoundId, isVerificationOpen);
  const { displayValue, curvePoints, chartPhase, handleMultiplierEvent, syncFromRound } =
    useCrashMultiplier();
  const {
    cashout,
    isCashingOut,
    isPopupOpen,
    cashoutMultiplier,
    handleCashoutEvent,
    handleRoundEventForPopup,
  } = useCashout({ append });

  const refreshWallet = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
  }, [queryClient]);

  useEffect(() => {
    void gameApi.getCurrentRound().then(syncFromRound).catch(() => {});
  }, [syncFromRound]);

  const handlePlaceBetSuccess = useCallback(
    (response: { betId: string }) => {
      setPendingBet(response.betId, amount * 100);
    },
    [amount, setPendingBet],
  );

  const { placeBet, isPending } = usePlaceBet({
    append,
    onSuccess: handlePlaceBetSuccess,
  });

  const handleWebSocketEvent = useCallback(
    (event: string, payload: unknown) => {
      handleRoundEvent(event, payload);
      handleMultiplierEvent(event, payload);
      handleBetEvent(event, payload);
      handleCashoutEvent(event, payload);
      handleRoundEventForPopup(event);

      if (event === WebSocketEvents.BetAccepted) {
        refreshWallet();
      }

      if (event === WebSocketEvents.RoundCrashed) {
        refreshWallet();
        refreshHistory();
      }

      if (event === WebSocketEvents.BetUpdated && typeof payload === "object" && payload !== null) {
        const updated = payload as BetUpdatedWebSocketPayload;

        if (updated.walletCredited === true) {
          refreshWallet();
        }
      }

      if (event === WebSocketEvents.RoundFinished) {
        void gameApi.getCurrentRound().then(syncFromRound).catch(() => {});
        resetBetState();
      }

      if (event === WebSocketEvents.RoundBettingOpened) {
        resetBetState();
      }
    },
    [
      handleBetEvent,
      handleCashoutEvent,
      handleMultiplierEvent,
      handleRoundEvent,
      handleRoundEventForPopup,
      refreshWallet,
      refreshHistory,
      resetBetState,
      syncFromRound,
    ],
  );

  useValidationWebSocket({ append, onEvent: handleWebSocketEvent });

  const handlePlaceBet = useCallback(() => {
    placeBet({
      amountCents: amount * 100,
      socketId: websocketService.getSocketId(),
    });
  }, [amount, placeBet]);

  const handleToggleEventLog = useCallback(() => {
    setIsEventLogOpen((open) => !open);
  }, []);

  const handleCloseEventLog = useCallback(() => {
    setIsEventLogOpen(false);
  }, []);

  const handleOpenVerification = useCallback((roundId: string) => {
    setVerificationRoundId(roundId);
    setIsVerificationOpen(true);
  }, []);

  const handleCloseVerification = useCallback(() => {
    setIsVerificationOpen(false);
    setVerificationRoundId(null);
  }, []);

  return (
    <div className="-mx-6 -my-8 flex h-[calc(100vh-113px)] flex-col">
      <CrashGameTopBar
        roundState={roundState}
        remainingSeconds={remainingSeconds}
        isEventLogOpen={isEventLogOpen}
        onToggleEventLog={handleToggleEventLog}
      />
      <RoundHistoryStrip
        items={historyItems}
        isLoading={isHistoryLoading}
        onSelectRound={handleOpenVerification}
      />
      <CrashGameStage
        multiplier={displayValue}
        roundStatus={roundState.status}
        serverSeedHash={roundState.serverSeedHash}
        curvePoints={curvePoints}
        chartPhase={chartPhase}
        isCashoutPopupOpen={isPopupOpen}
        isCashingOut={isCashingOut}
        cashoutMultiplier={cashoutMultiplier}
        betAmountCents={betState.amountCents}
        betStatus={betState.status}
        betPayout={betState.payout}
      />
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
      <EventLogModal
        open={isEventLogOpen}
        onClose={handleCloseEventLog}
        entries={entries}
        scrollRef={scrollRef}
        onClear={clear}
      />
      <ProvablyFairModal
        open={isVerificationOpen}
        onClose={handleCloseVerification}
        verification={verificationState}
      />
    </div>
  );
}
