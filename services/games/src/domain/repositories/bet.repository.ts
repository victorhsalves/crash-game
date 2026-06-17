import type { Bet } from "../entities/bet.entity";

export interface BetTransactionalScope {
  findByIdForUpdate(id: string): Promise<Bet | null>;
  save(bet: Bet): Promise<void>;
}

export interface BetRepository {
  findById(id: string): Promise<Bet | null>;
  findByRoundId(roundId: string): Promise<Bet[]>;
  findByPlayerId(playerId: string): Promise<Bet[]>;
  findByPlayerIdAndRoundId(playerId: string, roundId: string): Promise<Bet | null>;
  save(bet: Bet): Promise<void>;
  runInTransaction<T>(work: (scope: BetTransactionalScope) => Promise<T>): Promise<T>;
}
