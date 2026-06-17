export interface FinishRoundInput {
  readonly roundId: string;
}

export interface FinishRoundResult {
  readonly finishedRoundId: string;
  readonly nextRoundId?: string;
  readonly nextStatus?: "BETTING";
  readonly bettingEndsAt?: Date;
}
