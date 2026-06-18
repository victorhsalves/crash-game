import type { VerifyRoundResult } from "@crash/provably-fair/browser";

export type GameRoundStatus = "WAITING" | "BETTING" | "RUNNING" | "CRASHED" | "FINISHED";

export const ROUND_CRASHED_DURATION_MS = 10_000;

export interface CurrentGameRound {
  id: string;
  status: GameRoundStatus;
  currentMultiplier: string | null;
  crashPoint: string | null;
  serverSeedHash: string | null;
  clientSeed: string | null;
  nonce: number | null;
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
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
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
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export interface RoundFinishedWebSocketPayload {
  roundId: string;
  finishedAt: string;
}

export interface RoundState {
  roundId: string | null;
  status: GameRoundStatus | null;
  phaseEndsAt: Date | null;
  serverSeedHash: string | null;
  clientSeed: string | null;
  nonce: number | null;
}

export interface RoundHistoryItem {
  id: string;
  crashPoint: string;
  crashedAt: string;
  serverSeedHash: string;
}

export interface RoundVerification {
  roundId: string;
  status: string;
  serverSeed: string | null;
  serverSeedHash: string | null;
  clientSeed: string | null;
  nonce: number | null;
  crashPoint: string | null;
  calculatedCrashPoint: string | null;
  isValid: boolean;
  hashValid: boolean;
  crashPointValid: boolean;
}


export type VerificationStatus = "idle" | "loading" | "success" | "error";

export interface VerificationState {
  status: VerificationStatus;
  result: VerifyRoundResult | null;
  apiData: RoundVerification | null;
  errorMessage: string | null;
}

export type BetStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CASHED_OUT" | "LOST";

export type CrashChartPhase = "idle" | "running" | "crashed";

export interface CrashCurvePoint {
  elapsedSeconds: number;
  multiplier: number;
}

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
