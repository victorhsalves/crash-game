export const WebSocketBetEvents = {
  Accepted: "bet.accepted",
  Rejected: "bet.rejected",
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
