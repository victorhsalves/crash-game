import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { BetHistoryItem, BetStatus } from "@/types/game.types";
import { formatCurrencyFromReais } from "@/utils/format-currency";

interface BetHistoryModalProps {
  open: boolean;
  onClose: () => void;
  items: BetHistoryItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

const statusLabel: Record<BetStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceita",
  REJECTED: "Rejeitada",
  CASHED_OUT: "Sacada",
  LOST: "Perdida",
};

const statusBadgeClass: Record<BetStatus, string> = {
  PENDING: "bg-muted/20 text-muted",
  ACCEPTED: "bg-primary/20 text-primary",
  REJECTED: "bg-danger/20 text-danger",
  CASHED_OUT: "bg-emerald-500/20 text-emerald-300",
  LOST: "bg-danger/20 text-danger",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatResult(item: BetHistoryItem): string {
  if (item.status === "CASHED_OUT" && item.cashoutMultiplier !== null) {
    const payout =
      item.payoutAmount !== null
        ? formatCurrencyFromReais(Number(item.payoutAmount))
        : "—";
    return `${item.cashoutMultiplier}x · ${payout}`;
  }

  return "—";
}

function truncateRoundId(roundId: string): string {
  return roundId.slice(0, 8);
}

export function BetHistoryModal({
  open,
  onClose,
  items,
  isLoading,
  isError,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onRetry,
}: BetHistoryModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Historico de apostas">
      <div className="flex min-h-0 flex-col" style={{ maxHeight: "calc(80vh - 57px)" }}>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : null}

          {!isLoading && isError ? (
            <div className="flex flex-col items-start gap-3 py-4">
              <p className="text-sm text-danger">
                {error instanceof Error ? error.message : "Erro ao carregar historico"}
              </p>
              <Button variant="secondary" onClick={onRetry}>
                Tentar novamente
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError && items.length === 0 ? (
            <p className="py-4 text-sm text-muted">Nenhuma aposta ainda.</p>
          ) : null}

          {!isLoading && !isError && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="pb-2 pr-3 font-medium">Data</th>
                    <th className="pb-2 pr-3 font-medium">Valor</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 pr-3 font-medium">Resultado</th>
                    <th className="pb-2 font-medium">Rodada</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-b-0">
                      <td className="py-2.5 pr-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {formatCurrencyFromReais(Number(item.amount))}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusBadgeClass[item.status]}`}
                        >
                          {statusLabel[item.status]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap font-mono text-xs">
                        {formatResult(item)}
                      </td>
                      <td className="py-2.5 font-mono text-xs text-muted">
                        {truncateRoundId(item.roundId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {!isLoading && !isError && hasMore ? (
          <div className="shrink-0 border-t border-border px-4 py-3">
            <Button variant="secondary" onClick={onLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Carregando..." : "Carregar mais"}
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
