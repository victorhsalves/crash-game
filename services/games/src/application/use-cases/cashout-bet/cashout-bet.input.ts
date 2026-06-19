export interface CashoutBetInput {
  readonly playerId: string;
}

export interface CashoutBetResult {
  readonly betId: string;
  readonly userId: string;
  readonly roundId: string;
  readonly multiplier: number;
  readonly payout: number;
  readonly cashedOutAt: Date;
  readonly socketId: string | null;
  readonly alreadyCashedOut?: boolean;
}
