import { BET_PLACED, BET_CASHED_OUT, type BetPlacedPayload, type BetCashedOutPayload } from "@crash/messaging";
import { Injectable, Logger, Module, type OnModuleInit, forwardRef } from "@nestjs/common";
import { MessagingModule, RabbitMqSubscriber } from "@crash/messaging";
import { ApplicationModule } from "../../application/application.module";
import { ProcessBetPlacedUseCase } from "../../application/use-cases/process-bet-placed/process-bet-placed.use-case";
import { ProcessBetCashedOutUseCase } from "../../application/use-cases/process-bet-cashed-out/process-bet-cashed-out.use-case";
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
      routingKeys: [BET_PLACED, BET_CASHED_OUT],
    });

    this.subscriber.subscribe<BetPlacedPayload>(BET_PLACED, async (envelope) => {
      this.logger.log(`[messaging] bet.placed received for betId=${envelope.event.payload.betId}`);
      await this.processBetPlacedUseCase.execute({ payload: envelope.event.payload });
    });
  }
}

@Injectable()
export class BetCashedOutHandler implements OnModuleInit {
  private readonly logger = new Logger(BetCashedOutHandler.name);

  public constructor(
    private readonly subscriber: RabbitMqSubscriber,
    private readonly processBetCashedOutUseCase: ProcessBetCashedOutUseCase,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.subscriber.subscribe<BetCashedOutPayload>(BET_CASHED_OUT, async (envelope) => {
      this.logger.log(
        `[messaging] bet.cashed-out received for betId=${envelope.event.payload.betId}`,
      );
      await this.processBetCashedOutUseCase.execute({ payload: envelope.event.payload });
    });
  }
}

@Module({
  imports: [MessagingModule.forRoot(), forwardRef(() => ApplicationModule)],
  controllers: [InternalTestEventController],
  providers: [BetPlacedHandler, BetCashedOutHandler],
  exports: [MessagingModule],
})
export class MessagingInfrastructureModule {}
