import { Money } from "@crash/money";
import { Wallet } from "../../../../domain/entities/wallet.entity";
import { WalletOrmEntity } from "../entities/wallet.orm-entity";

export class WalletMapper {
  public static toDomain(entity: WalletOrmEntity): Wallet {
    return new Wallet({
      id: entity.id,
      playerId: entity.playerId,
      balance: Money.fromCents(BigInt(entity.balance)),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  public static toPersistence(wallet: Wallet): WalletOrmEntity {
    const entity = new WalletOrmEntity();

    entity.id = wallet.id;
    entity.playerId = wallet.playerId;
    entity.balance = wallet.balance.value.toString();
    entity.createdAt = wallet.createdAt;
    entity.updatedAt = wallet.updatedAt;

    return entity;
  }
}
