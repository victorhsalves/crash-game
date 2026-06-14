import type { DomainEvent } from "../shared/domain-event";

export interface RoundStartedPayload {
  readonly roundId: string;
  readonly startedAt: Date;
}

export class RoundStartedEvent implements DomainEvent<RoundStartedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: RoundStartedPayload;

  public constructor(payload: RoundStartedPayload, occurredAt: Date = new Date(), eventId: string = crypto.randomUUID()) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
