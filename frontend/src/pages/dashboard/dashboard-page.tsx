import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { useWallet } from "@/hooks/use-wallet";

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="break-all text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function DashboardPage() {
  const userQuery = useCurrentUser();
  const walletQuery = useWallet();
  const logout = useLogout();

  const isLoading = userQuery.isLoading || walletQuery.isLoading;
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
    </div>
  );
}
