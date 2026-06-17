import { ApplicationError } from "./application-error";

export class RoundNotRunningError extends ApplicationError {
  public static create(): RoundNotRunningError {
    return new RoundNotRunningError("The current round is not running.");
  }

  private constructor(message: string) {
    super(message);
  }
}
