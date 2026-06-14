export interface DomainEvent<TPayload> {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly payload: TPayload;
}
