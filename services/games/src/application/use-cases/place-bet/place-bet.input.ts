export interface PlaceBetInput {
  readonly playerId: string;
  readonly amountCents: number;
}

export interface PlaceBetResult {
  readonly betId: string;
  readonly status: "PENDING";
}
