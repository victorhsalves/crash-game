import { ApplicationError } from "./application-error";

export class RoundAlreadyCrashedError extends ApplicationError {
  public static create(): RoundAlreadyCrashedError {
    return new RoundAlreadyCrashedError("The cashout window has closed.");
  }

  private constructor(message: string) {
    super(message);
  }
}
