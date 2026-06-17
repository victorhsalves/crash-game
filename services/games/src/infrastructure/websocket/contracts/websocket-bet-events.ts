export const WebSocketBetEvents = {
  Accepted: "bet.accepted",
  Rejected: "bet.rejected",
  Cashout: "bet.cashout",
  Updated: "bet.updated",
  CashoutFailed: "bet.cashout.failed",
} as const;

export type CashoutErrorCode =
  | "ROUND_NOT_RUNNING"
  | "ROUND_ALREADY_CRASHED"
  | "BET_NOT_FOUND"
  | "BET_NOT_ACCEPTED"
  | "BET_ALREADY_SETTLED"
  | "INTERNAL_ERROR";

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

export interface BetCashoutFailedWebSocketPayload {
  code: CashoutErrorCode;
  message: string;
}
