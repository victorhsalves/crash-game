import { type DynamicModule, Module } from "@nestjs/common";
import { EVENT_PUBLISHER } from "./application/tokens";
import { RabbitMqConnection } from "./infrastructure/rabbitmq/rabbitmq.connection";
import { RabbitMqPublisher } from "./infrastructure/rabbitmq/rabbitmq.publisher";
import { RabbitMqSubscriber } from "./infrastructure/rabbitmq/rabbitmq.subscriber";

@Module({})
export class MessagingModule {
  public static forRoot(): DynamicModule {
    return {
      module: MessagingModule,
      providers: [
        RabbitMqConnection,
        RabbitMqPublisher,
        RabbitMqSubscriber,
        {
          provide: EVENT_PUBLISHER,
          useExisting: RabbitMqPublisher,
        },
      ],
      exports: [
        EVENT_PUBLISHER,
        RabbitMqPublisher,
        RabbitMqSubscriber,
        RabbitMqConnection,
      ],
    };
  }
}
