import { ApplicationError } from "./application-error";

export class BetNotFoundError extends ApplicationError {
  public static create(): BetNotFoundError {
    return new BetNotFoundError("Bet not found.");
  }

  private constructor(message: string) {
    super(message);
  }
}
