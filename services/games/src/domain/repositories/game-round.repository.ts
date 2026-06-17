import type { GameRound } from "../entities/game-round.entity";

export interface GameRoundRepository {
  findById(id: string): Promise<GameRound | null>;
  findCurrent(): Promise<GameRound | null>;
  findNextWaiting(): Promise<GameRound | null>;
  findUnsettled(): Promise<GameRound | null>;
  save(round: GameRound): Promise<void>;
}
