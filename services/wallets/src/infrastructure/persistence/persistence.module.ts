import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { UNIT_OF_WORK, WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY } from "../../application/common/tokens";
import { DatabaseModule } from "./database.module";
import { REPOSITORY_CONTEXT_FACTORY } from "./typeorm/repository-context.factory";
import { TypeOrmWalletTransactionRepository } from "./typeorm/repositories/typeorm-wallet-transaction.repository";
import { TypeOrmWalletRepository } from "./typeorm/repositories/typeorm-wallet.repository";
import { TypeOrmRepositoryContextFactory } from "./typeorm/typeorm-repository-context.factory";
import { TypeOrmUnitOfWork } from "./typeorm/typeorm-unit-of-work";

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: WALLET_REPOSITORY,
      useFactory: (dataSource: DataSource): TypeOrmWalletRepository => new TypeOrmWalletRepository(dataSource),
      inject: [DataSource],
    },
    {
      provide: WALLET_TRANSACTION_REPOSITORY,
      useFactory: (dataSource: DataSource): TypeOrmWalletTransactionRepository =>
        new TypeOrmWalletTransactionRepository(dataSource),
      inject: [DataSource],
    },
    { provide: REPOSITORY_CONTEXT_FACTORY, useClass: TypeOrmRepositoryContextFactory },
    { provide: UNIT_OF_WORK, useClass: TypeOrmUnitOfWork },
  ],
  exports: [WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY, UNIT_OF_WORK],
})
export class PersistenceModule {}
