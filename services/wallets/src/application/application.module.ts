import { Module } from "@nestjs/common";
import { PersistenceModule } from "../infrastructure/persistence/persistence.module";
import { CreateWalletUseCase } from "./use-cases/create-wallet/create-wallet.use-case";
import { CreditWalletUseCase } from "./use-cases/credit-wallet/credit-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "./use-cases/get-wallet-by-player-id/get-wallet-by-player-id.use-case";

@Module({
  imports: [PersistenceModule],
  providers: [CreateWalletUseCase, GetWalletByPlayerIdUseCase, CreditWalletUseCase],
  exports: [CreateWalletUseCase, GetWalletByPlayerIdUseCase, CreditWalletUseCase],
})
export class ApplicationModule {}
