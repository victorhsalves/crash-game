import {
  createIntegrationEvent,
  createIntegrationEventEnvelope,
  EVENT_PUBLISHER,
  MessagingModule,
  type EventPublisher,
} from "@crash/messaging";
import { Controller, Inject, Logger, Post } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

interface PublishTestEventResponse {
  readonly eventId: string;
  readonly published: true;
}

@ApiExcludeController()
@Controller("internal")
export class InternalTestEventController {
  private readonly logger = new Logger(InternalTestEventController.name);

  public constructor(
    @Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher,
  ) {}

  @Post("test-event")
  public async publishTestEvent(): Promise<PublishTestEventResponse> {
    const event = createIntegrationEvent({
      eventType: "infrastructure.test",
      aggregateId: "infrastructure-test",
      payload: {
        message: "ping from wallets",
        source: "wallets",
      },
    });
    const envelope = createIntegrationEventEnvelope(event);

    await this.publisher.publish("infrastructure.test", envelope);

    this.logger.log(`[messaging] test event published: ${envelope.eventId}`);

    return {
      eventId: envelope.eventId,
      published: true,
    };
  }
}
