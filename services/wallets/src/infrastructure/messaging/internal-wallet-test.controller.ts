import { Controller, HttpCode, HttpStatus, Inject, Post, Body } from "@nestjs/common";
import { CreditWalletUseCase } from "../../application/use-cases/credit-wallet/credit-wallet.use-case";
import { DebitWalletUseCase } from "../../application/use-cases/debit-wallet/debit-wallet.use-case";
import { WALLET_REPOSITORY } from "../../application/common/tokens";
import { WalletNotFoundError } from "../../application/errors/wallet-not-found.error";
import type { WalletRepository } from "../../domain/repositories/wallet.repository";
import { WalletResponseDto } from "../../presentation/dtos/wallet-response.dto";
import { SetWalletBalanceDto } from "./set-wallet-balance.dto";

@Controller("internal/wallet")
export class InternalWalletTestController {
  public constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase,
  ) {}

  @Post("set-balance")
  @HttpCode(HttpStatus.OK)
  public async setBalance(@Body() dto: SetWalletBalanceDto): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findById(dto.walletId);

    if (wallet === null) {
      throw WalletNotFoundError.byWalletId(dto.walletId);
    }

    const currentBalance = wallet.balance.value;
    const targetBalance = BigInt(dto.targetBalanceCents);

    if (currentBalance > targetBalance) {
      await this.debitWalletUseCase.execute({
        walletId: dto.walletId,
        amountCents: Number(currentBalance - targetBalance),
        referenceId: `e2e-reset-debit-${crypto.randomUUID()}`,
      });
    } else if (currentBalance < targetBalance) {
      await this.creditWalletUseCase.execute({
        walletId: dto.walletId,
        amountCents: Number(targetBalance - currentBalance),
        referenceId: `e2e-reset-credit-${crypto.randomUUID()}`,
      });
    }

    const updatedWallet = await this.walletRepository.findById(dto.walletId);

    if (updatedWallet === null) {
      throw WalletNotFoundError.byWalletId(dto.walletId);
    }

    return WalletResponseDto.fromDomain(updatedWallet);
  }
}
