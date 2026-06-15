import { Money } from "@crash/money";
import { Inject, Injectable } from "@nestjs/common";
import { WalletTransaction } from "../../../domain/entities/wallet-transaction.entity";
import { Wallet } from "../../../domain/entities/wallet.entity";
import { TransactionType } from "../../../domain/enums/transaction-type.enum";
import { UNIT_OF_WORK } from "../../common/tokens";
import { DuplicateTransactionReferenceError } from "../../errors/duplicate-transaction-reference.error";
import { WalletNotFoundError } from "../../errors/wallet-not-found.error";
import type { UnitOfWork } from "../../ports/unit-of-work";
import type { DebitWalletInput } from "./debit-wallet.input";

export interface DebitWalletResult {
  readonly wallet: Wallet;
  readonly transaction: WalletTransaction;
}

@Injectable()
export class DebitWalletUseCase {
  public constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public execute(input: DebitWalletInput): Promise<DebitWalletResult> {
    const referenceId = input.referenceId ?? null;

    return this.unitOfWork.run(async ({ wallets, walletTransactions }) => {
      if (referenceId !== null) {
        const existing = await walletTransactions.findByReferenceId(referenceId);

        if (existing !== null) {
          throw new DuplicateTransactionReferenceError(referenceId);
        }
      }

      const wallet = await wallets.findById(input.walletId);

      if (wallet === null) {
        throw WalletNotFoundError.byWalletId(input.walletId);
      }

      const amount = Money.fromCents(BigInt(input.amountCents));

      wallet.debit(amount, referenceId);

      const transaction = new WalletTransaction({
        id: crypto.randomUUID(),
        walletId: wallet.id,
        playerId: wallet.playerId,
        amount,
        type: TransactionType.Debit,
        referenceId,
      });

      await wallets.save(wallet);
      await walletTransactions.save(transaction);

      return { wallet, transaction };
    });
  }
}
