import type { GameRound } from "../entities/game-round.entity";

export interface RoundHistoryItem {
  readonly id: string;
  readonly crashPointBasisPoints: number;
  readonly crashedAt: Date;
  readonly serverSeedHash: string;
}

export interface GameRoundRepository {
  findById(id: string): Promise<GameRound | null>;
  findCurrent(): Promise<GameRound | null>;
  findNextWaiting(): Promise<GameRound | null>;
  findUnsettled(): Promise<GameRound | null>;
  findHistory(limit: number, offset: number): Promise<RoundHistoryItem[]>;
  save(round: GameRound): Promise<void>;
}
