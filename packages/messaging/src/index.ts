export type { EventPublisher } from "./application/ports/event-publisher.port";
export { EVENT_PUBLISHER } from "./application/tokens";
export type {
  CreateIntegrationEventEnvelopeOptions,
  IntegrationEventEnvelope,
} from "./domain/integration-event-envelope";
export {
  createIntegrationEventEnvelope,
} from "./domain/integration-event-envelope";
export type {
  CreateIntegrationEventInput,
  IntegrationEvent,
} from "./domain/integration-event";
export { createIntegrationEvent } from "./domain/integration-event";
export { MessagingError } from "./domain/messaging-error";
export type { MessagingConfig } from "./infrastructure/messaging-config";
export { buildMessagingConfig } from "./infrastructure/messaging-config";
export { RabbitMqConnection } from "./infrastructure/rabbitmq/rabbitmq.connection";
export { RabbitMqPublisher } from "./infrastructure/rabbitmq/rabbitmq.publisher";
export type {
  SubscriberHandler,
  SubscriberRegistration,
} from "./infrastructure/rabbitmq/rabbitmq.subscriber";
export { RabbitMqSubscriber } from "./infrastructure/rabbitmq/rabbitmq.subscriber";
export { MessagingModule } from "./messaging.module";
export type { BetPlacedPayload, BetCashedOutPayload } from "./contracts/bet";
export {
  BET_PLACED,
  BET_CASHED_OUT,
  WALLET_DEBITED,
  WALLET_DEBIT_FAILED,
  WALLET_CREDITED,
} from "./contracts/routing-keys";
export { DebitFailureReason } from "./contracts/wallet";
export type {
  WalletDebitedPayload,
  WalletDebitFailedPayload,
  WalletCreditedPayload,
} from "./contracts/wallet";
