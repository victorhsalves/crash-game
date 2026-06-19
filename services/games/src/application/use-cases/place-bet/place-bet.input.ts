export interface PlaceBetInput {
  readonly playerId: string;
  readonly playerUsername: string;
  readonly amountCents: number;
  readonly socketId?: string;
}

export interface PlaceBetResult {
  readonly betId: string;
  readonly status: "PENDING";
}
