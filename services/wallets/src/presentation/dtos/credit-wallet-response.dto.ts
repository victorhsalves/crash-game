import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity";
import { Wallet } from "../../domain/entities/wallet.entity";
import { WalletResponseDto } from "./wallet-response.dto";

export class CreditWalletResponseDto {
  transactionId: string;
  wallet: WalletResponseDto;

  public static fromDomain(wallet: Wallet, transaction: WalletTransaction): CreditWalletResponseDto {
    const dto = new CreditWalletResponseDto();

    dto.transactionId = transaction.id;
    dto.wallet = WalletResponseDto.fromDomain(wallet);

    return dto;
  }
}
