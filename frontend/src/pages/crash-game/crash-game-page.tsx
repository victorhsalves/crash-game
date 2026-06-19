import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionPanel } from "@/components/validation/action-panel";
import { BetHistoryModal } from "@/components/validation/bet-history-modal";
import { CrashGameStage } from "@/components/validation/crash-game-stage";
import { EventLogModal } from "@/components/validation/event-log-modal";
import { ProvablyFairModal } from "@/components/validation/provably-fair-modal";
import { RoundHistoryStrip } from "@/components/validation/round-history-strip";
import { CrashGameTopBar } from "@/components/validation/crash-game-top-bar";
import { useAuth } from "@/hooks/use-auth";
import { useBetAmount } from "@/hooks/use-bet-amount";
import { useBetHistory } from "@/hooks/use-bet-history";
import { useBetState } from "@/hooks/use-bet-state";
import { useCashout } from "@/hooks/use-cashout";
import { useCrashMultiplier } from "@/hooks/use-crash-multiplier";
import { useEventLog } from "@/hooks/use-event-log";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useRoundBets } from "@/hooks/use-round-bets";
import { useRoundHistory } from "@/hooks/use-round-history";
import { useRoundState } from "@/hooks/use-round-state";
import { useRoundVerification } from "@/hooks/use-round-verification";
import { useValidationWebSocket } from "@/hooks/use-validation-websocket";
import { gameApi } from "@/services/game/game.api";
import { WebSocketEvents } from "@/services/websocket/events";
import { websocketService } from "@/services/websocket/websocket.service";
import type { BetUpdatedWebSocketPayload } from "@/types/game.types";
import { calculatePotentialPayoutReais } from "@/utils/calculate-potential-payout";

export function CrashGamePage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const [isEventLogOpen, setIsEventLogOpen] = useState(false);
  const [isBetHistoryOpen, setIsBetHistoryOpen] = useState(false);
  const [verificationRoundId, setVerificationRoundId] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const { entries, append, clear, scrollRef } = useEventLog();
  const { amount, increment, decrement, setAmount } = useBetAmount();
  const { betState, setPendingBet, handleBetEvent, resetBetState } = useBetState();
  const { roundState, remainingSeconds, justCrashed, handleRoundEvent } = useRoundState();
  const {
    bets: roundBets,
    isLoading: isRoundBetsLoading,
    addOptimisticBet,
    removeOptimisticBet,
    handleRoundBetEvent,
    hydrate: hydrateRoundBets,
  } = useRoundBets(roundState.roundId);
  const { items: historyItems, isLoading: isHistoryLoading, refresh: refreshHistory } = useRoundHistory();
  const betHistory = useBetHistory({ isOpen: isBetHistoryOpen });
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

  const potentialPayoutReais = useMemo(() => {
    if (
      roundState.status !== "RUNNING" ||
      betState.status !== "ACCEPTED" ||
      betState.amountCents === null
    ) {
      return null;
    }

    return calculatePotentialPayoutReais(betState.amountCents, displayValue);
  }, [roundState.status, betState.status, betState.amountCents, displayValue]);

  const refreshWallet = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
  }, [queryClient]);

  const refreshBetHistory = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["games", "bets", "me"] });
  }, [queryClient]);

  useEffect(() => {
    void gameApi.getCurrentRound().then(syncFromRound).catch(() => {});
  }, [syncFromRound]);

  const handlePlaceBetSuccess = useCallback(
    (response: { betId: string }) => {
      setPendingBet(response.betId, amount * 100);

      if (currentUser?.username !== undefined) {
        addOptimisticBet(response.betId, currentUser.username, amount * 100);
      }
    },
    [amount, setPendingBet, currentUser?.username, addOptimisticBet],
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
      handleRoundBetEvent(event, payload);

      if (event === WebSocketEvents.BetRejected && typeof payload === "object" && payload !== null && "betId" in payload) {
        removeOptimisticBet((payload as { betId: string }).betId);
      }

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

        refreshBetHistory();
      }

      if (event === WebSocketEvents.RoundFinished) {
        void gameApi.getCurrentRound().then(syncFromRound).catch(() => {});
        void hydrateRoundBets();
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
      handleRoundBetEvent,
      handleRoundEvent,
      handleRoundEventForPopup,
      hydrateRoundBets,
      refreshWallet,
      refreshHistory,
      refreshBetHistory,
      removeOptimisticBet,
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

  const handleToggleBetHistory = useCallback(() => {
    setIsBetHistoryOpen((open) => {
      const next = !open;
      if (next) {
        setIsEventLogOpen(false);
      }
      return next;
    });
  }, []);

  const handleToggleEventLog = useCallback(() => {
    setIsEventLogOpen((open) => {
      const next = !open;
      if (next) {
        setIsBetHistoryOpen(false);
      }
      return next;
    });
  }, []);

  const handleCloseBetHistory = useCallback(() => {
    setIsBetHistoryOpen(false);
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
    <div className="-mx-4 -my-6 flex min-h-0 flex-1 flex-col sm:-mx-6 sm:-my-8">
      <CrashGameTopBar
        roundState={roundState}
        remainingSeconds={remainingSeconds}
        isBetHistoryOpen={isBetHistoryOpen}
        onToggleBetHistory={handleToggleBetHistory}
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
        justCrashed={justCrashed}
        serverSeedHash={roundState.serverSeedHash}
        curvePoints={curvePoints}
        chartPhase={chartPhase}
        isCashoutPopupOpen={isPopupOpen}
        isCashingOut={isCashingOut}
        cashoutMultiplier={cashoutMultiplier}
        betAmountCents={betState.amountCents}
        betStatus={betState.status}
        betPayout={betState.payout}
        roundBets={roundBets}
        roundBetsLoading={isRoundBetsLoading}
        currentUsername={currentUser?.username}
      />
      <ActionPanel
        amount={amount}
        isPending={isPending}
        isCashingOut={isCashingOut}
        isAuthenticated={isAuthenticated}
        roundStatus={roundState.status}
        betStatus={betState.status}
        potentialPayoutReais={potentialPayoutReais}
        onIncrement={increment}
        onDecrement={decrement}
        onAmountChange={setAmount}
        onPlaceBet={handlePlaceBet}
        onCashout={cashout}
      />
      <BetHistoryModal
        open={isBetHistoryOpen}
        onClose={handleCloseBetHistory}
        items={betHistory.items}
        isLoading={betHistory.isLoading}
        isError={betHistory.isError}
        error={betHistory.error instanceof Error ? betHistory.error : null}
        hasMore={betHistory.hasMore}
        isLoadingMore={betHistory.isLoadingMore}
        onLoadMore={betHistory.loadMore}
        onRetry={() => void betHistory.refetch()}
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
