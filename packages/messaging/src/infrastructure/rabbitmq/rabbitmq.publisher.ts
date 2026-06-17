import { Inject, Injectable } from "@nestjs/common";
import type { EventPublisher } from "../../application/ports/event-publisher.port";
import type { IntegrationEventEnvelope } from "../../domain/integration-event-envelope";
import { buildMessagingConfig } from "../messaging-config";
import { RabbitMqConnection } from "./rabbitmq.connection";
import { RabbitMqSerializer } from "./rabbitmq.serializer";

@Injectable()
export class RabbitMqPublisher implements EventPublisher {
  private readonly serializer = new RabbitMqSerializer();

  public constructor(
    @Inject(RabbitMqConnection) private readonly connection: RabbitMqConnection,
  ) {}

  public async publish<TPayload>(
    routingKey: string,
    envelope: IntegrationEventEnvelope<TPayload>,
  ): Promise<void> {
    const config = buildMessagingConfig();
    const channel = this.connection.getChannel();
    const content = this.serializer.serialize(envelope);

    channel.publish(config.exchange, routingKey, content, {
      contentType: "application/json",
      persistent: true,
    });
  }
}
