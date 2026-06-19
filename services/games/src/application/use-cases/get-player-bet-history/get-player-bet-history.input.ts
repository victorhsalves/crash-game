import type { BetStatus } from "../../../domain/enums/bet-status.enum";

export interface GetPlayerBetHistoryInput {
  playerId: string;
  limit?: number;
  offset?: number;
}

export interface PlayerBetHistoryEntry {
  id: string;
  playerId: string;
  roundId: string;
  amount: string;
  status: BetStatus;
  createdAt: string;
  cashoutMultiplier: string | null;
  payoutAmount: string | null;
  cashedOutAt: string | null;
}

export interface GetPlayerBetHistoryResult {
  items: PlayerBetHistoryEntry[];
}
