import { Wallet } from "../../domain/entities/wallet.entity";

export class WalletResponseDto {
  id: string;
  playerId: string;
  balance: string;
  createdAt: string;

  public static fromDomain(wallet: Wallet): WalletResponseDto {
    const dto = new WalletResponseDto();

    dto.id = wallet.id;
    dto.playerId = wallet.playerId;
    dto.balance = wallet.balance.toJSON();
    dto.createdAt = wallet.createdAt.toISOString();

    return dto;
  }
}
