import { BET_PLACED } from "../routing-keys";

export { BET_PLACED };

export interface BetPlacedPayload {
  readonly betId: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly amount: string;
}
