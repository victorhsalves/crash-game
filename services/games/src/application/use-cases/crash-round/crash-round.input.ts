export interface CrashRoundInput {
  readonly roundId: string;
}

export interface CrashRoundResult {
  readonly roundId: string;
  readonly crashedAt: Date;
  readonly crashedEndsAt: Date;
}
