export interface GetRoundHistoryInput {
  limit?: number;
  offset?: number;
}

export interface RoundHistoryEntry {
  id: string;
  crashPoint: string;
  crashedAt: string;
  serverSeedHash: string;
}

export interface GetRoundHistoryResult {
  items: RoundHistoryEntry[];
}
