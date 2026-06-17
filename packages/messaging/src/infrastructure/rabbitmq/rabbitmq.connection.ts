import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { Channel, ChannelModel } from "amqplib";
import * as amqp from "amqplib";
import { buildMessagingConfig } from "../messaging-config";

const MAX_CONNECT_ATTEMPTS = 15;
const CONNECT_RETRY_DELAY_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class RabbitMqConnection implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqConnection.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  public async onModuleInit(): Promise<void> {
    const config = buildMessagingConfig();

    for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
      try {
        this.connection = await amqp.connect(config.url);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(config.exchange, config.exchangeType, {
          durable: true,
        });

        this.logger.log(
          `Connected to RabbitMQ exchange "${config.exchange}" (${config.exchangeType}).`,
        );
        return;
      } catch (error) {
        await this.connection?.close().catch(() => undefined);
        this.connection = null;
        this.channel = null;

        if (attempt === MAX_CONNECT_ATTEMPTS) {
          throw error;
        }

        this.logger.warn(
          `RabbitMQ connection attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed. Retrying in ${CONNECT_RETRY_DELAY_MS}ms...`,
        );
        await sleep(CONNECT_RETRY_DELAY_MS);
      }
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
  }

  public getChannel(): Channel {
    if (this.channel === null) {
      throw new Error("RabbitMQ channel is not initialized.");
    }

    return this.channel;
  }
}
