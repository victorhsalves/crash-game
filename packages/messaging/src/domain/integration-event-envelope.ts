import type { IntegrationEvent } from "./integration-event";

export interface IntegrationEventEnvelope<TPayload = unknown> {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly event: IntegrationEvent<TPayload>;
}

export interface CreateIntegrationEventEnvelopeOptions {
  readonly eventId?: string;
  readonly occurredAt?: string;
}

export function createIntegrationEventEnvelope<TPayload>(
  event: IntegrationEvent<TPayload>,
  options: CreateIntegrationEventEnvelopeOptions = {},
): IntegrationEventEnvelope<TPayload> {
  return {
    eventId: options.eventId ?? crypto.randomUUID(),
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    event,
  };
}
