import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ConsumeMessage } from "amqplib";
import type { IntegrationEventEnvelope } from "../../domain/integration-event-envelope";
import { MessagingError } from "../../domain/messaging-error";
import { buildMessagingConfig } from "../messaging-config";
import { RabbitMqConnection } from "./rabbitmq.connection";
import { RabbitMqSerializer } from "./rabbitmq.serializer";

export type SubscriberHandler<TPayload = unknown> = (
  envelope: IntegrationEventEnvelope<TPayload>,
) => Promise<void>;

export interface SubscriberRegistration {
  readonly queue: string;
  readonly routingKeys: readonly string[];
}

interface QueueConsumerState {
  readonly queue: string;
  consumerTag: string | null;
}

@Injectable()
export class RabbitMqSubscriber {
  private readonly logger = new Logger(RabbitMqSubscriber.name);
  private readonly serializer = new RabbitMqSerializer();
  private readonly handlers = new Map<string, SubscriberHandler>();
  private readonly consumers = new Map<string, QueueConsumerState>();

  public constructor(
    @Inject(RabbitMqConnection) private readonly connection: RabbitMqConnection,
  ) {}

  public async register(registration: SubscriberRegistration): Promise<void> {
    const config = buildMessagingConfig();
    const channel = this.connection.getChannel();
    const { queue, routingKeys } = registration;

    if (routingKeys.length === 0) {
      throw new MessagingError(`Queue "${queue}" requires at least one routing key.`);
    }

    const deadLetterExchange = `${queue}.dlx`;
    const deadLetterQueue = `${queue}.dlq`;
    const deadLetterRoutingKey = deadLetterQueue;

    await channel.assertExchange(deadLetterExchange, "topic", { durable: true });

    await channel.assertQueue(deadLetterQueue, { durable: true });
    await channel.bindQueue(deadLetterQueue, deadLetterExchange, deadLetterRoutingKey);

    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": deadLetterExchange,
        "x-dead-letter-routing-key": deadLetterRoutingKey,
      },
    });

    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, config.exchange, routingKey);
    }

    if (this.consumers.has(queue)) {
      return;
    }

    const consumeResult = await channel.consume(
      queue,
      (message) => {
        void this.handleMessage(queue, message);
      },
      { noAck: false },
    );

    this.consumers.set(queue, {
      queue,
      consumerTag: consumeResult.consumerTag,
    });

    this.logger.log(
      `Registered queue "${queue}" with DLQ "${deadLetterQueue}" and routing keys: ${routingKeys.join(", ")}.`,
    );
  }

  public subscribe<TPayload>(
    routingKey: string,
    handler: SubscriberHandler<TPayload>,
  ): void {
    this.handlers.set(routingKey, handler as SubscriberHandler);
    this.logger.log(`Subscribed handler for routing key "${routingKey}".`);
  }

  private async handleMessage(queue: string, message: ConsumeMessage | null): Promise<void> {
    if (message === null) {
      return;
    }

    const channel = this.connection.getChannel();
    const routingKey = message.fields.routingKey;

    try {
      const envelope = this.serializer.deserialize(message.content);
      const handler = this.handlers.get(routingKey);

      if (handler === undefined) {
        throw new MessagingError(`No handler registered for routing key "${routingKey}".`);
      }

      await handler(envelope);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Failed to process message from queue "${queue}" (routingKey="${routingKey}"). Sending to DLQ.`,
        error instanceof Error ? error.stack : String(error),
      );
      channel.nack(message, false, false);
    }
  }
}
