import { ApplicationError } from "./application-error";

export class WalletAlreadyExistsError extends ApplicationError {
  public constructor(playerId: string) {
    super(`Wallet already exists for player ${playerId}.`);
  }
}
