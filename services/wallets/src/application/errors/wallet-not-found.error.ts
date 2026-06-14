import { ApplicationError } from "./application-error";

export class WalletNotFoundError extends ApplicationError {
  private constructor(message: string) {
    super(message);
  }

  public static byPlayerId(playerId: string): WalletNotFoundError {
    return new WalletNotFoundError(`Wallet not found for player ${playerId}.`);
  }

  public static byWalletId(walletId: string): WalletNotFoundError {
    return new WalletNotFoundError(`Wallet not found: ${walletId}.`);
  }
}
