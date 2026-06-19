import type { Bet } from "../../../domain/entities/bet.entity";
import type { GameRound } from "../../../domain/entities/game-round.entity";

export interface GetCurrentRoundResult {
  readonly round: GameRound;
  readonly bets: Bet[];
}
