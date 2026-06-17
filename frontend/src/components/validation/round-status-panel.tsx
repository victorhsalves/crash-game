import { Button } from "@/components/ui/button";
import type { GameRoundStatus, RoundState } from "@/types/game.types";

interface RoundStatusPanelProps {
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

export function RoundStatusPanel({
  roundState,
  remainingSeconds,
  isEventLogOpen,
  onToggleEventLog,
}: RoundStatusPanelProps) {
  const { status } = roundState;
  const showCountdown = status === "BETTING" || status === "RUNNING" || status === "CRASHED";

  return (
    <div className="shrink-0 border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-muted">Status: </span>
            <span className="font-medium">{status ? statusLabel[status] : "—"}</span>
            {status ? (
              <span className="ml-2 rounded bg-secondary px-2 py-0.5 font-mono text-xs">{status}</span>
            ) : null}
          </div>
          {showCountdown ? (
            <div>
              <span className="text-muted">Tempo restante: </span>
              <span className="font-mono font-medium">{formatCountdown(remainingSeconds)}</span>
            </div>
          ) : null}
        </div>
        <Button variant="secondary" onClick={onToggleEventLog}>
          {isEventLogOpen ? "Fechar eventos" : "Eventos"}
        </Button>
      </div>
    </div>
  );
}
