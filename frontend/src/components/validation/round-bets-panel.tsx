import { useState } from "react";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { ListIcon } from "@/components/icons/list-icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameRoundStatus, RoundBetListItem } from "@/types/game.types";
import { formatCurrencyFromReais } from "@/utils/format-currency";

interface RoundBetsPanelProps {
  bets: RoundBetListItem[];
  currentUsername?: string;
  roundStatus: GameRoundStatus | null;
  serverSeedHash: string | null;
  isLoading: boolean;
}

function resolveStatusLabel(bet: RoundBetListItem, roundStatus: GameRoundStatus | null): string {
  if (bet.isPending === true) {
    return "Confirmando...";
  }

  if (bet.status === "CASHED_OUT" && bet.multiplier !== null) {
    return `@${bet.multiplier}x`;
  }

  if (bet.status === "LOST") {
    return "Perdeu";
  }

  if (roundStatus === "RUNNING" && bet.status === "ACCEPTED") {
    return "Em jogo";
  }

  return "Apostou";
}

function resolveRowClass(bet: RoundBetListItem): string {
  if (bet.isPending === true) {
    return "opacity-60";
  }

  if (bet.status === "CASHED_OUT") {
    return "border-emerald-500/30 bg-emerald-500/10";
  }

  if (bet.status === "LOST") {
    return "border-red-500/20 bg-red-500/5";
  }

  return "border-border/60 bg-background/40";
}

function isSeedVisible(roundStatus: GameRoundStatus | null, serverSeedHash: string | null): boolean {
  return (
    (roundStatus === "BETTING" || roundStatus === "RUNNING") && serverSeedHash !== null
  );
}

export function RoundBetsPanel({
  bets,
  currentUsername,
  roundStatus,
  serverSeedHash,
  isLoading,
}: RoundBetsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const seedVisible = isSeedVisible(roundStatus, serverSeedHash);
  const confirmedCount = bets.filter((bet) => bet.isPending !== true).length;

  return (
    <div
      className={`pointer-events-auto absolute left-2 z-10 sm:left-3 ${
        seedVisible ? "top-10 sm:top-11" : "top-2 sm:top-3"
      }`}
    >
      {isExpanded ? (
        <div className="animate-slide-up flex w-[min(18rem,calc(100vw-1rem))] flex-col rounded-xl border-2 border-gold/70 bg-surface/90 shadow-lg backdrop-blur-sm sm:w-72">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <ListIcon className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate text-xs font-medium text-foreground sm:text-sm">
                Apostas da rodada
              </span>
              {!isLoading && confirmedCount > 0 ? (
                <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 font-mono text-[10px] text-gold">
                  {confirmedCount}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-background/60 hover:text-foreground"
              onClick={() => setIsExpanded(false)}
              aria-label="Ocultar apostas da rodada"
              aria-expanded={true}
            >
              <ChevronLeftIcon />
            </button>
          </div>

          <div className="scrollbar-subtle max-h-40 space-y-1 overflow-y-auto p-2 sm:max-h-48">
            {isLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-8" />
                ))}
              </div>
            ) : null}

            {!isLoading && bets.length === 0 ? (
              <span className="block px-1 py-2 text-xs text-muted">
                Nenhuma aposta confirmada nesta rodada.
              </span>
            ) : null}

            {!isLoading
              ? bets.map((bet) => {
                  const isCurrentUser =
                    currentUsername !== undefined && bet.username === currentUsername;
                  const statusLabel = resolveStatusLabel(bet, roundStatus);
                  const amountLabel = formatCurrencyFromReais(bet.amountCents / 100);
                  const payoutLabel =
                    bet.status === "CASHED_OUT" && bet.payoutCents !== null
                      ? formatCurrencyFromReais(bet.payoutCents / 100)
                      : null;

                  return (
                    <div
                      key={bet.id}
                      className={`flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-xs ${resolveRowClass(bet)}`}
                    >
                      <div className="min-w-0 flex-1 truncate">
                        <span
                          className={
                            isCurrentUser ? "font-semibold text-primary" : "text-foreground"
                          }
                        >
                          {isCurrentUser ? "Você" : bet.username}
                        </span>
                      </div>
                      <div className="shrink-0 font-mono text-muted">{amountLabel}</div>
                      <div
                        className={`min-w-[4rem] shrink-0 text-right font-mono ${
                          bet.status === "CASHED_OUT"
                            ? "font-semibold text-emerald-400"
                            : "text-muted"
                        }`}
                      >
                        {payoutLabel !== null ? (
                          <span title={statusLabel}>{payoutLabel}</span>
                        ) : (
                          statusLabel
                        )}
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border-2 border-gold/70 bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-surface"
          onClick={() => setIsExpanded(true)}
          aria-label="Mostrar apostas da rodada"
          aria-expanded={false}
        >
          <ListIcon className="h-4 w-4 text-gold" />
          {!isLoading && confirmedCount > 0 ? (
            <span className="font-mono text-xs font-semibold text-foreground">{confirmedCount}</span>
          ) : null}
        </button>
      )}
    </div>
  );
}
