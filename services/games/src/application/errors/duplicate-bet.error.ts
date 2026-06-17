import { ApplicationError } from "./application-error";

export class DuplicateBetError extends ApplicationError {
  public static create(): DuplicateBetError {
    return new DuplicateBetError("Player already has a bet on the current round.");
  }

  private constructor(message: string) {
    super(message);
  }
}
