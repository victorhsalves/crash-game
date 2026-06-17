import { Module, forwardRef } from "@nestjs/common";
import { PersistenceModule } from "../infrastructure/persistence/persistence.module";
import { MessagingInfrastructureModule } from "../infrastructure/messaging/messaging.module";
import { WebSocketInfrastructureModule } from "../infrastructure/websocket/websocket.module";
import { GetBetByIdUseCase } from "./use-cases/get-bet-by-id/get-bet-by-id.use-case";
import { GetCurrentRoundUseCase } from "./use-cases/get-current-round/get-current-round.use-case";
import { PlaceBetUseCase } from "./use-cases/place-bet/place-bet.use-case";
import { ProcessWalletDebitedUseCase } from "./use-cases/process-wallet-debited/process-wallet-debited.use-case";
import { ProcessWalletDebitFailedUseCase } from "./use-cases/process-wallet-debit-failed/process-wallet-debit-failed.use-case";

@Module({
  imports: [
    PersistenceModule,
    WebSocketInfrastructureModule,
    forwardRef(() => MessagingInfrastructureModule),
  ],
  providers: [
    GetCurrentRoundUseCase,
    PlaceBetUseCase,
    GetBetByIdUseCase,
    ProcessWalletDebitedUseCase,
    ProcessWalletDebitFailedUseCase,
  ],
  exports: [
    GetCurrentRoundUseCase,
    PlaceBetUseCase,
    GetBetByIdUseCase,
    ProcessWalletDebitedUseCase,
    ProcessWalletDebitFailedUseCase,
  ],
})
export class ApplicationModule {}
