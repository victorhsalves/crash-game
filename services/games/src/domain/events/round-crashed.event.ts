import type { DomainEvent } from "../shared/domain-event";

export interface RoundCrashedPayload {
  readonly roundId: string;
  readonly crashPoint: number;
  readonly crashedAt: Date;
}

export class RoundCrashedEvent implements DomainEvent<RoundCrashedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: RoundCrashedPayload;

  public constructor(payload: RoundCrashedPayload, occurredAt: Date = new Date(), eventId: string = crypto.randomUUID()) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
