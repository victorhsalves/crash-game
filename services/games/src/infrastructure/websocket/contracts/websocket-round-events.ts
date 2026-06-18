export const WebSocketRoundEvents = {
  BettingOpened: "round.betting-opened",
  Running: "round.running",
  Crashed: "round.crashed",
  Finished: "round.finished",
} as const;

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
