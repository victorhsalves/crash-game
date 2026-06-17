import { ApplicationError } from "./application-error";

export class GameRoundNotFoundError extends ApplicationError {
  public static create(): GameRoundNotFoundError {
    return new GameRoundNotFoundError("Game round not found.");
  }

  private constructor(message: string) {
    super(message);
  }
}
