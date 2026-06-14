import type { DomainEvent } from "../shared/domain-event";

export interface RoundFinishedPayload {
  readonly roundId: string;
  readonly finishedAt: Date;
}

export class RoundFinishedEvent implements DomainEvent<RoundFinishedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: RoundFinishedPayload;

  public constructor(payload: RoundFinishedPayload, occurredAt: Date = new Date(), eventId: string = crypto.randomUUID()) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
