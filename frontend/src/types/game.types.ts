export type GameRoundStatus = "WAITING" | "BETTING" | "RUNNING" | "CRASHED" | "FINISHED";

export const ROUND_CRASHED_DURATION_MS = 10_000;

export interface CurrentGameRound {
  id: string;
  status: GameRoundStatus;
  currentMultiplier: string | null;
  crashPoint: string | null;
  bettingEndsAt: string | null;
  startedAt: string | null;
  crashedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface PlaceBetResponse {
  betId: string;
  status: "PENDING";
}

export interface RoundBettingOpenedWebSocketPayload {
  roundId: string;
  status: "BETTING";
  bettingEndsAt: string;
}

export interface RoundRunningWebSocketPayload {
  roundId: string;
  startedAt: string;
  serverTime: string;
  growthFactor: number;
}

export interface RoundCrashedWebSocketPayload {
  roundId: string;
  crashPoint: number;
  crashedAt: string;
}

export interface RoundFinishedWebSocketPayload {
  roundId: string;
  finishedAt: string;
}

export interface RoundState {
  roundId: string | null;
  status: GameRoundStatus | null;
  phaseEndsAt: Date | null;
}

export type BetStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CASHED_OUT" | "LOST";

export interface BetState {
  betId: string | null;
  status: BetStatus | null;
  amountCents: number | null;
  multiplier: number | null;
  payout: number | null;
  cashedOutAt: string | null;
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
  code: string;
  message: string;
}
