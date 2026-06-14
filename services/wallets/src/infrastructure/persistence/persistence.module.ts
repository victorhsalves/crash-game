import { Module } from "@nestjs/common";
import { WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY } from "../../application/common/tokens";
import { DatabaseModule } from "./database.module";
import { TypeOrmWalletTransactionRepository } from "./typeorm/repositories/typeorm-wallet-transaction.repository";
import { TypeOrmWalletRepository } from "./typeorm/repositories/typeorm-wallet.repository";

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: WALLET_REPOSITORY, useClass: TypeOrmWalletRepository },
    { provide: WALLET_TRANSACTION_REPOSITORY, useClass: TypeOrmWalletTransactionRepository },
  ],
  exports: [WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY],
})
export class PersistenceModule {}
