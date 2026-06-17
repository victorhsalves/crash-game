import { ApplicationError } from "./application-error";

export class RoundNotInBettingPhaseError extends ApplicationError {
  public static create(): RoundNotInBettingPhaseError {
    return new RoundNotInBettingPhaseError("The current round is not accepting bets.");
  }

  private constructor(message: string) {
    super(message);
  }
}
