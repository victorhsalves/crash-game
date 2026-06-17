export interface ProcessBetCashedOutInput {
  readonly payload: {
    readonly betId: string;
    readonly playerId: string;
    readonly roundId: string;
    readonly payoutAmount: string;
    readonly cashoutMultiplier: number;
  };
}
