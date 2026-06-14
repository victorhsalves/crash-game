import type { DomainEvent } from "../shared/domain-event";
import type { Money } from "../value-objects/money.value-object";

export interface CashoutRequestedPayload {
  readonly betId: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly cashoutMultiplier: number;
  readonly payoutAmount: Money;
}

export class CashoutRequestedEvent implements DomainEvent<CashoutRequestedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: CashoutRequestedPayload;

  public constructor(
    payload: CashoutRequestedPayload,
    occurredAt: Date = new Date(),
    eventId: string = crypto.randomUUID(),
  ) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
