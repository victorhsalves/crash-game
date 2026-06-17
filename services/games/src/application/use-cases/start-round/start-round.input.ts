export interface StartRoundInput {
  readonly roundId: string;
}

export interface StartRoundResult {
  readonly roundId: string;
  readonly status: "RUNNING";
  readonly startedAt: Date;
  readonly crashAt: Date;
}
