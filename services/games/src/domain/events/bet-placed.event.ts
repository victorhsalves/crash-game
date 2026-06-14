import type { DomainEvent } from "../shared/domain-event";
import type { Money } from "../value-objects/money.value-object";

export interface BetPlacedPayload {
  readonly betId: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly amount: Money;
}

export class BetPlacedEvent implements DomainEvent<BetPlacedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: BetPlacedPayload;

  public constructor(payload: BetPlacedPayload, occurredAt: Date = new Date(), eventId: string = crypto.randomUUID()) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
