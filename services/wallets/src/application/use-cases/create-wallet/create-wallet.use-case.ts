import { Money } from "@crash/money";
import { Inject, Injectable } from "@nestjs/common";
import { WalletTransaction } from "../../../domain/entities/wallet-transaction.entity";
import { Wallet } from "../../../domain/entities/wallet.entity";
import { TransactionType } from "../../../domain/enums/transaction-type.enum";
import {
  INITIAL_BALANCE_REFERENCE_ID,
  resolveInitialWalletBalanceCents,
} from "../../common/wallet.constants";
import { UNIT_OF_WORK } from "../../common/tokens";
import { WalletAlreadyExistsError } from "../../errors/wallet-already-exists.error";
import type { UnitOfWork } from "../../ports/unit-of-work";
import type { CreateWalletInput } from "./create-wallet.input";

@Injectable()
export class CreateWalletUseCase {
  public constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public execute(input: CreateWalletInput): Promise<Wallet> {
    return this.unitOfWork.run(async ({ wallets, walletTransactions }) => {
      const existingWallet = await wallets.findByPlayerId(input.playerId);

      if (existingWallet !== null) {
        throw new WalletAlreadyExistsError(input.playerId);
      }

      const wallet = new Wallet({
        id: crypto.randomUUID(),
        playerId: input.playerId,
      });

      const initialBalanceCents = resolveInitialWalletBalanceCents();

      if (initialBalanceCents > 0n) {
        const amount = Money.fromCents(initialBalanceCents);

        wallet.credit(amount, INITIAL_BALANCE_REFERENCE_ID);

        const transaction = new WalletTransaction({
          id: crypto.randomUUID(),
          walletId: wallet.id,
          playerId: wallet.playerId,
          amount,
          type: TransactionType.Credit,
          referenceId: INITIAL_BALANCE_REFERENCE_ID,
        });

        await wallets.save(wallet);
        await walletTransactions.save(transaction);
      } else {
        await wallets.save(wallet);
      }

      return wallet;
    });
  }
}
