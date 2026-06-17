import {
  MessagingModule,
  RabbitMqSubscriber,
  WALLET_DEBIT_FAILED,
  WALLET_DEBITED,
  type WalletDebitedPayload,
  type WalletDebitFailedPayload,
} from "@crash/messaging";
import { Injectable, Logger, Module, type OnModuleInit, forwardRef } from "@nestjs/common";
import { ApplicationModule } from "../../application/application.module";
import { ProcessWalletDebitedUseCase } from "../../application/use-cases/process-wallet-debited/process-wallet-debited.use-case";
import { ProcessWalletDebitFailedUseCase } from "../../application/use-cases/process-wallet-debit-failed/process-wallet-debit-failed.use-case";

@Injectable()
export class TestEventHandler implements OnModuleInit {
  private readonly logger = new Logger(TestEventHandler.name);

  public constructor(private readonly subscriber: RabbitMqSubscriber) {}

  public async onModuleInit(): Promise<void> {
    await this.subscriber.register({
      queue: "games.queue",
      routingKeys: ["infrastructure.test", WALLET_DEBITED, WALLET_DEBIT_FAILED],
    });

    this.subscriber.subscribe("infrastructure.test", async (envelope) => {
      this.logger.log(
        `[messaging] test event received: ${envelope.eventId}`,
        envelope.event.payload,
      );
    });
  }
}

@Injectable()
export class WalletDebitedHandler implements OnModuleInit {
  public constructor(
    private readonly subscriber: RabbitMqSubscriber,
    private readonly processWalletDebitedUseCase: ProcessWalletDebitedUseCase,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.subscriber.subscribe<WalletDebitedPayload>(WALLET_DEBITED, async (envelope) => {
      await this.processWalletDebitedUseCase.execute(envelope.event.payload.betId);
    });
  }
}

@Injectable()
export class WalletDebitFailedHandler implements OnModuleInit {
  public constructor(
    private readonly subscriber: RabbitMqSubscriber,
    private readonly processWalletDebitFailedUseCase: ProcessWalletDebitFailedUseCase,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.subscriber.subscribe<WalletDebitFailedPayload>(
      WALLET_DEBIT_FAILED,
      async (envelope) => {
        await this.processWalletDebitFailedUseCase.execute(
          envelope.event.payload.betId,
          envelope.event.payload.reason,
        );
      },
    );
  }
}

@Module({
  imports: [MessagingModule.forRoot(), forwardRef(() => ApplicationModule)],
  providers: [TestEventHandler, WalletDebitedHandler, WalletDebitFailedHandler],
  exports: [MessagingModule],
})
export class MessagingInfrastructureModule {}
