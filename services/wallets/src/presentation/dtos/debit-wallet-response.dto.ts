import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity";
import { Wallet } from "../../domain/entities/wallet.entity";
import { WalletResponseDto } from "./wallet-response.dto";

export class DebitWalletResponseDto {
  transactionId: string;
  wallet: WalletResponseDto;

  public static fromDomain(wallet: Wallet, transaction: WalletTransaction): DebitWalletResponseDto {
    const dto = new DebitWalletResponseDto();

    dto.transactionId = transaction.id;
    dto.wallet = WalletResponseDto.fromDomain(wallet);

    return dto;
  }
}
