import type { RoundHistoryItem } from "@/types/game.types";

interface RoundHistoryStripProps {
  items: RoundHistoryItem[];
  isLoading: boolean;
  onSelectRound: (roundId: string) => void;
}

function historyColor(crashPoint: string): string {
  const value = Number(crashPoint);

  if (!Number.isFinite(value)) {
    return "bg-secondary text-foreground";
  }

  if (value < 2) {
    return "bg-red-500/20 text-red-300";
  }

  if (value <= 10) {
    return "bg-amber-500/20 text-amber-200";
  }

  return "bg-emerald-500/20 text-emerald-300";
}

export function RoundHistoryStrip({ items, isLoading, onSelectRound }: RoundHistoryStripProps) {
  return (
    <div className="shrink-0 border-b border-border px-4 py-2">
      <div className="mb-2 text-xs text-muted">Historico de rodadas</div>
      <div className="scrollbar-subtle flex gap-2 overflow-x-auto pb-1">
        {isLoading ? <span className="text-xs text-muted">Carregando...</span> : null}
        {!isLoading && items.length === 0 ? (
          <span className="text-xs text-muted">Nenhuma rodada finalizada ainda.</span>
        ) : null}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`shrink-0 rounded px-2 py-1 font-mono text-xs ${historyColor(item.crashPoint)}`}
            onClick={() => onSelectRound(item.id)}
            title={`Verificar rodada ${item.id}`}
          >
            {item.crashPoint}x
          </button>
        ))}
      </div>
    </div>
  );
}
