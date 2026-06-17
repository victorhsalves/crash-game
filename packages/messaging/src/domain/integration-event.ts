export interface IntegrationEvent<TPayload = unknown> {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly payload: TPayload;
}

export interface CreateIntegrationEventInput<TPayload> {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly payload: TPayload;
}

export function createIntegrationEvent<TPayload>(
  input: CreateIntegrationEventInput<TPayload>,
): IntegrationEvent<TPayload> {
  return {
    eventType: input.eventType,
    aggregateId: input.aggregateId,
    payload: input.payload,
  };
}
