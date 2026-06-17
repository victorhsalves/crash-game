import type { DomainEvent } from "../shared/domain-event";

export interface BetLostPayload {
  readonly betId: string;
  readonly roundId: string;
  readonly playerId: string;
  readonly amount: bigint;
  readonly lostAt: Date;
}

export class BetLostEvent implements DomainEvent<BetLostPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: BetLostPayload;

  public constructor(
    payload: BetLostPayload,
    occurredAt: Date = payload.lostAt,
    eventId: string = crypto.randomUUID(),
  ) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
