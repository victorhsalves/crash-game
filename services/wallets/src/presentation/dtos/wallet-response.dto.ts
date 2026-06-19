import { ApiProperty } from "@nestjs/swagger";
import { Wallet } from "../../domain/entities/wallet.entity";

export class WalletResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  playerId!: string;

  @ApiProperty({ example: "1000.00", description: "Saldo formatado" })
  balance!: string;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  public static fromDomain(wallet: Wallet): WalletResponseDto {
    const dto = new WalletResponseDto();

    dto.id = wallet.id;
    dto.playerId = wallet.playerId;
    dto.balance = wallet.balance.toJSON();
    dto.createdAt = wallet.createdAt.toISOString();

    return dto;
  }
}
