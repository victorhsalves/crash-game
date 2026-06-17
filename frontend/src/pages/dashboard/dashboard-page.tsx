import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { isNoActiveRoundError, useCurrentRound } from "@/hooks/use-current-round";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { useWallet } from "@/hooks/use-wallet";
import type { GameRoundStatus } from "@/types/game.types";

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="break-all text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

const statusBadgeClass: Record<GameRoundStatus, string> = {
  WAITING: "bg-muted/20 text-muted",
  BETTING: "bg-primary/20 text-primary",
  RUNNING: "bg-primary/30 text-primary",
  CRASHED: "bg-danger/20 text-danger",
  FINISHED: "bg-muted/20 text-muted",
};

function StatusBadge({ status }: { status: GameRoundStatus }) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusBadgeClass[status]}`}>
      {status}
    </span>
  );
}

export function DashboardPage() {
  const userQuery = useCurrentUser();
  const walletQuery = useWallet();
  const roundQuery = useCurrentRound();
  const logout = useLogout();

  const isLoading = userQuery.isLoading || walletQuery.isLoading || roundQuery.isLoading;
  const error = userQuery.error ?? walletQuery.error;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-danger">
          {error instanceof Error ? error.message : "Erro ao carregar dados"}
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            void userQuery.refetch();
            void walletQuery.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const user = userQuery.data;
  const wallet = walletQuery.data;

  if (!user || !wallet) {
    return null;
  }

  const round = roundQuery.data;
  const noActiveRound = roundQuery.error !== null && isNoActiveRoundError(roundQuery.error);
  const roundError =
    roundQuery.error !== null && !isNoActiveRoundError(roundQuery.error) ? roundQuery.error : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted">Sua conta e carteira</p>
        </div>
        <Button variant="danger" onClick={() => void logout()}>
          Sair
        </Button>
      </div>

      <Card title="Usuario">
        <DataRow label="ID" value={user.id} />
        <DataRow label="Username" value={user.username} />
        <DataRow label="Email" value={user.email ?? "-"} />
      </Card>

      <Card title="Carteira">
        <DataRow label="Wallet ID" value={wallet.id} />
        <DataRow label="Balance" value={wallet.balance} />
        <DataRow label="Created At" value={wallet.createdAt} />
      </Card>

      <Card title="Rodada Atual">
        {roundError ? (
          <div className="flex flex-col items-start gap-3 py-2">
            <p className="text-sm text-danger">
              {roundError instanceof Error ? roundError.message : "Erro ao carregar rodada"}
            </p>
            <Button variant="secondary" onClick={() => void roundQuery.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : noActiveRound || !round ? (
          <p className="py-2 text-sm text-muted">Nenhuma rodada ativa</p>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted">Status</span>
              <StatusBadge status={round.status} />
            </div>
            <DataRow label="Round ID" value={round.id} />
            {round.currentMultiplier !== null && (
              <DataRow label="Multiplier" value={`${round.currentMultiplier}x`} />
            )}
            {round.crashPoint !== null && (
              <DataRow label="Crash Point" value={`${round.crashPoint}x`} />
            )}
            {round.bettingEndsAt !== null && (
              <DataRow label="Betting Ends At" value={round.bettingEndsAt} />
            )}
            {round.startedAt !== null && <DataRow label="Started At" value={round.startedAt} />}
            {round.crashedAt !== null && <DataRow label="Crashed At" value={round.crashedAt} />}
            <DataRow label="Created At" value={round.createdAt} />
          </>
        )}
      </Card>
    </div>
  );
}
