export type ScheduledTimerType = "betting-end" | "crash-at" | "crashed-end";

export interface ScheduledTimer {
  readonly type: ScheduledTimerType;
  readonly roundId: string;
  readonly at: Date;
}

export interface RecoverRoundLifecycleInput {
  readonly bettingDurationMs: number;
  readonly crashedDurationMs: number;
}

export interface RecoverRoundLifecycleResult {
  readonly action: "started" | "resumed" | "caught-up";
  readonly timers: readonly ScheduledTimer[];
}
