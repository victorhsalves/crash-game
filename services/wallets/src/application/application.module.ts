import { Module, forwardRef } from "@nestjs/common";
import { PersistenceModule } from "../infrastructure/persistence/persistence.module";
import { MessagingInfrastructureModule } from "../infrastructure/messaging/messaging.module";
import { CreateWalletUseCase } from "./use-cases/create-wallet/create-wallet.use-case";
import { CreditWalletUseCase } from "./use-cases/credit-wallet/credit-wallet.use-case";
import { DebitWalletUseCase } from "./use-cases/debit-wallet/debit-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "./use-cases/get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import { ProcessBetPlacedUseCase } from "./use-cases/process-bet-placed/process-bet-placed.use-case";
import { ProcessBetCashedOutUseCase } from "./use-cases/process-bet-cashed-out/process-bet-cashed-out.use-case";

@Module({
  imports: [PersistenceModule, forwardRef(() => MessagingInfrastructureModule)],
  providers: [
    CreateWalletUseCase,
    GetWalletByPlayerIdUseCase,
    CreditWalletUseCase,
    DebitWalletUseCase,
    ProcessBetPlacedUseCase,
    ProcessBetCashedOutUseCase,
  ],
  exports: [
    CreateWalletUseCase,
    GetWalletByPlayerIdUseCase,
    CreditWalletUseCase,
    DebitWalletUseCase,
    ProcessBetPlacedUseCase,
    ProcessBetCashedOutUseCase,
  ],
})
export class ApplicationModule {}
