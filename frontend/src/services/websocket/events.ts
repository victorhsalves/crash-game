export const WebSocketEvents = {
  InfrastructureTest: "infrastructure.test",
  BetAccepted: "bet.accepted",
  BetRejected: "bet.rejected",
  BetCashout: "bet.cashout",
  BetUpdated: "bet.updated",
  BetCashoutFailed: "bet.cashout.failed",
  RoundBettingOpened: "round.betting-opened",
  RoundRunning: "round.running",
  RoundCrashed: "round.crashed",
  RoundFinished: "round.finished",
} as const;
