export type GameRoundStatus = "WAITING" | "BETTING" | "RUNNING" | "CRASHED";

export interface CurrentGameRound {
  id: string;
  status: GameRoundStatus;
  currentMultiplier: string | null;
  crashPoint: string | null;
  bettingEndsAt: string | null;
  startedAt: string | null;
  crashedAt: string | null;
  createdAt: string;
}

export interface PlaceBetResponse {
  betId: string;
  status: "PENDING";
}
