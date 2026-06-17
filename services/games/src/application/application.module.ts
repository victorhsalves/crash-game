import { Module, forwardRef } from "@nestjs/common";
import { CrashModule } from "../infrastructure/crash/crash.module";
import { PersistenceModule } from "../infrastructure/persistence/persistence.module";
import { MessagingInfrastructureModule } from "../infrastructure/messaging/messaging.module";
import { TimeModule } from "../infrastructure/time/time.module";
import { WebSocketInfrastructureModule } from "../infrastructure/websocket/websocket.module";
import { CashoutBetUseCase } from "./use-cases/cashout-bet/cashout-bet.use-case";
import { CrashRoundUseCase } from "./use-cases/crash-round/crash-round.use-case";
import { CreateGameRoundUseCase } from "./use-cases/create-game-round/create-game-round.use-case";
import { EnsureNextRoundWaitingUseCase } from "./use-cases/ensure-next-round-waiting/ensure-next-round-waiting.use-case";
import { FinishRoundUseCase } from "./use-cases/finish-round/finish-round.use-case";
import { GetBetByIdUseCase } from "./use-cases/get-bet-by-id/get-bet-by-id.use-case";
import { GetCurrentRoundUseCase } from "./use-cases/get-current-round/get-current-round.use-case";
import { OpenRoundBettingUseCase } from "./use-cases/open-round-betting/open-round-betting.use-case";
import { PlaceBetUseCase } from "./use-cases/place-bet/place-bet.use-case";
import { ProcessWalletDebitedUseCase } from "./use-cases/process-wallet-debited/process-wallet-debited.use-case";
import { ProcessWalletDebitFailedUseCase } from "./use-cases/process-wallet-debit-failed/process-wallet-debit-failed.use-case";
import { RecoverRoundLifecycleUseCase } from "./use-cases/recover-round-lifecycle/recover-round-lifecycle.use-case";
import { StartRoundUseCase } from "./use-cases/start-round/start-round.use-case";

@Module({
  imports: [
    PersistenceModule,
    CrashModule,
    TimeModule,
    forwardRef(() => WebSocketInfrastructureModule),
    forwardRef(() => MessagingInfrastructureModule),
  ],
  providers: [
    GetCurrentRoundUseCase,
    PlaceBetUseCase,
    CashoutBetUseCase,
    GetBetByIdUseCase,
    ProcessWalletDebitedUseCase,
    ProcessWalletDebitFailedUseCase,
    CreateGameRoundUseCase,
    OpenRoundBettingUseCase,
    StartRoundUseCase,
    CrashRoundUseCase,
    EnsureNextRoundWaitingUseCase,
    FinishRoundUseCase,
    RecoverRoundLifecycleUseCase,
  ],
  exports: [
    GetCurrentRoundUseCase,
    PlaceBetUseCase,
    CashoutBetUseCase,
    GetBetByIdUseCase,
    ProcessWalletDebitedUseCase,
    ProcessWalletDebitFailedUseCase,
    CreateGameRoundUseCase,
    OpenRoundBettingUseCase,
    StartRoundUseCase,
    CrashRoundUseCase,
    EnsureNextRoundWaitingUseCase,
    FinishRoundUseCase,
    RecoverRoundLifecycleUseCase,
  ],
})
export class ApplicationModule {}
