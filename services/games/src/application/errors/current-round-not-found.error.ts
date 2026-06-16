import { ApplicationError } from "./application-error";

export class CurrentRoundNotFoundError extends ApplicationError {
  private constructor() {
    super("No active game round found.");
  }

  public static create(): CurrentRoundNotFoundError {
    return new CurrentRoundNotFoundError();
  }
}
