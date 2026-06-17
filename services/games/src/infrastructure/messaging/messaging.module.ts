import { MessagingModule, RabbitMqSubscriber } from "@crash/messaging";
import { Injectable, Logger, Module, type OnModuleInit } from "@nestjs/common";

@Injectable()
export class TestEventHandler implements OnModuleInit {
  private readonly logger = new Logger(TestEventHandler.name);

  public constructor(private readonly subscriber: RabbitMqSubscriber) {}

  public async onModuleInit(): Promise<void> {
    await this.subscriber.register({
      queue: "games.queue",
      routingKeys: ["infrastructure.test"],
    });

    this.subscriber.subscribe("infrastructure.test", async (envelope) => {
      this.logger.log(
        `[messaging] test event received: ${envelope.eventId}`,
        envelope.event.payload,
      );
    });
  }
}

@Module({
  imports: [MessagingModule.forRoot()],
  providers: [TestEventHandler],
})
export class MessagingInfrastructureModule {}
