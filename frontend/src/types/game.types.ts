export type GameRoundStatus = "WAITING" | "BETTING" | "RUNNING" | "CRASHED" | "FINISHED";

export interface CurrentGameRound {
  id: string;
  status: GameRoundStatus;
  currentMultiplier: string | null;
  crashPoint: string | null;
  bettingEndsAt: string | null;
  startedAt: string | null;
  runningEndsAt: string | null;
  crashedAt: string | null;
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
  status: "RUNNING";
  startedAt: string;
  runningEndsAt: string;
}

export interface RoundFinishedWebSocketPayload {
  roundId: string;
  status: "FINISHED";
  finishedAt: string;
}

export interface RoundState {
  roundId: string | null;
  status: GameRoundStatus | null;
  phaseEndsAt: Date | null;
}
