import { WalletIcon } from "@/components/icons/wallet-icon";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import type { GameRoundStatus, RoundState } from "@/types/game.types";
import { formatCurrencyFromCents } from "@/utils/format-currency";

interface CrashGameTopBarProps {
  roundState: RoundState;
  remainingSeconds: number | null;
  isEventLogOpen: boolean;
  onToggleEventLog: () => void;
}

const statusLabel: Record<GameRoundStatus, string> = {
  WAITING: "Aguardando",
  BETTING: "Apostas abertas",
  RUNNING: "Em execucao",
  CRASHED: "Crash",
  FINISHED: "Finalizada",
};

function formatCountdown(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "--:--";
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function CrashGameTopBar({
  roundState,
  remainingSeconds,
  isEventLogOpen,
  onToggleEventLog,
}: CrashGameTopBarProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const walletQuery = useWallet();
  const { status } = roundState;
  const showCountdown = status === "BETTING" || status === "RUNNING" || status === "CRASHED";

  const balanceLabel = walletQuery.isLoading
    ? "—"
    : walletQuery.data
      ? formatCurrencyFromCents(walletQuery.data.balance)
      : "—";

  const eventButtonLabel = isEventLogOpen ? "Fechar" : "Eventos";
  const eventButtonLabelDesktop = isEventLogOpen ? "Fechar eventos" : "Eventos";

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
      {isInitialized && isAuthenticated ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-white sm:gap-2.5 sm:px-4 sm:py-2 sm:text-base">
          <WalletIcon className="h-5 w-5 text-primary sm:h-7 sm:w-7" />
          <span>{balanceLabel}</span>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm font-medium">{status ? statusLabel[status] : "—"}</span>
          {showCountdown ? (
            <span className="font-mono text-lg font-bold sm:text-xl">
              {formatCountdown(remainingSeconds)}
            </span>
          ) : null}
        </div>
        <Button variant="secondary" onClick={onToggleEventLog}>
          <span className="sm:hidden">{eventButtonLabel}</span>
          <span className="hidden sm:inline">{eventButtonLabelDesktop}</span>
        </Button>
      </div>
    </div>
  );
}
