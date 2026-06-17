import { ApplicationError } from "./application-error";

export class BetAlreadySettledError extends ApplicationError {
  public static create(): BetAlreadySettledError {
    return new BetAlreadySettledError("The bet has already been settled.");
  }

  private constructor(message: string) {
    super(message);
  }
}
