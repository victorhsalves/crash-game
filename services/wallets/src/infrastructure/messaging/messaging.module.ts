import { BET_PLACED, type BetPlacedPayload } from "@crash/messaging";
import { Injectable, Logger, Module, type OnModuleInit, forwardRef } from "@nestjs/common";
import { MessagingModule, RabbitMqSubscriber } from "@crash/messaging";
import { ApplicationModule } from "../../application/application.module";
import { ProcessBetPlacedUseCase } from "../../application/use-cases/process-bet-placed/process-bet-placed.use-case";
import { InternalTestEventController } from "./internal-test-event.controller";

@Injectable()
export class BetPlacedHandler implements OnModuleInit {
  private readonly logger = new Logger(BetPlacedHandler.name);

  public constructor(
    private readonly subscriber: RabbitMqSubscriber,
    private readonly processBetPlacedUseCase: ProcessBetPlacedUseCase,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.subscriber.register({
      queue: "wallets.queue",
      routingKeys: [BET_PLACED],
    });

    this.subscriber.subscribe<BetPlacedPayload>(BET_PLACED, async (envelope) => {
      this.logger.log(`[messaging] bet.placed received for betId=${envelope.event.payload.betId}`);
      await this.processBetPlacedUseCase.execute({ payload: envelope.event.payload });
    });
  }
}

@Module({
  imports: [MessagingModule.forRoot(), forwardRef(() => ApplicationModule)],
  controllers: [InternalTestEventController],
  providers: [BetPlacedHandler],
  exports: [MessagingModule],
})
export class MessagingInfrastructureModule {}
