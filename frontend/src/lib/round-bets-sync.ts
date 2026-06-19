import type { RoundBetListItem, RoundBetPublic } from "@/types/game.types";

const CHANNEL_NAME = "crash-game.round-bets.v1";

export type RoundBetsSyncMessage =
  | { type: "snapshot"; roundId: string; bets: RoundBetPublic[] }
  | { type: "patch"; roundId: string; bet: RoundBetListItem }
  | { type: "reset"; roundId: string };

type RoundBetsSyncListener = (message: RoundBetsSyncMessage) => void;

class RoundBetsSync {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<RoundBetsSyncListener>();

  public subscribe(listener: RoundBetsSyncListener): () => void {
    this.ensureChannel();
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public post(message: RoundBetsSyncMessage): void {
    this.ensureChannel();
    this.channel?.postMessage(message);
  }

  private ensureChannel(): void {
    if (this.channel !== null || typeof BroadcastChannel === "undefined") {
      return;
    }

    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = (event: MessageEvent<RoundBetsSyncMessage>) => {
      for (const listener of this.listeners) {
        listener(event.data);
      }
    };
  }
}

export const roundBetsSync = new RoundBetsSync();

export function sortRoundBets(bets: RoundBetListItem[]): RoundBetListItem[] {
  return [...bets].sort((left, right) => {
    const leftIsCashout = left.status === "CASHED_OUT";
    const rightIsCashout = right.status === "CASHED_OUT";

    if (leftIsCashout && !rightIsCashout) {
      return -1;
    }

    if (!leftIsCashout && rightIsCashout) {
      return 1;
    }

    if (leftIsCashout && rightIsCashout) {
      const leftMultiplier = Number(left.multiplier ?? 0);
      const rightMultiplier = Number(right.multiplier ?? 0);
      return rightMultiplier - leftMultiplier;
    }

    return right.amountCents - left.amountCents;
  });
}

export function upsertRoundBet(
  current: Map<string, RoundBetListItem>,
  bet: RoundBetListItem,
): Map<string, RoundBetListItem> {
  const next = new Map(current);
  next.set(bet.id, { ...next.get(bet.id), ...bet, isPending: bet.isPending ?? false });
  return next;
}

export function mapToSortedList(bets: Map<string, RoundBetListItem>): RoundBetListItem[] {
  return sortRoundBets(Array.from(bets.values()));
}
