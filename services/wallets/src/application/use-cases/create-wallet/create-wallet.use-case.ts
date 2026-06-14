import { Inject, Injectable } from "@nestjs/common";
import { Wallet } from "../../../domain/entities/wallet.entity";
import type { WalletRepository } from "../../../domain/repositories/wallet.repository";
import { WALLET_REPOSITORY } from "../../common/tokens";
import { WalletAlreadyExistsError } from "../../errors/wallet-already-exists.error";
import type { CreateWalletInput } from "./create-wallet.input";

@Injectable()
export class CreateWalletUseCase {
  public constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  public async execute(input: CreateWalletInput): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findByPlayerId(input.playerId);

    if (existingWallet !== null) {
      throw new WalletAlreadyExistsError(input.playerId);
    }

    const wallet = new Wallet({
      id: crypto.randomUUID(),
      playerId: input.playerId,
    });

    await this.walletRepository.save(wallet);

    return wallet;
  }
}
