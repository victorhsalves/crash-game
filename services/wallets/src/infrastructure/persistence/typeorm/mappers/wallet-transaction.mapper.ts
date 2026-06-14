import { Money } from "@crash/money";
import { WalletTransaction } from "../../../../domain/entities/wallet-transaction.entity";
import { TransactionType } from "../../../../domain/enums/transaction-type.enum";
import { WalletTransactionOrmEntity } from "../entities/wallet-transaction.orm-entity";

export class WalletTransactionMapper {
  public static toDomain(entity: WalletTransactionOrmEntity): WalletTransaction {
    return new WalletTransaction({
      id: entity.id,
      walletId: entity.walletId,
      playerId: entity.playerId,
      amount: Money.fromCents(BigInt(entity.amount)),
      type: entity.type as TransactionType,
      referenceId: entity.referenceId,
      createdAt: entity.createdAt,
    });
  }

  public static toPersistence(transaction: WalletTransaction): WalletTransactionOrmEntity {
    const entity = new WalletTransactionOrmEntity();

    entity.id = transaction.id;
    entity.walletId = transaction.walletId;
    entity.playerId = transaction.playerId;
    entity.amount = transaction.amount.value.toString();
    entity.type = transaction.type;
    entity.referenceId = transaction.referenceId;
    entity.createdAt = transaction.createdAt;

    return entity;
  }
}
