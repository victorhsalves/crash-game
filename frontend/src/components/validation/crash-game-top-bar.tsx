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

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3">
      {isInitialized && isAuthenticated ? (
        <div className="inline-flex items-center gap-2.5 rounded-lg border border-primary px-4 py-2 text-base font-medium text-white">
          <WalletIcon className="h-7 w-7 text-primary" />
          <span>{balanceLabel}</span>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{status ? statusLabel[status] : "—"}</span>
        {showCountdown ? (
          <span className="font-mono text-xl font-bold">{formatCountdown(remainingSeconds)}</span>
        ) : null}
        <Button variant="secondary" onClick={onToggleEventLog}>
          {isEventLogOpen ? "Fechar eventos" : "Eventos"}
        </Button>
      </div>
    </div>
  );
}
