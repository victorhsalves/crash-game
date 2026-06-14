import { Injectable } from "@nestjs/common";
import type { EntityManager } from "typeorm";
import type { RepositoryContext } from "../../../application/ports/unit-of-work";
import type { RepositoryContextFactory } from "./repository-context.factory";
import { TypeOrmWalletTransactionRepository } from "./repositories/typeorm-wallet-transaction.repository";
import { TypeOrmWalletRepository } from "./repositories/typeorm-wallet.repository";

@Injectable()
export class TypeOrmRepositoryContextFactory implements RepositoryContextFactory {
  public create(manager: EntityManager): RepositoryContext {
    return {
      wallets: new TypeOrmWalletRepository(manager),
      walletTransactions: new TypeOrmWalletTransactionRepository(manager),
    };
  }
}
