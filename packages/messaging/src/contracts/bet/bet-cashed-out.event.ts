import { BET_CASHED_OUT } from "../routing-keys";

export { BET_CASHED_OUT };

export interface BetCashedOutPayload {
  readonly betId: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly payoutAmount: string;
  readonly cashoutMultiplier: number;
}
