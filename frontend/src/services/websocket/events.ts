export const WebSocketEvents = {
  InfrastructureTest: "infrastructure.test",
  BetAccepted: "bet.accepted",
  BetRejected: "bet.rejected",
  BetUpdated: "bet.updated",
  RoundBettingOpened: "round.betting-opened",
  RoundRunning: "round.running",
  RoundCrashed: "round.crashed",
  RoundFinished: "round.finished",
  RoundBetAdded: "round.bet-added",
  RoundBetUpdated: "round.bet-updated",
} as const;
