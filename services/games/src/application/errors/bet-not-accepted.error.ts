import { ApplicationError } from "./application-error";

export class BetNotAcceptedError extends ApplicationError {
  public static create(): BetNotAcceptedError {
    return new BetNotAcceptedError("The bet has not been accepted yet.");
  }

  private constructor(message: string) {
    super(message);
  }
}
