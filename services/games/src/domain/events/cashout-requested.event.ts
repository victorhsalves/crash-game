import type { DomainEvent } from "../shared/domain-event";

export interface CashoutRequestedPayload {
  readonly betId: string;
  readonly playerId: string;
  readonly roundId: string;
  readonly cashoutMultiplier: number;
  readonly payoutAmountCents: bigint;
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
