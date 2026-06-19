export const WebSocketBetEvents = {
  Accepted: "bet.accepted",
  Rejected: "bet.rejected",
  Updated: "bet.updated",
} as const;

export interface BetAcceptedWebSocketPayload {
  betId: string;
  status: "ACCEPTED";
}

export interface BetRejectedWebSocketPayload {
  betId: string;
  status: "REJECTED";
  reason: string;
}

export interface BetUpdatedWebSocketPayload {
  betId: string;
  userId: string;
  roundId: string;
  status: "CASHED_OUT" | "LOST";
  multiplier: number | null;
  payout: number | null;
  cashedOutAt: string | null;
  walletCredited?: boolean;
}
