export interface OpenRoundBettingInput {
  readonly roundId: string;
  readonly durationMs?: number;
}

export interface OpenRoundBettingResult {
  readonly roundId: string;
  readonly status: "BETTING";
  readonly bettingEndsAt: Date;
}
