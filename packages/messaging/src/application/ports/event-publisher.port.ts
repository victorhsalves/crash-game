import type { IntegrationEventEnvelope } from "../../domain/integration-event-envelope";

export interface EventPublisher {
  publish<TPayload>(
    routingKey: string,
    envelope: IntegrationEventEnvelope<TPayload>,
  ): Promise<void>;
}
