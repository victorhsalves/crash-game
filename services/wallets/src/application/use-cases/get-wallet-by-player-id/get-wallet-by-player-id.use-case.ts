import { Inject, Injectable } from "@nestjs/common";
import { Wallet } from "../../../domain/entities/wallet.entity";
import type { WalletRepository } from "../../../domain/repositories/wallet.repository";
import { WALLET_REPOSITORY } from "../../common/tokens";
import { WalletNotFoundError } from "../../errors/wallet-not-found.error";

@Injectable()
export class GetWalletByPlayerIdUseCase {
  public constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  public async execute(playerId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByPlayerId(playerId);

    if (wallet === null) {
      throw new WalletNotFoundError(playerId);
    }

    return wallet;
  }
}
