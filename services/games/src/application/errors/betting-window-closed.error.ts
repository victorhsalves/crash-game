import { ApplicationError } from "./application-error";

export class BettingWindowClosedError extends ApplicationError {
  public static create(): BettingWindowClosedError {
    return new BettingWindowClosedError("The betting window for the current round has closed.");
  }

  private constructor(message: string) {
    super(message);
  }
}
