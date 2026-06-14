import { ApplicationError } from "./application-error";

export class WalletNotFoundError extends ApplicationError {
  public constructor(playerId: string) {
    super(`Wallet not found for player ${playerId}.`);
  }
}
