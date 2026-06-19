export const WebSocketRoundBetEvents = {
  Added: "round.bet-added",
  Updated: "round.bet-updated",
} as const;

export type RoundBetPublicStatus = "ACCEPTED" | "CASHED_OUT" | "LOST";

export interface RoundBetPublicPayload {
  id: string;
  username: string;
  amountCents: number;
  status: RoundBetPublicStatus;
  multiplier: string | null;
  payoutCents: number | null;
  cashedOutAt: string | null;
}

export interface RoundBetAddedWebSocketPayload {
  roundId: string;
  bet: RoundBetPublicPayload;
}

export interface RoundBetUpdatedWebSocketPayload {
  roundId: string;
  betId: string;
  status: RoundBetPublicStatus;
  multiplier: string | null;
  payoutCents: number | null;
  cashedOutAt: string | null;
}
